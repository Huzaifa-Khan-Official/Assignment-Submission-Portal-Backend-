import express from "express";
import { loginUser, logoutUser, getCurrentUserProfile, updateCurrentUserProfile, createTeacher, createStudent, getAllTrainers, getTrainerById, getStudentById, deleteTrainerById, deleteStudentById, updateUserById } from "../controllers/userController.js";
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


router.route("/trainers")
    .get(authenticate, authorizeAdmin, getAllTrainers);

router.route("/newTrainer")
    .post(authenticate, authorizeAdmin, createTeacher);

router.route("/trainer/:trainerId")
    .get(authenticate, authorizeAdmin, getTrainerById)
    .delete(authenticate, authorizeAdmin, deleteTrainerById);

router.route("/student/:studentId")
    .get(authenticate, authorizeAdmin, getStudentById)
    .delete(authenticate, authorizeAdmin, deleteStudentById);

router.route("/:Id")
    .put(authenticate, authorizeAdmin, updateUserById)

router.post("/auth", loginUser);


// logout current user, trainer, admin
router.post("/logout", logoutUser);

export default router;