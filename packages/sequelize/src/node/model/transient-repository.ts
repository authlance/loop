import { injectable } from 'inversify'
import { TransientData } from "./transient-data-model"

export const RegionRepositoryService = Symbol('RegionRepository')

@injectable()
export class TransientDataRepository {
    async upsertTransientData(key: string, value: string): Promise<TransientData | null> {
        await TransientData.upsert({
            key,
            value,
        })
        const dataEntry = await this.getTransientDataEntry(key)
        return dataEntry
    }
    async getTransientDataEntry(key: string): Promise<TransientData | null> {
        return TransientData.findOne({
            where: {
                key: key,
            },
        })
    }
    async getAllEntries(): Promise<TransientData[]> {
        return TransientData.findAll()
    }
}
