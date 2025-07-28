import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text, html) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail", // Use your email provider
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS, // Your email password or app password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text, // Fallback for email clients that do not support HTML
        html, // HTML content for the email
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;
