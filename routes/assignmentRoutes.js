import express from "express";
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByTrainer,
  getAssignmentById,
  evaluateSubmission,
  getAssignmentSubmissions,
  getAssignmentsByTrainerForClass,
  getStudentSubmissionReport,
  getAssignmentsByTrainerId,
  getStudentAssignmentReportsForClass,
  getStudentAssignmentInClass,
  getSubmittedAssignments,
  getAssignmentsForClass,
  getAssignmentsToSubmit,
  submitAssignment,
  unsubmitAssignment,
  // getAllSubmittedAssignments,
} from "../controllers/assignmentController.js";
import {
  authenticate,
  authorizeTrainer,
  authorizeAdmin,
  authorizeTrainerORAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Trainer routes
router.post("/create", authorizeTrainer, createAssignment);
router.put("/:id", authorizeTrainer, updateAssignment);
router.delete("/:id", authorizeTrainer, deleteAssignment);
router.get("/trainer", authorizeTrainer, getAssignmentsByTrainer);
router.get("/:id", authorizeTrainer, getAssignmentById);
router.post("/:assignmentId/evaluate", authorizeTrainer, evaluateSubmission);
router.get("/:id/submissions", authorizeTrainer, getAssignmentSubmissions);
router.get(
  "/class/:classId",
  authorizeTrainer,
  getAssignmentsByTrainerForClass
);

// Route accessible by students, trainers, and admins
router.get("/:assignmentId/report/:studentId", getStudentSubmissionReport);
router.get(
  "/class/:classId/student/:studentId/reports",
  getStudentAssignmentReportsForClass
);

// ADMIN ROUTES
router.get(
  "/trainer/:trainerId/assignments",
  authorizeAdmin,
  getAssignmentsByTrainerId
);
router.get(
  "/class/:classId/assignment/:assignmentId/student/:studentId",
  authorizeAdmin,
  getStudentAssignmentInClass
);

// student routes
// router.get("/student/allSubmitted", getAllSubmittedAssignments);
router.get("/student/submitted", getSubmittedAssignments); // current class Student is in
router.delete("/student/:assignmentId", authenticate, unsubmitAssignment);
router.get("/student/class/:classId", getAssignmentsForClass);
router.get("/student/pending", getAssignmentsToSubmit);
router.post("/:assignmentId/submit", submitAssignment);
export default router;
