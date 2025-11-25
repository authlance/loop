import { injectable } from 'inversify'
import { FrontendApplicationContribution } from '@authlance/core/lib/browser/frontend-contribution'

@injectable()
export class FrontendSideBarApplication implements FrontendApplicationContribution {
    constructor(
        
    ) {
        // such empty
    }

    initialize(): void {
        // NOOP
    }
}
