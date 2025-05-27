def get_supported_languages():
    """
    Returns list of supported languages
    """
    return [
        {'code': 'en', 'name': 'English'},
        {'code': 'gu', 'name': 'Gujarati'},
        {'code': 'hi', 'name': 'Hindi'}
    ]

def get_language_name(code):
    """
    Returns language name from code
    """
    languages = {
        'en': 'English',
        'gu': 'Gujarati',
        'hi': 'Hindi'
    }
    return languages.get(code, 'Unknown')
