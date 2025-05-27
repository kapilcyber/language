// Math Module - Interactive math learning functionality

// DOM Elements
const mathProblemContainer = document.getElementById('math-problem');
const userAnswerInput = document.getElementById('user-answer');
const checkAnswerBtn = document.getElementById('check-answer');
const nextProblemBtn = document.getElementById('next-problem');
const resultDisplay = document.getElementById('result-display');
const mathOperationSelect = document.getElementById('math-operation');
const difficultySelect = document.getElementById('difficulty-level');
const tipsButton = document.getElementById('show-tips');
const tipsContainer = document.getElementById('tips-container');
const mathProgressBar = document.getElementById('math-progress');
const mathStats = document.getElementById('math-stats');

// State variables
let currentProblem = null;
let correctAnswers = 0;
let totalProblems = 0;
let problemStartTime = 0;
let averageSolveTime = 0;
let streakCount = 0;
let previousInvolvesSign = false; // Used to show signs in practice mode

// Initialize the math module
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a math module page
    if (!mathProblemContainer) return;
    
    // Set up event listeners
    if (checkAnswerBtn) checkAnswerBtn.addEventListener('click', checkAnswer);
    if (nextProblemBtn) nextProblemBtn.addEventListener('click', generateNewProblem);
    if (mathOperationSelect) mathOperationSelect.addEventListener('change', generateNewProblem);
    if (difficultySelect) difficultySelect.addEventListener('change', generateNewProblem);
    if (tipsButton) tipsButton.addEventListener('click', toggleTips);
    
    // Allow pressing Enter to check answer
    if (userAnswerInput) {
        userAnswerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkAnswer();
            }
        });
    }
    
    // Generate the first problem
    generateNewProblem();
    
    // Update stats display
    updateStats();
});

// Generate a new math problem based on operation and difficulty
function generateNewProblem() {
    // Hide previous results
    if (resultDisplay) resultDisplay.style.display = 'none';
    
    // Clear previous answer
    if (userAnswerInput) {
        userAnswerInput.value = '';
        userAnswerInput.disabled = false;
        userAnswerInput.focus();
    }
    
    // Disable check button until answer is provided
    if (checkAnswerBtn) checkAnswerBtn.disabled = false;
    
    // Hide next problem button
    if (nextProblemBtn) nextProblemBtn.style.display = 'none';
    
    // Get selected operation and difficulty
    const operation = mathOperationSelect ? mathOperationSelect.value : 'addition';
    const difficulty = difficultySelect ? difficultySelect.value : 'easy';
    
    // Generate problem based on operation and difficulty
    currentProblem = generateProblem(operation, difficulty);
    
    // Record start time
    problemStartTime = Date.now();
    
    // Display the problem
    displayProblem(currentProblem);
}

