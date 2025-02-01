import * as dotenv from "dotenv"
dotenv.config()

export const serverConfigs = {
    serverPort: process.env.SERVER_PORT,
    serverUrl: process.env.SERVER_IP,
    mailServerUrl: process.env.NOTIFY_SERVER_URL,
}

import * as fs from "fs"
import * as path from "path"

const whiteListPath = path.join(__dirname, "../../../../whitelist.txt")
const listDatas = fs.readFileSync(whiteListPath, 'utf-8').split("\r\n")

export const allowIps: string[] = listDatas