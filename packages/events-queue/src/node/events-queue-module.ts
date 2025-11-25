import { ContainerModule } from 'inversify'
import { BackendApplicationContribution, bindContributionProvider } from '@authlance/core/lib'
import { EventsQueueBackendService } from './events-queue-backend-application'
import { EventsQueueServiceImpl } from './service/events-queue-service'
import { EventsQueueContribution, EventsQueueService } from '../common/types'

export default new ContainerModule((bind) => {
    bind(EventsQueueBackendService).toSelf().inSingletonScope()
    bind(BackendApplicationContribution).toDynamicValue((ctx) => {
        const result = ctx.container.get(EventsQueueBackendService)
        return result
    })
    bind(EventsQueueServiceImpl)
        .toSelf()
        .inSingletonScope()
    bind(EventsQueueService).to(EventsQueueServiceImpl).inSingletonScope()
    bindContributionProvider(bind, EventsQueueContribution)
})
