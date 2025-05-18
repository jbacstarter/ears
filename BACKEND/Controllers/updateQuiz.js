const { getDB } = require("../database");
const { ObjectId } = require("mongodb");

const updateQuizByTitle = async (req, res) => {
  try {
    const db = getDB();
    const { courseTitle, quizTitle } = req.params;
    // Convert timeLimit to number and ensure it's positive
    const timeLimitValue = req.body.timeLimit ? Math.abs(Number(req.body.timeLimit)) : undefined;
    
    const updatedQuiz = {
      title: req.body.title,
      timeLimit: timeLimitValue,
      questions: req.body.questions || undefined,
      maxScore: req.body.questions ? req.body.questions.length : undefined
    };

    // 1. Update quiz in courselist collection
    const courseUpdateResult = await db.collection("courselist").updateOne(
      { 
        title: courseTitle,
        "quizzes.title": quizTitle 
      },
      { 
        $set: {
          "quizzes.$[quiz].title": updatedQuiz.title,
          "quizzes.$[quiz].timeLimit": updatedQuiz.timeLimit,
          "quizzes.$[quiz].questions": updatedQuiz.questions,
          "quizzes.$[quiz].maxScore": updatedQuiz.maxScore
        }
      },
      { 
        arrayFilters: [{ "quiz.title": quizTitle }] 
      }
    );

    if (courseUpdateResult.matchedCount === 0) {
      return res.status(404).json("Course or quiz not found in courselist");
    }

    // 2. Update quiz in all users who have this course (preserving existing fields)
    const usersUpdateResult = await db.collection("info").updateMany(
      { 
        "courses.title": courseTitle,
        "courses.quizzes.title": quizTitle 
      },
      { 
        $set: { 
          "courses.$[course].quizzes.$[quiz].title": updatedQuiz.title,
          "courses.$[course].quizzes.$[quiz].timeLimit": updatedQuiz.timeLimit,
          "courses.$[course].quizzes.$[quiz].questions": updatedQuiz.questions,
          "courses.$[course].quizzes.$[quiz].maxScore": updatedQuiz.maxScore
        } 
      },
      { 
        arrayFilters: [
          { "course.title": courseTitle },
          { "quiz.title": quizTitle }
        ] 
      }
    );

    res.status(200).json({
      message: "Quiz updated successfully",
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
    console.error("Error updating quiz:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
};
module.exports = {updateQuizByTitle}