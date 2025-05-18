import { GetCourseList, addQuiz, removeQuiz, updateQuiz } from "../Utilities/api.js";
import { hideLoading, showLoading } from "../Utilities/loader.js";
import { showNotification } from "../Utilities/notification.js";
    const manageModules =document.querySelector(".li-module");
    const manageQuiz = document.querySelector(".li-quiz");

    manageModules.addEventListener("click", e =>{
        showLoading();
        setTimeout(() => {
            window.location.href = "./managemodules.html";
            hideLoading();
        }, 2000);
    })
    manageQuiz.addEventListener("click", e =>{
        showLoading();
        setTimeout(() => {
            window.location.href = "./managequiz.html";
            hideLoading();
        }, 2000);
    })
// DOM Elements
const courseSelect = document.getElementById('course-select');
const quizList = document.getElementById('quiz-list');
const addQuizBtn = document.getElementById('add-quiz-btn');
const removeQuizBtn = document.getElementById('remove-quiz-btn');
const editQuizBtn = document.getElementById('edit-quiz-btn'); // Add this button to your HTML
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
let currentCourseIndex = null;
let quizzes = [];
let currentQuiz = null;
let selectedQuizIndex = null;
let currentQuestionIndex = null;
let isEditing = false;

// Initialize the page
window.onload = async (e) => {
    e.preventDefault();
    const logout = document.querySelector("#logout-button");
    logout.addEventListener("click", (e)=>{
    window.location.href = "../auth/login.html";
    sessionStorage.removeItem("user");
    })
    const courses = await GetCourseList();
    courses.result.forEach((course, index) => {
        const option = document.createElement("option");
        option.setAttribute("value", index);
        option.textContent = course.title;
        courseSelect.appendChild(option);
    });
};

// Event Listeners
courseSelect.addEventListener('change', loadQuizzes);
addQuizBtn.addEventListener('click', showAddQuizModal);
removeQuizBtn.addEventListener('click', removeSelectedQuiz);
editQuizBtn.addEventListener('click', editSelectedQuiz); // New event listener for edit
quizForm.addEventListener('submit', (e)=>{
    saveQuizData(e);
});
questionForm.addEventListener('submit', saveQuestionData);
addQuestionBtn.addEventListener('click', showAddQuestionModal);
cancelQuizBtn.addEventListener('click', hideQuizModal);
cancelQuestionBtn.addEventListener('click', hideQuestionModal);
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (quizModal.style.display === 'flex') hideQuizModal();
        if (questionModal.style.display === 'flex') hideQuestionModal();
    });
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === quizModal) hideQuizModal();
    if (e.target === questionModal) hideQuestionModal();
});

