import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@authlance/ui/lib/browser/components/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@authlance/ui/lib/browser/components/dropdown-menu'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@authlance/ui/lib/browser/components/pagination'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
    deleteAdminProductCoupon,
    listAdminProductCoupons,
    toLicenseOperatorError,
    useLicensesSdk,
    type LicenseAdminCoupon,
    type LicenseAdminCouponList,
} from '../../common/licenses-sdk'
import { useAdminProducts } from '../../hooks/use-licenses'
import { useInvalidateAdminProducts } from './useInvalidateAdminProducts'
import { formatDateTime } from './date-utils'
import { useLicenseProductContext } from '../../hooks/useProductContext'

type CouponBehaviorValue = 'product_override' | 'stripe_promotion'

const COUPON_BEHAVIOR_LABELS: Record<CouponBehaviorValue, string> = {
    product_override: 'Product override',
    stripe_promotion: 'Stripe promotion',
}

const COUPON_BEHAVIOR_SUMMARY: Record<CouponBehaviorValue, string> = {
    product_override: "Switch checkout to the product's one-off price.",
    stripe_promotion: 'Forward coupon to Stripe as a promotion code.',
}

const normalizeCouponBehavior = (behavior?: string): CouponBehaviorValue => {
    const normalized = typeof behavior === 'string' ? behavior.toLowerCase() : ''
    return normalized === 'stripe_promotion' ? 'stripe_promotion' : 'product_override'
}

const ZERO_DECIMAL_CURRENCIES = new Set([
    'BIF',
    'CLP',
    'DJF',
    'GNF',
    'JPY',
    'KMF',
    'KRW',
    'MGA',
    'PYG',
    'RWF',
    'UGX',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF',
])

const formatStripeAmountOff = (amount?: number, currency?: string): string | undefined => {
    if (amount == null || !Number.isFinite(amount) || amount <= 0) {
        return undefined
    }
    if (!currency) {
        return `${amount} off`
    }
    const normalizedCurrency = currency.toUpperCase()
    const zeroDecimal = ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)
    const divisor = zeroDecimal ? 1 : 100
    const unitAmount = amount / divisor
    try {
        const formatter = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: normalizedCurrency,
            maximumFractionDigits: zeroDecimal ? 0 : 2,
        })
        return `${formatter.format(unitAmount)} off`
    } catch {
        const fallback = zeroDecimal ? Math.round(unitAmount).toString() : unitAmount.toFixed(2)
        return `${fallback} ${normalizedCurrency} off`
    }
}

const formatStripePromotionSummary = (coupon: LicenseAdminCoupon): string | undefined => {
    const details = coupon.stripePromotion
    if (!details) {
        return undefined
    }
    const discount =
        details.percentOff != null && Number.isFinite(details.percentOff)
            ? `${details.percentOff}% off`
            : formatStripeAmountOff(details.amountOff, details.currency)
    const durationRaw = typeof details.duration === 'string' ? details.duration.toLowerCase() : ''
    const duration =
        durationRaw === 'once'
            ? 'Applies once'
            : durationRaw === 'repeating'
            ? details.durationInMonths != null && Number.isFinite(details.durationInMonths)
                ? `Repeats for ${details.durationInMonths} month${details.durationInMonths === 1 ? '' : 's'}`
                : 'Repeating duration'
            : durationRaw === 'forever'
            ? 'Applies to all invoices'
            : undefined
    const parts = [discount, duration].filter(Boolean)
    return parts.length > 0 ? parts.join(' • ') : undefined
}

const DEFAULT_PAGE_SIZE = 10
// Fetch more products so the requested slug is available without an alternative lookup endpoint.
const DETAILS_PAGE_SIZE = 250

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

const buildSearchQuery = (pageSize: number) => {
    const params = new URLSearchParams()
    if (pageSize !== DEFAULT_PAGE_SIZE) {
        params.set('pageSize', String(pageSize))
    }
    const query = params.toString()
    return query ? `?${query}` : ''
}

