import { SALT_ROUND } from "../../../config/config.service.js";
import bcrypt from "bcrypt";
import { HashEnum } from "../enums/security.enum.js";
import argon2 from "argon2";
import { badRequest } from "../response/error.response.js";

export const generateHash = (plainText, saltRound = Number(SALT_ROUND), algorithm = HashEnum.Bcrypt) => {
    let hashResult = "";
    switch (algorithm) {
        case HashEnum.Bcrypt:
            hashResult = bcrypt.hash(plainText, saltRound);
            break;
        case HashEnum.Argon2:
            hashResult = argon2.hash(plainText);
            break;
        default:
            throw badRequest("Unsupported hash algorithm");
    }
    return hashResult;
};

export const compareHash = (plainText, cipherText, algorithm = HashEnum.Bcrypt) => {
    let match = false;
    switch (algorithm) {
        case HashEnum.Bcrypt:
            match = bcrypt.compare(plainText, cipherText);
            break;
        case HashEnum.Argon2:
            match = argon2.verify(cipherText, plainText);
            break;
        default:
            throw badRequest("Unsupported hash algorithm");
    }
    return match;
};