const { getDB } = require("../database");
const { ObjectId } = require("mongodb");

const addQuizByTitle = async (req, res) => {
  try {
    const db = getDB();
    const courseTitle = req.params.courseTitle;
    const newQuiz = {
      title: req.body.title,
      timeLimit: req.body.timeLimit * 60, // Convert minutes to seconds
      questions: req.body.questions || [],
      score: 0,
      maxScore: req.body.questions ? req.body.questions.length : 0,
      status: false 
    };

    // 1. Update the course in courselist collection
    const courseUpdateResult = await db.collection("courselist").updateOne(
      { title: courseTitle },
      { $push: { quizzes: newQuiz } }
    );

    if (courseUpdateResult.matchedCount === 0) {
      return res.status(404).json("Course not found in courselist");
    }
    
    // 2. Update all users who have this course in their profile
    const usersUpdateResult = await db.collection("info").updateMany(
      { 
        "courses.title": courseTitle 
      },
      { 
        $push: { 
          "courses.$[course].quizzes": newQuiz 
        } 
      },
      { 
        arrayFilters: [{ "course.title": courseTitle }] 
      }
    );

    res.status(200).json({
      message: "Quiz added successfully",
      courseUpdate: {
        matched: courseUpdateResult.matchedCount,
        modified: courseUpdateResult.modifiedCount
      },
      usersUpdate: {
        matched: usersUpdateResult.matchedCount,
        modified: usersUpdateResult.modifiedCount
      }
    });

  } catch (error) {
    console.error("Error adding quiz:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
};

module.exports = {
  addQuizByTitle
};