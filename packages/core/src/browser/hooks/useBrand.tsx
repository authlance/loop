import { useMemo } from 'react'
import type { interfaces } from 'inversify'
import { useAppSelector } from '../store'
import { BASE_DASHBOARD_PATH, BRAND_ICON, BRAND_LOGO } from '../branding'

const useContainerValue = <T,>(token: interfaces.ServiceIdentifier<T>) => {
    const container = useAppSelector((state) => state.app.container)

    return useMemo(() => {
        if (!container) {
            return undefined
        }
        try {
            if ('isBound' in container && typeof container.isBound === 'function' && !container.isBound(token)) {
                return undefined
            }
            return container.get<T>(token)
        } catch (error) {
            return undefined
        }
    }, [container, token])
}

export const useBrandIcon = (): string | undefined => {
    return useContainerValue<string>(BRAND_ICON)
}

export const useBrandLogo = (): string | undefined => {
    return useContainerValue<string>(BRAND_LOGO)
}

export const useBaseDashboardPath = (): string | undefined => {
    return useContainerValue<string>(BASE_DASHBOARD_PATH)
}
