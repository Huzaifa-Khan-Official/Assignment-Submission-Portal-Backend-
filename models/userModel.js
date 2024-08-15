import mongoose from "mongoose";
import { generateOtp } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";

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
    otp: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profileImg: {
        type: String
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
}, { timestamps: true });

userSchema.pre("save", function (next) {
    if (!this.otp) {
        this.otp = generateOtp()

        sendEmail({
            to: this.email,
            subject: "Account Verification OTP",
            text: `Your account verification token is ${this.otp}`
        }).then(res => console.log(`Successfully sending emial to ${this.email}`))
            .catch(err => console.log(`Error sending emial to ${this.email}`))
    }
    next();
})

const User = model("User", userSchema);

export default User;