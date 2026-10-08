import crypto from "crypto";
import { SECRET_KEY } from "../../../config/config.service.js";

const IV_LENGTH = 16;
const ENCRYPTION_SECRET_KEY = Buffer.from(SECRET_KEY);

export const encrypt = (text) => {
   const iv = crypto.randomBytes(IV_LENGTH);
   const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, iv);

   let encryptedData = cipher.update(text, 'utf8', 'hex');
   encryptedData += cipher.final('hex');

   return iv.toString('hex') + ':' + encryptedData;
};

export const decrypt = (encryptedText) => {
    const [ivHex, encryptedData] = encryptedText.split(':');

    const  iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};
