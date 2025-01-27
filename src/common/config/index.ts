import * as dotenv from "dotenv"
dotenv.config()

export const serverConfigs = {
    serverPort: process.env.SERVER_PORT,
    mailServerUrl: process.env.NOTIFY_SERVER_URL,
    localhost: process.env.LOCAL_HOST,
}