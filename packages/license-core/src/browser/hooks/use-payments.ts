import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { PaymentsApi } from '../../common/authlance-licenses'
import { listPayments, type PaymentsPage, type PaymentsQuery } from '../common/licenses-sdk'

export const buildPaymentsQueryKey = (scope: string, query: PaymentsQuery) => [
    'authlance',
    'payments',
    scope,
    query.page ?? 1,
    query.pageSize ?? 25,
    query.name ?? null,
    query.organizationName ?? null,
    query.from ?? null,
    query.to ?? null,
]

export const usePaymentsReport = (
    paymentsApi: PaymentsApi | undefined,
    scope: string,
    query: PaymentsQuery
): UseQueryResult<PaymentsPage | undefined> => {
    return useQuery<PaymentsPage | undefined>({
        queryKey: buildPaymentsQueryKey(scope, query),
        enabled: Boolean(paymentsApi),
        keepPreviousData: true,
        staleTime: 60 * 1000,
        queryFn: async () => {
            if (!paymentsApi) {
                return undefined
            }
            return listPayments(paymentsApi, query)
        },
    })
}
