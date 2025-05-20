import { AccountInfo, GetCourse, GetCourseList, GetInfoSummary, ModuleStatus, updateProfile, UpdateScore } from "../Utilities/api.js";
import { checkAnswers } from "../Utilities/checkAnswers.js";
import { formatText } from "../Utilities/fomatting.js";
import { hideLoading, showLoading } from "../Utilities/loader.js";
import { showNotification } from "../Utilities/notification.js";
import QuizTimer from "../Utilities/QuizTimer.js";
import { logout } from "./logout.js";
import { supportPage } from "./static.js";

window.onload = (e) =>{
    e.preventDefault();
    e.stopPropagation()
    logout();
}

const getUser = () =>{
    return sessionStorage.getItem("user");
}    

const dashboard = document.querySelector(".dashboard button");
const profile = document.querySelector(".profile button");
const progress = document.querySelector(".progress button");
const tm = document.querySelector(".training-modules button");
const support = document.querySelector(".support button");

const clearActiveClass = ()=>{
    const links = document.querySelectorAll("li");
    links.forEach((el) =>{
        el.classList.remove("active");
    })
}
window.addEventListener("load",async (e) =>{
    showLoading()
    setTimeout(async () => {
    await updateDashboard();
    hideLoading();
    }, 2500);
})

dashboard.addEventListener("click", async (e) =>{
    e.preventDefault();
    showLoading()
    setTimeout( async () => {
    await updateDashboard();
    hideLoading();
    }, 2500);
})


export const updateDashboard = async () => {
    clearActiveClass();
    document.querySelector(".dashboard").classList.add("active");
    const parent = document.querySelector(".main-content-area")
    const tempContent = document.querySelector(".main-content-area main");
    if(tempContent){
        parent.removeChild(tempContent);
    }
    const {result} = await GetInfoSummary(getUser());
    const {progress, userInfo, courses} = result;
    const content = document.createElement("main");
    content.classList.add("content");
    content.innerHTML +=
    `    
    <div class="welcome-banner">
        <h1>Welcome, <span class="user-name">${userInfo.name}</span></h1>
        <p class="user-progress">You've completed <span class="completed-count">${progress.completedModules}</span> of <span class="total-modules">${progress.totalModules}</span> modules</p>
    </div>

    <div class="dashboard-sections">
        <!-- Current Progress Section -->
        <section class="dashboard-section progress-section">
            <h2><i class="fas fa-chart-line"></i> Your Progress</h2>
            <div class="progress-circles">
                <div class="progress-circle">
                    <div class="circle" style="--percent:${progress.overallCompletion}">
                        <span>${progress.overallCompletion}%</span>
                    </div>
                    <p>Overall Completion</p>
                </div>
                <div class="progress-circle">
                    <div class="circle" style="--percent:${progress.averageScore}">
                        <span>${progress.averageScore}%</span>
                    </div>
                    <p>Avg Quiz Score</p>
                </div>
            </div>
        </section>
                <section class="dashboard-section courses-section">
            <h2><i class="fas fa-book-open"></i> Available Courses</h2>
            <div class="course-cards">
                ${courses.map((el)=>{
                    const temp =
                    `
                    <div class="course-card">
                    <h3>${el.title}</h3>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${el.modules.completionPercentage}%"></div>
                    </div>
                    <div class="course-stats">
                        <span><i class="fas fa-check"></i> ${el.modules.completed}/${el.modules.total} modules</span>
                        <span><i class="fas fa-star"></i> ${el.quizzes.completed}/${el.quizzes.total}</span>
                    </div>
                    <button class="continue-btn">Continue</button>
                </div>
                    `
                    return temp;
                }).join('')}
            </div>
        </section>
    </div>
    `
    const courseProgress =``
    content.innerHTML += courseProgress;
    parent.appendChild(content);
    courses.forEach((el, index) => {
        const arr = content.querySelectorAll(".continue-btn");
        arr[index].addEventListener("click", (e)=>{
        e.preventDefault();
        clearActiveClass();
        document.querySelector(".training-modules").classList.add("active");
        showLoading()
        setTimeout(() => {
            showCourse(el.title);
            hideLoading();
            }, 1500);
        })
    });
}


