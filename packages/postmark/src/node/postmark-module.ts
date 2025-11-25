import { ContainerModule } from 'inversify'
import { AccountControllerImpl } from './controllers/account-controller'
import { AccountController } from '@authlance/common/lib/node/controller/account-controller'
import { EmailController } from '@authlance/common/lib/node/controller/email-controller'
import { EmailControllerImpl } from './controllers/email-controller'
import { PostMarkBackendApplication } from './postmark-backend-application'
import { BackendApplicationContribution } from '@authlance/core/lib'
import { MailsService } from './services/mail-service'
import { EventsQueueContribution } from '@authlance/events-queue/lib/common/types'

export default new ContainerModule((bind) => {
    bind(PostMarkBackendApplication).toSelf().inSingletonScope()
    bind(BackendApplicationContribution).toDynamicValue((ctx) => {
        const result = ctx.container.get(PostMarkBackendApplication)
        return result
    })
    bind(AccountControllerImpl).toSelf().inSingletonScope()
    bind(AccountController).to(AccountControllerImpl).inSingletonScope()
    bind(EmailControllerImpl).toSelf().inSingletonScope()
    bind(EmailController).to(EmailControllerImpl).inSingletonScope()

    bind(MailsService).toSelf().inSingletonScope()
    
    bind(EventsQueueContribution).toDynamicValue((ctx) => {
        const result = ctx.container.get(MailsService)
        return result
    })

    bind(EventsQueueContribution).toDynamicValue((ctx) => {
        const result = ctx.container.get(AccountControllerImpl)
        return result
    })
})
