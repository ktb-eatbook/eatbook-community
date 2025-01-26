import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from 'nodemailer';
import * as fs from "fs"
import * as path from "path"

import { serverConfigs } from "../common";
import { NovelStatus } from "../provider";

const logger: Logger = new Logger("MailService")
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
            user: serverConfigs.authUser,
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
        to: serverConfigs.authEmail,
        html: this.getAlertTemplete(args)
      })
      logger.log('메일이 전송되었습니다')
    } catch (error) {
      logger.error('메일 전송 중 오류가 발생했습니다:', error)
    }
  }

  public async sendReminderEmail(args: StatusMailArgs): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: serverConfigs.authEmail, 
        subject: "소설 등록 요청 결과 리마인드 메일입니다",
        to: args.responsiblePersonEmail,
        html: this.getRemindertTemplete(args)
      })
      logger.log('메일이 전송되었습니다')
    } catch (error) {
      logger.error('메일 전송 중 오류가 발생했습니다:', error)
    }
  }

  private getAlertTemplete(args: AlertMailArgs): string {
    return this.replaceTempleteArguments(
      this.alertTemplete,
      args,
    )
  }

  private getRemindertTemplete(args: StatusMailArgs): string {
    args['color'] = this.getColorFromStatus(args.status)
    return this.replaceTempleteArguments(
      this.reminderTemplete,
      args,
    )
  }

  private getColorFromStatus(status: NovelStatus) {
    switch(status) {
      case "pending":
      case "reviewed":
        return "#F9CAA6"
      case "confirm":
        return "#1CBA3E"
      case "cancel":
        return "#FD6830"
    }
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

export interface MailArgs {}

export interface AlertMailArgs extends MailArgs {
  requester: string
  requesterEmail: string & tags.Format<"email">
  title: string & tags.MaxLength<200>
  description: string & tags.MaxLength<200>
  ref: string & tags.Format<"url">
  createdAt: Date
}

export interface StatusMailArgs extends MailArgs {
  responsiblePerson: string
  responsiblePersonEmail: string & tags.Format<"email">
  status: NovelStatus
  reason: string & tags.MaxLength<300>
  createdAt: Date
}