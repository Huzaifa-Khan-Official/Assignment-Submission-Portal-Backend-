import express from "express";
import { authenticate, authorizeTrainer } from "../middlewares/authMiddleware.js";
import { createAssignment, updateAssignment } from "../controllers/assignmentController.js";

const router = express.Router();

router.route("/create")
    .post(authenticate, authorizeTrainer, createAssignment);

router.route("/:assignmentId")
    .put(authenticate, authorizeTrainer, updateAssignment);

export default router;