// DOM Elements
const courseSelect = document.getElementById('course-select');
const quizList = document.getElementById('quiz-list');
const addQuizBtn = document.getElementById('add-quiz-btn');
const removeQuizBtn = document.getElementById('remove-quiz-btn');
const quizModal = document.getElementById('quiz-modal');
const questionModal = document.getElementById('question-modal');
const quizForm = document.getElementById('quiz-form');
const questionForm = document.getElementById('question-form');
const addQuestionBtn = document.getElementById('add-question-btn');
const cancelQuizBtn = document.getElementById('cancel-quiz');
const cancelQuestionBtn = document.getElementById('cancel-question');
const closeButtons = document.querySelectorAll('.close-button');

// State variables
let currentCourse = null;
let quizzes = [];
let currentQuiz = null;
let currentQuestionIndex = null;
let isEditing = false;

// Sample course data (would normally come from API)
const courses = [
    {
        _id: "68289b7f08317006d20ac896",
        title: "Introduction to Psychology",
        quizzes: [
            {
                title: "Foundations Quiz",
                timeLimit: 300,
                questions: [
                    {
                        problem: "Who founded psychoanalysis?",
                        choices: ["Pavlov", "Skinner", "Freud", "Maslow"],
                        answer: "Freud"
                    },
                    {
                        problem: "Which school focused on observable behavior?",
                        choices: ["Structuralism", "Behaviorism", "Humanism", "Gestalt"],
                        answer: "Behaviorism"
                    }
                ]
            },
            {
                title: "Biological Psychology Quiz",
                timeLimit: 300,
                questions: [
                    {
                        problem: "Which brain area controls movement?",
                        choices: ["Hippocampus", "Amygdala", "Cerebellum", "Frontal lobe"],
                        answer: "Cerebellum"
                    }
                ]
            }
        ]
    },
    {
        _id: "68289b7f08317006d20ac897",
        title: "Computer Science 101",
        quizzes: [
            {
                title: "Programming Basics Quiz",
                timeLimit: 240,
                questions: [
                    {
                        problem: "What does HTML stand for?",
                        choices: ["Hyperlinks and Text Markup Language", "Home Tool Markup Language", "Hyper Text Markup Language", "Hyper Text Marking Language"],
                        answer: "Hyper Text Markup Language"
                    }
                ]
            }
        ]
    }
];

// Initialize the dashboard
function initDashboard() {
    loadCourses();
    setupEventListeners();
}

// Load courses into the dropdown
function loadCourses() {
    courseSelect.innerHTML = '<option value="">-- Select a Course --</option>';
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course._id;
        option.textContent = course.title;
        courseSelect.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Course selection
    courseSelect.addEventListener('change', (e) => {
        const courseId = e.target.value;
        currentCourse = courses.find(c => c._id === courseId);
        loadQuizzes();
    });

    // Quiz buttons
    addQuizBtn.addEventListener('click', () => {
        if (!currentCourse) {
            alert('Please select a course first');
            return;
        }
        openQuizModal();
    });

    removeQuizBtn.addEventListener('click', () => {
        if (!currentQuiz) {
            alert('Please select a quiz to remove');
            return;
        }
        if (confirm(`Are you sure you want to remove the quiz "${currentQuiz.title}"?`)) {
            removeQuiz();
        }
    });

    // Quiz form submission
    quizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveQuiz();
    });

    // Question form submission
    questionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveQuestion();
    });

    // Add question button
    addQuestionBtn.addEventListener('click', () => {
        openQuestionModal();
    });

    // Cancel buttons
    cancelQuizBtn.addEventListener('click', closeQuizModal);
    cancelQuestionBtn.addEventListener('click', closeQuestionModal);

    // Close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (quizModal.style.display === 'flex') closeQuizModal();
            if (questionModal.style.display === 'flex') closeQuestionModal();
        });
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === quizModal) closeQuizModal();
        if (e.target === questionModal) closeQuestionModal();
    });
}

// Load quizzes for the selected course
function loadQuizzes() {
    quizList.innerHTML = '';
    currentQuiz = null;
    
    if (!currentCourse || !currentCourse.quizzes || currentCourse.quizzes.length === 0) {
        quizList.innerHTML = '<div class="placeholder-message"><p>No quizzes found for this course.</p></div>';
        return;
    }

    quizzes = currentCourse.quizzes;
    
    quizzes.forEach((quiz, index) => {
        const quizItem = document.createElement('div');
        quizItem.className = 'quiz-item';
        quizItem.dataset.index = index;
        
        quizItem.innerHTML = `
            <div class="quiz-info">
                <h3>${quiz.title}</h3>
                <div class="quiz-meta">
                    <span><i class="fas fa-clock"></i> ${quiz.timeLimit / 60} min</span>
                    <span><i class="fas fa-question-circle"></i> ${quiz.questions.length} questions</span>
                </div>
            </div>
            <button class="action-button edit-button">Edit</button>
        `;
        
        quizItem.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                currentQuiz = quiz;
                currentQuestionIndex = null;
                openQuizModal(true);
            } else {
                // Select for removal
                document.querySelectorAll('.quiz-item').forEach(item => {
                    item.classList.remove('selected');
                });
                quizItem.classList.add('selected');
                currentQuiz = quiz;
            }
        });
        
        quizList.appendChild(quizItem);
    });
}

