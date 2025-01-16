import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';
import * as fs from "fs"
import * as path from "path"

import { serverConfigs } from "../common";

const templetePath = path.join(__dirname, "../../../public/templete/")

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter
  private readonly alertTemplete: string
  private readonly reminderTemplete: string

  constructor(){
      this.transporter = nodemailer.createTransport({
          host: serverConfigs.host,
          port: 587,
          secure: false,
          auth: {
            user: serverConfigs.authEmail,
            pass: serverConfigs.authEmailPass,
          }
      })
      this.alertTemplete = fs.readFileSync(templetePath + "alert_templete.html", 'utf8')
      this.reminderTemplete = fs.readFileSync(templetePath + "reminder_templete.html", 'utf-8')
  }

  public async sendAlertEmail(args: AlertMailArgs): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: serverConfigs.authEmail, 
        subject: "새로운 소설 등록 요청이 도착했습니다",
        to: args.to,
        html: this.getAlertTemplete(args)
      })
      console.log('메일이 전송되었습니다')
    } catch (error) {
      console.error('메일 전송 중 오류가 발생했습니다:', error)
    }
  }

  public async sendReminderTempleteEmail(args: StatusMailArgs): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: serverConfigs.authEmail, 
        subject: "소설 등록 요청 결과 리마인드 메일입니다",
        to: args.to,
        html: this.getRemindertTemplete(args)
      })
      console.log('메일이 전송되었습니다')
    } catch (error) {
      console.error('메일 전송 중 오류가 발생했습니다:', error)
    }
  }

  private getAlertTemplete(args: AlertMailArgs): string {
    return this.replaceTempleteArguments(
      this.alertTemplete,
      args,
    )
  }

  private getRemindertTemplete(args: StatusMailArgs): string {
    args['color'] = args.status === "confirm" ? "#1CBA3E" : args.status === "cancel" ? "#FD6830" : "#F9CAA6"
    return this.replaceTempleteArguments(
      this.reminderTemplete,
      args,
    )
  }

  private replaceTempleteArguments(
    templete: string,
    args: MailArgs
  ): string {
    const keys = Object.keys(args)
    for(let i=0; i<keys.length; ++i) {
      templete = templete.replaceAll(`{${keys[i]}}`, `${args[keys[i]]}`)
    }
    return templete
  }
}

import { tags } from "typia"
import { NovelStatus, NovelUCICode } from "../provider";

export interface MailArgs {}

export interface AlertMailArgs extends MailArgs {
  requester: string
  to: string & tags.Format<"email">
  title: string & tags.MaxLength<200>
  description: string & tags.MaxLength<200>
  ref: string & tags.Format<"url">
  createdAt: Date
}

export interface StatusMailArgs extends MailArgs {
  novel_id: NovelUCICode
  title: string & tags.MaxLength<200>
  requester: string
  to: string & tags.Format<"email">
  responsiblePerson: string
  responsiblePersonEmail: string & tags.Format<"email">
  status: NovelStatus
  reason: string & tags.MaxLength<300>
  createdAt: Date
}