import { injectable } from 'inversify'
import type { FrontendApplication } from './frontend-application'
import { MaybePromise } from '../common'

export const FrontendApplicationContribution = Symbol('FrontendApplicationContribution')

export interface FrontendApplicationContribution {
    initialize?(): void
    configure?(app: FrontendApplication): MaybePromise<void>
    onStart?(app: FrontendApplication): MaybePromise<void>
    onWillStop?(app: FrontendApplication): boolean | void
    onStop?(app: FrontendApplication): void
    initializeLayout?(app: FrontendApplication): MaybePromise<void>
    onDidInitializeLayout?(app: FrontendApplication): MaybePromise<void>
}

@injectable()
export abstract class DefaultFrontendApplicationContribution implements FrontendApplicationContribution {
    initialize(): void {
        // NOOP
    }
}
