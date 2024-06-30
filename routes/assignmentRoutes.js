import express from "express";
import { authenticate, authorizeTrainer } from "../middlewares/authMiddleware.js";
import { createAssignment } from "../controllers/assignmentController.js";

const router = express.Router();

router.route("/create")
    .post(authenticate, authorizeTrainer, createAssignment);

export default router;