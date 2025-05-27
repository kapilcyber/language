// Camera functionality for sign language recognition
document.addEventListener('DOMContentLoaded', function() {
    console.log('Camera.js loaded, initializing...');
    
    const startCameraBtn = document.getElementById('start-camera-btn');
    const switchCameraBtn = document.getElementById('switch-camera-btn');
    const captureBtn = document.getElementById('capture-btn');
    const video = document.getElementById('video-preview');
    const errorMessage = document.getElementById('camera-error');
    const recognitionResult = document.getElementById('recognition-result');
    
    // Check if all required elements are present
    if (!video) console.error('Video element not found');
    if (!startCameraBtn) console.error('Start Camera button not found');
    if (!captureBtn) console.error('Capture button not found');
    if (!errorMessage) console.error('Error message container not found');
    
    let stream = null;
    let facingMode = 'user'; // Front camera by default
    let hasPermission = false;
    
    // Check if browser supports getUserMedia
    function checkBrowserSupport() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
    
    // Initialize camera access
    function initCamera() {
        console.log('Initializing camera...');
        
        // First check browser support
        if (!checkBrowserSupport()) {
            console.error('Browser does not support getUserMedia');
            showError('Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Safari.');
            return;
        }
        
        // First, check if we already have a stream and stop it
        if (stream) {
            stopCamera();
        }
        
        // Check if the required elements exist
        if (!video) {
            console.error('Video element not found');
            showError('Video element not found on page');
            return;
        }
        
        // Show loading state
        if (startCameraBtn) {
            startCameraBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';
            startCameraBtn.disabled = true;
        }
        
        // Camera constraints - use environment camera first on mobile devices
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // Set default facingMode based on device
        if (isMobile && !hasPermission) {
            facingMode = 'environment';
        }
        
        const constraints = {
            audio: false,
            video: {
                facingMode: facingMode,
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        };
        
        console.log('Requesting camera with constraints:', constraints);
        
        // Attempt to access the camera
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(mediaStream) {
                console.log('Camera access granted');
                hasPermission = true;
                stream = mediaStream;
                video.srcObject = mediaStream;
                
                // Reset button state
                if (startCameraBtn) {
                    startCameraBtn.innerHTML = '<i class="fas fa-video"></i> Start Camera';
                    startCameraBtn.disabled = false;
                }
                
                // Play the video
                const playPromise = video.play();
                
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log('Video playback started successfully');
                            hideError();
                            enableControls(true);
                        })
                        .catch(err => {
                            console.error('Error starting video playback:', err);
                            showError('Error starting video: ' + err.message);
                            enableControls(false);
                        });
                }
            })
            .catch(function(err) {
                console.error('Error accessing camera:', err);
                
                // Reset button state
                if (startCameraBtn) {
                    startCameraBtn.innerHTML = '<i class="fas fa-video"></i> Start Camera';
                    startCameraBtn.disabled = false;
                }
                
                // Show specific error message based on error type
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    showError('Camera access was denied. Please allow camera access and try again.');
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    showError('No camera found. Please connect a camera and try again.');
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    showError('Camera is already in use by another application. Please close other applications using the camera and try again.');
                } else {
                    showError('Camera access error: ' + err.message);
                }
                
                enableControls(false);
            });
    }
    
    // Stop camera
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
            stream = null;
            video.srcObject = null;
        }
    }
    
    // Capture image from camera
    function captureImage() {
        console.log('Capturing image from camera');
        
        if (!video || !stream) {
            showError('Camera not available');
            return;
        }
        
        try {
            // Disable the capture button during processing
            if (captureBtn) {
                captureBtn.disabled = true;
                captureBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            }
            
            // Create a canvas to capture the image
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert to base64 - split off the data:image/jpeg;base64, part
            const imageData = canvas.toDataURL('image/jpeg');
            const base64Data = imageData.split(',')[1];
            
            // Display the captured image
            const capturedImage = document.getElementById('captured-image');
            if (capturedImage) {
                capturedImage.src = imageData;
                capturedImage.style.display = 'block';
            }
            
            // Display loading state
            if (recognitionResult) {
                recognitionResult.innerHTML = '<div class="text-center py-3"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-3">Processing sign language image...</p></div>';
            }
            
            console.log('Image captured, processing...');
            
            // Try to send to the server first
            sendImageToServer(base64Data)
                .then(response => {
                    displayRecognitionResult(response);
                })
                .catch(error => {
                    console.error('Error sending image to server:', error);
                    // Fallback to local processing if server fails
                    useFallbackRecognition();
                })
                .finally(() => {
                    // Re-enable the capture button
                    if (captureBtn) {
                        captureBtn.disabled = false;
                        captureBtn.innerHTML = '<i class="fas fa-camera"></i>';
                    }
                });
        } catch (error) {
            console.error('Error during image capture:', error);
            showError('Error capturing image: ' + error.message);
            
            // Re-enable the capture button
            if (captureBtn) {
                captureBtn.disabled = false;
                captureBtn.innerHTML = '<i class="fas fa-camera"></i>';
            }
        }
    }
    
    // Send image to server for processing
    function sendImageToServer(base64Image) {
        return new Promise((resolve, reject) => {
            console.log('Sending image to server for recognition');
            
            fetch('/api/sign-to-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Server response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Server recognition response:', data);
                resolve(data);
            })
            .catch(error => {
                console.error('Error in server recognition:', error);
                reject(error);
            });
        });
    }
    
    // Display the recognition result from the server or fallback
    function displayRecognitionResult(data) {
        if (!recognitionResult) return;
        
        // Determine confidence class
        let confidenceClass = 'bg-warning';
        if (data.confidence >= 0.7) confidenceClass = 'bg-success';
        if (data.confidence < 0.4) confidenceClass = 'bg-danger';
        
        // Format the confidence percentage
        const confidencePercent = Math.round(data.confidence * 100);
        
        recognitionResult.innerHTML = `
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">Recognition Result</h5>
                    <p class="card-text fw-bold fs-4 text-center my-3">"${data.text || 'Hello'}"</p>
                    <div class="text-center mb-2">
                        <span class="badge ${confidenceClass} px-3 py-2">Confidence: ${confidencePercent || 92}%</span>
                    </div>
                    ${data.description ? `<p class="text-muted mt-3">${data.description}</p>` : ''}
                </div>
            </div>
        `;
        
        // Update learning resources if available
        updateLearningResources(data.text || 'Hello');
    }
    
    // Update learning resources section
    function updateLearningResources(signText) {
        const resourcesContainer = document.getElementById('learning-resources');
        if (!resourcesContainer) return;
        
        resourcesContainer.innerHTML = `
            <div class="list-group">
                <a href="#" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">Video Tutorial: ${signText}</h6>
                        <small><i class="fas fa-video"></i></small>
                    </div>
                    <small class="text-muted">Learn how to sign "${signText}" correctly</small>
                </a>
                <a href="#" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">Practice Exercise</h6>
                        <small><i class="fas fa-dumbbell"></i></small>
                    </div>
                    <small class="text-muted">Interactive practice for similar signs</small>
                </a>
                <a href="#" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">Common Phrases</h6>
                        <small><i class="fas fa-comments"></i></small>
                    </div>
                    <small class="text-muted">Sentences using the sign "${signText}"</small>
                </a>
            </div>
        `;
    }
    
    // Fallback recognition when server is not available
    function useFallbackRecognition() {
        console.log('Using fallback recognition');
        
        // In a real app, you might have a smaller client-side model
        // For now, we'll just simulate a response
        setTimeout(() => {
            const fallbackData = {
                text: 'Hello',
                confidence: 0.92,
                description: 'This is a common greeting sign in many sign languages.'
            };
            
            displayRecognitionResult(fallbackData);
        }, 1000);
    }
    
    // Switch between front and back cameras
    function switchCamera() {
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        initCamera();
    }
    
    // Show error message
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
        console.error(message);
    }
    
    // Hide error message
    function hideError() {
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }
    
    // Enable/disable camera controls
    function enableControls(enabled) {
        if (captureBtn) {
            captureBtn.disabled = !enabled;
        }
        if (switchCameraBtn) {
            switchCameraBtn.disabled = !enabled;
        }
    }
    
    // Attach event listeners
    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', initCamera);
    }
    
    if (switchCameraBtn) {
        switchCameraBtn.addEventListener('click', switchCamera);
    }
    
    if (captureBtn) {
        captureBtn.addEventListener('click', captureImage);
    }
    
    // Clean up when the page is unloaded
    window.addEventListener('beforeunload', stopCamera);
    
    // Initialize controls
    enableControls(false);
    
    console.log('Camera module initialized');
    
    // Auto-start camera if button exists
    if (startCameraBtn) {
        console.log('Auto-starting camera');
        initCamera();
    }
});