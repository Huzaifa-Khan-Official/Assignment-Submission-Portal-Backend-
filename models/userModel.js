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

userSchema.pre("save", async function (next) {
    if (!this.otp) {
        this.otp = generateOtp();

        const emailTemplate = `
            <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                <h2>Account Verification</h2>
                <p>Hello ${this.username},</p>
                <p>Thank you for registering on our platform. To complete your registration, please verify your account using the OTP below:</p>
                <h3>${this.otp}</h3>
                <p>If you did not request this, please ignore this email.</p>
                <p>Best regards,<br>Assignment Submission Portal</p>
            </div>
        `;

        try {
            await sendEmail({
                to: this.email,
                subject: "Account Verification OTP",
                html: emailTemplate
            });
        } catch (error) {
            console.log(`Error sending email to ${this.email}`);
        }
    }
    next();
});

const User = model("User", userSchema);

export default User;