// Generate a problem based on operation and difficulty
function generateProblem(operation, difficulty) {
    let num1, num2, answer, symbol, problem;
    
    // Set number ranges based on difficulty
    const ranges = {
        easy: { min: 1, max: 10 },
        medium: { min: 10, max: 50 },
        hard: { min: 50, max: 100 }
    };
    
    const range = ranges[difficulty] || ranges.easy;
    
    // Generate random numbers within range
    num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    
    // Create problem based on operation
    switch (operation) {
        case 'addition':
            answer = num1 + num2;
            symbol = '+';
            problem = `${num1} ${symbol} ${num2} = ?`;
            break;
            
        case 'subtraction':
            // Ensure num1 > num2 for easier problems
            if (num1 < num2) [num1, num2] = [num2, num1];
            answer = num1 - num2;
            symbol = '−'; // Using minus sign instead of hyphen
            problem = `${num1} ${symbol} ${num2} = ?`;
            break;
            
        case 'multiplication':
            // Adjust for difficulty
            if (difficulty === 'hard') {
                num1 = Math.floor(Math.random() * 13); // 0-12 for tables
                num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            } else if (difficulty === 'medium') {
                num1 = Math.floor(Math.random() * 10) + 1; // 1-10 for tables
                num2 = Math.floor(Math.random() * 10) + 1; // 1-10
            } else {
                num1 = Math.floor(Math.random() * 5) + 1; // 1-5 for easier tables
                num2 = Math.floor(Math.random() * 5) + 1; // 1-5
            }
            
            answer = num1 * num2;
            symbol = '×'; // Using multiplication symbol
            problem = `${num1} ${symbol} ${num2} = ?`;
            break;
            
        case 'division':
            // For division, we need to ensure clean division
            // Start with the answer and the divisor
            if (difficulty === 'hard') {
                num2 = Math.floor(Math.random() * 10) + 2; // 2-11 as divisor
                answer = Math.floor(Math.random() * 10) + 1; // 1-10 as quotient
            } else if (difficulty === 'medium') {
                num2 = Math.floor(Math.random() * 5) + 2; // 2-6 as divisor
                answer = Math.floor(Math.random() * 10) + 1; // 1-10 as quotient
            } else {
                num2 = Math.floor(Math.random() * 3) + 2; // 2-4 as divisor
                answer = Math.floor(Math.random() * 5) + 1; // 1-5 as quotient
            }
            
            // Calculate the dividend
            num1 = num2 * answer;
            symbol = '÷'; // Using division symbol
            problem = `${num1} ${symbol} ${num2} = ?`;
            break;
            
        case 'mixed':
            // Choose a random operation
            const operations = ['addition', 'subtraction', 'multiplication', 'division'];
            const randomOp = operations[Math.floor(Math.random() * 4)];
            return generateProblem(randomOp, difficulty);
            
        default:
            // Default to addition
            answer = num1 + num2;
            symbol = '+';
            problem = `${num1} ${symbol} ${num2} = ?`;
    }
    
    // Some problems should involve sign language practice
    const involvesSign = Math.random() > 0.7 || previousInvolvesSign;
    previousInvolvesSign = !involvesSign; // Toggle for variety
    
    // Return problem data
    return {
        problem,
        num1,
        num2,
        operation,
        symbol,
        answer,
        difficulty,
        involvesSign
    };
}

// Display the problem in the UI
function displayProblem(problem) {
    if (!mathProblemContainer) return;
    
    // Determine if we should use sign language representation
    if (problem.involvesSign) {
        mathProblemContainer.innerHTML = `
            <div class="sign-math-problem">
                <div class="sign-number">
                    <div class="number-value">${problem.num1}</div>
                    <div class="sign-representation">
                        <i class="fas fa-hands fa-2x"></i>
                    </div>
                </div>
                <div class="operation-symbol">${problem.symbol}</div>
                <div class="sign-number">
                    <div class="number-value">${problem.num2}</div>
                    <div class="sign-representation">
                        <i class="fas fa-hands fa-2x"></i>
                    </div>
                </div>
                <div class="equals-symbol">=</div>
                <div class="question-mark">?</div>
            </div>
        `;
    } else {
        mathProblemContainer.innerHTML = `
            <div class="math-problem-text">
                ${problem.problem}
            </div>
        `;
    }
    
    // Display operation-specific tips
    updateTips(problem.operation);
}

