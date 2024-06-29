import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchemea = new Schema({
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
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true });

const User = model("User", userSchemea);

export default User; 