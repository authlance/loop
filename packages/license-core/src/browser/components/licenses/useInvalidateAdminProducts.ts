import { useCallback } from 'react'
import { type QueryClient } from '@tanstack/react-query'

export function useInvalidateAdminProducts(queryClient: QueryClient) {
    return useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: ['authlance', 'licenses', 'admin', 'products'] })
    }, [queryClient])
}
