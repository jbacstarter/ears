const { getDB } = require("../database");
const { ObjectId } = require("mongodb");


const removeQuizByTitle = async (req, res) => {
  try {
    const db = getDB();
    const { courseTitle, quizTitle } = req.params;

    // 1. Remove quiz from courselist collection
    const courseUpdateResult = await db.collection("courselist").updateOne(
      { title: courseTitle },
      { $pull: { quizzes: { title: quizTitle } } }
    );

    if (courseUpdateResult.matchedCount === 0) {
      return res.status(404).json("Course not found in courselist");
    }

    // 2. Remove quiz from all users who have this course
    const usersUpdateResult = await db.collection("info").updateMany(
      { "courses.title": courseTitle },
      { $pull: { "courses.$[course].quizzes": { title: quizTitle } } },
      { arrayFilters: [{ "course.title": courseTitle }] }
    );

    res.status(200).json({
      message: "Quiz removed successfully",
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
    console.error("Error removing quiz:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
};

module.exports = {
  removeQuizByTitle
};