// Check the user's answer
function checkAnswer() {
    if (!currentProblem || !userAnswerInput || !resultDisplay) return;
    
    // Get the user's answer
    const userAnswer = parseFloat(userAnswerInput.value.trim());
    
    // Calculate time taken
    const timeTaken = (Date.now() - problemStartTime) / 1000; // in seconds
    
    // Validate input
    if (isNaN(userAnswer)) {
        resultDisplay.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i> Please enter a valid number.
            </div>
        `;
        resultDisplay.style.display = 'block';
        return;
    }
    
    // Check if the answer is correct
    const isCorrect = userAnswer === currentProblem.answer;
    
    // Update stats
    totalProblems++;
    if (isCorrect) {
        correctAnswers++;
        streakCount++;
        
        // Update average solve time
        if (averageSolveTime === 0) {
            averageSolveTime = timeTaken;
        } else {
            averageSolveTime = (averageSolveTime + timeTaken) / 2;
        }
    } else {
        streakCount = 0;
    }
    
    // Update UI based on result
    if (isCorrect) {
        resultDisplay.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> Correct! Well done.
                <div class="time-taken">Time: ${timeTaken.toFixed(1)} seconds</div>
            </div>
        `;
        
        // Show sign language praise animation
        resultDisplay.innerHTML += `
            <div class="sign-animation">
                <i class="fas fa-thumbs-up fa-3x"></i>
            </div>
        `;
    } else {
        resultDisplay.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-times-circle"></i> Not quite right. The correct answer is ${currentProblem.answer}.
                <div class="explanation">
                    ${getExplanation(currentProblem)}
                </div>
            </div>
        `;
    }
    
    // Show the result
    resultDisplay.style.display = 'block';
    
    // Disable input and check button
    userAnswerInput.disabled = true;
    if (checkAnswerBtn) checkAnswerBtn.disabled = true;
    
    // Show next problem button
    if (nextProblemBtn) nextProblemBtn.style.display = 'inline-block';
    
    // Update progress and stats
    updateProgress();
    updateStats();
}

// Generate explanation for incorrect answers
function getExplanation(problem) {
    switch (problem.operation) {
        case 'addition':
            return `${problem.num1} + ${problem.num2} = ${problem.answer}`;
            
        case 'subtraction':
            return `${problem.num1} - ${problem.num2} = ${problem.answer}`;
            
        case 'multiplication':
            return `${problem.num1} × ${problem.num2} = ${problem.answer}`;
            
        case 'division':
            return `${problem.num1} ÷ ${problem.num2} = ${problem.answer} (${problem.num2} × ${problem.answer} = ${problem.num1})`;
            
        default:
            return `The answer is ${problem.answer}`;
    }
}

// Update the tips based on the current operation
function updateTips(operation) {
    if (!tipsContainer) return;
    
    let tipContent = '';
    
    switch (operation) {
        case 'addition':
            tipContent = `
                <h5>Addition Tips</h5>
                <ul>
                    <li>Count forward from the larger number</li>
                    <li>Break numbers into tens and ones</li>
                    <li>Look for number pairs that make 10</li>
                </ul>
            `;
            break;
            
        case 'subtraction':
            tipContent = `
                <h5>Subtraction Tips</h5>
                <ul>
                    <li>Count backward from the larger number</li>
                    <li>Use the "counting up" method</li>
                    <li>Remember that subtraction is finding the difference</li>
                </ul>
            `;
            break;
            
        case 'multiplication':
            tipContent = `
                <h5>Multiplication Tips</h5>
                <ul>
                    <li>Remember your times tables</li>
                    <li>Multiplication is repeated addition</li>
                    <li>For 5×, multiply by 10 then divide by 2</li>
                </ul>
            `;
            break;
            
        case 'division':
            tipContent = `
                <h5>Division Tips</h5>
                <ul>
                    <li>Division is finding how many groups</li>
                    <li>Think of related multiplication facts</li>
                    <li>Division is the opposite of multiplication</li>
                </ul>
            `;
            break;
            
        case 'mixed':
            tipContent = `
                <h5>General Math Tips</h5>
                <ul>
                    <li>Read the problem carefully</li>
                    <li>Identify the operation (+, -, ×, ÷)</li>
                    <li>Take your time to think</li>
                </ul>
            `;
            break;
    }
    
    tipsContainer.innerHTML = tipContent;
}

// Toggle tips visibility
function toggleTips() {
    if (!tipsContainer || !tipsButton) return;
    
    if (tipsContainer.style.display === 'none' || !tipsContainer.style.display) {
        tipsContainer.style.display = 'block';
        tipsButton.textContent = 'Hide Tips';
    } else {
        tipsContainer.style.display = 'none';
        tipsButton.textContent = 'Show Tips';
    }
}

// Update progress bar
function updateProgress() {
    if (!mathProgressBar) return;
    
    const progressPercent = totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0;
    mathProgressBar.style.width = `${progressPercent}%`;
    mathProgressBar.setAttribute('aria-valuenow', progressPercent);
}

// Update statistics display
function updateStats() {
    if (!mathStats) return;
    
    mathStats.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Correct:</span>
            <span class="stat-value">${correctAnswers}/${totalProblems}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Accuracy:</span>
            <span class="stat-value">${totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0}%</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Current Streak:</span>
            <span class="stat-value">${streakCount}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Avg. Time:</span>
            <span class="stat-value">${averageSolveTime > 0 ? averageSolveTime.toFixed(1) : 0}s</span>
        </div>
    `;
}
