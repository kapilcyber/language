// DOM Elements
const textInput = document.getElementById('text-input');
const languageSelect = document.getElementById('language-select');
const convertBtn = document.getElementById('convert-button');
const signOutput = document.getElementById('sign-output');
const signLoading = document.getElementById('sign-loading');
const errorMessage = document.getElementById('error-message');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    if (convertBtn) {
        convertBtn.addEventListener('click', convertTextToSign);
    }
    
    if (textInput) {
        textInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                convertTextToSign();
            }
        });
    }
});

// Convert Text to Sign function
function convertTextToSign() {
    // Validate input
    if (!textInput.value.trim()) {
        showError("Please enter some text to convert");
        return;
    }
    
    // Show loading state
    signLoading.style.display = 'block';
    signOutput.innerHTML = '';
    hideError();
    
    // Prepare the request
    const requestData = {
        text: textInput.value.trim(),
        language: languageSelect.value
    };
    
    // Send the API request
    fetch('/api/text-to-sign', {
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
        // Hide loading state
        signLoading.style.display = 'none';
        
        // Display sign language results
        displaySignLanguage(data.sign_data);
    })
    .catch(error => {
        // Hide loading state
        signLoading.style.display = 'none';
        
        // Show error message
        showError("Error converting text to sign language. Please try again.");
        console.error('Error:', error);
    });
}

// Display sign language data
function displaySignLanguage(signData) {
    // Clear previous content
    signOutput.innerHTML = '';
    
    if (!signData || signData.length === 0) {
        signOutput.innerHTML = '<p class="text-center">No sign language representation available for this text.</p>';
        return;
    }
    
    // Create a container for the signs
    const signContainer = document.createElement('div');
    signContainer.className = 'sign-container';
    
    // Add each sign representation
    signData.forEach(sign => {
        // For a real implementation, this would show videos or animations
        // Here we'll just display placeholder or text representation
        const signElement = document.createElement('div');
        signElement.className = 'sign-element';
        
        if (sign.type === 'video') {
            // For videos, we would use:
            // const video = document.createElement('video');
            // video.src = sign.url;
            // video.controls = true;
            // signElement.appendChild(video);
            
            // Placeholder for video using icons
            signElement.innerHTML = `
                <div class="sign-video-placeholder">
                    <i class="fas fa-sign-language fa-3x"></i>
                    <p>${sign.word || ''}</p>
                </div>
            `;
        } else if (sign.type === 'animation') {
            // For animations, we would use Lottie or similar
            // Here using a placeholder
            signElement.innerHTML = `
                <div class="sign-animation-placeholder">
                    <i class="fas fa-hands fa-3x"></i>
                    <p>${sign.word || ''}</p>
                </div>
            `;
        } else {
            // Fallback representation
            signElement.innerHTML = `
                <div class="sign-text-placeholder">
                    <span class="sign-text">${sign.text || sign}</span>
                </div>
            `;
        }
        
        signContainer.appendChild(signElement);
    });
    
    signOutput.appendChild(signContainer);
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
