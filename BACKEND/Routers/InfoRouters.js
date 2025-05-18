    const { addModuleByTitle } = require("../Controllers/AddModule");
    const { addQuizByTitle } = require("../Controllers/addQuiz");
    const { getDashboardData } = require("../Controllers/GetDashboardData");
    const { updateModuleStatus } = require("../Controllers/ModuleStatus");
    const { removeModuleByTitle } = require("../Controllers/RemoveModule");
    const { removeQuizByTitle } = require("../Controllers/removeQuiz");
    const { updateQuizByTitle } = require("../Controllers/updateQuiz");
    const { UserAddress } = require("../Controllers/UserAddress");
    const { UserAverage } = require("../Controllers/UserAverage");
    const { UserCompleted } = require("../Controllers/UserCompleted");
    const { UserCourse } = require("../Controllers/UserCourse");
    const { UserCourseList } = require("../Controllers/UserCourseList");
    const { UserGender } = require("../Controllers/UserGender");
    const { UserInfo } = require("../Controllers/UserInfo");
    const { UserName } = require("../Controllers/UserName");
    const { UserRegInfo } = require("../Controllers/UserRegInfo");
    const { UserScore } = require("../Controllers/UserScore");

    const InfoRouter = require("express").Router();


    InfoRouter.get("/info", UserInfo);
    InfoRouter.get("/info/name", UserName);
    InfoRouter.get("/info/avg", UserAverage);
    InfoRouter.get("/info/gen", UserGender);
    InfoRouter.get("/info/addr", UserAddress);
    InfoRouter.get("/info/mcomp", UserCompleted);
    InfoRouter.get("/info/course", UserCourse);
    InfoRouter.get("/info/courselist", UserCourseList);
    InfoRouter.get("/info/newScore", UserScore);
    InfoRouter.get("/info/dashboard", getDashboardData);
    InfoRouter.post("/info/create", UserRegInfo);
    InfoRouter.post("/info/module-status", updateModuleStatus);

    InfoRouter.post("/info/courses/:courseTitle/modules", addModuleByTitle);
    InfoRouter.delete("/info/courses/:courseTitle/modules/:moduleTitle", removeModuleByTitle);

    InfoRouter.post('/:courseTitle/quizzes', addQuizByTitle);
    InfoRouter.delete('/:courseTitle/quizzes/:quizTitle', removeQuizByTitle);
    InfoRouter.put('/:courseTitle/quizzes/:quizTitle', updateQuizByTitle);


    module.exports ={InfoRouter}