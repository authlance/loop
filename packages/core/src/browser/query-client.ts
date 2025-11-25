import { QueryClient } from '@tanstack/react-query'

export const createQueryClient = (): QueryClient => new QueryClient()

let queryClientRef: QueryClient | undefined

export const getOrCreateQueryClient = (): QueryClient => {
    if (!queryClientRef) {
        queryClientRef = createQueryClient()
    }
    return queryClientRef
}

export const setQueryClient = (client: QueryClient): void => {
    queryClientRef = client
}

