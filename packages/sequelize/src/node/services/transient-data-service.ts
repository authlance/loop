import { injectable, inject } from 'inversify'
import { TransientData } from "../model/transient-data-model"
import { TransientDataRepository } from '../model/transient-repository'

export interface TransientDataAttributes {
    key: string
    value: string
}

export const TransientDataService = Symbol('TransientDataService')

export interface TransientDataService {
    getAllDataEntries(): Promise<TransientDataAttributes[]>
    setTransientValue(key: string, value: string): Promise<void>
    getTransientDataEntry(key: string): Promise<TransientData | null>
    getTransientValue(key: string): Promise<string | null>
}

@injectable()
export class TransientDataServiceImpl implements TransientDataService {

    constructor(
        @inject(TransientDataRepository) protected readonly transientDataRepository: TransientDataRepository
    ) { }

    getTransientDataEntry(key: string): Promise<TransientData | null> {
        return this.transientDataRepository.getTransientDataEntry(key)
    }

    getAllDataEntries(): Promise<TransientDataAttributes[]> {
        return this.transientDataRepository.getAllEntries()
    }

    async setTransientValue(key: string, value: string): Promise<void> {
        await this.transientDataRepository.upsertTransientData(key, value)
    }

    async getTransientValue(key: string): Promise<string | null> {
        const data = await this.transientDataRepository.getTransientDataEntry(key)
        return data ? data.value : null
    }
}

