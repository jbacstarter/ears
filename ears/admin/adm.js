import { addModule, GetCourseList, removeModule } from "../Utilities/api.js";
import { formatText } from "../Utilities/fomatting.js";
import { hideLoading, showLoading } from "../Utilities/loader.js";
import { showNotification } from "../Utilities/notification.js";

        const courseSelect = document.getElementById('course-select');
        const moduleList = document.getElementById('module-list');
        const addModuleBtn = document.getElementById('add-module-btn');
        const removeModuleBtn = document.getElementById('remove-module-btn');
        const addModuleModal = document.getElementById('add-module-modal');
        const moduleForm = document.getElementById('module-form');
        const cancelAddBtn = document.getElementById('cancel-add');
        const closeModalBtn = document.querySelector('.close-button');


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
        window.onload = async (e) =>{
            e.preventDefault();
            const logout = document.querySelector("#logout-button");
            logout.addEventListener("click", (e)=>{
            showLoading()
            setTimeout(() => {
                window.location.href = "../auth/login.html";
                sessionStorage.removeItem("user");
                hideLoading();
            }, 2500);
                    
            })
            const courses = await GetCourseList();
            // <option value="intro-psych">Introduction to Psychology</option>
            courses.result.forEach((el,index) =>{
                const option = document.createElement("option");
                option.setAttribute("value", index);
                option.textContent = el.title;
                courseSelect.appendChild(option);
            })
        }
        // Event Listeners
        courseSelect.addEventListener('change', e =>{
                showLoading();
                setTimeout(() => {
                loadModules();
                hideLoading()
            }, 2500);
        });
        addModuleBtn.addEventListener('click', e =>{
            e.preventDefault();
            showLoading();
            setTimeout(() => {
            showAddModuleModal()
            hideLoading()
            }, 2500);
            
        });
        removeModuleBtn.addEventListener('click', e =>{
            e.preventDefault();
                showLoading();
            setTimeout(() => {
                removeSelectedModule();
                hideLoading();     
            }, 2500);
        });
            
        moduleForm.addEventListener('submit', e => {
            e.preventDefault();
        
            setTimeout(() => {
                addNewModule();
                hideLoading;
            }, 2500);
        });
        cancelAddBtn.addEventListener('click', e =>{
            e.preventDefault();
                showLoading();
            setTimeout(() => {
                hideAddModuleModal()
                hideLoading()
            }, 2500);    
            showNotification("Closed", "info");

        });
        closeModalBtn.addEventListener('click', e =>{
            e.preventDefault();
                showLoading();
                setTimeout(() => {
                hideAddModuleModal()
                hideLoading()
            }, 2500);    
            showNotification("Closed", "info");
        });
        // Functions
        async function loadModules() {
            const courseId = courseSelect.value;
            moduleList.innerHTML = '';
            const courses = await GetCourseList();
            
            if (!courseId) {
                showNotification("Select a course", "info")
                moduleList.innerHTML = '<div class="placeholder-message"><p>Select a course to view or manage its modules.</p></div>';
                return;
            }
            
            const course = courses.result[courseId];
            
            if (course.modules.length === 0) {
                showNotification("No modules found", "info");
                moduleList.innerHTML = '<div class="placeholder-message"><p>This course currently has no modules.</p></div>';
                return;
            }
            course.modules.forEach((module, index) => {
                const moduleItem = document.createElement('div');
                moduleItem.className = 'module-item';
                moduleItem.innerHTML = `
                    <div class="module-info">
                        <h3>${module.title}</h3>
                        <p>${module.body}</p>
                    </div>
                    <input type="radio" name="selected-module" value="${index}">
                `;
                moduleList.appendChild(moduleItem);
            });
        }

        function showAddModuleModal() {
            if (!courseSelect.value) {
                showNotification('Please select a course first');
                return;
            }
            addModuleModal.style.display = 'flex';
        }

        function hideAddModuleModal() {
            addModuleModal.style.display = 'none';
            moduleForm.reset();
        }

        async function addNewModule() {
            
            const title = document.getElementById('module-title').value;
            const body = document.getElementById('module-content').value;
            const courseId = courseSelect.value;
            const courseTitle = (await GetCourseList()).result[courseId].title;
            addModule({ title, body, courseTitle });
            
            hideAddModuleModal();
            loadModules();
            
            // Show success message
            showNotification('Module added successfully!', "success");
        }

        async function removeSelectedModule() {
            const courseId = courseSelect.value;
            
            if (!courseId) {
                showNotification('Please select a course first', "info");
                return;
            }
            
            const selectedModule = document.querySelector('input[name="selected-module"]:checked');
            
            if (!selectedModule) {
                showNotification('Please select a module to remove', "info");
                return;
            }
            
            if (confirm('Are you sure you want to remove this module?')) {
                // courses[courseId].modules.splice(selectedModule.value, 1);
                const course = (await GetCourseList()).result[courseId];
                const courseTitle = course.title;
                const moduleTitle = course.modules[parseInt(selectedModule.value)].title;
                const result = removeModule({ courseTitle,  moduleTitle});
                loadModules();
                showNotification('Module removed successfully!', "success");
            }
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === addModuleModal) {
                hideAddModuleModal();
            }
        });