import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["student", "trainer", "admin"],
        default: "student"
    },
    // teacher_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: function () { return this.role === 'student'; },
    //     default: null
    // },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
}, { timestamps: true });

const User = model("User", userSchema);

export default User;