import {
    BackendApplicationContribution,
    RawBackendApplicationContribution
} from '@authlance/core/lib'
import { injectable } from 'inversify'
import express from 'express'

@injectable()
export class StripePaymentApplication implements BackendApplicationContribution, RawBackendApplicationContribution {
    constructor(

    ) {
        // such empty
    }

    public configureRaw(app: express.Application): void {
        // no-op
    }

    public configure(app: express.Application): void {
        // no-op
    }
}
