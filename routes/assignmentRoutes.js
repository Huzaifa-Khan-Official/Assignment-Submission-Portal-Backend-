import express from "express";
import { authenticate, authorizeAdmin, authorizeTrainer } from "../middlewares/authMiddleware.js";
import { createAssignment, updateAssignment, getAllAssignments, deleteAssignment, getAssignment } from "../controllers/assignmentController.js";

const router = express.Router();

router.route("/create")
    .post(authenticate, authorizeTrainer, createAssignment);

router.route("/:assignmentId")
    .get(authenticate, authorizeTrainer, getAssignment)
    .put(authenticate, authorizeTrainer, updateAssignment)
    .delete(authenticate, authorizeTrainer, deleteAssignment);

// Get all the assignments as admin
router.route("/getAllAssignments")
    .get(authenticate, authorizeAdmin, getAllAssignments);



export default router;