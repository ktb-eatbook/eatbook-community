import * as dotenv from "dotenv"
dotenv.config()

export const serverConfigs = {
    serverPort: process.env.SERVER_PORT,
    authEmailPass: process.env.GOOGLE_EMAIL_AUTH_PASS,
    authEmail: process.env.GOOGLE_AUTH_EMAIL,
    authUser: process.env.GOOGLE_AUTH_USER,
    host: process.env.GOOGLE_AUTH_HOST,
}