import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


const sendEmail = async (to: string, subject: string, html: string) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html, // Use HTML content for clickable links
    });
};

export default sendEmail;
