import { addModule, GetCourseList, removeModule } from "../Utilities/api.js";

        const courseSelect = document.getElementById('course-select');
        const moduleList = document.getElementById('module-list');
        const addModuleBtn = document.getElementById('add-module-btn');
        const removeModuleBtn = document.getElementById('remove-module-btn');
        const addModuleModal = document.getElementById('add-module-modal');
        const moduleForm = document.getElementById('module-form');
        const cancelAddBtn = document.getElementById('cancel-add');
        const closeModalBtn = document.querySelector('.close-button');

        window.onload = async (e) =>{
            e.preventDefault();
            const courses = await GetCourseList();
            // <option value="intro-psych">Introduction to Psychology</option>
            courses.result.forEach((el,index) =>{
                console.log(el)
                const option = document.createElement("option");
                option.setAttribute("value", index);
                option.textContent = el.title;
                courseSelect.appendChild(option);
            })
        }
        // Event Listeners
        courseSelect.addEventListener('change', loadModules);
        addModuleBtn.addEventListener('click', showAddModuleModal);
        removeModuleBtn.addEventListener('click', removeSelectedModule);
        moduleForm.addEventListener('submit', addNewModule);
        cancelAddBtn.addEventListener('click', hideAddModuleModal);
        closeModalBtn.addEventListener('click', hideAddModuleModal);
        // Functions
        async function loadModules() {
            const courseId = courseSelect.value;
            moduleList.innerHTML = '';
            const courses = await GetCourseList();
            
            if (!courseId) {
                moduleList.innerHTML = '<div class="placeholder-message"><p>Select a course to view or manage its modules.</p></div>';
                return;
            }
            
            const course = courses.result[courseId];
            
            if (course.modules.length === 0) {
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
                alert('Please select a course first');
                return;
            }
            addModuleModal.style.display = 'flex';
        }

        function hideAddModuleModal() {
            addModuleModal.style.display = 'none';
            moduleForm.reset();
        }

        async function addNewModule(e) {
            e.preventDefault();
            
            const title = document.getElementById('module-title').value;
            const body = document.getElementById('module-content').value;
            const courseId = courseSelect.value;
            const courseTitle = (await GetCourseList()).result[courseId].title;
            // In a real app, you would send this to your backend
            addModule({ title, body, courseTitle });
            
            hideAddModuleModal();
            loadModules();
            
            // Show success message
            alert('Module added successfully!');
        }

        async function removeSelectedModule() {
            const courseId = courseSelect.value;
            
            if (!courseId) {
                alert('Please select a course first');
                return;
            }
            
            const selectedModule = document.querySelector('input[name="selected-module"]:checked');
            
            if (!selectedModule) {
                alert('Please select a module to remove');
                return;
            }
            
            if (confirm('Are you sure you want to remove this module?')) {
                // courses[courseId].modules.splice(selectedModule.value, 1);
                const course = (await GetCourseList()).result[courseId];
                const courseTitle = course.title;
                const moduleTitle = course.modules[parseInt(selectedModule.value)].title;
                const result = removeModule({ courseTitle,  moduleTitle});
                loadModules();
                alert('Module removed successfully!');
            }
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === addModuleModal) {
                hideAddModuleModal();
            }
        });