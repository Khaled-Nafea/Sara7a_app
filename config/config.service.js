import {resolve} from "node:path";
import dotenv from "dotenv";

const envPath = {
    development: `dev.env`,
    production: `prod.env`,
}

dotenv.config({ path: resolve(`./config/${envPath.development}`) });

export const PORT = process.env.PORT || 5000;
export const DB_URI = process.env.DB_URI;
export const SALT_ROUND = process.env.SALT_ROUND;
export const SECRET_KEY = process.env.SECRET_KEY;

// User JWT
export const JWT_USER_SECRET_ACCESS = process.env.JWT_USER_SECRET_ACCESS;
export const JWT_USER_SECRET_REFRESH = process.env.JWT_USER_SECRET_REFRESH;

// Admin JWT
export const JWT_ADMIN_SECRET_ACCESS = process.env.JWT_ADMIN_SECRET_ACCESS;
export const JWT_ADMIN_SECRET_REFRESH = process.env.JWT_ADMIN_SECRET_REFRESH;


// General JWT
export const JWT_EXPIRES_IN_ACCESS = process.env.JWT_EXPIRES_IN_ACCESS || '1h';
export const JWT_EXPIRES_IN_REFRESH = process.env.JWT_EXPIRES_IN_REFRESH || '1d';

// Google OAuth
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Email
export const USER_EMAIL = process.env.USER_EMAIL;
export const USER_PASSWORD = process.env.USER_PASSWORD;

