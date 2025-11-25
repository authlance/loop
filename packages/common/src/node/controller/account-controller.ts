import {
    PaymentSuccessMessage,
    PaymentDeclinedMessage,
} from '../../common/types/payment-events'

export const AccountController = Symbol('AccountController')

export interface AccountController {

    /**
     * Will send email invoice and update CRM
     * @param context
     */
    processPaymentDeclined(context: PaymentDeclinedMessage): Promise<void>

    /**
     * Will send email invoice and update CRM
     * @param context
     */
    processPaymentSuccess(context: PaymentSuccessMessage): Promise<void>
}
