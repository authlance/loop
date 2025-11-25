import { injectable, inject } from 'inversify'
import { EventsQueueContribution, EventsQueueService, MessageEvent } from '@authlance/events-queue/lib/common/types'
import { DisposableCollection } from '@authlance/core/lib/common/disposable'
import { EmailController } from '@authlance/common/lib/node/controller/email-controller'
import { MAIL_SEND_SUBJECT, SendEmailMessage } from '@authlance/common/lib/common/types/mail-events'

@injectable()
export class MailsService implements  EventsQueueContribution {

    private disposables: DisposableCollection

    constructor(
        @inject(EventsQueueService) protected readonly eventsQueue: EventsQueueService,
        @inject(EmailController) protected readonly emailController: EmailController
    ) {
        this.disposables = new DisposableCollection()
    }

    async initialize(): Promise<void> {
        this.disposables.push(
            await this.eventsQueue.subscribe(
                MAIL_SEND_SUBJECT,
                this.handleSendEmailEvent.bind(this),
                {
                    consumerName: 'duna-mail-send',
                    workQueue: true,
                    broadcast: false,
                    ackWait: 60 * 5,
                }
            )
        )
    }
    
    async handleSendEmailEvent(event: MessageEvent): Promise<void> {
        try {
            const targetEvent = JSON.parse(event.message) as SendEmailMessage
            await this.emailController.sendEmail(targetEvent)
            event.success()
        } catch (error) {
            console.log('Error in handleSendEmailEvent', error)
            event.error(error)
        }
    }
}
