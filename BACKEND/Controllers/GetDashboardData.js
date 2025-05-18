const { getDB } = require("../database");

const getDashboardData = async (req, res) => {
    try {
        const db = getDB();
        const query = {
            email: { $eq: req.query.email }
        };
        
        // Fetch user data from MongoDB
        const user = await db.collection("info").findOne(query);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Process the data for the dashboard
        const dashboardData = {
            userInfo: {
                name: user.name,
                email: user.email,
                role: user.admin ? 'Admin' : 'Employee'
            },
            progress: {
                totalModules: 0,
                completedModules: 0,
                totalQuizzes: 0,
                completedQuizzes: 0,
                overallCompletion: 0,
                averageScore: 0
            },
            courses: [],
        };

        // Process each course
        user.courses.forEach(course => {
            const courseModules = course.modules || [];
            const courseQuizzes = course.quizzes || [];
            
            // Calculate completed modules and quizzes
            const completedModules = courseModules.filter(m => m.status === true).length;
            const completedQuizzes = courseQuizzes.filter(q => q.status === true).length;
            
            // Calculate quiz scores
            const quizScores = courseQuizzes
                .filter(q => q.status === true)
                .map(q => (q.score / q.maxScore) * 100);
            
            // Calculate course completion percentage
            const completionPercentage = courseModules.length > 0 
                ? Math.round((completedModules / courseModules.length) * 100)
                : 0;

            // Calculate average quiz score for this course
            const courseAverageScore = quizScores.length > 0
                ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
                : 0;

            // Add course to dashboard data
            dashboardData.courses.push({
                title: course.title,
                modules: {
                    total: courseModules.length,
                    completed: completedModules,
                    completionPercentage: completionPercentage
                },
                quizzes: {
                    total: courseQuizzes.length,
                    completed: completedQuizzes,
                    averageScore: courseAverageScore
                },
                nextModule: courseModules.find(m => !m.status)?.title || null,
                nextQuiz: courseQuizzes.find(q => !q.status)?.title || null
            });

            // Update overall progress metrics
            dashboardData.progress.totalModules += courseModules.length;
            dashboardData.progress.completedModules += completedModules;
            dashboardData.progress.totalQuizzes += courseQuizzes.length;
            dashboardData.progress.completedQuizzes += completedQuizzes;
            
            // Add quiz scores to overall average calculation
            if (quizScores.length > 0) {
                dashboardData.progress.averageScore += quizScores.reduce((a, b) => a + b, 0);
            }
        });

        // Calculate overall completion percentage
        dashboardData.progress.overallCompletion = dashboardData.progress.totalModules > 0
            ? Math.round((dashboardData.progress.completedModules / dashboardData.progress.totalModules) * 100)
            : 0;

        // Calculate overall average score
        const totalCompletedQuizzes = dashboardData.courses.reduce((sum, course) => sum + course.quizzes.completed, 0);
        dashboardData.progress.averageScore = totalCompletedQuizzes > 0
            ? Math.round(dashboardData.progress.averageScore / totalCompletedQuizzes)
            : 0;

        // Return the processed data
        res.status(200).json(dashboardData);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getDashboardData };