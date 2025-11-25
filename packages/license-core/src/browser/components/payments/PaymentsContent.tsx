import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@authlance/ui/lib/browser/components/card'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { Label } from '@authlance/ui/lib/browser/components/label'
import { Input } from '@authlance/ui/lib/browser/components/input'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@authlance/ui/lib/browser/components/pagination'
import { Loader2, RefreshCw } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import {
    exportPaymentsReport,
    formatCurrencyAmount,
    toLicenseOperatorError,
    type PaymentRecord,
    type PaymentsQuery,
    useLicensesSdk,
} from '../../common/licenses-sdk'
import { usePaymentsReport } from '../../hooks/use-payments'
import { LicensesDataTable } from '../licenses/LicensesDataTable'
import { formatDateTime } from '../licenses/date-utils'
import { usePaymentsReportContext } from '../../hooks/usePaymentsReportContext'

const DEFAULT_PAGE_SIZE = 25

const sanitizeFileSegment = (value: string | undefined) => {
    if (!value) {
        return ''
    }
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

const buildReportFileName = (scope: 'global' | 'group', groupName?: string) => {
    const date = new Date().toISOString().slice(0, 10)
    const segment = scope === 'group' && groupName ? `group-${sanitizeFileSegment(groupName)}-` : ''
    return `payments-${segment}${date}.csv`
}

const parsePositiveInt = (value: string | null | undefined, fallback: number): number => {
    if (!value) {
        return fallback
    }
    const parsed = Number.parseInt(value, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback
    }
    return parsed
}

const sanitizeFilterValue = (value: string): string => value.trim()

const buildSearchQuery = (filters: { name?: string; from?: string; to?: string }, pageSize: number) => {
    const params = new URLSearchParams()
    if (filters.name) {
        params.set('name', filters.name)
    }
    if (filters.from) {
        params.set('from', filters.from)
    }
    if (filters.to) {
        params.set('to', filters.to)
    }
    if (pageSize !== DEFAULT_PAGE_SIZE) {
        params.set('pageSize', String(pageSize))
    }
    const query = params.toString()
    return query ? `?${query}` : ''
}

interface PaymentsContentProps {
    scope: 'global' | 'group'
}

interface PaymentRow {
    id: string
    record: PaymentRecord
}

const usePaymentsColumns = (): ColumnDef<PaymentRow>[] => {
    return useMemo<ColumnDef<PaymentRow>[]>(
        () => [
            {
                id: 'paidAt',
                header: 'Paid at',
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">{formatDateTime(row.original.record.paidAt)}</span>
                ),
            },
            {
                id: 'customer',
                header: 'Customer',
                cell: ({ row }) => {
                    const first = row.original.record.customerFirstName?.trim() ?? ''
                    const last = row.original.record.customerLastName?.trim() ?? ''
                    const display = [first, last].filter(Boolean).join(' ')
                    return display ? (
                        <span className="text-sm font-medium text-foreground">{display}</span>
                    ) : (
                        <span className="text-sm text-muted-foreground">Unknown</span>
                    )
                },
            },
            {
                id: 'email',
                header: 'Email',
                cell: ({ row }) => {
                    const email = row.original.record.customerEmail?.trim()
                    return email ? (
                        <span className="text-sm text-muted-foreground">{email}</span>
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    )
                },
            },
            {
                id: 'organization',
                header: 'Organization',
                cell: ({ row }) => {
                    const organization = row.original.record.organizationName?.trim()
                    return organization ? (
                        <span className="text-sm text-foreground">{organization}</span>
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    )
                },
            },
            {
                id: 'amount',
                header: 'Amount',
                cell: ({ row }) => {
                    const { currency, amountTotal } = row.original.record
                    const formatted = formatCurrencyAmount(currency, amountTotal)
                    return formatted ? (
                        <span className="text-sm font-medium text-foreground">{formatted}</span>
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    )
                },
            },
            {
                id: 'invoice',
                header: 'Invoice',
                cell: ({ row }) => {
                    const invoice = row.original.record.invoiceId?.trim()
                    return invoice ? (
                        <span className="font-mono text-xs text-muted-foreground">{invoice}</span>
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    )
                },
                size: 64,
            },
        ],
        []
    )
}

