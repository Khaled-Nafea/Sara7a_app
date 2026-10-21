import { EventEmitter } from "node:events";
import { sendEmail } from "../email/nodemailer.js";
import { template } from "../email/generateHTML.js";
import { emailSubject } from "../enums/email.enum.js";

export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async(data) => {
    await sendEmail({
        to:data.to, 
        subject:emailSubject.confirmEmail, 
        text:data.text, 
        html:template(data.OTP, data.firstName, emailSubject.confirmEmail)
    }).catch((err) => {
        console.log("Error in sending confirm email:", err);
    });
});

emailEvent.on("forgetPassword", async(data) => {
    await sendEmail({
        to:data.to, 
        subject:emailSubject.resetPassword, 
        text:data.text, 
        html:template(data.OTP, data.firstName, emailSubject.resetPassword)
    }).catch((err) => {
        console.log("Error in sending forget password email:", err);
    });
});

