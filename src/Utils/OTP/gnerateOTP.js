import crypto from "crypto";

export const generateOTP = (length = 6) => {
    const min = 10 ** (length - 1);
    const max = 10 ** length;
    return String(crypto.randomInt(min, max));
};