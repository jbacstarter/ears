const { getDB } = require("../database");

const updateModuleStatus = async (req, res) => {
    try {
        const db = getDB();
        const { email, courseTitle, moduleTitle, status } = req.body;

        if (!email || !courseTitle || !moduleTitle || typeof status !== 'boolean') {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Update the module status in MongoDB
        const result = await db.collection("info").updateOne(
            {
                email: email,
                "courses.title": courseTitle,
                "courses.modules.title": moduleTitle
            },
            {
                $set: {
                    "courses.$[course].modules.$[module].status": status
                }
            },
            {
                arrayFilters: [
                    { "course.title": courseTitle },
                    { "module.title": moduleTitle }
                ]
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Module not found or no changes made" });
        }

        res.status(200).json({ message: "Module status updated successfully" });
    } catch (error) {
        console.error("Error updating module status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {  updateModuleStatus };