export const PaymentsContent: React.FC<PaymentsContentProps> = ({ scope }) => {
    const navigate = useNavigate()
    const { page: pageParam, groupName } = useParams<{ page?: string; groupName?: string }>()
    const [searchParams] = useSearchParams()
    const { paymentsApi } = useLicensesSdk()
    const { isSysAdmin } = useContext(SessionContext)
    const { toast } = useToast()
    const reportContext = usePaymentsReportContext()

    const pageSizeParam = parsePositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE)
    const activeName = searchParams.get('name')?.trim() ?? ''
    const activeFrom = searchParams.get('from')?.trim() ?? ''
    const activeTo = searchParams.get('to')?.trim() ?? ''

    const [formState, setFormState] = useState({
        name: activeName,
        from: activeFrom,
        to: activeTo,
    })
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        setFormState({
            name: activeName,
            from: activeFrom,
            to: activeTo,
        })
    }, [activeName, activeFrom, activeTo])

    const parsedPageParam = parsePositiveInt(pageParam, 1)
    const currentPage = parsedPageParam
    const resolvedGroupName = scope === 'group' ? groupName ?? '' : undefined

    const activeFilters = useMemo(
        () => ({
            name: activeName || undefined,
            from: activeFrom || undefined,
            to: activeTo || undefined,
        }),
        [activeName, activeFrom, activeTo]
    )

    const query = useMemo<PaymentsQuery>(
        () => ({
            ...activeFilters,
            organizationName: resolvedGroupName,
            page: currentPage,
            pageSize: pageSizeParam,
        }),
        [activeFilters, resolvedGroupName, currentPage, pageSizeParam]
    )

    const scopeKey = scope === 'group' ? `group:${resolvedGroupName ?? 'unknown'}` : 'global'

    const { data, isLoading, isFetching, error, refetch } = usePaymentsReport(paymentsApi, scopeKey, query)

    const exportHandler = useCallback(async () => {
        if (!paymentsApi) {
            toast({
                title: 'Payments unavailable',
                description: 'Authentication is required to export payments.',
                variant: 'destructive',
            })
            return
        }
        if (isExporting) {
            return
        }
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            toast({
                title: 'Unsupported context',
                description: 'Exports are only available in a browser environment.',
                variant: 'destructive',
            })
            return
        }

        setIsExporting(true)

        try {
            const { blob, fileName } = await exportPaymentsReport(paymentsApi, query)
            const downloadName = fileName && fileName.trim() !== '' ? fileName.trim() : buildReportFileName(scope, resolvedGroupName)
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = downloadName
            link.rel = 'noopener noreferrer'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast({
                title: 'Export ready',
                description: `Downloading ${downloadName}`,
            })
        } catch (error) {
            const normalized = toLicenseOperatorError(error, 'Failed to export payments report.')
            toast({ title: 'Export failed', description: normalized.message, variant: 'destructive' })
        } finally {
            setIsExporting(false)
        }
    }, [paymentsApi, query, toast, scope, resolvedGroupName, isExporting])

    useEffect(() => {
        if (!paymentsApi) {
            reportContext.setState(undefined)
            return () => {
                reportContext.clear()
            }
        }

        reportContext.setState({
            scope,
            groupName: resolvedGroupName,
            query,
            exportHandler,
            exporting: isExporting,
        })

        return () => {
            reportContext.clear()
        }
    }, [reportContext, paymentsApi, scope, resolvedGroupName, query, exportHandler, isExporting])

    useEffect(() => {
        if (!error) {
            return
        }
        const description = error instanceof Error ? error.message : 'Unable to load payments right now.'
        toast({
            title: 'Failed to load payments',
            description,
            variant: 'destructive',
        })
    }, [error, toast])

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const trimmedName = sanitizeFilterValue(formState.name)
            const filters = {
                name: trimmedName ? trimmedName : undefined,
                from: formState.from || undefined,
                to: formState.to || undefined,
            }
            const basePath = resolvedGroupName ? `/license/payments/groups/${resolvedGroupName}` : '/license/payments'
            const search = buildSearchQuery(filters, pageSizeParam)
            navigate(`${basePath}${search}`, { replace: false })
        },
        [formState.name, formState.from, formState.to, navigate, resolvedGroupName, pageSizeParam]
    )

    const handleReset = useCallback(() => {
        setFormState({ name: '', from: '', to: '' })
        const basePath = resolvedGroupName ? `/license/payments/groups/${resolvedGroupName}` : '/license/payments'
        navigate(basePath, { replace: false })
    }, [navigate, resolvedGroupName])

    const handlePageChange = useCallback(
        (nextPage: number) => {
            const normalized = nextPage > 0 ? nextPage : 1
            const filters = {
                name: activeFilters.name,
                from: activeFilters.from,
                to: activeFilters.to,
            }
            const basePath = resolvedGroupName ? `/license/payments/groups/${resolvedGroupName}` : '/license/payments'
            const search = buildSearchQuery(filters, pageSizeParam)
            const target = normalized > 1 ? `${basePath}/page/${normalized}` : basePath
            navigate(`${target}${search}`, { replace: false })
        },
        [activeFilters, navigate, resolvedGroupName, pageSizeParam]
    )

    const columns = usePaymentsColumns()

    const rows = useMemo<PaymentRow[]>(() => {
        const items = data?.items ?? []
        return items.map((record, index) => ({
            id:
                record.paymentIntentId?.trim() ||
                record.invoiceId?.trim() ||
                `payment-${record.organizationName ?? 'row'}-${index}`,
            record,
        }))
    }, [data?.items])

    const total = data?.total ?? 0
    const pageSize = data?.pageSize ?? pageSizeParam
    const current = data?.page ?? currentPage
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const renderPagination = totalPages > 1

    const rangeStart = rows.length > 0 ? (current - 1) * pageSize + 1 : 0
    const rangeEnd = rows.length > 0 ? rangeStart + rows.length - 1 : 0

    if (!paymentsApi) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Payments unavailable</CardTitle>
                        <CardDescription>Authentication is required to access the payments service.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (!isSysAdmin) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Access restricted</CardTitle>
                        <CardDescription>Only system administrators can view payments.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (scope === 'group' && !resolvedGroupName) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Group not found</CardTitle>
                        <CardDescription>The requested group is not available.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <Card>
                <CardHeader>
                    <CardTitle>{scope === 'group' ? `Payments for ${resolvedGroupName}` : 'All Payments'}</CardTitle>
                    <CardDescription>
                        Filter captured payments by customer name and billing dates. Use the pagination controls to
                        navigate the full history.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="customer-name">Name or last name</Label>
                                <Input
                                    id="customer-name"
                                    placeholder="Search by customer name"
                                    value={formState.name}
                                    onChange={(event) =>
                                        setFormState((prev) => ({ ...prev, name: event.target.value }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="from-date">From</Label>
                                <Input
                                    id="from-date"
                                    type="date"
                                    value={formState.from}
                                    onChange={(event) =>
                                        setFormState((prev) => ({ ...prev, from: event.target.value }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="to-date">To</Label>
                                <Input
                                    id="to-date"
                                    type="date"
                                    value={formState.to}
                                    onChange={(event) => setFormState((prev) => ({ ...prev, to: event.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleReset}>
                                Clear
                            </Button>
                            <Button type="submit">Apply filters</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>
                            {total > 0
                                ? `Showing ${rangeStart}-${rangeEnd} of ${total} payments`
                                : 'No payments match the selected filters.'}
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                        {isFetching ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <LicensesDataTable
                            columns={columns}
                            data={rows}
                            emptyMessage={total === 0 ? 'No payments found yet.' : 'No results for the selected page.'}
                        />
                    )}
                </CardContent>
                {renderPagination && (
                    <CardFooter>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        aria-disabled={current <= 1}
                                        className={current <= 1 ? 'pointer-events-none opacity-50' : undefined}
                                        onClick={() => current > 1 && handlePageChange(current - 1)}
                                    />
                                </PaginationItem>
                                {Array.from({ length: totalPages }).map((_, index) => {
                                    const pageNumber = index + 1
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === totalPages ||
                                        Math.abs(pageNumber - current) <= 1
                                    ) {
                                        return (
                                            <PaginationItem key={`payment-page-${pageNumber}`}>
                                                <PaginationLink
                                                    isActive={pageNumber === current}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    }
                                    if (Math.abs(pageNumber - current) === 2) {
                                        return (
                                            <PaginationItem key={`payments-ellipsis-${pageNumber}`}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        )
                                    }
                                    return null
                                })}
                                <PaginationItem>
                                    <PaginationNext
                                        aria-disabled={current >= totalPages}
                                        className={current >= totalPages ? 'pointer-events-none opacity-50' : undefined}
                                        onClick={() => current < totalPages && handlePageChange(current + 1)}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
