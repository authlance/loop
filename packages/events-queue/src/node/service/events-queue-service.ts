import { injectable, inject, named } from 'inversify'
import { EventsQueueContribution, EventsQueueService, EventSubscriptionOptions, MessageEvent } from '../../common/types'
import { Disposable, Emitter, ContributionProvider } from '@authlance/core/lib'
import {
    connect,
    NatsConnection,
    JetStreamClient,
    JetStreamManager,
    AckPolicy,
    StringCodec,
    StreamInfo,
    Consumer,
    DeliverPolicy,
    RetentionPolicy,
} from 'nats'

@injectable()
export class EventsQueueServiceImpl implements EventsQueueService {
    protected nc: NatsConnection
    protected js: JetStreamClient
    protected jsManager: JetStreamManager
    private emitters: Map<string, Emitter<MessageEvent>> = new Map()
    private consumingStreams: Set<string> = new Set()

    constructor(
        @inject(ContributionProvider)
        @named(EventsQueueContribution)
        protected readonly eventsQueueContributionsProvider: ContributionProvider<EventsQueueContribution>
    ) {
        // such empty
    }

    async initialize(natsUrl: string): Promise<void> {
        this.nc = await connect({
            servers: [natsUrl],
            pingInterval: 100000,
            maxReconnectAttempts: -1,
            reconnect: true,
            reconnectTimeWait: 50000,
        })
        this.js = await this.nc.jetstream()
        this.jsManager = await this.nc.jetstreamManager()
        // lazy init
        setTimeout(this.initQueueContributors.bind(this), 1000)
    }

    initQueueContributors(): void {
        this.eventsQueueContributionsProvider.getContributions().forEach((next: EventsQueueContribution) => {
            next.initialize()
        })
    }

    async publish(key: string, message: string): Promise<void> {
        let delay = 500;
        for (let attempt = 0; attempt < 10; attempt++) {
            try {
                await this.js.publish(key, message);
                return;
            } catch (err) {
                if (attempt < 4) {
                    console.warn(`Publish failed, retrying in ${delay}ms...`, err);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    console.error('Failed to publish after retries', err);
                }
            }
        }
    }

    async subscribe(key: string, callback: (message: MessageEvent) => void, options: EventSubscriptionOptions): Promise<Disposable> {
        if (!this.emitters.has(key)) {
            this.emitters.set(key, new Emitter<MessageEvent>())
        }
        
        const streamName = key.replace(/\./g, '-')
        if (this.consumingStreams.has(streamName)) { // process is already listening to this stream
            const currentDisposable = this.emitters.get(key)?.event(callback)
            return {
                dispose: () => {
                    this.emitters.delete(key)
                    currentDisposable?.dispose()
                },
            }
        }
        try {
            const consumer = await this.js.consumers.get(streamName, options.consumerName)
            await this.consumeStream(key, streamName, consumer, options.workQueue, options.broadcast)
            if (consumer) {
                const currentDisposable = this.emitters.get(key)?.event(callback)
                return {
                    dispose: () => {
                        this.emitters.delete(key)
                        currentDisposable?.dispose()
                    },
                }
            }
        } catch (error) {
            // do nothing
        }
        try {
            let createStream = true
            try {
                const currentStreams = await this.jsManager.streams.list(key)
                let streamInfo: StreamInfo[] | undefined = undefined
                while ((streamInfo = await currentStreams.next())) {
                    if (streamInfo && streamInfo.length > 0) {
                        createStream = false
                        break
                    } else {
                        createStream = true
                        break
                    }
                }
            } catch (error) {
                // do nothing
            }

            if (createStream) {
                await this.jsManager.streams.add({
                    name: streamName,
                    subjects: [key],
                    retention: options.workQueue ? RetentionPolicy.Workqueue : RetentionPolicy.Limits,
                })
            }
            let createConsumer = true
            try {
                const consumer = await this.js.consumers.get(streamName, options.consumerName)
                if (consumer) {
                    createConsumer = false
                }
            } catch (error) {
                // do nothing
            }
            if (createConsumer) {
                const info = await this.jsManager.consumers.add(streamName, {
                    name: options.consumerName,
                    durable_name: options.consumerName,
                    filter_subject: key,
                    deliver_group: options.consumerName,
                    deliver_policy: options.workQueue ? DeliverPolicy.All : DeliverPolicy.LastPerSubject,
                    ack_policy: AckPolicy.Explicit,
                    ack_wait: (100000 * 10000) * ( options.ackWait || 30),
                    max_deliver: -1,
                })
                if (!info) {
                    throw new Error('Consumer not created')
                }
            }

            const consumer = await this.js.consumers.get(streamName, options.consumerName)

            await this.consumeStream(key, streamName, consumer, options.workQueue, options.broadcast)
        } catch (error) {
            console.log('error', error)
        }

        const currentDisposable = this.emitters.get(key)?.event(callback)
        return {
            dispose: () => {
                this.emitters.delete(key)
                currentDisposable?.dispose()
            },
        }
    }

    private async consumeStream(key: string, streamName: string, c: Consumer, workQueue: boolean, broadcast: boolean): Promise<void> {
        if (this.consumingStreams.has(streamName)) {
            return
        }
        
        const fetchMessages = async (consumer: Consumer, bcast: boolean) => {
            const sc = StringCodec()
            const messages = await consumer.fetch({ max_messages: 1 });
            for await (const m of messages) {
                const message = sc.decode(m.data)
                this.emitters.get(key)?.fire({
                    key,
                    message,
                    success: async () => {
                        m.ack()
                    },
                    error: async () => {
                        m.nak()
                    },
                })
                if (bcast) {
                    break
                }
            }
            
            fetchMessages(consumer, bcast)
        }
        fetchMessages(c, broadcast)
        this.consumingStreams.add(streamName)
    }

    close(): void {
        this.nc.close()
    }
}
