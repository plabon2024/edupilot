/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../config";
import AppError from "../errors/AppError";


const SMTP_PORT = Number(envVars.EMAIL_SENDER.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
    host : envVars.EMAIL_SENDER.SMTP_HOST,
    port: SMTP_PORT,
    // secure: true requires port 465 (SSL). Port 587 uses STARTTLS (secure: false)
    secure: SMTP_PORT === 465,
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS
    },
    tls: {
        // Do not fail on invalid certificates (useful for some SMTP providers)
        rejectUnauthorized: false,
    }
})

interface SendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType: string;
    }[]
}

export const sendEmail = async ({subject, templateData, templateName, to, attachments} : SendEmailOptions) => {
   
    
    try {
        // Resolve template path relative to this file's location.
        // In dev (tsx): __dirname = src/app/utils  → ../templates
        // In prod (dist): __dirname = dist/app/utils → ../templates (after copy)
        const templatePath = path.resolve(__dirname, `../templates/${templateName}.ejs`);

        const html = await ejs.renderFile(templatePath, templateData);

        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to : to,
            subject : subject,
            html : html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            }))
        })

        console.log(`Email sent to ${to} : ${info.messageId}`);
    } catch (error : any) {
        console.log("Email Sending Error", error.message);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
    }
}