import * as dotenv from "dotenv"
dotenv.config()

export const serverConfigs = {
    serverPort: process.env.SERVER_PORT,
    googleEmailPass: process.env.GOOGLE_EMAIL_AUTH_PASS,
    googleEmail: process.env.GOOGLE_AUTH_EMAIL,
}