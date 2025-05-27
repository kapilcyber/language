import os
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Define hardcoded fallback mappings for common words and letters
FALLBACK_MAPPINGS = {
    'en': {
        'hello': {
            'type': 'static',
            'word': 'Hello',
            'image': '/static/images/signs/en/hello.svg',
            'description': 'The hand starts near the forehead and moves outward, like a salute.'
        },
        'thank': {
            'type': 'static',
            'word': 'Thank you',
            'image': '/static/images/signs/en/thank.svg',
            'description': 'The flat hand starts at the chin and moves outward and down.'
        },
        'please': {
            'type': 'static',
            'word': 'Please',
            'image': '/static/images/signs/en/please.svg',
            'description': 'The flat hand rubs in a circular motion on the chest.'
        },
        'a': {
            'type': 'static',
            'word': 'A',
            'description': 'Make a fist with the thumb on the side. Only the thumb moves to the side of the index finger.'
        },
        'b': {
            'type': 'static',
            'word': 'B',
            'description': 'Hold up your hand with the palm facing forward, fingers extended and close together, thumb tucked against palm.'
        }
    }
}

def convert_text_to_sign(text, language='en'):
    """
    Convert text to sign language representation
    
    Args:
        text (str): The text to convert
        language (str): Language code (en, gu, hi)
        
    Returns:
        list: List of sign language representations
    """
    try:
        # Try to load the sign language mappings
        mappings_path = Path('static/data/sign_language_mappings.json')
        mappings = {}
        
        # Try to load from file first
        if mappings_path.exists():
            try:
                with open(mappings_path, 'r', encoding='utf-8') as f:
                    mappings = json.load(f)
            except Exception as e:
                logger.warning(f"Error loading mappings from file: {e}, using fallbacks")
                mappings = FALLBACK_MAPPINGS
        else:
            logger.warning(f"Mappings file not found at {mappings_path}, using fallbacks")
            mappings = FALLBACK_MAPPINGS
        
        # Get language-specific mappings
        if language not in mappings:
            logger.warning(f"Language {language} not found in mappings, using English")
            language = 'en'
            
        # Handle case where language mappings might not be available
        language_mappings = mappings.get(language, {})
        if not language_mappings and language != 'en':
            language = 'en'
            language_mappings = mappings.get('en', {})
        
        # Handle case where nothing is available
        if not language_mappings:
            language_mappings = FALLBACK_MAPPINGS.get('en', {})
        
        # Process text
        words = text.lower().split()
        result = []
        
        for word in words:
            # Clean the word (remove punctuation)
            word = ''.join(c for c in word if c.isalnum())
            
            # Check if we have the whole word
            if word in language_mappings:
                word_mapping = language_mappings[word].copy()  # Create a copy to avoid modifying the original
                
                # Add image path for static image type if available
                if word in ['hello', 'thank', 'please'] and language == 'en':
                    image_path = f'/static/images/signs/en/{word}.svg'
                    word_mapping['image'] = image_path
                
                result.append(word_mapping)
            else:
                # Create a simple representation for the word
                result.append({
                    'type': 'fingerspell',
                    'word': word,
                    'description': f'Spell each letter of "{word}" using finger alphabet'
                })
        
        return result
        
    except Exception as e:
        logger.error(f"Error converting text to sign: {e}", exc_info=True)
        
        # Return basic fallback result with key words
        fallback_result = []
        for word in text.lower().split():
            clean_word = ''.join(c for c in word if c.isalnum())
            
            if clean_word in ['hello', 'thank', 'please'] and language == 'en':
                fallback_result.append({
                    'type': 'static',
                    'word': clean_word.capitalize(),
                    'image': f'/static/images/signs/en/{clean_word}.svg',
                    'description': f'Sign for {clean_word}'
                })
            else:
                fallback_result.append({
                    'type': 'fingerspell',
                    'word': clean_word,
                    'description': f'Spell each letter of "{clean_word}" using finger alphabet'
                })
        
        return fallback_result
