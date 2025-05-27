"""
Service for HR interview tools to help deaf and mute candidates
"""
import json
from services.openai_service import generate_interview_questions

def get_interview_questions(role="software developer", experience_level="entry", skills=None):
    """
    Get interview questions for a specific role and experience level
    
    Args:
        role (str): Job role
        experience_level (str): Experience level
        skills (list): Skills to focus on
        
    Returns:
        list: Generated interview questions
    """
    if skills is None:
        skills = ["communication", "teamwork", "problem-solving"]
    
    questions = generate_interview_questions(role, experience_level, skills)
    return questions

def get_interview_preparation_tips():
    """
    Get preparation tips for interviews for deaf and mute candidates
    
    Returns:
        dict: Preparation tips
    """
    return {
        "before_interview": [
            "Research the company and role thoroughly",
            "Prepare to request accommodations in advance",
            "Practice common interview questions",
            "Set up and test technology if using interpreters or assistive devices",
            "Prepare a method to communicate your needs clearly"
        ],
        "during_interview": [
            "Take your time responding to questions",
            "Don't hesitate to ask for clarification",
            "Focus on showcasing your skills and qualifications",
            "Have prepared examples of your achievements",
            "Be confident in your communication method"
        ],
        "follow_up": [
            "Send a thank-you note expressing appreciation",
            "Reiterate your interest in the position",
            "Address any points you wish you had covered better",
            "Inquire about the next steps in the hiring process",
            "Offer to provide any additional information"
        ]
    }

def get_accommodation_request_templates():
    """
    Get templates for requesting accommodations during job interviews
    
    Returns:
        list: Accommodation request templates
    """
    return [
        {
            "title": "Sign Language Interpreter Request",
            "template": "Dear [Hiring Manager],\n\nI am writing to confirm my interview for the [Position] role scheduled on [Date] at [Time]. As a deaf candidate, I would like to request a sign language interpreter for the interview. I use [specify language, e.g., American Sign Language (ASL)] as my primary means of communication.\n\nPlease let me know if you need any additional information from me to arrange this accommodation.\n\nThank you for your consideration, and I look forward to our interview.\n\nSincerely,\n[Your Name]"
        },
        {
            "title": "Written Communication Request",
            "template": "Dear [Hiring Manager],\n\nThank you for the opportunity to interview for the [Position] role on [Date]. As someone who communicates primarily through text, I would like to request that our interview be conducted via written communication or with the assistance of text-based tools.\n\nSome accommodations that would be helpful include:\n- Providing questions in written form\n- Allowing extra time for me to type responses\n- Using a chat platform or email exchange for the interview\n\nI am confident that with these accommodations, I can effectively demonstrate my qualifications for this position.\n\nThank you for your understanding.\n\nBest regards,\n[Your Name]"
        },
        {
            "title": "Video Interview with Captions Request",
            "template": "Dear [Hiring Manager],\n\nI am writing regarding my upcoming interview for the [Position] position on [Date]. As I have a hearing impairment, I would like to request that our video interview include real-time captions or transcription services.\n\nIf your video conferencing platform offers built-in captioning, that would be ideal. Alternatively, I am familiar with [mention specific captioning services] if that would be helpful.\n\nI appreciate your assistance in making this accommodation, which will allow me to fully participate in the interview process.\n\nThank you for your consideration.\n\nSincerely,\n[Your Name]"
        }
    ]

def analyze_job_description(job_description):
    """
    Analyze a job description for accessibility and inclusive language
    
    Args:
        job_description (str): Job description text
        
    Returns:
        dict: Analysis results with suggestions for improvement
    """
    # This would use OpenAI in a real implementation
    # Placeholder for now
    return {
        "inclusivity_score": 7.5,
        "positive_aspects": [
            "Uses inclusive language",
            "Focuses on essential job functions",
            "Mentions commitment to accessibility"
        ],
        "improvement_suggestions": [
            "Add explicit statement about accommodations for deaf/mute candidates",
            "Clarify if phone conversations are required or alternatives are available",
            "Consider removing terminology that might exclude deaf candidates"
        ],
        "alternative_wording": {
            "Strong verbal communication skills": "Strong communication skills",
            "Must be able to handle phone calls": "Must be able to handle client communications",
            "Team meetings and discussions": "Team collaboration and information sharing"
        }
    }