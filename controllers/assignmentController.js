import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asynHandler.js";
import Assignment from "../models/assignmentModel.js";

const createAssignment = asyncHandler(async (req, res) => {
    const { title, description, dueDate, totalMarks, fileLink  } = req.body;

    if (!title || !description || !dueDate || !totalMarks || !fileLink) {
        return res.status(400).json({ error: "Please enter all required fields" });
    }

    // Additional checks can be added as needed, e.g., date format, totalMarks being a positive number, etc.
    if (typeof totalMarks !== 'number' || totalMarks <= 0) {
        return res.status(400).json({ error: "Total marks must be a positive number" });
    }

    const newAssignment = new Assignment({ title, description, trainer, dueDate, totalMarks, fileLink });
    try {
        const assignment = await newAssignment.save();
        
        res.status(200).json(assignment);
    } catch (error) {
        res.status(400);
        throw new Error("Something went wrong");
    }
})
export { createAssignment };