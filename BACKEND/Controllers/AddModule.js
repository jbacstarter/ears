const { getDB } = require("../database");
const { ObjectId } = require("mongodb");

const addModuleByTitle = async (req, res) => {
  try {
    const db = getDB();
    const courseTitle = req.params.courseTitle;
    const newModule = {
      title: req.body.title,
      body: req.body.body
    };

    // 1. Update the course in courselist collection
    const courseUpdateResult = await db.collection("courselist").updateOne(
      { title: courseTitle },
      { $push: { modules: newModule } }
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
          "courses.$[course].modules": newModule 
        } 
      },
      { 
        arrayFilters: [{ "course.title": courseTitle }] 
      }
    );

    res.status(200).json({
      message: "Module added successfully",
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
    console.error("Error adding module:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
};

module.exports = { addModuleByTitle };