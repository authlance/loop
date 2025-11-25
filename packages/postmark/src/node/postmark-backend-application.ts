import { injectable } from 'inversify'
import { BackendApplicationContribution } from '@authlance/core/lib'
import express from 'express'

@injectable()
export class PostMarkBackendApplication implements BackendApplicationContribution {
    
    constructor(
        
    ) {
        // such empty
    }

    public configure(app: express.Application): void {
        // TODO
    }
}
