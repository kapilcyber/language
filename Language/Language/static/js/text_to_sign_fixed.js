// Text to Sign Language Translation JavaScript - Simplified Direct Version
document.addEventListener('DOMContentLoaded', function() {
    const translateForm = document.getElementById('translate-form');
    const inputText = document.getElementById('input-text');
    const inputLanguage = document.getElementById('input-language');
    const outputLanguage = document.getElementById('output-language');
    const translateBtn = document.getElementById('translate-btn');
    const resultContainer = document.getElementById('sign-result-container');
    const errorContainer = document.getElementById('error-message');
    
    console.log('Text to Sign Translation module loading (simplified version)...');
    
    // Available sign images
    const availableSignImages = {
        'hello': {
            image: '/static/images/signs/en/hello.svg',
            description: 'Wave hand with palm facing outward'
        },
        'thank': {
            image: '/static/images/signs/en/thank.svg',
            description: 'Touch lips with fingertips, then move hand outward'
        },
        'please': {
            image: '/static/images/signs/en/please.svg',
            description: 'Rub palm in circular motion on chest'
        }
    };
    
    if (translateForm) {
        translateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            translateText();
        });
        console.log('Form submission listener added');
    }
    
    function translateText() {
        if (!inputText || !resultContainer) {
            showError('Required elements not found');
            return;
        }
        
        const text = inputText.value.trim();
        if (!text) {
            showError('Please enter some text to translate');
            return;
        }
        
        // Show loading state
        resultContainer.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-2">Translating...</p></div>';
        
        console.log('Processing translation for:', text);
        
        // Simple direct translation without API call
        setTimeout(() => {
            processDirectTranslation(text);
        }, 500);
    }
    
    function processDirectTranslation(text) {
        console.log('Processing direct translation for:', text);
        
        // Break the text into words and clean them
        const words = text.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);
        let translationHtml = '<h5 class="mb-3">Sign Language Translation</h5>';
        translationHtml += '<div class="sign-language-container">';
        
        // Process each word to generate the translation
        words.forEach(word => {
            if (word in availableSignImages) {
                // We have an image for this word
                const signInfo = availableSignImages[word];
                translationHtml += `
                    <div class="sign-language-item">
                        <img src="${signInfo.image}" alt="${word} sign" class="sign-language-image">
                        <div class="sign-language-text">${word}</div>
                        <div class="sign-language-description">${signInfo.description}</div>
                    </div>
                `;
            } else {
                // For words we don't have images for
                translationHtml += `
                    <div class="sign-language-item">
                        <div class="text-center py-3 bg-light rounded">
                            <i class="fas fa-sign-language fa-2x text-muted"></i>
                        </div>
                        <div class="sign-language-text">${word}</div>
                        <div class="sign-language-description">Fingerspell each letter using sign language alphabet</div>
                    </div>
                `;
            }
        });
        
        translationHtml += '</div>';
        resultContainer.innerHTML = translationHtml;
        
        // Hide any previous errors
        hideError();
    }
    
    function showError(message) {
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
            
            if (resultContainer) {
                resultContainer.innerHTML = '';
            }
        }
        console.error(message);
    }
    
    function hideError() {
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    }
    
    // If there's text in the input on page load, do an initial translation
    if (inputText && inputText.value.trim()) {
        translateText();
    }
    
    console.log('Text to Sign Translation module initialized');
});