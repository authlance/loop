import { interfaces } from 'inversify'

export const ServiceProvider = Symbol('ServiceProvider')
export interface ServiceProvider {
    getService<T>(identifier: interfaces.ServiceIdentifier<T>): T | undefined
    getContribution<T extends object>(named: string | number | symbol): T | undefined
    getContributions<T extends object>(named: string | number | symbol): T[]
}
