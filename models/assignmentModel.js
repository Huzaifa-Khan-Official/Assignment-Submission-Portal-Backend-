import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Assignment schema
const assignmentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    assignDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    fileLink: {
        type: String,
        required: false
    },
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        fileLink: String,
        submittedAt: Date,
        grade: Number
    }]
}, { timestamps: true });

const Assignment = model('Assignment', assignmentSchema);

export default Assignment;
