import express from "express";
import { authenticate, authorizeAdmin, authorizeTrainer } from "../middlewares/authMiddleware.js";
import { createAssignment, updateAssignment, getAllAssignments, deleteAssignment, getAssignment, getAssignments } from "../controllers/assignmentController.js";

const router = express.Router();


// Get all the assignments as admin
router.route("/getAssignments")
    .get(authenticate, authorizeAdmin, getAllAssignments);

router.route("/assignments")
    .get(authenticate, authorizeTrainer, getAssignments);

router.route("/create")
    .post(authenticate, authorizeTrainer, createAssignment);

router.route("/:assignmentId")
    .get(authenticate, authorizeTrainer, getAssignment)
    .put(authenticate, authorizeTrainer, updateAssignment)
    .delete(authenticate, authorizeTrainer, deleteAssignment);

export default router;