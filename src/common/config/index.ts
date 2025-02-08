import * as dotenv from "dotenv"
dotenv.config()

export const serverConfigs = {
    serverPort: process.env.SERVER_PORT,
    serverUrl: process.env.SERVER_IP,
    mailServerUrl: process.env.NOTIFY_SERVER_URL,
    bookKeeperUrl: process.env.BOOK_KEEPER_URL,
}

import * as fs from "fs"
import * as path from "path"

const whiteListPath = path.join(__dirname, "../../../../whitelist.txt")
const isExistsFile = fs.existsSync(whiteListPath)
let listDatas: string[]
if(isExistsFile) {
    listDatas = fs.readFileSync(whiteListPath, 'utf-8').split("\r\n")
} else {
    fs.writeFileSync(whiteListPath, '')
    listDatas = []
}

export const allowIps: string[] = listDatas