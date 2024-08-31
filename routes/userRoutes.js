import express from "express";
import {
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
  verifyAccount,
  getUnenrolledStudents,
  setMultipleStudents,
} from "../controllers/userController.js";
import {
  authenticate,
  authorizeAdmin,
  authorizeTrainer,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Student Routes
router
  .route("/")
  // create a new student
  .post(createStudent);

router
  .route("/account-verification")
  .post(authenticate, verifyAccount);

router
  .route("/profile")
  // get current student's profile
  .get(authenticate, getCurrentUserProfile)
  // update current student's profile
  .put(authenticate, updateCurrentUserProfile);

router.route("/trainers").get(authenticate, authorizeAdmin, getAllTrainers);

router
  .route("/students")
  .get(authenticate, authorizeAdmin, getAllStudents)
  .post(authenticate, authorizeAdmin, setMultipleStudents);

router.route("/trainer").post(authenticate, authorizeAdmin, createTeacher);

router
  .route("/trainer/:trainerId")
  .get(authenticate, authorizeAdmin, getTrainerById)
  .delete(authenticate, authorizeAdmin, deleteTrainerById)
  .put(authenticate, authorizeAdmin, updateTrainerById);

router
  .route("/student")
  .post(authenticate, authorizeAdmin, createStudentByAdmin);

router
  .route("/students/unenrolled")
  .get(authenticate, authorizeAdmin, getUnenrolledStudents);

router
  .route("/students/class/:classId")
  .get(authenticate, authorizeAdmin, getStudentsByClass);

router
  .route("/student/:studentId")
  .get(authenticate, getStudentById)
  .delete(authenticate, authorizeAdmin, deleteStudentById)
  .put(authenticate, authorizeAdmin, updateStudentById);

router
  .route("/students/:trainerId")
  .get(authenticate, authorizeAdmin, getStudentsOfTrainer);

router
  .route("/trainer/student/:studentId")
  .get(authenticate, authorizeTrainer, getStudentByTrainer);

router.post("/auth", loginUser);

// logout current user, trainer, admin
router.post("/logout", logoutUser);

export default router;
