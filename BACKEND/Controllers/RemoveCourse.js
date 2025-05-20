const { getDB } = require("../database.js");
const { ObjectId } = require("mongodb");

const removeCourse = async (req, res) => {
  try {
    const db = getDB();
    const { title } = req.params;

    if (!title) {
      return res.status(400).json("Course title is required" );
    }

    // 1. Remove from courselist
    const courseDeleteResult = await db.collection("courselist").deleteOne({ title });

    if (courseDeleteResult.deletedCount === 0) {
      return res.status(404).json("Course not found in courselist");
    }

    // 2. Remove from all users in info
    const userUpdateResult = await db.collection("info").updateMany(
      {},
      {
        $pull: {
          courses: { title }
        }
      }
    );

    res.status(200).json("Course removed successfully");
  } catch (error) {
    console.error("Error removing course:", error);
    res.status(500).json("Internal server error");
  }
};
module.exports = {removeCourse}
