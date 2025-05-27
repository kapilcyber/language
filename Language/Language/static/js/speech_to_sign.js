// DOM Elements
const startRecordingBtn = document.getElementById('start-recording');
const stopRecordingBtn = document.getElementById('stop-recording');
const languageSelect = document.getElementById('speech-language-select');
const recordingStatus = document.getElementById('recording-status');
const recognizedText = document.getElementById('recognized-text');
const signOutput = document.getElementById('speech-sign-output');
const signLoading = document.getElementById('speech-sign-loading');
const errorMessage = document.getElementById('speech-error-message');

// Speech Recognition Setup
let recognition;
let isRecording = false;
let recognizedSpeech = '';

// Check browser support for Web Speech API
function checkBrowserSupport() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showError("Your browser doesn't support speech recognition. Please try Chrome, Edge, or Safari.");
        if (startRecordingBtn) startRecordingBtn.disabled = true;
        return false;
    }
    return true;
}

// Initialize Speech Recognition
function initSpeechRecognition() {
    // Use the appropriate constructor based on browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    // Configure speech recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Set language based on selection
    recognition.lang = getLanguageCode();
    
    // Event handlers
    recognition.onstart = function() {
        isRecording = true;
        updateRecordingUI(true);
    };
    
    recognition.onresult = function(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Update the recognized text display
        if (finalTranscript) {
            recognizedSpeech += finalTranscript + ' ';
            recognizedText.textContent = recognizedSpeech;
            
            // Automatically convert as we get final results
            convertSpeechToSign(finalTranscript);
        }
        
        if (interimTranscript) {
            const currentText = recognizedSpeech + interimTranscript;
            recognizedText.innerHTML = `${recognizedSpeech}<em class="interim-text">${interimTranscript}</em>`;
        }
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
            showError("No speech detected. Please try speaking louder or check your microphone.");
        } else if (event.error === 'audio-capture') {
            showError("No microphone detected. Please ensure your microphone is connected and permissions are granted.");
        } else if (event.error === 'not-allowed') {
            showError("Microphone permission was denied. Please allow microphone access to use speech recognition.");
        } else {
            showError("Speech recognition error occurred. Please try again.");
        }
        stopRecording();
    };
    
    recognition.onend = function() {
        if (isRecording) {
            // If we're still supposed to be recording, restart
            // This helps with the continuous recognition
            recognition.start();
        } else {
            updateRecordingUI(false);
        }
    };
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    if (!checkBrowserSupport()) return;
    
    if (startRecordingBtn) {
        startRecordingBtn.addEventListener('click', startRecording);
    }
    
    if (stopRecordingBtn) {
        stopRecordingBtn.addEventListener('click', stopRecording);
    }
    
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            if (recognition) {
                recognition.lang = getLanguageCode();
                
                // If we're currently recording, restart to apply new language
                if (isRecording) {
                    stopRecording();
                    setTimeout(startRecording, 200);
                }
            }
        });
    }
});

// Get language code from select element
function getLanguageCode() {
    const language = languageSelect.value;
    
    // Map language codes for speech recognition
    switch (language) {
        case 'en':
            return 'en-US';
        case 'hi':
            return 'hi-IN';
        case 'gu':
            return 'gu-IN';
        default:
            return 'en-US';
    }
}

// Start recording
function startRecording() {
    if (!recognition) {
        initSpeechRecognition();
    }
    
    // Clear previous results
    recognizedSpeech = '';
    recognizedText.textContent = '';
    signOutput.innerHTML = '';
    hideError();
    
    try {
        recognition.start();
    } catch (error) {
        console.error('Error starting speech recognition:', error);
        showError("Error starting speech recognition. Please refresh the page and try again.");
    }
}

// Stop recording
function stopRecording() {
    isRecording = false;
    if (recognition) {
        try {
            recognition.stop();
        } catch (error) {
            console.error('Error stopping speech recognition:', error);
        }
    }
}

// Update UI based on recording state
function updateRecordingUI(isRecording) {
    if (isRecording) {
        recordingStatus.textContent = 'Recording...';
        recordingStatus.classList.add('recording');
        if (startRecordingBtn) startRecordingBtn.style.display = 'none';
        if (stopRecordingBtn) stopRecordingBtn.style.display = 'inline-block';
    } else {
        recordingStatus.textContent = 'Not recording';
        recordingStatus.classList.remove('recording');
        if (startRecordingBtn) startRecordingBtn.style.display = 'inline-block';
        if (stopRecordingBtn) stopRecordingBtn.style.display = 'none';
    }
}

// Convert speech to sign language
function convertSpeechToSign(text) {
    if (!text.trim()) return;
    
    // Show loading indicator
    signLoading.style.display = 'block';
    
    // Prepare request data
    const requestData = {
        text: text.trim(),
        language: languageSelect.value
    };
    
    // Send API request
    fetch('/api/speech-to-sign', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Hide loading indicator
        signLoading.style.display = 'none';
        
        // Display sign language output
        displaySignLanguage(data.sign_data);
    })
    .catch(error => {
        // Hide loading indicator
        signLoading.style.display = 'none';
        
        // Show error message
        showError("Error converting speech to sign language. Please try again.");
        console.error('Error:', error);
    });
}

// Display sign language data
function displaySignLanguage(signData) {
    if (!signData || signData.length === 0) {
        return;
    }
    
    // Create sign element container
    const signContainer = document.createElement('div');
    signContainer.className = 'sign-container mt-3';
    
    // Add each sign representation
    signData.forEach(sign => {
        const signElement = document.createElement('div');
        signElement.className = 'sign-element';
        
        if (sign.type === 'video') {
            // Placeholder for video using icons
            signElement.innerHTML = `
                <div class="sign-video-placeholder">
                    <i class="fas fa-sign-language fa-3x"></i>
                    <p>${sign.word || ''}</p>
                </div>
            `;
        } else if (sign.type === 'animation') {
            signElement.innerHTML = `
                <div class="sign-animation-placeholder">
                    <i class="fas fa-hands fa-3x"></i>
                    <p>${sign.word || ''}</p>
                </div>
            `;
        } else {
            signElement.innerHTML = `
                <div class="sign-text-placeholder">
                    <span class="sign-text">${sign.text || sign}</span>
                </div>
            `;
        }
        
        signContainer.appendChild(signElement);
    });
    
    // Add to the output area
    signOutput.appendChild(signContainer);
    
    // Scroll to the latest content
    signOutput.scrollTop = signOutput.scrollHeight;
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Hide error message
function hideError() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}
