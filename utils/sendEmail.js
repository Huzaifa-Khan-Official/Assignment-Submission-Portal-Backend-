import nodemailer from "nodemailer"
import serverConfig from "../config/serverConfig.js";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    auth: {
        user: serverConfig.gmail_user_mail,
        pass: serverConfig.gmail_app_password
    }
})

const sendEmail = async (data) => {
    try {
        const response = await transporter.sendMail({
            from: serverConfig.gmail_user_mail,
            ...data
        })

        return response;
    } catch (error) {
        throw error
    }
}

export { sendEmail }