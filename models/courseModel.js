import mongoose from "mongoose";

const { Schema, model } = mongoose;

const courseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    // description: {
    //     type: String,
    //     required: true
    // },
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    // students: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // }]
}, { timestamps: true });

const Course = model('Course', courseSchema);

export default Course;
