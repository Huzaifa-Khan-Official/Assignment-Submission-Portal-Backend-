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

const enrollStudent = asyncHandler(async (req, res) => {
    const { join_code } = req.body;

    if (!join_code) {
        return res.status(400).json({ error: "Please enter a join code for the class" });
    }

    try {
        const classObj = await Class.findOne({ join_code });
        const student = await User.findById(req.user._id);

        if (!classObj) {
            return res.status(404).send('Invalid Class Code');
        }

        // Check if the student is already in the class
        if (classObj.students.includes(student._id)) {
            return res.status(400).send('Student is already in the class');
        }

        // Add the student to the class
        classObj.students.push(student._id);
        await classObj.save();

        // Add the class to the student's class_ids array
        if (!student.classes.includes(classObj._id)) {
            student.classes.push(classObj._id);
            await student.save();
        }

        res.send('Student assigned to class successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

const getAllClassesOfTrainer = asyncHandler(async (req, res) => {
    const teacherId = req.user._id;

    try {
        const teacher = await User.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        const classes = await Class.find({ teacher: teacherId });

        res.status(200).json(classes);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
});

const getAllStudentsOfClass = asyncHandler(async (req, res) => {
    const classId = req.params.classId;

    try {
        const classObj = await Class.findById(classId);

        if (!classObj) {
            return res.status(404).json({ error: "Class not found" });
        }

        const students = await User.find({ _id: { $in: classObj.students } });

        res.status(200).json(students);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
});

const getClassmates = asyncHandler(async (req, res) => {
    const classId = req.params.classId;
    const studentId = req.user._id;

    try {
        const classObj = await Class.findById(classId);

        if (!classObj) {
            return res.status(404).json({ error: "Class not found" });
        }

        const student = await User.findById(studentId);

        if (!student || !classObj.students.includes(studentId)) {
            return res.status(404).json({ error: "Student not found in the class" });
        }

        const classmates = await User.find({ _id: { $in: classObj.students }, _id: { $ne: studentId }, role: "student" });


        res.status(200).json(classmates);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
});


const getClassesOfStudent = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    try {
        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        const classes = await Class.find({ students: studentId });

        res.status(200).json(classes);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
})


export { createClass, updateClassById, getClassById, deleteClassById, enrollStudent, getAllClassesOfTrainer, getAllStudentsOfClass, getClassmates, getClassesOfStudent }