const { getDB } = require("../database");

const UserScore = async (req, res) => {
  try {
    const db = getDB();
  
    // Correct query to find both user and specific course
    const result = db.collection("info").updateOne(
  {
    email: req.query.email,
    "courses.title": req.query.courseTitle,
    "courses.quizzes.title": `${req.query.quizTitle}`
  },
  {
    $set: {
      "courses.$[].quizzes.$[quiz].score": parseInt(req.query.newScore),
      "courses.$[].quizzes.$[quiz].status": true
    }
  },
  {
    arrayFilters: [
      { "quiz.title": `${req.query.quizTitle}` }
    ]
  }
)
    if(result){
        res.status(200).json("Updated Successfully...");
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

module.exports = { UserScore};