import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Assignment schema
const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    postDate: { type: Date, default: Date.now }, // Date.now
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    total_marks: { type: Number, required: true },
    fileLink: { type: String }, // Assignment file Link
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        description: { type: String },
        fileLink: { type: String }, // link of file submitted according to that assignment
        submissionDate: { type: Date },
        marks: { type: Number },
        rating: { type: String }, // rating: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
        remark: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Assignment = model("Assignment", assignmentSchema);

export default Assignment;
