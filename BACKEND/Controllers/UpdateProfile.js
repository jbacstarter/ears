const { getDB } = require("../database");

const updateProfile = async (req, res) => {
    try {
        const db = getDB();
        const { email } = req.params; // or req.user.email if using authentication middleware
        const { name, gender, address } = req.body;

        // Validate required fields
        if (!name || !gender || !address) {
            return res.status(400).json({ message: "Name, gender, and address are required" });
        }

        // Create update object with only the allowed fields
        const updateData = {
            $set: {
                name,
                gender,
                address // Add timestamp for last update
            }
        };

        // Update only the specified fields in the database
        const result = await db.collection("info").updateOne(
            { email },
            updateData
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        if (result.modifiedCount === 0) {
            return res.status(200).json({ message: "No changes made" });
        }

        res.status(200).json({ 
            success: true,
            message: "Profile updated successfully",
            updatedFields: { name, gender, address }
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { updateProfile };