import { injectable, inject } from 'inversify'
import { EventsQueueServiceImpl } from './service/events-queue-service'
import { EventsQueueService } from '../common/types'
import { ApplicationConfigProvider, BackendApplicationContribution } from '@authlance/core/lib'
import express from 'express'

@injectable()
export class EventsQueueBackendService implements BackendApplicationContribution {
    constructor(
        @inject(EventsQueueService) protected readonly eventsQueue: EventsQueueServiceImpl,
        @inject(ApplicationConfigProvider) protected readonly appConfig: ApplicationConfigProvider,
    ) {
        // such empty
    }

    public initialize(): void {
        this.validateConfig()
        this.eventsQueue.initialize(this.appConfig.config.nats.url, this.appConfig.config.nats.prefix)
    }

    public onStop(app: express.Application): void {
        this.eventsQueue.close()
    }

    private validateConfig(): void {
        if (!this.appConfig.config.nats || !this.appConfig.config.nats.url) {
            console.error('NATS configuration is missing')
            process.exit(1)
            return
        }
    }
}