export const ProductCouponsContent: React.FC = () => {
    const navigate = useNavigate()
    const { slug, page: pageParam } = useParams<{ slug: string; page?: string }>()
    const [searchParams] = useSearchParams()
    const { adminApi } = useLicensesSdk()
    const { toast } = useToast()
    const { isSysAdmin } = useContext(SessionContext)
    const queryClient = useQueryClient()
    const invalidateProducts = useInvalidateAdminProducts(queryClient)
    const productLicenseContext = useLicenseProductContext()

    const pageSizeParam = parsePositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE)
    const currentPage = parsePositiveInt(pageParam, 1)

    const couponQueryPrefix = useMemo(
        () => ['authlance', 'licenses', 'admin', 'products', slug ?? 'unknown', 'coupons'] as const,
        [slug]
    )

    const couponQueryKey = useMemo(
        () => [...couponQueryPrefix, currentPage, pageSizeParam] as const,
        [couponQueryPrefix, currentPage, pageSizeParam]
    )

    const handlePageChange = useCallback(
        (nextPage: number) => {
            if (!slug) {
                return
            }
            const normalized = nextPage > 0 ? nextPage : 1
            const basePath = `/licenses/admin/products/${slug}/coupons`
            const search = buildSearchQuery(pageSizeParam)
            const target = normalized > 1 ? `${basePath}/page/${normalized}` : basePath
            navigate(`${target}${search}`, { replace: false })
        },
        [navigate, pageSizeParam, slug]
    )

    const [deleteTarget, setDeleteTarget] = useState<LicenseAdminCoupon | null>(null)

    const { data, isLoading, isFetching, error } = useAdminProducts(adminApi, {
        includeInactive: true,
        includeInternal: true,
        page: 1,
        pageSize: DETAILS_PAGE_SIZE,
    })

    useEffect(() => {
        if (!error) {
            return
        }
        const message = error instanceof Error ? error.message : 'Unable to load product details right now.'
        toast({
            title: 'Failed to load product',
            description: message,
            variant: 'destructive',
        })
    }, [error, toast])

    const {
        data: couponsPage,
        isLoading: couponsLoading,
        isFetching: couponsFetching,
        error: couponsError,
    } = useQuery<LicenseAdminCouponList | undefined>({
        queryKey: couponQueryKey,
        enabled: Boolean(adminApi && slug),
        keepPreviousData: true,
        queryFn: async () => {
            if (!adminApi || !slug) {
                return undefined
            }
            return listAdminProductCoupons(adminApi, slug, true, currentPage, pageSizeParam)
        },
    })

    useEffect(() => {
        if (!couponsError) {
            return
        }
        const message = couponsError instanceof Error ? couponsError.message : 'Unable to load coupons right now.'
        toast({
            title: 'Failed to load coupons',
            description: message,
            variant: 'destructive',
        })
    }, [couponsError, toast])

    const deleteCouponMutation = useMutation({
        mutationFn: (couponId: number) => {
            if (!adminApi || !slug) {
                return Promise.reject(new Error('Select a product before deleting coupons.'))
            }
            return deleteAdminProductCoupon(adminApi, slug, couponId)
        },
        onSuccess: async (_, couponId) => {
            await invalidateProducts()
            await queryClient.invalidateQueries({ queryKey: couponQueryPrefix })
            const code = deleteTarget?.code || `Coupon ${couponId}`
            toast({
                title: 'Coupon removed',
                description: `${code} deleted from ${slug}.`,
            })
            setDeleteTarget(null)
        },
        onError: (mutationError) => {
            const normalized = toLicenseOperatorError(mutationError, 'Failed to delete coupon.')
            toast({ title: 'Coupon failed', description: normalized.message, variant: 'destructive' })
        },
    })

    useEffect(() => {
        productLicenseContext.setCurrentProductSlug(slug)
    }, [productLicenseContext, slug])

    const couponItems: LicenseAdminCoupon[] = couponsPage?.items ?? []
    const totalCoupons = couponsPage?.total ?? couponItems.length
    const couponPageSize = couponsPage?.pageSize && couponsPage.pageSize > 0 ? couponsPage.pageSize : pageSizeParam
    const couponCurrentPage = couponsPage?.page && couponsPage.page > 0 ? couponsPage.page : currentPage
    const hasCoupons = couponItems.length > 0
    const couponRangeStart = hasCoupons ? (couponCurrentPage - 1) * couponPageSize + 1 : 0
    const couponRangeEnd = hasCoupons ? couponRangeStart + couponItems.length - 1 : 0
    const couponTotalPages = Math.max(1, Math.ceil(totalCoupons / couponPageSize))
    const renderPagination = couponTotalPages > 1 || (totalCoupons > 0 && !hasCoupons)
    const resultsSummary = hasCoupons
        ? `Showing ${couponRangeStart}-${couponRangeEnd} of ${totalCoupons} coupons`
        : totalCoupons === 0
        ? 'No coupons configured yet.'
        : 'No results for the selected page.'

    if (!isSysAdmin) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Access restricted</CardTitle>
                        <CardDescription>Only system administrators can manage licensing products.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => navigate('/licenses/admin/products')}>
                            Back to catalog
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (!adminApi) {
        return <DefaultDashboardContent loading />
    }

    if (!slug) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Product not found</CardTitle>
                        <CardDescription>The requested product identifier is missing.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => navigate('/licenses/admin/products')}>
                            Back to catalog
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (isLoading && !data) {
        return <DefaultDashboardContent loading />
    }

    const product = data?.items?.find((entry) => entry.slug === slug)

    if (!product) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Product not found</CardTitle>
                        <CardDescription>The requested product is no longer available.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => navigate('/licenses/admin/products')}>
                            Back to catalog
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Adjust redemption rules for {product.name || product.slug}.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2"></div>
            </div>

            {(isFetching || couponsFetching) && !isLoading && !couponsLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing latest coupon data…
                </div>
            )}

            <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Coupons for {product.slug}</CardTitle>
                        <CardDescription>Active and inactive coupons configured for this product.</CardDescription>
                        <p className="text-xs text-muted-foreground">{resultsSummary}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Behavior</TableHead>
                                <TableHead>Limits</TableHead>
                                <TableHead>Metadata</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {couponsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                                        Loading coupons…
                                    </TableCell>
                                </TableRow>
                            ) : !hasCoupons ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                                        {resultsSummary}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                couponItems.map((coupon) => {
                                    const groupLimit = coupon.maxPerGroup != null ? coupon.maxPerGroup : '—'
                                    const totalLimit = coupon.maxTotal != null ? coupon.maxTotal : '—'
                                    const metadataSummary =
                                        coupon.metadata && Object.keys(coupon.metadata).length > 0
                                            ? Object.entries(coupon.metadata)
                                                  .map(([key, value]) => `${key}: ${value}`)
                                                  .join(', ')
                                            : undefined
                                    const normalizedBehavior = normalizeCouponBehavior(coupon.behavior)
                                    const behaviorLabel = COUPON_BEHAVIOR_LABELS[normalizedBehavior]
                                    const defaultBehaviorSummary = COUPON_BEHAVIOR_SUMMARY[normalizedBehavior]
                                    const stripeSummary =
                                        normalizedBehavior === 'stripe_promotion'
                                            ? formatStripePromotionSummary(coupon)
                                            : undefined
                                    const behaviorSummary =
                                        stripeSummary ?? defaultBehaviorSummary

                                    return (
                                        <TableRow key={coupon.id ?? coupon.code}>
                                            <TableCell className="font-medium">{coupon.code}</TableCell>
                                            <TableCell>
                                                <Badge variant={coupon.active ? 'default' : 'secondary'}>
                                                    {coupon.active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-medium text-foreground">{behaviorLabel}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {behaviorSummary}
                                                    </span>
                                                    {stripeSummary && (
                                                        <span className="text-xs text-muted-foreground opacity-80">
                                                            {defaultBehaviorSummary}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                Group: {groupLimit} • Total: {totalLimit}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {metadataSummary ? metadataSummary : '—'}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {coupon.updatedAt ? formatDateTime(coupon.updatedAt) : '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
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
                                                            disabled={coupon.id == null}
                                                            onSelect={(event) => {
                                                                event.preventDefault()
                                                                if (coupon.id == null) {
                                                                    return
                                                                }
                                                                navigate(
                                                                    `/licenses/admin/products/${slug}/coupons/${coupon.id}/edit`
                                                                )
                                                            }}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit coupon
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            disabled={coupon.id == null}
                                                            onSelect={(event) => {
                                                                event.preventDefault()
                                                                setDeleteTarget(coupon)
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Remove coupon
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                {renderPagination && slug && (
                    <CardFooter>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        aria-disabled={couponCurrentPage <= 1}
                                        className={
                                            couponCurrentPage <= 1 ? 'pointer-events-none opacity-50' : undefined
                                        }
                                        onClick={() => couponCurrentPage > 1 && handlePageChange(couponCurrentPage - 1)}
                                    />
                                </PaginationItem>
                                {Array.from({ length: couponTotalPages }).map((_, index) => {
                                    const pageNumber = index + 1
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === couponTotalPages ||
                                        Math.abs(pageNumber - couponCurrentPage) <= 1
                                    ) {
                                        return (
                                            <PaginationItem key={`coupon-page-${pageNumber}`}>
                                                <PaginationLink
                                                    isActive={pageNumber === couponCurrentPage}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    }
                                    if (Math.abs(pageNumber - couponCurrentPage) === 2) {
                                        return (
                                            <PaginationItem key={`coupon-ellipsis-${pageNumber}`}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        )
                                    }
                                    return null
                                })}
                                <PaginationItem>
                                    <PaginationNext
                                        aria-disabled={couponCurrentPage >= couponTotalPages}
                                        className={
                                            couponCurrentPage >= couponTotalPages
                                                ? 'pointer-events-none opacity-50'
                                                : undefined
                                        }
                                        onClick={() =>
                                            couponCurrentPage < couponTotalPages &&
                                            handlePageChange(couponCurrentPage + 1)
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </CardFooter>
                )}
            </Card>

            {deleteTarget && (
                <Card className="border-destructive/40 bg-destructive/10">
                    <CardHeader>
                        <CardTitle>Remove coupon</CardTitle>
                        <CardDescription>
                            This action removes {deleteTarget.code} from {product.slug}. Existing licenses remain
                            unchanged.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleteCouponMutation.isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteTarget.id && deleteCouponMutation.mutate(deleteTarget.id)}
                            disabled={deleteCouponMutation.isLoading}
                        >
                            {deleteCouponMutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Remove coupon
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}
