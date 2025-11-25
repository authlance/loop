export const MAIL_SEND_SUBJECT = 'mail.send'

export interface MailName {
    first: string
    last: string
}

export interface MailTemplate {
    email: string
    name: MailName
    recovery_url: string
    verification_url: string
    recovery_code: string
    verification_code: string
}

export interface SendEmailMessage {
    to: string
    from: string
    templateId: string
    templateModel: Partial<MailTemplate>
}
