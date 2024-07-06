import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Assignment schema
const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    postDate: { type: Date, default: Date.now },
    trainer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    total_marks: { type: Number, required: true },
    submissions: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fileLink: { type: String }, // link of file submitted according to that assignment
        submissionDate: { type: Date },
        marks: { type: Number },
        rating: { type: String }, // rating: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
        remark: { type: String },
    }],
}, { timeStamps: true });

const Assignment = model('Assignment', assignmentSchema);

export default Assignment;