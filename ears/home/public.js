import { AccountInfo, GetCourse, GetCourseList } from "../Utilities/api.js";
import QuizTimer from "../Utilities/QuizTimer.js";
import { logout } from "./logout.js";
import { modules, shome, sprofile } from "./static.js";


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
window.addEventListener("DOMContentLoaded",async (e) =>{
    await updateDashboard();
})
const updateDashboard = async () => {
        clearActiveClass();
    document.querySelector(".dashboard").classList.add("active");
    const content = document.querySelector(".main-content-area main");
    content.classList.remove("cardContainer");
    content.classList.remove("course-content")
    content.classList.add("content")
    content.innerHTML = shome;
    const details = (await AccountInfo(getUser())).result;
    const mcompleted = document.querySelector("#modules-completed");
    const avg = document.querySelector("#average-score");
    mcompleted.textContent = details.mcompleted;
    avg.textContent = details.avgscore + "%";
    logout();
    history.pushState({}, "", "dashboard");
}
dashboard.addEventListener("click", async (e) =>{
    e.preventDefault();
    updateDashboard();
})

profile.addEventListener("click", async (e) =>{
    e.preventDefault();
    clearActiveClass();
    document.querySelector(".profile").classList.add("active");
    const parent = document.querySelector(".main-content-area")
    const tempContent = document.querySelector(".main-content-area main");
    if(tempContent){
        parent.removeChild(tempContent);
    }

    const content = document.createElement("main");
    content.classList.add("content");
    content.innerHTML = sprofile;
    parent.appendChild(content)
    const details = (await AccountInfo(getUser())).result;
    const obj = {
        name:"",email:"", gender:"",address:""
    }
    for(const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const doc = document.querySelector(`#${key}`);
            doc.innerHTML = "";
            const str =document.createElement("strong");
            str.textContent = `${key.toUpperCase()}: `; 
            doc.appendChild(str);
            doc.innerHTML += `${details[key]}`
            
        }
    }
        logout();
        history.pushState({}, "", "profile");

})


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
tm.addEventListener("click", async (e) =>{
    e.preventDefault()
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
            showCourse(courseTitle);
        })
    }

    parent.appendChild(cardContainer);
    logout();
    history.pushState({}, "", "courses");
})

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
            showModule(info, i);
        })
        
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
        title.textContent = info.result.modules[i].title;
        const nscore =info.result.quizzes[i].score;
        const maxScore = info.result.quizzes[i].maxScore;
        score.textContent = nscore > 0 ? `Score: ${nscore}/${maxScore}`: `Score: ${maxScore}/${maxScore}`
        qCard.appendChild(title);
        qCard.append(score);
        content.appendChild(qCard);

        title.addEventListener("click", (e) =>{
        const quiz = info.result.quizzes[i];
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
        for(let numQ = 0; numQ < qs.length; numQ++){
            
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
        radio.setAttribute("id", `q${numQ+1}-option${numQ+1}`);
        radio.setAttribute("name", `q${numQ+1}`);
        radio.classList.add("answer-radio")
        const label = document.createElement("label");
        label.setAttribute("for", `q${numQ+1}-option${numQ+1}`)
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
        footer.appendChild(submitBtn);
        main.appendChild(footer);

        //Append parent
        parent.appendChild(main);
        
        })
    }

    parent.appendChild(content);

}

const showModule = (info, index) => {
            const parent =  document.querySelector('.main-content-area');
            const oldContent = document.querySelector(".main-content-area main");   
            if (oldContent) {
            parent.removeChild(oldContent);
            }   
            const moduleBody = document.createElement("main");
            moduleBody.classList.add("module-information");
            const title = document.createElement("h1");
            const body = document.createElement("p");
            body.textContent = info.result.modules[index].body;
            title.textContent = info.result.modules[index].title;
            moduleBody.appendChild(title)
            moduleBody.appendChild(body)
            parent.appendChild(moduleBody);
}

const showQuiz = (info, index) => {

}
