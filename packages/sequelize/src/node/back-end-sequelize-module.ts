import { ContainerModule } from 'inversify'
import { DataModelsManager, ModelServiceContribution, SequelizeModelContribution } from './data-models-manager'
import {
    bindContributionProvider,
    LoopSequelize,
    BackendApplicationContribution
} from '@authlance/core/lib'
import { TransientDataRepository } from './model/transient-repository'
import { TransientDataService, TransientDataServiceImpl } from './services/transient-data-service'
import { TransientDataModelContribution } from './model/transient-data-model'

export default new ContainerModule((bind) => {
    bind(DataModelsManager).toSelf().inSingletonScope()

    bind(BackendApplicationContribution).toDynamicValue((ctx) => {
        const result = ctx.container.get(DataModelsManager)
        result.initialize()
        if (!ctx.container.isBound(LoopSequelize)) {
            ctx.container.bind(LoopSequelize).toConstantValue(result.sequelize)
        }
        return result
    })

    bindContributionProvider(bind, SequelizeModelContribution)
    bindContributionProvider(bind, ModelServiceContribution)

    bind(TransientDataModelContribution).toSelf()
    bind(SequelizeModelContribution).toDynamicValue((ctx) => ctx.container.get(TransientDataModelContribution))

    bind(TransientDataRepository).toSelf().inSingletonScope()
    bind(TransientDataServiceImpl).toSelf().inSingletonScope()
    bind(TransientDataService).toService(TransientDataServiceImpl)
})
