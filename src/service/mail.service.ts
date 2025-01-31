import { Injectable, Logger } from "@nestjs/common";

import { serverConfigs } from "../common";
import { NovelStatus } from "../provider";

const notifyServerUrl = serverConfigs.mailServerUrl
const logger: Logger = new Logger("MailService")

@Injectable()
export class MailService {
  public sendAlertEmail(args: AlertMailArgs): void {
    this.sendEmail("alert", args)
  }

  public sendReminderEmail(args: StatusMailArgs): void {
    this.sendEmail("reminder", args)
  }

  private async sendEmail(type: EmailType, args: MailArgs): Promise<void> {
    const url = `${notifyServerUrl}/mail/${type}`
    await fetch(url, {
      method: "POST",
      body: JSON.stringify(args),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .catch(e => {
      logger.error("메일 전송 요청에 실패했습니다")
      logger.error(`Reason: ${e}`)
    })
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
  toEmails: Array<string & tags.Format<"email">>
  status: NovelStatus
  reason: string & tags.MaxLength<300>
  createdAt: Date
}

export type EmailType = "reminder" | "alert"