import { Disposable } from '@authlance/core/lib'

export interface MessageEvent {
    key: string
    message: string
    success: () => void
    error: (error: Error) => void
}

export interface EventSubscriptionOptions {
    consumerName: string
    workQueue: boolean
    broadcast: boolean
    ackWait?: number
}

export const EventsQueueService = Symbol('EventsQueueService')

export interface EventsQueueService {
    publish(key: string, message: string): Promise<void>
    subscribe(key: string, callback: (message: MessageEvent) => void, options: EventSubscriptionOptions): Promise<Disposable>
    close(): void
}

export const EventsQueueContribution = Symbol('EventsQueueContribution')
export interface EventsQueueContribution {
    initialize(): Promise<void>
}
