const { getDB } = require("../database.js");
const { ObjectId } = require("mongodb");

// Add a course to courselist and to all users in info
const addCourse = async (req, res) => {
  try {
    const db = getDB();
    const { title } = req.body;

    if (!title) {
      return res.status(400).json("Course title is required" );
    }

    const newCourse = {
      title,
      modules:[],
      quizzes: []
    };

    // 1. Insert into courselist if it doesn't exist
    const existingCourse = await db.collection("courselist").findOne({ title });

    if (existingCourse) {
      return res.status(409).json("Course already exists in courselist" );
    }

    await db.collection("courselist").insertOne(newCourse);

    // 2. Add course to all users in info
    const userUpdateResult = await db.collection("info").updateMany(
      {},
      {
        $push: {
          courses: {
            title,
            modules:[],
            quizzes:[]
          }
        }
      }
    );

    res.status(200).json("Course added successfully");
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json("Internal server error");
  }
};

module.exports = { addCourse };