import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { Badge } from '@authlance/ui/lib/browser/components/badge'
import { Switch } from '@authlance/ui/lib/browser/components/switch'
import { Label } from '@authlance/ui/lib/browser/components/label'
import { Skeleton } from '@authlance/ui/lib/browser/components/skeleton'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@authlance/ui/lib/browser/components/pagination'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@authlance/ui/lib/browser/components/dropdown-menu'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { Loader2, MoreHorizontal } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import {
    describeProductType,
    describePricingMode,
    formatCurrencyAmount,
    formatLicensePrice,
    isOneOffProduct,
    isSubscriptionProduct,
    isTieredPricing,
    useLicensesSdk,
    type LicenseAdminProduct,
} from '../../common/licenses-sdk'
import { useAdminProducts, useAdminSeatUsage } from '../../hooks/use-licenses'
import type { InternalHttpControllerSeatUsageResponse } from '../../../common/authlance-licenses'
import { LicensesDataTable } from './LicensesDataTable'
import { formatDateTime } from './date-utils'
import { RECURRING_INTERVALS } from './constants'

interface ProductRow {
    id: string
    product: LicenseAdminProduct
}

const ProductSummaryCard: React.FC<{ title: string; value: number; helper?: string }> = ({ title, value, helper }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-semibold">{value}</div>
            {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
        </CardContent>
    </Card>
)

const SeatUsageCard: React.FC<{
    usage?: InternalHttpControllerSeatUsageResponse
    loading: boolean
    error?: Error
}> = ({ usage, loading, error }) => {
    const seatLimit = typeof usage?.seatLimit === 'number' ? usage.seatLimit : undefined
    const activeConfigManaged = usage?.activeConfigManaged ?? 0
    const activeCustom = usage?.activeCustom ?? 0
    const activeTotal = usage?.activeTotal ?? activeConfigManaged + activeCustom
    const availableSeats =
        typeof usage?.availableSeats === 'number'
            ? usage.availableSeats
            : seatLimit != null
            ? Math.max(seatLimit - activeTotal, 0)
            : undefined
    const helper = (() => {
        if (loading) {
            return 'Loading seat usage…'
        }
        if (error) {
            return 'Seat usage unavailable.'
        }
        if (seatLimit == null) {
            return 'Unlimited seats'
        }
        return `${activeTotal} used · ${availableSeats ?? 0} available`
    })()
    const warning = seatLimit != null && (availableSeats ?? 0) === 0

    return (
        <Card className={warning ? 'border-destructive/60' : undefined}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Seat usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-2xl font-semibold">
                    {loading ? <Skeleton className="h-8 w-24" /> : seatLimit != null ? seatLimit : 'Unlimited'}
                </div>
                <div className="text-xs text-muted-foreground">{helper}</div>
                {seatLimit != null && (
                    <div className="text-xs text-muted-foreground">
                        Config-managed: {activeConfigManaged} · Custom: {activeCustom}
                    </div>
                )}
                {warning && (
                    <div className="text-xs font-semibold text-destructive">
                        Seat limit reached. Deactivate products or contact support to raise the cap.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const formatBillingSchedule = (product: LicenseAdminProduct) => {
    const interval = product.billingInterval?.trim()
    if (!interval) {
        return '—'
    }
    const normalized = interval.toLowerCase()
    if (!RECURRING_INTERVALS.has(normalized)) {
        return interval.charAt(0).toUpperCase() + interval.slice(1)
    }
    const count =
        typeof product.billingIntervalCount === 'number' && product.billingIntervalCount > 0
            ? product.billingIntervalCount
            : 1
    if (count === 1) {
        return `Every ${normalized}`
    }
    return `Every ${count} ${normalized}${count > 1 ? 's' : ''}`
}

const summarizeProducts = (products: LicenseAdminProduct[]) => {
    let active = 0
    let inactive = 0
    let subscription = 0
    let oneOff = 0
    let tiered = 0
    for (const product of products) {
        if (product.active) {
            active += 1
        } else {
            inactive += 1
        }
        if (isSubscriptionProduct(product)) {
            subscription += 1
        } else if (isOneOffProduct(product)) {
            oneOff += 1
        }
        if (isTieredPricing(product)) {
            tiered += 1
        }
    }
    const total = products.length
    const fixed = total - tiered
    return { total, active, inactive, subscription, oneOff, tiered, fixed }
}

const DEFAULT_PAGE_SIZE = 10

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

const parseBooleanParam = (value: string | null | undefined): boolean => {
    if (!value) {
        return false
    }
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1'
}

const buildSearchQuery = (pageSize: number, includeInactive: boolean) => {
    const params = new URLSearchParams()
    if (pageSize !== DEFAULT_PAGE_SIZE) {
        params.set('pageSize', String(pageSize))
    }
    if (includeInactive) {
        params.set('includeInactive', 'true')
    }
    const query = params.toString()
    return query ? `?${query}` : ''
}

export const ProductsAdminContent: React.FC = () => {
    const navigate = useNavigate()
    const { page: pageParam } = useParams<{ page?: string }>()
    const [searchParams] = useSearchParams()
    const { adminApi } = useLicensesSdk()
    const { toast } = useToast()
    const { isSysAdmin } = useContext(SessionContext)

    const includeInternal = isSysAdmin

    const pageSizeParam = parsePositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE)
    const includeInactive = parseBooleanParam(searchParams.get('includeInactive'))
    const currentPage = parsePositiveInt(pageParam, 1)

    const { data, isLoading, isFetching, error, refetch } = useAdminProducts(adminApi, {
        includeInactive,
        includeInternal,
        page: currentPage,
        pageSize: pageSizeParam,
    })
    const {
        data: seatUsage,
        isLoading: seatUsageLoading,
        error: rawSeatUsageError,
    } = useAdminSeatUsage(adminApi)
    const seatUsageError = rawSeatUsageError instanceof Error ? rawSeatUsageError : undefined

    const handlePageChange = useCallback(
        (nextPage: number) => {
            const normalized = nextPage > 0 ? nextPage : 1
            const basePath = '/licenses/admin/products'
            const search = buildSearchQuery(pageSizeParam, includeInactive)
            const target = normalized > 1 ? `${basePath}/page/${normalized}` : basePath
            navigate(`${target}${search}`, { replace: false })
        },
        [includeInactive, navigate, pageSizeParam]
    )

    const handleIncludeInactiveChange = useCallback(
        (checked: boolean) => {
            const nextInclude = Boolean(checked)
            const basePath = '/licenses/admin/products'
            const search = buildSearchQuery(pageSizeParam, nextInclude)
            navigate(`${basePath}${search}`, { replace: false })
        },
        [navigate, pageSizeParam]
    )

    useEffect(() => {
        if (!error) {
            return
        }
        const message = error instanceof Error ? error.message : 'Unable to load products right now.'
        toast({
            title: 'Failed to load products',
            description: message,
            variant: 'destructive',
        })
    }, [error, toast])

    if (!isSysAdmin) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Access restricted</CardTitle>
                        <CardDescription>Only system administrators can manage licensing products.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => navigate('/licenses/group')}>
                            Back to licenses
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (!adminApi) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Operator unavailable</CardTitle>
                        <CardDescription>Authentication details missing for the license operator API.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    const products = data?.items ?? []
    const summary = useMemo(() => {
        const computed = summarizeProducts(products)
        return {
            ...computed,
            total: data?.total ?? computed.total,
        }
    }, [data?.total, products])

    const productRows = useMemo<ProductRow[]>(
        () =>
            products.map((product, index) => ({
                id: product.slug || `product-${index}`,
                product,
            })),
        [products]
    )

    const total = data?.total ?? 0
    const pageSize = data?.pageSize && data.pageSize > 0 ? data.pageSize : pageSizeParam
    const current = data?.page && data.page > 0 ? data.page : currentPage
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const renderPagination = totalPages > 1 || (total > 0 && productRows.length === 0)
    const hasResults = productRows.length > 0
    const rangeStart = hasResults ? (current - 1) * pageSize + 1 : 0
    const rangeEnd = hasResults ? rangeStart + productRows.length - 1 : 0
    const resultsSummary = hasResults
        ? `Showing ${rangeStart}-${rangeEnd} of ${total} products`
        : total === 0
        ? includeInactive
            ? 'No products found.'
            : 'No active products are configured yet.'
        : 'No results for the selected page.'

    const productColumns = useMemo<ColumnDef<ProductRow>[]>(
        () => [
            {
                id: 'name',
                header: 'Product',
                cell: ({ row }) => {
                    const product = row.original.product
                    const bundles = Array.isArray(product.bundledProducts) ? product.bundledProducts : []
                    return (
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-foreground">{product.name}</span>
                                {product.plan && (
                                    <Badge variant="outline" className="uppercase tracking-wide text-xs">
                                        {product.plan}
                                    </Badge>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">Slug: {product.slug || '—'}</span>
                            {product.productKey && (
                                <span className="text-xs text-muted-foreground">Key: {product.productKey}</span>
                            )}
                            {bundles.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {bundles.map((bundle, index) => (
                                        <Badge key={`${product.slug}-bundle-${index}`} variant="outline">
                                            {bundle.quantity ?? 1}× {bundle.productKey || bundle.productSlug || 'Unknown'}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                },
            },
            {
                id: 'type',
                header: 'Type',
                cell: ({ row }) => <Badge variant="secondary">{describeProductType(row.original.product)}</Badge>,
            },
            {
                id: 'pricingMode',
                header: 'Pricing',
                cell: ({ row }) => {
                    const product = row.original.product
                    const modeLabel = describePricingMode(product)
                    if (isTieredPricing(product)) {
                        const tierCount = Array.isArray(product.pricingTiers) ? product.pricingTiers.length : 0
                        const baseAmount = formatCurrencyAmount(product.currency, product.baseAmount)
                        const maxManaged =
                            typeof product.maxManagedProducts === 'number' && product.maxManagedProducts > 0
                                ? product.maxManagedProducts
                                : undefined
                        return (
                            <div className="flex flex-col gap-1">
                                <Badge variant="secondary">{modeLabel}</Badge>
                                {(tierCount > 0 || baseAmount) && (
                                    <span className="text-xs text-muted-foreground">
                                        {tierCount > 0 ? `Tiers: ${tierCount}` : 'Tiered pricing'}
                                        {baseAmount ? ` - Base ${baseAmount}` : ''}
                                    </span>
                                )}
                                {maxManaged && (
                                    <span className="text-xs text-muted-foreground">Max managed: {maxManaged}</span>
                                )}
                            </div>
                        )
                    }
                    return (
                        <div className="flex flex-col gap-1">
                            <Badge variant="secondary">{modeLabel}</Badge>
                        </div>
                    )
                },
            },
            {
                id: 'price',
                header: 'Price',
                cell: ({ row }) => {
                    const price = formatLicensePrice(row.original.product)
                    return <span className="text-sm font-medium">{price ?? '—'}</span>
                },
            },
            {
                id: 'billing',
                header: 'Billing',
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">{formatBillingSchedule(row.original.product)}</span>
                ),
            },
            {
                id: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const product = row.original.product
                    return (
                        <div className="flex flex-wrap items-center gap-1">
                            <Badge variant={product.active ? 'default' : 'secondary'}>
                                {product.active ? 'Active' : 'Inactive'}
                            </Badge>
                            {product.configManaged && <Badge variant="outline">Config managed</Badge>}
                            {product.internal && <Badge variant="outline">Internal</Badge>}
                        </div>
                    )
                },
            },
            {
                id: 'updated',
                header: 'Updated',
                cell: ({ row }) => (
                    <span className="text-xs text-muted-foreground">
                        {formatDateTime(row.original.product.updatedAt)}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }) => {
                    const product = row.original.product
                    const slug = product.slug
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Manage</DropdownMenuLabel>
                                <DropdownMenuItem
                                    disabled={!slug}
                                    onSelect={(event) => {
                                        event.preventDefault()
                                        if (!slug) {
                                            return
                                        }
                                        navigate(`/licenses/admin/products/${slug}/edit`)
                                    }}
                                >
                                    Edit product
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    disabled={!slug}
                                    onSelect={(event) => {
                                        event.preventDefault()
                                        if (!slug) {
                                            return
                                        }
                                        navigate(`/licenses/admin/products/${slug}/coupons`)
                                    }}
                                >
                                    Manage coupons
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onSelect={(event) => {
                                        event.preventDefault()
                                        if (!slug) {
                                            return
                                        }
                                        navigator.clipboard?.writeText(slug).catch(() => {})
                                    }}
                                >
                                    Copy slug
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                },
            },
        ],
        [navigate]
    )

    if (isLoading && !data) {
        return <DefaultDashboardContent loading />
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Manage Authlance licensing products and their Stripe configuration.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2"></div>
            </div>

            {isFetching && !isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing latest configuration…
                </div>
            )}

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-24 rounded-lg" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <ProductSummaryCard title="Products" value={summary.total} helper={`${summary.active} active`} />
                    <ProductSummaryCard title="Active" value={summary.active} helper={`${summary.inactive} inactive`} />
                    <ProductSummaryCard title="Tiered" value={summary.tiered} helper={`${summary.fixed} fixed`} />
                    <ProductSummaryCard title="Subscription" value={summary.subscription} helper={`${summary.oneOff} one-off`} />
                    <SeatUsageCard usage={seatUsage} loading={seatUsageLoading} error={seatUsageError} />
                </div>
            )}

            <div className="flex items-center gap-2">
                <Switch
                    id="toggle-inactive-products"
                    checked={includeInactive}
                    onCheckedChange={(checked) => handleIncludeInactiveChange(Boolean(checked))}
                />
                <Label htmlFor="toggle-inactive-products" className="text-sm text-muted-foreground">
                    Show inactive products
                </Label>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Configured products</CardTitle>
                        <CardDescription>Includes pricing metadata and coupon allocations.</CardDescription>
                        <p className="text-xs text-muted-foreground">{resultsSummary}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <LicensesDataTable columns={productColumns} data={productRows} emptyMessage={resultsSummary} />
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
                                            <PaginationItem key={`products-page-${pageNumber}`}>
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
                                            <PaginationItem key={`products-ellipsis-${pageNumber}`}>
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
