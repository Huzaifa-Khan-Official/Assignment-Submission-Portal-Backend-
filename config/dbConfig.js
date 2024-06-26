import mongoose from "mongoose";
import serverConfig from "./serverConfig.js";

const connectDB = async () => {
    try {
        await mongoose.connect(serverConfig.dbURI)
    } catch (error) {
        console.error("Error ==>", error.message);
        process.exit(1);
    }
}

export default connectDB;