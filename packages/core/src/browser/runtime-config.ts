export interface RuntimeConfig {
    basePath?: string
    backendBasePath?: string
    googleAnalyticsMeasurementId?: string
    homeUrl?: string
}

let runtimeConfig: RuntimeConfig = {}

export const setRuntimeConfig = (config: RuntimeConfig): void => {
    runtimeConfig = {
        ...runtimeConfig,
        ...config,
    }
}

export const getRuntimeConfig = (): RuntimeConfig => runtimeConfig
