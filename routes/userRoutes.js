import express from "express";
import { createUser, loginUser, logoutUser, getAllUsers, getCurrentUserProfile, updateCurrentUserProfile, deleteUserById, getUserById, updateUserById, createTeacher, createStudent } from "../controllers/userController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js"

const router = express.Router();

// Student Routes
router.route("/")
    // create a new student
    .post(createStudent);

router.route("/profile")
    // get current student's profile
    .get(authenticate, getCurrentUserProfile)
    // update current student's profile
    .put(authenticate, updateCurrentUserProfile);

router.route("/")
    .post(createUser)
    .get(authenticate, authorizeAdmin, getAllUsers);

router.route("/newTrainer")
    .post(authenticate, authorizeAdmin, createTeacher);

router.post("/auth", loginUser);


// logout current user, trainer, admin
router.post("/logout", logoutUser);

// admin routes
router.route("/:id")
    .delete(authenticate, authorizeAdmin, deleteUserById)
    .get(authenticate, authorizeAdmin, getUserById)
    .put(authenticate, authorizeAdmin, updateUserById);

export default router;