// Open quiz modal for adding/editing
function openQuizModal(editing = false) {
    isEditing = editing;
    const modalTitle = document.getElementById('quiz-modal-title');
    const questionList = document.getElementById('question-list');
    
    if (editing) {
        modalTitle.textContent = `Edit Quiz: ${currentQuiz.title}`;
        document.getElementById('quiz-title').value = currentQuiz.title;
        document.getElementById('quiz-time').value = currentQuiz.timeLimit / 60;
        
        // Load questions
        questionList.innerHTML = '';
        currentQuiz.questions.forEach((question, index) => {
            addQuestionToDOM(question, index);
        });
    } else {
        modalTitle.textContent = 'Add New Quiz';
        document.getElementById('quiz-title').value = '';
        document.getElementById('quiz-time').value = 5;
        questionList.innerHTML = '';
        currentQuiz = {
            title: '',
            timeLimit: 300,
            questions: []
        };
    }
    
    quizModal.style.display = 'flex';
}

// Close quiz modal
function closeQuizModal() {
    quizModal.style.display = 'none';
}

// Open question modal for adding/editing
function openQuestionModal(editing = false, questionIndex = null) {
    const modalTitle = document.getElementById('question-modal-title');
    const questionForm = document.getElementById('question-form');
    
    if (editing && questionIndex !== null) {
        modalTitle.textContent = 'Edit Question';
        const question = currentQuiz.questions[questionIndex];
        document.getElementById('question-text').value = question.problem;
        
        const choiceInputs = document.querySelectorAll('.choice-text');
        const correctRadios = document.querySelectorAll('input[name="correct-choice"]');
        
        question.choices.forEach((choice, index) => {
            choiceInputs[index].value = choice;
            if (choice === question.answer) {
                correctRadios[index].checked = true;
            }
        });
        
        currentQuestionIndex = questionIndex;
    } else {
        modalTitle.textContent = 'Add Question';
        document.getElementById('question-text').value = '';
        document.querySelectorAll('.choice-text').forEach(input => {
            input.value = '';
        });
        document.querySelector('input[name="correct-choice"]').checked = true;
        currentQuestionIndex = null;
    }
    
    questionModal.style.display = 'flex';
}

// Close question modal
function closeQuestionModal() {
    questionModal.style.display = 'none';
}

// Add question to DOM
function addQuestionToDOM(question, index) {
    const questionList = document.getElementById('question-list');
    const questionItem = document.createElement('div');
    questionItem.className = 'question-item';
    questionItem.dataset.index = index;
    
    questionItem.innerHTML = `
        <div class="question-actions">
            <button class="edit-question-btn" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="remove-question-btn" title="Remove"><i class="fas fa-trash"></i></button>
        </div>
        <h4>${question.problem}</h4>
        <ol class="question-choices">
            ${question.choices.map((choice, i) => `
                <li class="${choice === question.answer ? 'correct-answer' : ''}">${choice}</li>
            `).join('')}
        </ol>
    `;
    
    // Add event listeners for question actions
    questionItem.querySelector('.edit-question-btn').addEventListener('click', () => {
        openQuestionModal(true, index);
    });
    
    questionItem.querySelector('.remove-question-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to remove this question?')) {
            currentQuiz.questions.splice(index, 1);
            loadQuizzes(); // Refresh the quiz list
            openQuizModal(true); // Reopen modal with updated questions
        }
    });
    
    questionList.appendChild(questionItem);
}

// Save quiz to the database (simulated)
function saveQuiz() {
    const title = document.getElementById('quiz-title').value;
    const timeLimit = document.getElementById('quiz-time').value * 60;
    
    currentQuiz.title = title;
    currentQuiz.timeLimit = timeLimit;
    
    if (isEditing) {
        // Find and update the quiz in the course
        const quizIndex = currentCourse.quizzes.findIndex(q => q.title === currentQuiz.title);
        if (quizIndex !== -1) {
            currentCourse.quizzes[quizIndex] = currentQuiz;
        }
    } else {
        // Add new quiz
        currentCourse.quizzes.push(currentQuiz);
    }
    
    closeQuizModal();
    loadQuizzes();
    alert('Quiz saved successfully!');
}

// Save question to the current quiz
function saveQuestion() {
    const problem = document.getElementById('question-text').value;
    const choiceInputs = document.querySelectorAll('.choice-text');
    const correctRadio = document.querySelector('input[name="correct-choice"]:checked');
    
    const choices = Array.from(choiceInputs).map(input => input.value);
    const answer = choices[parseInt(correctRadio.value)];
    
    const question = {
        problem,
        choices,
        answer
    };
    
    if (currentQuestionIndex !== null) {
        // Update existing question
        currentQuiz.questions[currentQuestionIndex] = question;
    } else {
        // Add new question
        currentQuiz.questions.push(question);
    }
    
    closeQuestionModal();
    openQuizModal(true); // Reopen quiz modal to show updated questions
}

// Remove quiz from the course
function removeQuiz() {
    if (!currentQuiz) return;
    
    const quizIndex = currentCourse.quizzes.findIndex(q => q.title === currentQuiz.title);
    if (quizIndex !== -1) {
        currentCourse.quizzes.splice(quizIndex, 1);
        loadQuizzes();
        alert('Quiz removed successfully!');
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);