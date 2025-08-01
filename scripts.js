// CDL Training Platform - Main JavaScript

// Global variables for quiz functionality
let currentQuiz = null;
let userAnswers = {};
let isChecked = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up accessibility features
    setupAccessibility();
    
    // Add hover effects to available modules
    setupModuleHoverEffects();
    
    // Initialize quiz if on quiz page
    if (document.getElementById('quizContent')) {
        initializeQuiz();
    }
}

function setupAccessibility() {
    // Make module cards focusable for accessibility
    document.querySelectorAll('.module-card.available').forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        const titleElement = card.querySelector('.module-title');
        if (titleElement) {
            card.setAttribute('aria-label', `Open ${titleElement.textContent} module`);
        }
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const focusedElement = document.activeElement;
            if (focusedElement.classList.contains('module-card') && focusedElement.classList.contains('available')) {
                e.preventDefault();
                focusedElement.click();
            }
        }
    });
}

function setupModuleHoverEffects() {
    const availableModules = document.querySelectorAll('.module-card.available');
    availableModules.forEach(module => {
        module.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        module.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
        });
    });
}

function initializeQuiz() {
    // Show quiz selector by default
    showQuizSelector();
}

// Navigation Functions
function showQuizSelector() {
    const quizSelector = document.getElementById('quizSelector');
    const quizContent = document.getElementById('quizContent');
    
    if (quizSelector) quizSelector.style.display = 'block';
    if (quizContent) quizContent.classList.remove('active');
    
    // Reset quiz state
    currentQuiz = null;
    userAnswers = {};
    isChecked = false;
}

function goBackToHub() {
    window.location.href = 'index.html';
}

// Module Navigation
function openModule(moduleCode) {
    showLoadingState(moduleCode);
    
    // Map module codes to their corresponding files
    const moduleFiles = {
        'CDLC2': 'cdlc2-trucking.html',
        'CDLC3': 'cdlc3-controls.html',
        'CDLC4': 'cdlc4-inspections.html',
        'CDLC5': 'cdlc5-basic-control.html',
        'CDLC7': 'cdlc7-backing.html'
    };
    
    const fileName = moduleFiles[moduleCode];
    if (fileName) {
        setTimeout(() => {
            window.location.href = fileName;
        }, 1000);
    } else {
        setTimeout(() => {
            alert('This module is coming soon! Check back for updates.');
        }, 1000);
    }
}



// Quiz Functions
function loadQuiz(quizKey, quizData) {
    currentQuiz = quizKey;
    const quiz = quizData[quizKey];
    
    if (!quiz) {
        alert('This quiz module is not available!');
        return;
    }

    const quizSelector = document.getElementById('quizSelector');
    const quizContent = document.getElementById('quizContent');
    
    if (quizSelector) quizSelector.style.display = 'none';
    if (quizContent) quizContent.classList.add('active');
    
    displayQuestions(quiz);
    updateProgress();
    updateScore();
    
    // Reset controls
    const checkAnswers = document.getElementById('checkAnswers');
    const resetQuiz = document.getElementById('resetQuiz');
    const showResults = document.getElementById('showResults');
    
    if (checkAnswers) checkAnswers.style.display = 'inline-block';
    if (resetQuiz) resetQuiz.disabled = true;
    if (showResults) showResults.style.display = 'none';
    
    isChecked = false;
}

function displayQuestions(quiz) {
    const container = document.getElementById('questionsContainer');
    if (!container) return;
    
    container.innerHTML = '';

    quiz.questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-container';
        questionDiv.innerHTML = `
            <div class="question">${index + 1}. ${q.question}</div>
            <div class="options">
                ${q.options.map((option, optIndex) => `
                    <label class="option" onclick="selectOption(${index}, ${optIndex})">
                        <input type="radio" name="q${index}" value="${optIndex}">
                        <span>${String.fromCharCode(97 + optIndex)}. ${option}</span>
                    </label>
                `).join('')}
            </div>
        `;
        container.appendChild(questionDiv);
    });
}

function selectOption(questionIndex, optionIndex) {
    if (isChecked) return;
    
    userAnswers[questionIndex] = optionIndex;
    
    // Update visual selection
    const questionContainer = document.querySelectorAll('.question-container')[questionIndex];
    const options = questionContainer.querySelectorAll('.option');
    
    options.forEach((option, index) => {
        option.classList.remove('selected');
        if (index === optionIndex) {
            option.classList.add('selected');
        }
    });
    
    updateProgress();
    updateScore();
}

function updateProgress() {
    if (!currentQuiz) return;
    
    // This function will be customized per quiz page with the specific quiz data
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        // Generic progress update - will be overridden in individual quiz pages
        const totalQuestions = document.querySelectorAll('.question-container').length;
        const answeredQuestions = Object.keys(userAnswers).length;
        const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
        progressFill.style.width = progress + '%';
    }
}

