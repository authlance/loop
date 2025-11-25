import { RuntimeConfig, getRuntimeConfig } from '../runtime-config'

const normalizeValue = (value?: string | null): string | undefined => {
    if (!value) {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

const envBasePath = normalizeValue(process.env.REACT_APP_BASE_PATH);
const envBackendBasePath = normalizeValue(process.env.REACT_APP_BACKEND_BASE_PATH);

const getFromRuntimeConfig = (extract: (config: RuntimeConfig) => string | undefined): string | undefined => {
    const config = getRuntimeConfig();
    return normalizeValue(extract(config));
};

export const getBasePath = (): string => {
    return envBasePath
        ?? getFromRuntimeConfig(config => config.basePath)
        ?? '/';
};

export const getBackendBasePath = (): string => {
    return envBackendBasePath
        ?? getFromRuntimeConfig(config => config.backendBasePath)
        ?? '/';
};

export interface NavigateHandler {
    navigate(path: string, options?: any): void
}

export interface PathProvider {
    getCurrentPath(): string
}
