// DOM Elements
const quizForm = document.getElementById('quiz-form');
const timerElement = document.getElementById('quiz-timer');
const progressBar = document.getElementById('quiz-progress');
const nextButton = document.getElementById('next-question');
const prevButton = document.getElementById('prev-question');
const submitButton = document.getElementById('submit-quiz');
const feedbackElement = document.getElementById('question-feedback');

// Quiz state variables
let currentQuestionIndex = 0;
let quizTime = 0;
let timerInterval = null;
let quizQuestions = [];
let quizAnswers = {};
let isQuizSubmitted = false;

// Initialize the quiz
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a quiz page
    if (!quizForm) return;
    
    // Get all question containers
    const questionContainers = document.querySelectorAll('.question-container');
    if (questionContainers.length === 0) return;
    
    // Setup question data
    quizQuestions = Array.from(questionContainers);
    
    // Initialize the quiz
    initQuiz();
    
    // Event listeners
    if (nextButton) nextButton.addEventListener('click', nextQuestion);
    if (prevButton) prevButton.addEventListener('click', prevQuestion);
    if (submitButton) submitButton.addEventListener('click', confirmSubmitQuiz);
    
    // Listen for input changes
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', function() {
            saveAnswer(this.name, this.value);
            updateButtons();
        });
    });
    
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            saveAnswer(this.name, this.value);
            updateButtons();
        });
    });
    
    // Start quiz timer
    startTimer();
});

// Initialize the quiz
function initQuiz() {
    // Show only the first question
    quizQuestions.forEach((question, index) => {
        question.style.display = index === 0 ? 'block' : 'none';
    });
    
    // Update navigation buttons
    updateButtons();
    
    // Setup progress bar
    if (progressBar) {
        progressBar.setAttribute('aria-valuemax', quizQuestions.length);
        updateProgress();
    }
}

// Go to the next question
function nextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        // Hide current question
        quizQuestions[currentQuestionIndex].style.display = 'none';
        
        // Show next question
        currentQuestionIndex++;
        quizQuestions[currentQuestionIndex].style.display = 'block';
        
        // Update UI
        updateButtons();
        updateProgress();
        
        // Scroll to top of the question
        quizQuestions[currentQuestionIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Go to the previous question
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        // Hide current question
        quizQuestions[currentQuestionIndex].style.display = 'none';
        
        // Show previous question
        currentQuestionIndex--;
        quizQuestions[currentQuestionIndex].style.display = 'block';
        
        // Update UI
        updateButtons();
        updateProgress();
        
        // Scroll to top of the question
        quizQuestions[currentQuestionIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Update navigation buttons state
function updateButtons() {
    if (prevButton) {
        prevButton.disabled = currentQuestionIndex === 0;
    }
    
    if (nextButton) {
        nextButton.disabled = currentQuestionIndex === quizQuestions.length - 1;
    }
    
    if (submitButton) {
        // Enable submit if all questions have answers
        const allAnswered = checkAllQuestionsAnswered();
        submitButton.disabled = !allAnswered || isQuizSubmitted;
    }
}

// Update the progress bar
function updateProgress() {
    if (!progressBar) return;
    
    const progress = Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100);
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', currentQuestionIndex + 1);
    progressBar.textContent = `${currentQuestionIndex + 1} / ${quizQuestions.length}`;
}

// Save the answer to the current question
function saveAnswer(questionName, value) {
    quizAnswers[questionName] = value;
    
    // If we have a feedback area, disable it as the user has changed their answer
    if (feedbackElement) {
        feedbackElement.style.display = 'none';
    }
}

// Check if all questions have been answered
function checkAllQuestionsAnswered() {
    for (let i = 0; i < quizQuestions.length; i++) {
        const questionId = quizQuestions[i].getAttribute('data-question-id');
        const inputName = `question_${questionId}`;
        
        // Skip check if this isn't a required question
        if (quizQuestions[i].getAttribute('data-required') === 'false') {
            continue;
        }
        
        // Check if we have an answer for this question
        if (!quizAnswers[inputName]) {
            return false;
        }
    }
    
    return true;
}

// Start the quiz timer
function startTimer() {
    if (!timerElement) return;
    
    const startTime = Date.now();
    
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        quizTime = elapsedTime;
        
        // Format the time
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Stop the quiz timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Confirm quiz submission
function confirmSubmitQuiz() {
    if (isQuizSubmitted) return;
    
    // Check if all required questions are answered
    if (!checkAllQuestionsAnswered()) {
        alert('Please answer all required questions before submitting.');
        return;
    }
    
    const confirmSubmit = confirm('Are you sure you want to submit your quiz? You cannot change your answers after submission.');
    
    if (confirmSubmit) {
        submitQuiz();
    }
}

// Submit the quiz
function submitQuiz() {
    // Stop the timer
    stopTimer();
    
    // Disable all inputs
    document.querySelectorAll('#quiz-form input, #quiz-form textarea, #quiz-form button').forEach(el => {
        el.disabled = true;
    });
    
    // Add hidden input for quiz time
    const timeInput = document.createElement('input');
    timeInput.type = 'hidden';
    timeInput.name = 'quiz_time';
    timeInput.value = quizTime;
    quizForm.appendChild(timeInput);
    
    // Set flag
    isQuizSubmitted = true;
    
    // Submit the form
    quizForm.submit();
}

// Show instant feedback for a question (if enabled)
function showFeedback(questionId, isCorrect, correctAnswer) {
    if (!feedbackElement) return;
    
    if (isCorrect) {
        feedbackElement.innerHTML = `
            <div class="alert alert-success mt-3">
                <i class="fas fa-check-circle"></i> Correct answer!
            </div>
        `;
    } else {
        feedbackElement.innerHTML = `
            <div class="alert alert-danger mt-3">
                <i class="fas fa-times-circle"></i> Incorrect. The correct answer is: ${correctAnswer}
            </div>
        `;
    }
    
    feedbackElement.style.display = 'block';
}
