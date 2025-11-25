import { ContainerModule } from 'inversify'
import { StripePaymentApplication } from './payments-application'

export default new ContainerModule((bind) => {
    bind(StripePaymentApplication).toSelf().inSingletonScope()
})
