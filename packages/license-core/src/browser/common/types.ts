import { injectable } from 'inversify'
import type { PaymentsQuery } from './licenses-sdk'

@injectable()
export class LicenseProductContext {

    private currentProductSlug: string | undefined

    setCurrentProductSlug(slug: string | undefined) {
        this.currentProductSlug = slug
    }

    getCurrentProductSlug(): string | undefined {
        return this.currentProductSlug
    }
}

export interface PaymentsReportState {
    scope: 'global' | 'group'
    query: PaymentsQuery
    groupName?: string
    exportHandler?: (() => Promise<void>) | null
    exporting?: boolean
}

@injectable()
export class PaymentsReportContext {
    private state: PaymentsReportState | undefined

    setState(state: PaymentsReportState | undefined) {
        this.state = state
    }

    clear() {
        this.state = undefined
    }

    getState(): PaymentsReportState | undefined {
        return this.state
    }

    getExportHandler(): (() => Promise<void>) | undefined {
        return this.state?.exportHandler ?? undefined
    }

    isExporting(): boolean {
        return Boolean(this.state?.exporting)
    }
}
