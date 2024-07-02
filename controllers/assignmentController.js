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

const getAssignment = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.assignmentId);
    const trainerId = req.user._id.toString();
    const assignmentTrainer = assignment.trainer.toString();
    if (assignment) {
        console.log("user ==>", req.user);
        console.log(trainerId == assignmentTrainer);
        console.log(assignment);
        if (trainerId == assignmentTrainer) {

            res.json(assignment);

        } else {
            res.status(403);
            throw new Error("You are not authorized to view this assignment");
        }
    } else {
        res.status(404);
        throw new Error("Assignment not found");
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

const deleteAssignment = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findByIdAndDelete(req.params.assignmentId);

    if (assignment) {
        res.json({ message: "Assignment deleted successfully" });
    } else {
        res.status(404);
        throw new Error("Assignment not found");
    }
})

const getAllAssignments = asyncHandler(async (req, res) => {
    console.log("me aaya");
    const assignments = await Assignment.find();
    res.json(assignments);
})

const getAssignments = asyncHandler(async (req, res) => {
    const assignments = await Assignment.find({trainer: req.user._id});
    if (assignments) {
        res.json(assignments);
    } else {
        res.status(404);
        throw new Error("Assignments not found");
    }
})

export { createAssignment, updateAssignment, getAllAssignments, deleteAssignment, getAssignment, getAssignments };