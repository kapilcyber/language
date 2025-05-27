from flask import render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from app import db, babel
from models import User, Module, Lesson, Quiz, Question, Choice, QuizResult, Progress
from models import ROLE_STUDENT, ROLE_TEACHER, ROLE_PARENT
from werkzeug.security import generate_password_hash
from functools import wraps
from services.speech_to_sign import convert_speech_to_sign
from services.text_to_sign import convert_text_to_sign
from services.language_service import get_supported_languages
from services.openai_service import recognize_sign_language, generate_interview_questions, translate_speech_to_sign, get_learning_recommendations
from services.gesture_recognition_service_fixed import process_image_data, get_gesture_learning_resources
from services.hr_interview_service import get_interview_questions, get_accommodation_request_templates, analyze_job_description
from services.realtime_translation_service import text_to_sign_descriptions, sign_to_text, get_translation_history

def register_routes(app):
    # Babel locale selection is handled in app.py
    
    @app.route('/set_language/<language>')
    def set_language(language):
        if language in ['en', 'gu', 'hi']:
            if current_user.is_authenticated:
                current_user.preferred_language = language
                db.session.commit()
            session['language'] = language
        return redirect(request.referrer or url_for('index'))
    
    @app.route('/')
    def index():
        modules = Module.query.order_by(Module.order).all()
        return render_template('index.html', modules=modules)
    
    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
        
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            
            user = User.query.filter_by(username=username).first()
            if user and user.check_password(password):
                login_user(user, remember=True)
                next_page = request.args.get('next')
                return redirect(next_page or url_for('dashboard'))
            else:
                flash('Invalid username or password', 'danger')
                
        return render_template('login.html')
    
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
        
        if request.method == 'POST':
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            role = request.form.get('role')
            language = request.form.get('language', 'en')
            
            if User.query.filter_by(username=username).first():
                flash('Username already exists', 'danger')
                return render_template('register.html')
                
            if User.query.filter_by(email=email).first():
                flash('Email already registered', 'danger')
                return render_template('register.html')
            
            # Validate role
            if role not in [ROLE_STUDENT, ROLE_TEACHER, ROLE_PARENT]:
                flash('Invalid role selected', 'danger')
                return render_template('register.html')
            
            user = User(username=username, email=email, role=role, preferred_language=language)
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('login'))
            
        languages = get_supported_languages()
        return render_template('register.html', languages=languages)
    
    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        return redirect(url_for('index'))
    
    @app.route('/dashboard')
    @login_required
    def dashboard():
        if current_user.role == ROLE_STUDENT:
            # Get student's progress
            progress = Progress.query.filter_by(user_id=current_user.id).all()
            quiz_results = QuizResult.query.filter_by(user_id=current_user.id).all()
            
            # Organize progress by module category
            progress_by_category = {}
            for p in progress:
                if p.module.category not in progress_by_category:
                    progress_by_category[p.module.category] = []
                progress_by_category[p.module.category].append(p)
                
            return render_template('dashboard.html', 
                                 progress=progress, 
                                 progress_by_category=progress_by_category,
                                 quiz_results=quiz_results)
                                 
        elif current_user.role == ROLE_TEACHER:
            # Get teacher's students
            teacher_relations = current_user.students.all()
            student_ids = [relation.student_id for relation in teacher_relations]
            students = User.query.filter(User.id.in_(student_ids)).all()
            
            return render_template('dashboard.html', students=students)
            
        elif current_user.role == ROLE_PARENT:
            # Get parent's children
            parent_relations = current_user.student_relations.all()
            student_ids = [relation.student_id for relation in parent_relations]
            children = User.query.filter(User.id.in_(student_ids)).all()
            
            # Collect progress for each child
            children_progress = {}
            for child in children:
                progress = Progress.query.filter_by(user_id=child.id).all()
                quiz_results = QuizResult.query.filter_by(user_id=child.id).all()
                children_progress[child.id] = {
                    'progress': progress,
                    'quiz_results': quiz_results
                }
                
            return render_template('dashboard.html', 
                                 children=children,
                                 children_progress=children_progress)
    
    @app.route('/modules/<category>')
    def modules_by_category(category):
        modules = Module.query.filter_by(category=category).order_by(Module.order).all()
        return render_template('modules.html', modules=modules, category=category)
    
    @app.route('/module/<slug>')
    def module_detail(slug):
        module = Module.query.filter_by(slug=slug).first_or_404()
        lessons = Lesson.query.filter_by(module_id=module.id).order_by(Lesson.order).all()
        
        # Update progress if user is logged in
        if current_user.is_authenticated and current_user.role == ROLE_STUDENT:
            progress = Progress.query.filter_by(
                user_id=current_user.id,
                module_id=module.id
            ).first()
            
            if not progress:
                progress = Progress(
                    user_id=current_user.id,
                    module_id=module.id,
                    progress_percent=0
                )
                db.session.add(progress)
                db.session.commit()
        
        return render_template(f'modules/{module.category}.html', 
                             module=module, 
                             lessons=lessons)
    
    @app.route('/lesson/<module_slug>/<lesson_slug>')
    def lesson_detail(module_slug, lesson_slug):
        module = Module.query.filter_by(slug=module_slug).first_or_404()
        lesson = Lesson.query.filter_by(module_id=module.id, slug=lesson_slug).first_or_404()
        
        # Update progress if user is logged in
        if current_user.is_authenticated and current_user.role == ROLE_STUDENT:
            progress = Progress.query.filter_by(
                user_id=current_user.id,
                module_id=module.id,
                lesson_id=lesson.id
            ).first()
            
            if not progress:
                progress = Progress(
                    user_id=current_user.id,
                    module_id=module.id,
                    lesson_id=lesson.id,
                    progress_percent=50  # Mark as started
                )
                db.session.add(progress)
            else:
                progress.last_accessed = db.func.now()
                
            db.session.commit()
            
        # Get quizzes for this lesson
        quizzes = Quiz.query.filter_by(lesson_id=lesson.id).all()
            
        return render_template(f'lesson.html', 
                             module=module,
                             lesson=lesson,
                             quizzes=quizzes)
    
    @app.route('/quiz/<int:quiz_id>')
    @login_required
    def quiz(quiz_id):
        quiz = Quiz.query.get_or_404(quiz_id)
        questions = Question.query.filter_by(quiz_id=quiz.id).order_by(Question.order).all()
        
        # Load choices for each question
        for question in questions:
            question.choices_list = Choice.query.filter_by(question_id=question.id).all()
            
        return render_template('modules/quiz.html', quiz=quiz, questions=questions)
    
    @app.route('/submit_quiz/<int:quiz_id>', methods=['POST'])
    @login_required
    def submit_quiz(quiz_id):
        quiz = Quiz.query.get_or_404(quiz_id)
        questions = Question.query.filter_by(quiz_id=quiz.id).all()
        
        score = 0
        max_score = len(questions)
        
        for question in questions:
            # Get user's answer
            answer_key = f'question_{question.id}'
            user_answer = request.form.get(answer_key)
            
            # Check if correct
            if question.question_type == 'multiple-choice':
                correct_choice = Choice.query.filter_by(
                    question_id=question.id, 
                    is_correct=True
                ).first()
                
                if correct_choice and user_answer and int(user_answer) == correct_choice.id:
                    score += 1
            
            elif question.question_type == 'true-false':
                correct_choice = Choice.query.filter_by(
                    question_id=question.id, 
                    is_correct=True
                ).first()
                
                if correct_choice and user_answer and user_answer == correct_choice.choice_text:
                    score += 1
        
        # Save quiz result
        result = QuizResult(
            quiz_id=quiz.id,
            user_id=current_user.id,
            score=score,
            max_score=max_score
        )
        db.session.add(result)
        
        # Update lesson progress
        if quiz.lesson_id:
            lesson = Lesson.query.get(quiz.lesson_id)
            if lesson:
                progress = Progress.query.filter_by(
                    user_id=current_user.id,
                    module_id=lesson.module_id,
                    lesson_id=lesson.id
                ).first()
                
                if progress:
                    progress.progress_percent = 100  # Mark as completed
                else:
                    progress = Progress(
                        user_id=current_user.id,
                        module_id=lesson.module_id,
                        lesson_id=lesson.id,
                        progress_percent=100
                    )
                    db.session.add(progress)
        
        db.session.commit()
        
        flash(f'Quiz completed! Your score: {score}/{max_score}', 'success')
        return redirect(url_for('dashboard'))
    
    # Tools routes
    @app.route('/tools/text-to-sign')
    def text_to_sign_tool():
        return render_template('tools/text_to_sign.html')
    
    @app.route('/api/text-to-sign', methods=['POST'])
    def text_to_sign_api():
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
            
        text = data['text']
        language = data.get('language', 'en')
        
        # Convert text to sign language
        sign_data = convert_text_to_sign(text, language)
        
        return jsonify({'sign_data': sign_data})
    
    @app.route('/tools/speech-to-sign')
    def speech_to_sign_tool():
        return render_template('tools/speech_to_sign.html')
    
    @app.route('/api/speech-to-sign', methods=['POST'])
    def speech_to_sign_api():
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No speech text provided'}), 400
            
        speech_text = data['text']
        language = data.get('language', 'en')
        
        # Convert speech text to sign language
        sign_data = convert_speech_to_sign(speech_text, language)
        
        return jsonify({'sign_data': sign_data})
    
    @app.route('/tools/writing-pad')
    def writing_pad_tool():
        return render_template('tools/writing_pad.html')
        
    # Phase 3 - Advanced AI Features
    
    # Sign to Text (Gesture Recognition)
    @app.route('/tools/sign-to-text')
    def sign_to_text_tool():
        return render_template('tools/sign_to_text.html')
    
    @app.route('/api/sign-to-text', methods=['POST'])
    def sign_to_text_api():
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
            
        image_data = data['image']
        source_language = data.get('source_language', 'en')
        target_language = data.get('target_language', 'en')
        
        # Process the image data for sign language recognition
        result = process_image_data(image_data)
        
        return jsonify(result)
    
    @app.route('/api/gesture-resources', methods=['GET'])
    def gesture_resources_api():
        gesture = request.args.get('gesture', '')
        if not gesture:
            return jsonify({'error': 'No gesture specified'}), 400
            
        # Get learning resources for the specified gesture
        resources = get_gesture_learning_resources(gesture)
        
        return jsonify(resources)
    
    # HR/Interview tools
    @app.route('/tools/hr-interview')
    def hr_interview_tool():
        return render_template('tools/hr_interview_tool.html')
    
    @app.route('/api/interview-questions', methods=['POST'])
    def interview_questions_api():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        role = data.get('role', 'software developer')
        experience_level = data.get('experience_level', 'mid')
        skills = data.get('skills', ["communication", "teamwork", "problem-solving"])
        
        # Get interview questions based on role, experience level, and skills
        questions = get_interview_questions(role, experience_level, skills)
        
        return jsonify(questions)
    
    @app.route('/api/accommodation-templates', methods=['GET'])
    def accommodation_templates_api():
        # Get accommodation request templates
        templates = get_accommodation_request_templates()
        
        return jsonify(templates)
    
    @app.route('/api/analyze-job-description', methods=['POST'])
    def analyze_job_description_api():
        data = request.get_json()
        if not data or 'description' not in data:
            return jsonify({'error': 'No job description provided'}), 400
            
        description = data['description']
        
        # Analyze job description for accessibility and inclusive language
        result = analyze_job_description(description)
        
        return jsonify(result)
    
    # Real-time translation
    @app.route('/tools/realtime-translation')
    def realtime_translation_tool():
        return render_template('tools/realtime_translation.html')
    
    @app.route('/api/realtime-speech-to-sign', methods=['POST'])
    def realtime_speech_to_sign_api():
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No speech text provided'}), 400
            
        text = data['text']
        source_language = data.get('source_language', 'en')
        target_language = data.get('target_language', 'en')
        
        # Translate speech to sign language
        sign_descriptions = translate_speech_to_sign(text, source_language)
        
        return jsonify(sign_descriptions)
    
    @app.route('/api/realtime-text-to-sign', methods=['POST'])
    def realtime_text_to_sign_api():
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
            
        text = data['text']
        source_language = data.get('source_language', 'en')
        target_language = data.get('target_language', 'en')
        
        # Translate text to sign language
        sign_descriptions = text_to_sign_descriptions(text, source_language)
        
        return jsonify(sign_descriptions)
    
    @app.route('/api/translation-history', methods=['GET'])
    def translation_history_api():
        # Get translation history for the current user
        user_id = current_user.id if current_user.is_authenticated else None
        
        if user_id:
            history = get_translation_history(user_id)
        else:
            history = []
            
        return jsonify(history)
    
    # AI-powered learning recommendations
    @app.route('/api/learning-recommendations', methods=['GET'])
    @login_required
    def learning_recommendations_api():
        # Get user profile information
        user_profile = {
            'user_id': current_user.id,
            'username': current_user.username,
            'role': current_user.role,
            'preferred_language': current_user.preferred_language
        }
        
        # Get user progress data
        progress_data = {
            'modules': [],
            'quizzes': []
        }
        
        progress_records = Progress.query.filter_by(user_id=current_user.id).all()
        for record in progress_records:
            module = Module.query.get(record.module_id)
            progress_data['modules'].append({
                'module_id': record.module_id,
                'module_name': module.name if module else 'Unknown',
                'progress_percent': record.progress_percent,
                'last_accessed': record.last_accessed.isoformat() if record.last_accessed else None
            })
            
        quiz_results = QuizResult.query.filter_by(user_id=current_user.id).all()
        for result in quiz_results:
            quiz = Quiz.query.get(result.quiz_id)
            progress_data['quizzes'].append({
                'quiz_id': result.quiz_id,
                'quiz_name': quiz.name if quiz else 'Unknown',
                'score': result.score,
                'max_score': result.max_score,
                'completed_at': result.completed_at.isoformat() if result.completed_at else None
            })
            
        # Get personalized learning recommendations
        recommendations = get_learning_recommendations(user_profile, progress_data)
        
        return jsonify(recommendations)
    
    # Error handlers
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('errors/404.html'), 404
        
    @app.errorhandler(500)
    def server_error(e):
        return render_template('errors/500.html'), 500
