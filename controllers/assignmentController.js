import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asynHandler.js";
import Assignment from "../models/assignmentModel.js";

const createAssignment = asyncHandler(async (req, res) => {
    const { title, description, dueDate, totalMarks, fileLink } = req.body;

    if (!title || !description || !dueDate || !totalMarks) {
        return res.status(400).json({ error: "Please enter all required fields" });
    }

    if (typeof totalMarks !== 'number' || totalMarks <= 0) {
        return res.status(400).json({ error: "Total marks must be a positive number" });
    }

    const trainerId = req.user._id || req.body.trainer;

    const newAssignment = new Assignment({ title, description, trainer: trainerId, dueDate, totalMarks, fileLink });
    try {
        const assignment = await newAssignment.save();

        res.status(200).json(assignment);
    } catch (error) {
        res.status(400);
        throw new Error("Something went wrong");
    }
})

const updateAssignment = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (assignment) {
        assignment.title = req.body.title || assignment.title;
        assignment.description = req.body.description || assignment.description;
        assignment.dueDate = req.body.dueDate || assignment.dueDate;
        assignment.totalMarks = req.body.totalMarks || assignment.totalMarks;
        assignment.fileLink = req.body.fileLink || assignment.fileLink;
        assignment.trainer = req.body.trainer || assignment.trainer;
        const updatedAssignment = await assignment.save();
        res.json(updatedAssignment);
    } else {
        res.status(404);
        throw new Error("Assignment not found");
    }
})
export { createAssignment, updateAssignment };