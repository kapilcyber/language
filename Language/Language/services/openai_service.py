"""
OpenAI service for AI-powered features
"""
import os
import json
import base64
from openai import OpenAI

# the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
# do not change this unless explicitly requested by the user
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def recognize_sign_language(image_data):
    """
    Recognize sign language gestures from an image
    
    Args:
        image_data (str): Base64 encoded image data
        
    Returns:
        dict: Recognition results including text, confidence, and language
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in sign language recognition. Analyze the image and identify the sign language gesture being shown. Return the result as JSON with the following format: {\"text\": \"recognized text\", \"confidence\": 0.0-1.0, \"language\": \"language code\"}"
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Identify the sign language gesture in this image."
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"Error in recognize_sign_language: {e}")
        return {"error": str(e)}

def generate_interview_questions(role, experience_level, skills):
    """
    Generate interview questions for HR tools
    
    Args:
        role (str): Job role
        experience_level (str): Experience level
        skills (list): Skills to focus on
        
    Returns:
        list: Generated interview questions
    """
    try:
        skills_str = ", ".join(skills)
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an experienced HR professional. Generate appropriate interview questions based on the provided job role, experience level, and required skills. Focus on questions that would be accessible for deaf and mute candidates."
                },
                {
                    "role": "user",
                    "content": f"Generate 5 interview questions for a {role} position with {experience_level} experience level. The required skills are: {skills_str}. Format your response as a JSON array of questions."
                }
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get("questions", [])
    except Exception as e:
        print(f"Error in generate_interview_questions: {e}")
        return {"error": str(e)}

def translate_speech_to_sign(speech_text, source_language='en'):
    """
    Translate speech text to sign language descriptions
    
    Args:
        speech_text (str): Text from speech recognition
        source_language (str): Source language code
        
    Returns:
        list: Descriptions of sign language gestures
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in sign language translation. Convert the provided text into detailed descriptions of sign language gestures. Return an array of descriptions, one for each word or concept."
                },
                {
                    "role": "user",
                    "content": f"Translate the following text into sign language descriptions (language code: {source_language}): '{speech_text}'"
                }
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get("signs", [])
    except Exception as e:
        print(f"Error in translate_speech_to_sign: {e}")
        return {"error": str(e)}

def get_learning_recommendations(user_profile, progress_data):
    """
    Get personalized learning recommendations based on user profile and progress
    
    Args:
        user_profile (dict): User profile information
        progress_data (dict): User progress data
        
    Returns:
        dict: Personalized recommendations
    """
    try:
        user_profile_str = json.dumps(user_profile)
        progress_data_str = json.dumps(progress_data)
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an educational advisor specializing in sign language learning. Analyze the user profile and progress data to provide personalized learning recommendations."
                },
                {
                    "role": "user",
                    "content": f"Generate personalized learning recommendations based on this user profile: {user_profile_str} and progress data: {progress_data_str}"
                }
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"Error in get_learning_recommendations: {e}")
        return {"error": str(e)}