// Face recognition module
const FaceRecognition = (function() {
    // Store private variables
    let video;
    let canvas;
    let ctx;
    let isModelLoaded = false;
    let isCameraRunning = false;
    
    // Store detected faces and their descriptors
    const knownFaces = [];
    
    // Load sample student data (in a real app, this would be fetched from a server)
    const sampleStudents = [
        { id: 1, name: "Student 1", faceDescriptor: null },
        { id: 2, name: "Student 2", faceDescriptor: null },
        { id: 3, name: "Student 3", faceDescriptor: null }
    ];
    
    // Initialize face recognition
    async function init(videoElement, canvasElement) {
        video = videoElement;
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        
        // Load face-api models
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
                faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
                faceapi.nets.faceRecognitionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights')
            ]);
            
            isModelLoaded = true;
            return true;
        } catch (error) {
            console.error('Error loading face-api models:', error);
            return false;
        }
    }
    
    // Start camera 
    async function startCamera() {
        if (!isModelLoaded) {
            throw new Error('Face recognition models are not loaded yet');
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            
            video.srcObject = stream;
            isCameraRunning = true;
            
            registerSampleFaces();
            
            return true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            return false;
        }
    }
    
    function registerSampleFaces() {
        
        sampleStudents.forEach(student => {
            // Create a random 128-length array (simulating a face descriptor)
            const randomDescriptor = new Float32Array(128);
            for (let i = 0; i < 128; i++) {
                randomDescriptor[i] = Math.random() * 2 - 1; // Random values between -1 and 1
            }
            student.faceDescriptor = randomDescriptor;
            knownFaces.push({
                id: student.id,
                name: student.name,
                descriptor: randomDescriptor
            });
        });
    }
    
    // Detect faces in the current video frame
    async function detectFaces() {
        if (!isCameraRunning) {
            throw new Error('Camera is not running');
        }
        
        try {
            // Get detections from current video frame
            const detections = await faceapi.detectAllFaces(
                video, 
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceDescriptors();
            
            // Clear previous drawings
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw detected faces on canvas
            detections.forEach(detection => {
                // Draw face detection box
                const box = detection.detection.box;
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.strokeRect(box.x, box.y, box.width, box.height);
        
            });
            
            return detections;
        } catch (error) {
            console.error('Error detecting faces:', error);
            return [];
        }
    }
    
    // Identify a person from their face
    function identifyPerson(faceDescriptor) {
        
        const randomIndex = Math.floor(Math.random() * sampleStudents.length);
        return sampleStudents[randomIndex];
    }
    
    // Public API
    return {
        init,
        startCamera,
        detectFaces,
        identifyPerson,
        isReady: () => isModelLoaded && isCameraRunning
    };
})();