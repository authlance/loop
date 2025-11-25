import { ContainerModule } from 'inversify'
import { SequelizePrerenderCache } from './services/prerender-cache'
import { PrerenderCache } from '@authlance/core/lib/common/routes/routes'

export default new ContainerModule((bind) => {
    bind(SequelizePrerenderCache).toSelf().inSingletonScope()
    bind(PrerenderCache).toService(SequelizePrerenderCache)
})
