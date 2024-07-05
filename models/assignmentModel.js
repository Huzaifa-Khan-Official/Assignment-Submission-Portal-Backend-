import mongoose from "mongoose";

const { Schema, model } = mongoose;

const submissionSchema = new Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submittedAt: {
        type: Date,
        default: null
    },
    grade: {
        type: Number,
        default: null
    },
    fileLink: {
        type: String,
        required: false
    }
}, { timestamps: true });

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
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
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
    submissions: [submissionSchema]
}, { timestamps: true });

const Assignment = model('Assignment', assignmentSchema);

export default Assignment;
