import { ContainerModule } from 'inversify'
import { StripePaymentApplication } from './core-application'
import { PrerenderCacheContribution } from '@authlance/core/lib/common/routes/routes'
import { PricingPrerenderCacheContribution } from './prerender/pricing-prerender-cache-contribution'

export default new ContainerModule((bind) => {
    bind(StripePaymentApplication).toSelf().inSingletonScope()
    bind(PricingPrerenderCacheContribution).toSelf().inSingletonScope()
    bind(PrerenderCacheContribution).toService(PricingPrerenderCacheContribution)
})