// Load quizzes for selected course
async function loadQuizzes() {
    showLoading();
    const courseIndex = courseSelect.value;
    quizList.innerHTML = '';
    selectedQuizIndex = null;
    
    if (!courseIndex) {
        showNotification("Select a course", "info")
        quizList.innerHTML = '<div class="placeholder-message"><p>Select a course to view or manage its quizzes.</p></div>';
        return;
    }
    
    const courses = await GetCourseList();
    currentCourse = courses.result[courseIndex];
    currentCourseIndex = courseIndex;
    quizzes = currentCourse.quizzes || [];
    
    if (quizzes.length === 0) {
        showNotification("No quizzes", "info")
        quizList.innerHTML = '<div class="placeholder-message"><p>This course currently has no quizzes.</p></div>';
        return;
    }
    
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
            <input type="radio" name="selected-quiz" value="${index}">
        `;
        
        quizItem.addEventListener('click', (e) => {
            if (e.target.type === 'radio') {
                // Select for edit/remove
                document.querySelectorAll('.quiz-item').forEach(item => {
                    item.classList.remove('selected');
                });
                quizItem.classList.add('selected');
                selectedQuizIndex = index;
                currentQuiz = quizzes[index];
            }
        });
        
        quizList.appendChild(quizItem);
    });
    hideLoading();
}

// Show modal for adding a new quiz
function showAddQuizModal() {
    showLoading();
    if (!courseSelect.value) {
        showNotification('Please select a course first', "info");
        return;
    }
    
    isEditing = false;
    currentQuiz = {
        title: '',
        timeLimit: 300, // 5 minutes in seconds
        questions: []
    };
    
    document.getElementById('quiz-modal-title').textContent = 'Add New Quiz';
    document.getElementById('quiz-title').value = '';
    document.getElementById('quiz-time').value = 5;
    document.getElementById('question-list').innerHTML = '';
    
    quizModal.style.display = 'flex';
    hideLoading();
}

// Show modal for editing an existing quiz
function editSelectedQuiz() {
    showLoading();
    if (selectedQuizIndex === null) {
        showNotification('Please select a quiz to edit', "info");
        return;
    }
    
    isEditing = true;
    currentQuiz = quizzes[selectedQuizIndex];
    showEditQuizModal();
    hideLoading();
}

function showEditQuizModal() {
    showLoading()
    if (!currentQuiz) return;
    
    document.getElementById('quiz-modal-title').textContent = `Edit Quiz: ${currentQuiz.title}`;
    document.getElementById('quiz-title').value = currentQuiz.title;
    document.getElementById('quiz-time').value = currentQuiz.timeLimit / 60;
    
    const questionList = document.getElementById('question-list');
    questionList.innerHTML = '';
    
    currentQuiz.questions.forEach((question, index) => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.innerHTML = `
            <div class="question-actions">
                <button type="button" class="edit-question-btn" data-index="${index}" title="Edit"><i class="fas fa-edit"></i></button>
                <button type="button" class="remove-question-btn" data-index="${index}" title="Remove"><i class="fas fa-trash"></i></button>
            </div>
            <h4>${question.problem}</h4>
            <ol class="question-choices">
                ${question.choices.map((choice, i) => `
                    <li class="${choice === question.answer ? 'correct-answer' : ''}">${choice}</li>
                `).join('')}
            </ol>
        `;
        
        // Modified event listener for edit button
        questionItem.querySelector('.edit-question-btn').addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default behavior
            e.stopPropagation(); // Stop event bubbling
            showEditQuestionModal(parseInt(e.target.closest('button').dataset.index));
        });
        
        questionItem.querySelector('.remove-question-btn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Are you sure you want to remove this question?')) {
                currentQuiz.questions.splice(parseInt(e.target.closest('button').dataset.index), 1);
                showEditQuizModal(); // Refresh the view
                showNotification("Removed", "success");
            }
        });
        
        questionList.appendChild(questionItem);
    });
    
    quizModal.style.display = 'flex';
    hideLoading();
}

// Hide quiz modal
function hideQuizModal() {
    showLoading();
    quizModal.style.display = 'none';
    hideLoading();
}

// Show modal for adding a new question
function showAddQuestionModal() {
    showLoading();
    currentQuestionIndex = null;
    document.getElementById('question-modal-title').textContent = 'Add Question';
    document.getElementById('question-text').value = '';
    document.querySelectorAll('.choice-text').forEach((input, index) => {
        input.value = '';
        if (index === 0) {
            input.closest('.choice-input').querySelector('input[type="radio"]').checked = true;
        }
    });
    questionModal.style.display = 'flex';
    hideLoading();
}

// Show modal for editing an existing question
function showEditQuestionModal(questionIndex) {
    showLoading();
    currentQuestionIndex = questionIndex;
    const question = currentQuiz.questions[questionIndex];
    
    document.getElementById('question-modal-title').textContent = 'Edit Question';
    document.getElementById('question-text').value = question.problem;
    
    document.querySelectorAll('.choice-text').forEach((input, index) => {
        input.value = question.choices[index] || '';
        input.closest('.choice-input').querySelector('input[type="radio"]').checked = (question.answer === question.choices[index]);
    });
    
    questionModal.style.display = 'flex';
    hideLoading();
}

// Hide question modal
function hideQuestionModal() {
    showLoading();
    questionModal.style.display = 'none';
    hideLoading();
}

// Save quiz data (add or update)
async function saveQuizData(e) {
    e.preventDefault();
    showLoading();
    const title = document.getElementById('quiz-title').value;
    const timeLimit = Math.abs(Number(document.getElementById('quiz-time').value)) * 60;
    
    currentQuiz.title = title;
    currentQuiz.timeLimit = timeLimit;
    currentQuiz.maxScore = currentQuiz.questions.length;
    
    const courses = await GetCourseList();
    const courseTitle = courses.result[currentCourseIndex].title;
    const originalQuizTitle = selectedQuizIndex != null? courses.result[currentCourseIndex].quizzes[selectedQuizIndex].title : null; // Keep original for URL
    
    try {
        if (isEditing) {
            await updateQuiz({
                courseTitle,
                quizTitle: originalQuizTitle, // Use original title in URL
                quiz: currentQuiz            // Send new data including new title
            });
        } else {
            await addQuiz({
                courseTitle,
                quiz: currentQuiz
            });
        }
        
        hideQuizModal();
        loadQuizzes();
        showNotification('Quiz saved successfully!', "success");
    } catch (error) {
        console.error('Error saving quiz:', error);
        showNotification(`Failed to save quiz`, "error");
    }
    hideLoading();
}

// Save question to the current quiz
function saveQuestionData(e) {
    e.preventDefault();
    showLoading();
    const problem = document.getElementById('question-text').value;
    const choices = Array.from(document.querySelectorAll('.choice-text')).map(input => input.value);
    const answerIndex = parseInt(document.querySelector('input[name="correct-choice"]:checked').value);
    const answer = choices[answerIndex];
    
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
    
    hideQuestionModal();
    if (isEditing) {
        showEditQuizModal();
    } else {
        document.getElementById('question-list').innerHTML = '';
        currentQuiz.questions.forEach((q, i) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            questionItem.innerHTML = `
                <div class="question-actions">
                    <button class="edit-question-btn" data-index="${i}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="remove-question-btn" data-index="${i}" title="Remove"><i class="fas fa-trash"></i></button>
                </div>
                <h4>${q.problem}</h4>
                <ol class="question-choices">
                    ${q.choices.map((choice, idx) => `
                        <li class="${choice === q.answer ? 'correct-answer' : ''}">${choice}</li>
                    `).join('')}
                </ol>
            `;
            
            questionItem.querySelector('.edit-question-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                showEditQuestionModal(parseInt(e.target.closest('button').dataset.index));
            });
            
            questionItem.querySelector('.remove-question-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to remove this question?')) {
                    currentQuiz.questions.splice(parseInt(e.target.closest('button').dataset.index), 1);
                    questionItem.remove();
                    showNotification("Removed","success")
                }
            });
            
            document.getElementById('question-list').appendChild(questionItem);
        });
    }
    hideLoading();
}

// Remove selected quiz
async function removeSelectedQuiz() {
    showLoading();
    if (selectedQuizIndex === null) {
        showNotification('Please select a quiz to remove');
        return;
    }
    
    if (!confirm(`Are you sure you want to remove the quiz "${quizzes[selectedQuizIndex].title}"?`)) {
        return;
    }
    
    try {
        const courses = await GetCourseList();
        const courseTitle = courses.result[currentCourseIndex].title;
        const quizTitle = quizzes[selectedQuizIndex].title;
        
        await removeQuiz({ courseTitle, quizTitle });
        loadQuizzes();
        showNotification('Quiz removed successfully!',"success");
    } catch (error) {
        console.error('Error removing quiz:', error);
        showNotification(`Failed to remove quiz`, "error");
    }
    hideLoading();
}