    const { addModuleByTitle } = require("../Controllers/AddModule");
    const { addQuizByTitle } = require("../Controllers/addQuiz");
const { GetDashboardData } = require("../Controllers/GetDashboardData");
    const { updateModuleStatus } = require("../Controllers/ModuleStatus");
    const { removeModuleByTitle } = require("../Controllers/RemoveModule");
    const { removeQuizByTitle } = require("../Controllers/removeQuiz");
    const { updateProfile } = require("../Controllers/UpdateProfile");
    const { updateQuizByTitle } = require("../Controllers/updateQuiz");
    const { UserCourse } = require("../Controllers/UserCourse");
    const { UserCourseList } = require("../Controllers/UserCourseList");
    const { UserInfo } = require("../Controllers/UserInfo");
    const { UserRegInfo } = require("../Controllers/UserRegInfo");
    const { UserScore } = require("../Controllers/UserScore");

    const InfoRouter = require("express").Router();


    InfoRouter.get("/info", UserInfo);
    InfoRouter.get("/info/course", UserCourse);
    InfoRouter.get("/info/courselist", UserCourseList);
    InfoRouter.get("/info/newScore", UserScore);
    InfoRouter.get("/info/dashboard", GetDashboardData);
    InfoRouter.post("/info/create", UserRegInfo);
    InfoRouter.post("/info/module-status", updateModuleStatus);

    InfoRouter.post("/info/courses/:courseTitle/modules", addModuleByTitle);
    InfoRouter.delete("/info/courses/:courseTitle/modules/:moduleTitle", removeModuleByTitle);

    InfoRouter.post('/:courseTitle/quizzes', addQuizByTitle);
    InfoRouter.delete('/:courseTitle/quizzes/:quizTitle', removeQuizByTitle);
    InfoRouter.put('/:courseTitle/quizzes/:quizTitle', updateQuizByTitle);
    InfoRouter.put('/profile/:email', updateProfile);

    module.exports ={InfoRouter}