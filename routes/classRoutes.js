import express from "express";
import {
  authenticate,
  authorizeAdmin,
  authorizeTrainer,
} from "../middlewares/authMiddleware.js";
import {
  createClass,
  updateClassById,
  getClassById,
  deleteClassById,
  enrollStudent,
  getAllClassesOfTrainer,
  getAllStudentsOfClass,
  getClassmates,
  getClassesOfStudent,
  getClassDetailById,
  unEnrollStudentByClassId
} from "../controllers/classController.js";

const router = express.Router();

router.route("/").get(authenticate, authorizeTrainer, getAllClassesOfTrainer);

router.route("/getClasses").get(authenticate, getClassesOfStudent);

router
  .route("/students/:classId")
  .get(authenticate, authorizeTrainer, getAllStudentsOfClass);

router
  .route("/trainer/class/:classId")
  .get(authenticate, authorizeTrainer, getClassDetailById);

router
  .route("/student/class/:classId")
  .get(authenticate, getClassDetailById)
  .delete(authenticate, unEnrollStudentByClassId);

router
  .route("/admin/students/:classId")
  .get(authenticate, authorizeAdmin, getAllStudentsOfClass);

router.route("/create").post(authenticate, authorizeTrainer, createClass);

router
  .route("/:classId")
  .put(authenticate, authorizeTrainer, updateClassById)
  .get(authenticate, authorizeTrainer, getClassById)
  .delete(authenticate, authorizeTrainer, deleteClassById);

router.route("/enroll").post(authenticate, enrollStudent);

router.route("/classmates/:classId").get(authenticate, getClassmates);

export default router;
