// i18n.js - Internationalization support

/**
 * Simple i18n module for client-side translations
 */
const i18n = (function() {
    // Private properties
    let translations = {};
    let currentLanguage = 'en';
    let fallbackLanguage = 'en';
    let isLoaded = false;
    
    // Load translations for the current language
    function loadTranslations() {
        return fetch(`/static/data/translations/${currentLanguage}.json`)
            .then(response => {
                if (!response.ok) {
                    console.warn(`Translations for ${currentLanguage} not found, falling back to ${fallbackLanguage}`);
                    currentLanguage = fallbackLanguage;
                    return fetch(`/static/data/translations/${fallbackLanguage}.json`);
                }
                return response;
            })
            .then(response => response.json())
            .then(data => {
                translations = data;
                isLoaded = true;
                updatePageTranslations();
                return translations;
            })
            .catch(error => {
                console.error('Error loading translations:', error);
                return {};
            });
    }
    
    // Update all translatable elements on the page
    function updatePageTranslations() {
        if (!isLoaded) return;
        
        // Find all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = translate(key);
            
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.type === 'placeholder') {
                        element.placeholder = translation;
                    } else {
                        element.value = translation;
                    }
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Find all elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = translate(key);
            
            if (translation) {
                element.placeholder = translation;
            }
        });
        
        // Find all elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = translate(key);
            
            if (translation) {
                element.title = translation;
            }
        });
    }
    
    // Get translation for a key
    function translate(key, params = {}) {
        if (!isLoaded) return key;
        
        // Check if the key exists in translations
        let translation = getNestedTranslation(translations, key);
        
        // Return the key if translation not found
        if (!translation) return key;
        
        // Replace any parameters in the translation
        return replaceParams(translation, params);
    }
    
    // Get a nested translation value using dot notation
    function getNestedTranslation(obj, key) {
        const keys = key.split('.');
        let result = obj;
        
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return null;
            }
        }
        
        return result;
    }
    
    // Replace parameters in a translation string
    function replaceParams(text, params) {
        return text.replace(/{{\s*([^}]+)\s*}}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }
    
    // Change the current language
    function setLanguage(language) {
        if (language === currentLanguage) return Promise.resolve();
        
        currentLanguage = language;
        isLoaded = false;
        return loadTranslations();
    }
    
    // Get the current language
    function getLanguage() {
        return currentLanguage;
    }
    
    // Initialize the module
    function init(options = {}) {
        if (options.language) {
            currentLanguage = options.language;
        } else {
            // Try to detect from HTML lang attribute
            const htmlLang = document.documentElement.lang;
            if (htmlLang) {
                currentLanguage = htmlLang;
            }
        }
        
        if (options.fallback) {
            fallbackLanguage = options.fallback;
        }
        
        return loadTranslations();
    }
    
    // Return public methods
    return {
        init,
        translate,
        setLanguage,
        getLanguage,
        updatePageTranslations
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Try to get language from user preference or HTML lang attribute
    const userLang = document.documentElement.lang || navigator.language || navigator.userLanguage || 'en';
    const language = userLang.substring(0, 2); // Get just the language code (e.g., 'en' from 'en-US')
    
    // Initialize with detected language and English fallback
    i18n.init({
        language: language,
        fallback: 'en'
    });
    
    // Add language selector event listeners if present
    document.querySelectorAll('[data-language-selector]').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-language-selector');
            
            if (lang) {
                i18n.setLanguage(lang).then(() => {
                    // Optionally reload the page to ensure all content is translated
                    // window.location.reload();
                });
            }
        });
    });
});

// Export for use in other scripts
window.i18n = i18n;
