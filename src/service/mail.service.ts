import { Injectable } from "@nestjs/common";

import { serverConfigs } from "../common";
import { NovelStatus } from "../provider";

const notifyServerUrl = serverConfigs.mailServerUrl

@Injectable()
export class MailService {
  public sendAlertEmail(args: AlertMailArgs): void {
    this.sendEmail("alert", args)
  }

  public sendReminderEmail(args: StatusMailArgs): void {
    this.sendEmail("reminder", args)
  }

  private async sendEmail(target: "reminder" | "alert", args: MailArgs): Promise<void> {
    const url = `${notifyServerUrl}/mail/${target}`
    await fetch(url, {
      method: "POST",
      body: JSON.stringify(args),
      headers: {
        "Content-Type": "application/json"
      }
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