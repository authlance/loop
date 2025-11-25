import { SendEmailMessage } from "../../common/types/mail-events";
export const EmailController = Symbol('EmailController')

export interface EmailController {

    sendEmail(data: SendEmailMessage): Promise<void>
}
