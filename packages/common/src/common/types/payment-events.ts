export const PAYMENT_SUCCESS_SUBJECT = 'payment.success'
export const PAYMENT_DECLINED_SUBJECT = 'payment.declined'

export interface InvoiceEmailMessage {
    email: string
    name: string
    subscriptionId: string
}

export interface PaymentUser {
    id: string // stripe customer id
    email: string
    name: string
    subId?: string 
}

export interface PaymentSuccessMessage {
    user: PaymentUser
    email: string
    amount: string
    subscriptionId: string
    stripeCustomerId: string
    stripeSubscriptionId: string
    invoice_pdf: string
    subscription_status: string
    organizationId: string
    billingReason: string
    period_end?: number
}

export interface PaymentDeclinedMessage {
    user: PaymentUser
    email: string
    subscriptionId: string
    stripeCustomerId: string
    stripeSubscriptionId: string
    organizationId: string
    amount: string
    reason: string
}

export interface SubscriptionCancelledEvent {
    user: PaymentUser
    email: string
    subscriptionId: string
    subscriptionStatus: string
}

export interface UserLoginEvent {
    email: string
    subId: string
}

