import express from "express";
import { authenticate, authorizeTrainer } from "../middlewares/authMiddleware.js";
import { createClass, updateClassById, getClassById, deleteClassById } from "../controllers/classController.js";

const router = express.Router();

router.route("/create")
    .post(authenticate, authorizeTrainer, createClass);

router.route("/:classId")
    .put(authenticate, authorizeTrainer, updateClassById)
    .get(authenticate, authorizeTrainer, getClassById)
    .delete(authenticate, authorizeTrainer, deleteClassById);

export default router;