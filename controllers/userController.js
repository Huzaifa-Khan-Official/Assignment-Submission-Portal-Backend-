import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asynHandler.js";
import generateToken from "../utils/createToken.js";


// student CRUD
const createStudent = asyncHandler(async (req, res) => {
    const { username, email, password, role, teacher_id } = req.body;

    if (!username || !email || !password) {
        throw new Error("Please enter all fields");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).send("User already exists");
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;

    if (role === "student") {
        newUser = new User({ username, email, password: hashedPassword, role, teacher_id });
    } else {
        newUser = new User({ username, email, password: hashedPassword, role });
    }

    try {
        await newUser.save();
        generateToken(res, newUser._id);

        res.status(200).json({ _id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role });
    } catch (error) {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new Error("Please enter all fields");
    }

    const userExits = await User.findOne({ email });

    if (userExits) {
        const isMatch = await bcrypt.compare(password, userExits.password);

        if (isMatch) {
            generateToken(res, userExits._id);
            res.status(200).json({ _id: userExits._id, username: userExits.username, email: userExits.email, isAdmin: userExits.isAdmin });

            return;
        } else {
            res.status(400).send("Invalid credentials");
        }
    } else {
        res.status(400).send("Invalid credentials");
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    res.cookie("jwt", "", {
        expires: new Date(0),
        httpOnly: true
    });

    res.status(200).send("User logged out successfully");
})

const getAllTrainers = asyncHandler(async (req, res) => {
    const trainers = await User.find({ role: "trainer" });
    res.status(200).json(trainers);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.status(200).json({ _id: user._id, username: user.username, email: user.email });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }
        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
        })
    } else {
        res.status(404);
        throw new Error("User not found");
    }
})

const deleteTrainerById = asyncHandler(async (req, res) => {
    const trainer = await User.findByIdAndDelete(req.params.trainerId);

    if (trainer) {
        if (trainer.role == "admin") {
            res.status(400);
            throw new Error("Cannot delete an admin!");
        } else {
            await User.deleteOne({ _id: trainer._id })

            res.json({ message: "Trainer deleted successfully" });
        }
    } else {
        res.status(404);
        throw new Error("Trainer not found");
    }
})

const deleteStudentById = asyncHandler(async (req, res) => {
    const student = await User.findByIdAndDelete(req.params.studentId);

    if (student) {
        if (student.role == "admin") {
            res.status(400);
            throw new Error("Cannot delete an admin!");
        } else {
            await User.deleteOne({ _id: student._id })

            res.json({ message: "Student deleted successfully" });
        }
    } else {
        res.status(404);
        throw new Error("Student not found");
    }
})


const getTrainerById = asyncHandler(async (req, res) => {
    const trainer = await User.findById(req.params.trainerId).select("-password");

    if (trainer) {
        res.json(trainer);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
})

const getStudentById = asyncHandler(async (req, res) => {
    const student = await User.findById(req.params.studentId).select("-password");

    if (student) {
        res.json(student);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
})

const updateUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.Id);

    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        })
    } else {
        res.status(404);
        throw new Error("User not found");
    }
})

const createTeacher = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        throw new Error("Please enter all fields");
    }

    const userExists = await User.findOne({ email });

    if (userExists) res.status(400).send("User already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword, role });
    try {
        await newUser.save();

        res.status(200).json({ _id: newUser._id, username: newUser.username, email: newUser.email, isAdmin: newUser.isAdmin, role: newUser.role });
    } catch (error) {
        res.status(400)
        throw new Error("Invalid user data")
    }
})

export { loginUser, logoutUser, getCurrentUserProfile, updateCurrentUserProfile, createTeacher, createStudent, getAllTrainers, getTrainerById, getStudentById, deleteTrainerById, deleteStudentById, updateUserById };