// Main application logic
document.addEventListener('DOMContentLoaded', async function() {
    // DOM elements
    const video = document.getElementById('video');
    const canvas = document.getElementById('overlay');
    const startCameraBtn = document.getElementById('start-camera');
    const markAttendanceBtn = document.getElementById('mark-attendance');
    const attendanceRecords = document.getElementById('attendance-records');
    const statusMessage = document.getElementById('status-message');
    
    // Initialize modules
    AttendanceTracker.init(attendanceRecords, statusMessage);
    
    // Initialize face recognition models (this may take a moment)
    try {
        const initialized = await FaceRecognition.init(video, canvas);
        if (!initialized) {
            AttendanceTracker.showStatus('Failed to load face recognition models', 'error');
            return;
        }
    } catch (error) {
        console.error('Error initializing face recognition:', error);
        AttendanceTracker.showStatus('Error initializing face recognition', 'error');
        return;
    }
    
    // Event: Start Camera button clicked
    startCameraBtn.addEventListener('click', async () => {
        try {
            // Show loading status
            AttendanceTracker.showStatus('Starting camera...', 'loading');
            
            // Start camera
            const started = await FaceRecognition.startCamera();
            
            if (started) {
                // Camera started successfully
                startCameraBtn.disabled = true;
                markAttendanceBtn.disabled = false;
                AttendanceTracker.showStatus('Camera started successfully', 'success');
                
                // Start detecting faces in video feed
                startFaceDetection();
            } else {
                AttendanceTracker.showStatus('Failed to start camera', 'error');
            }
        } catch (error) {
            console.error('Error starting camera:', error);
            AttendanceTracker.showStatus('Error starting camera', 'error');
        }
    });
    
    // Event: Mark Attendance button clicked
    markAttendanceBtn.addEventListener('click', async () => {
        try {
            // Show loading status
            AttendanceTracker.showStatus('Processing...', 'loading');
            
            // Get current detections
            const detections = await FaceRecognition.detectFaces();
            
            if (detections.length === 0) {
                AttendanceTracker.showStatus('No face detected. Please face the camera', 'error');
                return;
            }
            
            if (detections.length > 1) {
                AttendanceTracker.showStatus('Multiple faces detected. Please ensure only one person is in frame', 'error');
                return;
            }
            
            // Get the detected face descriptor
            const faceDescriptor = detections[0].descriptor;
            
            // Identify the person (in a real app, this would match against known faces)
            const identifiedPerson = FaceRecognition.identifyPerson(faceDescriptor);
            
            if (!identifiedPerson) {
                AttendanceTracker.showStatus('Unable to recognize face', 'error');
                return;
            }
            
            // Mark attendance for the identified person
            AttendanceTracker.markAttendance(identifiedPerson);
            
        } catch (error) {
            console.error('Error marking attendance:', error);
            AttendanceTracker.showStatus('Error marking attendance', 'error');
        }
    });
    
    // Continuously detect faces in video feed
    function startFaceDetection() {
        setInterval(async () => {
            if (FaceRecognition.isReady()) {
                await FaceRecognition.detectFaces();
            }
        }, 100); // Update every 100ms
    }
});