function updateScore() {
    if (!currentQuiz) return;
    
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (!scoreDisplay) return;
    
    const totalQuestions = document.querySelectorAll('.question-container').length;
    const answeredQuestions = Object.keys(userAnswers).length;
    
    let correctAnswers = 0;
    if (isChecked && window.currentQuizData) {
        Object.keys(userAnswers).forEach(questionIndex => {
            const userAnswer = userAnswers[questionIndex];
            const correctAnswer = window.currentQuizData[currentQuiz].questions[questionIndex].correct;
            if (userAnswer === correctAnswer) {
                correctAnswers++;
            }
        });
    }
    
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const scoreText = isChecked 
        ? `Score: ${correctAnswers}/${totalQuestions} (${percentage}%)`
        : `Progress: ${answeredQuestions}/${totalQuestions} questions answered`;
    
    scoreDisplay.textContent = scoreText;
    
    // Update score display color based on performance
    if (isChecked) {
        if (percentage >= 80) {
            scoreDisplay.style.background = 'linear-gradient(135deg, #00b894, #00a085)';
        } else if (percentage >= 70) {
            scoreDisplay.style.background = 'linear-gradient(135deg, #fdcb6e, #e17055)';
        } else {
            scoreDisplay.style.background = 'linear-gradient(135deg, #fd79a8, #e84393)';
        }
    } else {
        scoreDisplay.style.background = 'linear-gradient(135deg, #fdcb6e, #e17055)';
    }
}

function checkAnswers() {
    if (!currentQuiz || !window.currentQuizData) return;
    
    const totalQuestions = window.currentQuizData[currentQuiz].questions.length;
    const answeredQuestions = Object.keys(userAnswers).length;
    
    if (answeredQuestions < totalQuestions) {
        alert(`Please answer all questions before checking. You have answered ${answeredQuestions} out of ${totalQuestions} questions.`);
        return;
    }
    
    isChecked = true;
    
    // Show correct/incorrect answers
    window.currentQuizData[currentQuiz].questions.forEach((q, questionIndex) => {
        const questionContainer = document.querySelectorAll('.question-container')[questionIndex];
        const options = questionContainer.querySelectorAll('.option');
        const userAnswer = userAnswers[questionIndex];
        const correctAnswer = q.correct;
        
        options.forEach((option, optionIndex) => {
            option.style.pointerEvents = 'none';
            
            if (optionIndex === correctAnswer) {
                option.classList.add('correct');
            } else if (optionIndex === userAnswer && userAnswer !== correctAnswer) {
                option.classList.add('incorrect');
            }
        });
    });
    
    updateScore();
    
    // Update controls
    const checkAnswers = document.getElementById('checkAnswers');
    const resetQuiz = document.getElementById('resetQuiz');
    const showResults = document.getElementById('showResults');
    
    if (checkAnswers) checkAnswers.style.display = 'none';
    if (resetQuiz) resetQuiz.disabled = false;
    if (showResults) showResults.style.display = 'inline-block';
}

function resetQuiz() {
    if (!currentQuiz) return;
    
    userAnswers = {};
    isChecked = false;
    
    // Reset all visual indicators
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('correct', 'incorrect', 'selected');
        option.style.pointerEvents = 'auto';
        const radio = option.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
    });
    
    updateProgress();
    updateScore();
    
    // Reset controls
    const checkAnswers = document.getElementById('checkAnswers');
    const resetQuiz = document.getElementById('resetQuiz');
    const showResults = document.getElementById('showResults');
    
    if (checkAnswers) checkAnswers.style.display = 'inline-block';
    if (resetQuiz) resetQuiz.disabled = true;
    if (showResults) showResults.style.display = 'none';
}

function showResults() {
    if (!currentQuiz || !isChecked || !window.currentQuizData) return;
    
    const quiz = window.currentQuizData[currentQuiz];
    const totalQuestions = quiz.questions.length;
    let correctAnswers = 0;
    let resultDetails = [];
    
    quiz.questions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = q.correct;
        const isCorrect = userAnswer === correctAnswer;
        
        if (isCorrect) correctAnswers++;
        
        resultDetails.push({
            question: q.question,
            userAnswer: q.options[userAnswer],
            correctAnswer: q.options[correctAnswer],
            isCorrect: isCorrect
        });
    });
    
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    let resultMessage = `Quiz Results for ${quiz.title}\n\n`;
    resultMessage += `Score: ${correctAnswers}/${totalQuestions} (${percentage}%)\n\n`;
    
    if (percentage >= 80) {
        resultMessage += "🎉 Excellent work! You're well-prepared for this topic.\n\n";
    } else if (percentage >= 70) {
        resultMessage += "👍 Good job! Review the incorrect answers to improve further.\n\n";
    } else {
        resultMessage += "📚 Keep studying! Focus on the areas where you missed questions.\n\n";
    }
    
    resultMessage += "Detailed Results:\n";
    resultDetails.forEach((result, index) => {
        const status = result.isCorrect ? "✅" : "❌";
        resultMessage += `\n${index + 1}. ${status} ${result.question.substring(0, 60)}...\n`;
        if (!result.isCorrect) {
            resultMessage += `   Your answer: ${result.userAnswer}\n`;
            resultMessage += `   Correct answer: ${result.correctAnswer}\n`;
        }
    });
    
    alert(resultMessage);
}

// Utility Functions
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}