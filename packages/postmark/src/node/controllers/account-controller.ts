import { injectable, inject } from 'inversify'
import { AccountController } from '@authlance/common/lib/node/controller/account-controller'
import {
    PAYMENT_DECLINED_SUBJECT,
    PAYMENT_SUCCESS_SUBJECT,
    PaymentDeclinedMessage,
    PaymentSuccessMessage
} from '@authlance/common/lib/common/types/payment-events'
import { EventsQueueService, EventsQueueContribution } from '@authlance/events-queue/lib/common/types'
import { DisposableCollection } from '@authlance/core/lib/common/disposable'

@injectable()
export class AccountControllerImpl implements AccountController, EventsQueueContribution {
    
    private disposables: DisposableCollection

    constructor(
        @inject(EventsQueueService) protected readonly eventsQueue: EventsQueueService
    ) {
        this.disposables = new DisposableCollection()
    }

    public async initialize(): Promise<void> {
        this.disposables.push(
            await this.eventsQueue.subscribe(
                PAYMENT_SUCCESS_SUBJECT,
                this.handlePaymentSuccessEvent.bind(this),
                {
                    consumerName: 'authlance-payment-success',
                    workQueue: true,
                    broadcast: false,
                    ackWait: 60 * 5,
                }
            )
        )
        this.disposables.push(
            await this.eventsQueue.subscribe(
                PAYMENT_DECLINED_SUBJECT,
                this.handlePaymentDeclinedEvent.bind(this),
                {
                    consumerName: 'authlance-payment-declined',
                    workQueue: true,
                    broadcast: false,
                    ackWait: 60 * 5,
                }
            )
        )
    }

    private async handlePaymentSuccessEvent(event: any): Promise<void> {
        try {
            const targetEvent = JSON.parse(event.message) as PaymentSuccessMessage
            await this.processPaymentSuccess(targetEvent)
            event.success()
        } catch (error) {
            console.log('Error in handlePaymentSuccessEvent', error)
            event.error(error)
        }
    }
    
    private async handlePaymentDeclinedEvent(event: any): Promise<void> {
        try {
            const targetEvent = JSON.parse(event.message) as PaymentDeclinedMessage
            await this.processPaymentDeclined(targetEvent)
            event.success()
        } catch (error) {
            console.log('Error in handlePaymentDeclinedEvent', error)
            event.error(error)
        }
    }

    public async processPaymentDeclined(message: PaymentDeclinedMessage): Promise<void> {
        try {
            // TODO
        } catch (error) {
            console.error('Error sending payment failed email:', error)
            throw error
        }
    }


    public async processPaymentSuccess(message: PaymentSuccessMessage): Promise<void> {
        try {
            // TODO: send email invoice
        } catch (error) {
            console.error('Error processing payment success:', error)
            throw error
        }
    }
}