profile.addEventListener("click", async (e) => {
    e.preventDefault();
    showLoading()
    setTimeout(() => {
    updateProfilePage();
    hideLoading();
}, 1500);
    sessionStorage.setItem("page", 1);
});

const updateProfilePage = async () =>{
   clearActiveClass();
    document.querySelector(".profile").classList.add("active");
    const parent = document.querySelector(".main-content-area")
    const tempContent = document.querySelector(".main-content-area main");
    if(tempContent){
        parent.removeChild(tempContent);
    }
    const {address, gender, email, name} = (await AccountInfo(getUser())).result;

    const content = document.createElement("main");
    content.classList.add("content");
    content.innerHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <h1>My Profile</h1>
                <button class="edit-btn" id="editProfileBtn">
                    <i class="fas fa-edit"></i> Edit Profile
                </button>
            </div>
            
            <div class="profile-details">
                <div class="detail-row">
                    <div class="detail-label">Full Name:</div>
                    <div class="detail-value" id="name">${name}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value" id="email">${email}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Gender:</div>
                    <div class="detail-value" id="gender">${gender}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Address:</div>
                    <div class="detail-value" id="address">${address}</div>
                </div>
                
                <div class="save-cancel-btns" id="actionButtons">
                    <button class="cancel-btn" id="cancelEditBtn">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="save-btn" id="saveChangesBtn">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;
    
 parent.appendChild(content);

    // Initialize profile editing functionality
    const editBtn = document.getElementById('editProfileBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const saveBtn = document.getElementById('saveChangesBtn');
    const actionButtons = document.getElementById('actionButtons');
    
    // Hide action buttons initially
    actionButtons.style.display = 'none';
    
    // Fields that can be edited
    const editableFields = ['name', 'email', 'gender', 'address'];
    let originalValues = {};
    
    editBtn.addEventListener('click', function() {
        // Store original values
        editableFields.forEach(field => {
            originalValues[field] = document.getElementById(field).textContent.trim();
            
            // Replace text with input fields
            if (field === 'gender') {
                // Create select for gender
                const select = document.createElement('select');
                select.id = `${field}-input`;
                select.innerHTML = `
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                `;
                select.value = originalValues[field];
                document.getElementById(field).innerHTML = '';
                document.getElementById(field).appendChild(select);
            } else {
                const input = document.createElement('input');
                input.type = field === 'email' ? 'email' : 'text';
                input.id = `${field}-input`;
                input.value = originalValues[field];
                document.getElementById(field).innerHTML = '';
                document.getElementById(field).appendChild(input);
            }
        });
        
        // Show action buttons
        actionButtons.style.display = 'flex';
        // Hide edit button
        editBtn.style.display = 'none';
    });
    cancelBtn.addEventListener('click', function() {
        // Restore original values
            showLoading()
            setTimeout(() => {
            editableFields.forEach(field => {
                document.getElementById(field).innerHTML = originalValues[field];
            });

            // Hide action buttons
            actionButtons.style.display = 'none';
            // Show edit button
            
            editBtn.style.display = 'block';
            hideLoading();
            }, 500);
            showNotification("Canceled...", "error");
    });
    
    saveBtn.addEventListener('click', async function() {
        // Get updated values
        const updatedValues = {};
        editableFields.forEach(field => {
            const inputElement = document.getElementById(`${field}-input`);
            updatedValues[field] = inputElement.value;
            
            document.getElementById(field).innerHTML = updatedValues[field];
        });
        
        try {
            // Call your API to update the profile
            showLoading();
            setTimeout(async () => {
                const response = await updateProfile({...updatedValues, userEmail: getUser() });
                hideLoading();
                if (response.success) {
                    actionButtons.style.display = 'none';
                    editBtn.style.display = 'block';
                    
                    showNotification("Profile updated successfully!", "success")
                }
            }, 2500);
                
        } catch (error) {
            showNotification("Failed to update profile", "error");
            editableFields.forEach(field => {
                document.getElementById(field).innerHTML = originalValues[field];
            });
            
            actionButtons.style.display = 'none';
            editBtn.style.display = 'block';
        }
    });
}

tm.addEventListener("click", async (e) =>{
    e.preventDefault();
    showLoading()
    setTimeout(() => {
    updateModulesPage();
    hideLoading();
    }, 1500);
})
const updateModulesPage = async() => {
    clearActiveClass();
    document.querySelector(".training-modules").classList.add("active");

    const courses = await GetCourseList();
    const parent =  document.querySelector('.main-content-area');
     const oldContent = document.querySelector(".main-content-area main");
    if (oldContent) {
        parent.removeChild(oldContent);
    }   
    const cardContainer = document.createElement("main");
    cardContainer.classList.add("content");
    cardContainer.classList.add("cardContainer");

    for (let index = 0; index < courses.result.length; index++) {
        
        const card = document.createElement("div");
        const cardContent = document.createElement("div");
        const title = document.createElement("h1");
    
        card.classList.add("card");
        cardContent.classList.add("card-content");
        const courseTitle = courses.result[index].title;
        title.textContent = courseTitle
        card.appendChild(cardContent);
        cardContent.appendChild(title);
        
        cardContainer.appendChild(card);
        card.addEventListener("click", (e) =>{
        showLoading()
        setTimeout(() => {
            showCourse(courseTitle);
            hideLoading()
            }, 1500);
        })
    }
    parent.appendChild(cardContainer);
}

// content.innerHTML = sprofile;
// parent.appendChild(content)
// const details = (await AccountInfo(getUser())).result;
// const obj = {
//     name:"",email:"", gender:"",address:""
// }
// for(const key in obj) {
//     if (Object.prototype.hasOwnProperty.call(obj, key)) {
//         const doc = document.querySelector(`#${key}`);
//         doc.innerHTML = "";
//         const str =document.createElement("strong");
//         str.textContent = `${key.toUpperCase()}: `; 
//         doc.appendChild(str);
//         doc.innerHTML += `${details[key]}`
        
//     }
// }
//     logout();
//     history.pushState({}, "", "profile");

// tm.addEventListener("click", (e) => {
//     e.preventDefault();
//     clearActiveClass();
//     document.querySelector(".training-modules").classList.add("active");
//      const container = document.querySelector(".employee-dashboard-layout")
//      container.removeChild(document.querySelector('.main-content-area'));
//      const temp = document.createElement("div");
//      temp.classList.add("main-content-area")
//      temp.innerHTML = modules;
//      container.appendChild(temp);
//      logout();
// });
                /*<main class="content cardContainer">
                <div class="card">
                    <div class="card-content">
                        <h1>Title</h1>
                        <h2>Course Code</h2>
                        <h3>Description</h3>
                    </div>
                </div>
            </main>*/
/*
<main class="content   course-content">
                <h1 class="posh1">Modules</h1>
                <div class="module_header"></div>
                <div class="module_card"></div>
                <h1 class="marginh1">Assessments</h1>
                <div class="quiz_header"></div>
                <div class="quiz_card"></div>
            </main>
            
*/


const showCourse = async (courseTitle) => {
    const info = await GetCourse(getUser(), courseTitle);
    const parent =  document.querySelector('.main-content-area');
    const oldContent = document.querySelector(".main-content-area main");
    if (oldContent) {
        parent.removeChild(oldContent);
    }   
    const content = document.createElement("main");
    content.classList.add("course-content");

    const moduleTitle = document.createElement("h1");
    moduleTitle.textContent = "Modules";
    moduleTitle.classList.add("posh1")
    const moduleHeader = document.createElement("div");
    moduleHeader.classList.add("module_header");
    content.appendChild(moduleTitle);
    content.appendChild(moduleHeader);

     const mLength = info.result.modules.length;
    for(let i = 0 ; i < mLength; i++){
        const mCard = document.createElement("div");
        const title = document.createElement("h4");
        mCard.classList.add("module_card");
        title.textContent = info.result.modules[i].title
        title.addEventListener("click", (e) =>{
            showLoading()
            setTimeout(() => {
            showModule(info, courseTitle,i);
            hideLoading();
            }, 1500);
        })
        if(info.result.modules[i].status){
            title.style.color = "rgb(7, 7, 197)";
            title.style.textDecoration = "underline";
        }else {
            title.style.color = "";
            title.style.textDecoration = "";
        }
        mCard.appendChild(title);
        content.appendChild(mCard);
    }
    const quizTitle = document.createElement("h1");
    quizTitle.textContent = "Assessments";
    quizTitle.classList.add("marginh1");
    const quizHeader = document.createElement("div");
    quizHeader.classList.add("quiz_header");
    content.appendChild(quizTitle);
    content.appendChild(quizHeader);

    const qLength = info.result.quizzes.length;
    for(let i = 0 ; i < qLength; i++){
        const qCard = document.createElement("div");
        const title = document.createElement("h4");
        const score = document.createElement("p");
        qCard.classList.add("quiz_card");
        title.textContent = info.result.quizzes[i].title;
        const nscore =info.result.quizzes[i].score;
        const maxScore = info.result.quizzes[i].maxScore;
        score.textContent = (info.result.quizzes[i].status ? "(Closed)  " : "(Open)  ") + (nscore > 0 ? `Score: ${nscore}/${maxScore}`: `Score: ${maxScore}/${maxScore}`);
        if(info.result.quizzes[i].status){
            title.style.color = "rgb(7, 7, 197)";
            title.style.textDecoration = "underline";
        }else {
            title.style.textDecoration = "";
            title.style.color = "black";
        }
        
        qCard.appendChild(title);
        qCard.append(score);
        content.appendChild(qCard);

        title.addEventListener("click", (e) =>{
            showLoading()
            setTimeout(() => {
            showQuiz(info, i);
            hideLoading();
            }, 2500);
        })
    }

    parent.appendChild(content);

}

const showModule = (info, courseTitle,index) => {
        const parent = document.querySelector('.main-content-area');
    const oldContent = document.querySelector(".main-content-area main");   
    if (oldContent) {
        parent.removeChild(oldContent);
    }   
    
    const moduleBody = document.createElement("main");
    moduleBody.classList.add("module-information");
    moduleBody.innerHTML = `
        <div class="module-header">
            <h1>${info.result.modules[index].title}</h1>
            <div class="module-progress">Module ${index + 1} of ${info.result.modules.length}</div>
        </div>
        
        <div class="module-content">
            <div class="module-text">
                <p>${formatText(info.result.modules[index].body, {
  headings: true,
  lists: true,
  listDepth: 5
})}</p>
            </div>
            
            <div class="module-actions">
                <button class="done-button">
                    <i class="fas fa-check-circle"></i>
                    <span>Mark as Completed</span>
                </button>
            </div>
        </div>
    `;
        const doneButton = moduleBody.querySelector('.done-button');
    doneButton.addEventListener('click', async () => {
        showLoading();
        setTimeout(async () => {
            await ModuleStatus(getUser(), courseTitle,info.result.modules[index].title,true);
            hideLoading()
            await updateDashboard();
        }, 1500);
        showNotification("Module completed...", "success")
        doneButton.innerHTML = '<i class="fas fa-check"></i> Completed!';
        doneButton.classList.add('completed');
    });
    parent.appendChild(moduleBody);
    
    
}

const showQuiz = (info,index) => {
        const quiz = info.result.quizzes[index];
        if(!quiz.status){
        const parent =  document.querySelector('.main-content-area');
        const oldContent = document.querySelector(".main-content-area main");   
        if (oldContent) {
            parent.removeChild(oldContent);
        }   
        const main = document.createElement("main");
        main.classList.add("quiz-container");
        const quizHeader = document.createElement("div");
        quizHeader.classList.add("quiz-header");
        const quizTitle = document.createElement("h1")
        quizTitle.textContent = quiz.title;   
        quizHeader.appendChild(quizTitle);
        const quizMeta = document.createElement("div"); // Append this child
        const quizTimer =document.createElement("span");
        quizTimer.classList.add("quiz-timer");
        quizTimer.innerHTML +=
        `
        <i class="fas fa-clock"></i> Time remaining: 
        `
        const displayElement = document.createElement("span");
        displayElement.setAttribute("id", "time-display");
        const quizT = new QuizTimer(quiz.timeLimit/60, displayElement);
        quizTimer.appendChild(displayElement);
        quizT.start();
        quizMeta.appendChild(quizTimer);
        quizHeader.appendChild(quizMeta);
        main.appendChild(quizHeader);
        
        const quizQS = document.createElement("div");
        // Quiz Q Children
        const qs = quiz.questions;
        const answerList = []; // Store user answers
        const answers = [];
        for(let numQ = 0; numQ < qs.length; numQ++){
            answers.push(qs[numQ].answer);
            const quesH = document.createElement("div");
            const quizQ = document.createElement("div");
            quesH.innerHTML += `<h2>Question ${numQ+1}</h2>`;
            quizQ.appendChild(quesH);
            quizQ.innerHTML +=
            `
            <div class="question-text">
            <p>${qs[numQ].problem}</p>
            </div>
            `
            const aos = document.createElement("div");
            aos.classList.add("answer-options");
            for(let numCh = 0; numCh < qs[numQ].choices.length; numCh++){
            
            const ao= document.createElement("div")
            ao.classList.add("answer-option");
            const radio = document.createElement("input");
            radio.setAttribute("type", "radio");
            radio.setAttribute("id", `q${numQ+1}-option${numCh+1}`);
            radio.setAttribute("name", `q${numQ+1}`);
            radio.classList.add("answer-radio")
            radio.addEventListener("click", ()=>{
                answerList.push(qs[numQ].choices[numCh]);
            })
            const label = document.createElement("label");
            label.setAttribute("for", `q${numQ+1}-option${numCh+1}`)
            label.classList.add("answer-label");
            label.innerHTML +=
            `
            <span class="option-letter">${String.fromCharCode(numCh+65)}</span>
            <span class="option-text">${qs[numQ].choices[numCh]}</span>
            `
            ao.appendChild(radio);
            ao.appendChild(label);

            aos.appendChild(ao)
            }

            quizQS.appendChild(quizQ);
            quizQS.appendChild(aos);
            }
            //Append questions
            main.appendChild(quizQS);

            //Append footer & submit button
            const footer = document.createElement("div");
            footer.classList.add("quiz-footer");
            const submitBtn = document.createElement("button");
            submitBtn.classList.add("submit-button");
            submitBtn.textContent = "Submit Assessment"; 
            submitBtn.addEventListener("click", async (e) =>{
                e.preventDefault();
                const res =  checkAnswers( answers, answerList);
                showLoading();
                setTimeout(async () => {
                    submitQuiz(getUser(), info.result.title, info.result.quizzes[index].title,res);
                    hideLoading();
                    await updateDashboard();
                }, 2500);
                showNotification("Quiz Submitted", "success");
            })
            footer.appendChild(submitBtn);
            main.appendChild(footer);

            parent.appendChild(main);
        }else{
            showNotification("Quiz has been closed...", "warning");
        }
}

const submitQuiz = async (user, courseTitle, quizTitle, newScore) =>{
              UpdateScore(user, courseTitle, quizTitle,newScore);
}


support.addEventListener("click", e =>{
    e.preventDefault();
    clearActiveClass();
    document.querySelector(".support").classList.add("active");
    const parent = document.querySelector(".main-content-area")
    const tempContent = document.querySelector(".main-content-area main");
    if(tempContent){
        parent.removeChild(tempContent);
    }
    const content = document.createElement("main");
    content.classList.add("content");
    content.innerHTML +=supportPage;
    parent.appendChild(content);
        const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('active');
            
            // Rotate chevron icon
            const icon = question.querySelector('i');
            if (icon) {
                icon.style.transform = item.classList.contains('active') 
                    ? 'rotate(180deg)' 
                    : 'rotate(0)';
            }
        });
    });
    document.querySelector(".chat-button").addEventListener("click", (e) =>{
e.preventDefault();
        window.location.href= "https://www.facebook.com/chess.asne";
    })
})