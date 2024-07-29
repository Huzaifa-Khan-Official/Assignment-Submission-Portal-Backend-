import mongoose from "mongoose";
import { nanoid } from 'nanoid';

const { Schema, model } = mongoose;

const classSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    classImage: {
        type: String,
    },
    assignments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment'
        }
    ],
    join_code: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid(10)
    }
}, { timestamps: true });

const Class = model("Class", classSchema);

export default Class;
