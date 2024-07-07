import Class from "../models/classModel.js"
import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asynHandler.js"
import { nanoid } from "nanoid";

const createClass = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Please enter a name for the class" });
    }

    const teacher = await User.findById(req.user._id);

    if (!teacher) {
        return res.status(401).json({ error: "Unauthorized" });
    } else {
        const newClass = new Class({
            name: req.body.name,
            teacher: teacher._id,
            join_code: nanoid(7)
        });

        await newClass.save();
        teacher.classes.push(newClass._id);
        await teacher.save();

        res.status(200).json(newClass);
    }
})

const updateClassById = asyncHandler(async (req, res) => {
    const classId = req.params.classId;
    const teacherId = req.user._id;
    const name = req.body.name;

    try {
        const classObj = await Class.findById(classId);

        if (!classObj) {
            return res.status(404).json({ error: "Class not found" });
        }

        if (teacherId) {
            const teacher = await User.findById(teacherId);
            if (!teacher || teacher.role !== 'trainer') {
                return res.status(404).send('Teacher not found or not a trainer');
            }
            classObj.teacher = teacherId;
        }

        classObj.name = name || classObj.name;

        await classObj.save();

        res.status(200).json(classObj);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
})

const getClassById = asyncHandler(async (req, res) => {
    const classId = req.params.classId;

    try {
        const classObj = await Class.findById(classId);

        if (!classObj) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.status(200).json(classObj);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
})

const deleteClassById = asyncHandler(async (req, res) => {
    const classId = req.params.classId;
    const teacherId = req.user._id;

    try {
        const classObj = await Class.findById(classId);

        if (!classObj) {
            return res.status(404).json({ error: "Class not found" });
        }

        if (teacherId) {
            const teacher = await User.findById(teacherId);
            if (!teacher || teacher.role !== 'trainer') {
                return res.status(401).json({ error: "Unauthorized" });
            }
        }

        // Remove the class ID from the teacher's class_ids array
        await User.updateOne({ _id: classObj.teacher }, { $pull: { classes: classObj._id } });

        // Remove the class ID from all students' classes arrays
        await User.updateMany({ _id: { $in: classObj.students } }, { $pull: { classes: classObj._id } });


        await classObj.deleteOne();

        res.status(200).json({ message: "Class deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
})

export { createClass, updateClassById, getClassById, deleteClassById }