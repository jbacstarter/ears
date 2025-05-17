const { getDB } = require("../database");
const { ObjectId } = require("mongodb");

const removeModuleByTitle = async (req, res) => {
  try {
    const db = getDB();
    const { courseTitle, moduleTitle } = req.params;
    console.log(courseTitle+ " "+ moduleTitle)
    // 1. Remove module from courselist collection
    const courseUpdateResult = await db.collection("courselist").updateOne(
      { title: courseTitle },
      { $pull: { modules: { title: moduleTitle } } }
    );

    if (courseUpdateResult.matchedCount === 0) {
      return res.status(404).json("Course not found in courselist");
    }

    // 2. Remove module from all users who have this course
    const usersUpdateResult = await db.collection("info").updateMany(
      { "courses.title": courseTitle },
      { $pull: { "courses.$[course].modules": { title: moduleTitle } } },
      { arrayFilters: [{ "course.title": courseTitle }] }
    );

    res.status(200).json({
      message: "Module removed successfully",
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
    console.error("Error removing module:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
};

module.exports = { 
  removeModuleByTitle 
};