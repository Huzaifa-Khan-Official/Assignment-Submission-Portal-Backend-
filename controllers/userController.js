import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import Class from "../models/classModel.js";
import asyncHandler from "../middlewares/asynHandler.js";
import generateToken from "../utils/createToken.js";
import Assignment from "../models/assignmentModel.js";

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

  console.log();
  if (role === "student") {
    newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      teacher_id,
    });
  } else {
    newUser = new User({ username, email, password: hashedPassword, role });
  }

  try {
    await newUser.save();
    const token = generateToken(res, newUser._id);

    res.status(200).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      token: token,
    });
  } catch (error) {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const createStudentByAdmin = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

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

  try {
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    res.status(200).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    res.status(400);
    console.log("error ==>", error);
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
      const token = generateToken(res, userExits._id);
      res.status(200).json({
        _id: userExits._id,
        username: userExits.username,
        email: userExits.email,
        role: userExits.role,
        token: token,
      });

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
    httpOnly: true,
  });

  res.status(200).send("User logged out successfully");
});

const getAllTrainers = asyncHandler(async (req, res) => {
  const trainers = await User.find({ role: "trainer" });
  res.status(200).json(trainers);
});

const getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: "student" })
    .populate({
      path: "classes",
      select: "_id name teacher",
      populate: {
        path: "teacher",
        select: "_id username email",
      },
    })
    .select("_id username email");
  res.status(200).json(students);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(404);
    throw new Error("User not found");
  }

  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImg: user.profileImg,
    });
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
    user.profileImg = req.body.profileImg || user.profileImg;
    if (req.body.password) {
      if (!req.body.oldPassword) {
        res.status(400);
        throw new Error("Old password is required");
      }

      const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
      if (!isMatch) {
        res.status(400);
        throw new Error("Old password does not match");
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profileImg: updatedUser.profileImg,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const deleteTrainerById = asyncHandler(async (req, res) => {
  const trainerId = req.params.trainerId;
  const trainer = await User.findById(trainerId);

  if (trainer) {
    if (trainer.role == "admin") {
      res.status(400);
      throw new Error("Cannot delete an admin!");
    } else {
      const classes = await Class.find({ teacher: trainer._id });
      const classIds = classes.map((cls) => cls._id);

      await User.deleteOne({ _id: trainer._id });

      await Class.deleteMany({ _id: { $in: classIds } });

      await User.updateMany(
        { role: "student" },
        { $pull: { classes: { $in: classIds } } }
      );

      await Assignment.deleteMany({ trainer_id: trainerId });

      res.json({
        message: "Trainer and associated classes deleted successfully",
      });
    }
  } else {
    res.status(404);
    throw new Error("Trainer not found");
  }
});

const deleteStudentById = asyncHandler(async (req, res) => {
  const student = await User.findByIdAndDelete(req.params.studentId);

  if (student) {
    if (student.role == "admin") {
      res.status(400);
      throw new Error("Cannot delete an admin!");
    } else {
      await User.deleteOne({ _id: student._id });

      res.json({ message: "Student deleted successfully" });
    }
  } else {
    res.status(404);
    throw new Error("Student not found");
  }
});

const getTrainerById = asyncHandler(async (req, res) => {
  const trainer = await User.findById(req.params.trainerId).select("-password");

  if (trainer) {
    res.json(trainer);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.studentId)
    .populate({
      path: "classes",
      select: "_id name teacher",
      populate: {
        path: "teacher",
        select: "_id username email",
      },
    })
    .select("_id username email role profileImg");

  if (student && student.role == "student") {
    res.json(student);
  } else {
    res.status(404);
    throw new Error("Student not found");
  }
});

const updateStudentById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.studentId);

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
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateTrainerById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.trainerId);

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
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

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

    res.status(200).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      role: newUser.role,
    });
  } catch (error) {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const getStudentsOfTrainer = asyncHandler(async (req, res) => {
  const trainerId = req.params.trainerId;

  if (!trainerId) {
    res.status(400).send("Trainer Not Found!");
    return;
  }

  const students = await User.find({ teacher_id: trainerId, role: "student" });

  if (students) {
    res.status(200).json(students);
  } else {
    res.status(404);
    throw new Error("Students not found for this trainer");
  }
});

const getStudentByTrainer = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;

  if (!studentId) {
    res.status(400).send("Student Not Found!");
    return;
  }
  try {
    const student = await User.findById(studentId);

    if (!student) {
      res.status(404);
      throw new Error("Trainer or Student not found");
    }

    res.status(200).json({
      _id: student._id,
      username: student.username,
      email: student.email,
      role: student.role,
    });
  } catch (error) {
    console.log("error ==>", error);
    res.status(500).send("Server Error");
  }
});

const getStudentsByClass = asyncHandler(async (req, res) => {
  const classId = req.params.classId;

  if (!classId) {
    res.status(400).send("Class Not Found!");
    return;
  }

  try {
    const students = await User.find({ class_id: classId, role: "student" });

    if (students) {
      res.status(200).json(students);
    } else {
      res.status(404);
      throw new Error("Students not found for this class");
    }
  } catch (error) {
    console.log("error ==>", error);
    res.status(500).send("Server Error");
  }
});

export {
  loginUser,
  logoutUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  createTeacher,
  createStudent,
  getAllTrainers,
  getTrainerById,
  getStudentById,
  deleteTrainerById,
  deleteStudentById,
  updateTrainerById,
  getAllStudents,
  createStudentByAdmin,
  updateStudentById,
  getStudentsOfTrainer,
  getStudentByTrainer,
  getStudentsByClass,
};
