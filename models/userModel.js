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
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() { return this.role === 'student'; },
        default: null
    }
}, { timestamps: true });

userSchema.pre('save', function(next) {
    if (this.role === 'student' && !this.teacher_id) {
        next(new Error('teacher_id is required for students'));
    } else {
        next();
    }
});

const User = model("User", userSchema);

export default User;