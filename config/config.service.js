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