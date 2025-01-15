import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';
import * as fs from "fs"
import * as path from "path"

import { serverConfigs } from "../common";

const templetePath = path.join(__dirname, "../../public/templete/")

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter
    private alertTemplete: string

    constructor(){
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: serverConfigs.googleEmail,
              pass: serverConfigs.googleEmailPass,
            }
        })
        this.alertTemplete = fs.readFileSync(templetePath + "alert_templete.html", 'utf8')
    }

    public async sendMail(args: AlertMailArgs) {
      try {
        await this.transporter.sendMail({
          from: serverConfigs.googleEmail, 
          subject: "새로운 소설 등록 요청이 도착했습니다",
          to: args.to,
          html: this.getAlertTemplete(args)
        })
        console.log('메일이 전송되었습니다')
      } catch (error) {
        console.error('메일 전송 중 오류가 발생했습니다:', error)
      }
  }

  private getAlertTemplete(args: AlertMailArgs): string {
    const keys = Object.keys(args)
    let templete = this.alertTemplete
    for(let i=0; i<keys.length; ++i) {
      templete = templete.replace(`{${keys[i]}}`, `${args[keys[i]]}`)
    }
    return templete
  }
}

import { tags } from "typia"

export interface AlertMailArgs {
  requester: string
  to: string & tags.Format<"email">
  title: string & tags.MaxLength<200>
  description: string & tags.MaxLength<200>
  ref: string & tags.Format<"url">
}