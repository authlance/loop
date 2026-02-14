import { injectable, inject } from 'inversify'
import { EmailController } from '@authlance/common/lib/node/controller/email-controller'
import { SendEmailMessage } from '@authlance/common/lib/common/types/mail-events'
import { ApplicationConfigProvider } from '@authlance/core/lib/node/backend-application'
import { ServerClient } from 'postmark'

class PostMarkClientWrapper {

    private client: ServerClient

    constructor(private config: PostMarkConfiguration)  {
        this.client = new ServerClient(config.key)
    }

    async sendEmail(data: SendEmailMessage): Promise<void> {
        if (this.config.templates && this.config.templates[data.templateId]) {
            const template = this.config.templates[data.templateId]
            if (template) {
                const message = {
                    From: `${template.fromName} <${template.from}>`,
                    To: data.to,
                    TemplateAlias: template.alias,
                    TemplateModel: this.getTemplateModel(template, data),
                }
                await this.client.sendEmailWithTemplate(message)
            }
        }
    }

    getTemplateModel(template: PostMarkTemplate, data: SendEmailMessage) {
        const sender: SenderModel = {
            company: this.config.server,
            sender_name: template.fromName,
            sender_position: template.fromPosition,
            sender_email: template.from,
        }
        if (!data.templateModel.name || !data.templateModel.name.first || !data.templateModel.name.last || !data.templateModel.email) {
            throw new Error('Template model must include name property')
        }
        const recipient: RecipientModel = {
            name: data.templateModel.name.first + ' ' + data.templateModel.name.last,
            email: data.templateModel.email,
            recovery_code: data.templateModel.recovery_code,
            veirfy_url: data.templateModel.verification_url,
            verification_code: data.templateModel.verification_code,
        }
        // Extract any additional custom fields (e.g., message for contact forms)
        const { name, email, recovery_code, verification_url, recovery_url, verification_code, ...customFields } = data.templateModel
        return {
            ...sender,
            ...recipient,
            ...customFields,
        }
    }
}

interface PostMarkTemplate {
    alias: string
    from: string
    fromName: string
    fromPosition: string
}

interface PostMarkConfiguration {
    server: string
    key: string
    templates: Record<string, PostMarkTemplate>
}

interface SenderModel {
    company: string
    sender_name: string
    sender_position: string
    sender_email: string
}

interface RecipientModel {
    name: string
    email: string
    veirfy_url?: string
    verification_code?: string
    recovery_code?: string
}

@injectable()
export class EmailControllerImpl implements EmailController {

    private client: PostMarkClientWrapper

    constructor(
        @inject(ApplicationConfigProvider) private readonly appConfig: ApplicationConfigProvider
    ) {
        this.client = new PostMarkClientWrapper(this.appConfig.config.postmark)
    }

    async sendEmail(data: SendEmailMessage): Promise<void> {
        this.client.sendEmail(data)
    }

}
