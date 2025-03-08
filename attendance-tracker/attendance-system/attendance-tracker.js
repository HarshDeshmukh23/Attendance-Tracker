// Attendance Tracker module
const AttendanceTracker = (function() {
    // Store attendance records
    const attendanceRecords = [];
    
    // DOM elements
    let tableBody;
    let statusMessage;
    
    // Initialize the attendance tracker
    function init(tableBodyElement, statusMessageElement) {
        tableBody = tableBodyElement;
        statusMessage = statusMessageElement;
        
        // Load any saved attendance from local storage
        loadFromLocalStorage();
        
        // Render the initial table
        renderAttendanceTable();
    }
    
    // Mark attendance for a recognized student
    function markAttendance(student) {
        if (!student || !student.id || !student.name) {
            showStatus('Error: Invalid student data', 'error');
            return false;
        }
        
        // Check if student has already been marked for today
        const today = new Date().toLocaleDateString();
        const alreadyMarked = attendanceRecords.some(record => 
            record.studentId === student.id && 
            record.date === today
        );
        
        if (alreadyMarked) {
            showStatus(`${student.name} has already been marked present today`, 'error');
            return false;
        }
        
        // Create new attendance record
        const now = new Date();
        const record = {
            id: generateId(),
            studentId: student.id,
            studentName: student.name,
            time: now.toLocaleTimeString(),
            date: today,
            status: 'Present'
        };
        
        // Add to records
        attendanceRecords.push(record);
        
        // Save to local storage
        saveToLocalStorage();
        
        // Update the table
        renderAttendanceTable();
        
        // Show success message
        showStatus(`Attendance marked for ${student.name}`, 'success');
        
        return true;
    }
    
    // Generate a unique ID for attendance records
    function generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }
    
    // Render the attendance table
    function renderAttendanceTable() {
        // Clear the table
        tableBody.innerHTML = '';
        
        // Sort records by date and time (newest first)
        const sortedRecords = [...attendanceRecords].sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateB - dateA;
        });
        
        // Add each record to the table
        sortedRecords.forEach(record => {
            const row = document.createElement('tr');
            
            // Create cells
            const nameCell = document.createElement('td');
            nameCell.textContent = record.studentName;
            
            const timeCell = document.createElement('td');
            timeCell.textContent = record.time;
            
            const dateCell = document.createElement('td');
            dateCell.textContent = record.date;
            
            const statusCell = document.createElement('td');
            statusCell.textContent = record.status;
            
            // Add cells to row
            row.appendChild(nameCell);
            row.appendChild(timeCell);
            row.appendChild(dateCell);
            row.appendChild(statusCell);
            
            // Add row to table
            tableBody.appendChild(row);
        });
    }
    
    // Show status message
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = type; // 'success', 'error', or 'loading'
        
        // Clear message after 3 seconds
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = '';
        }, 3000);
    }
    
    // Save attendance records to local storage
    function saveToLocalStorage() {
        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    }
    
    // Load attendance records from local storage
    function loadFromLocalStorage() {
        const savedRecords = localStorage.getItem('attendanceRecords');
        if (savedRecords) {
            // Clear current records and add saved ones
            attendanceRecords.length = 0;
            const parsed = JSON.parse(savedRecords);
            attendanceRecords.push(...parsed);
        }
    }
    
    // Clear all attendance records
    function clearAllRecords() {
        attendanceRecords.length = 0;
        localStorage.removeItem('attendanceRecords');
        renderAttendanceTable();
        showStatus('All attendance records cleared', 'success');
    }
    
    // Public API
    return {
        init,
        markAttendance,
        clearAllRecords,
        showStatus
    };
})();