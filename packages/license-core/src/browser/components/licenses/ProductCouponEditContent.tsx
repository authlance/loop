import React, { useContext, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import {
    listAdminProductCoupons,
    toLicenseOperatorError,
    updateAdminProductCoupon,
    useLicensesSdk,
    type LicenseAdminCoupon,
    type LicenseAdminCouponList,
    type LicenseAdminCouponRequest,
} from '../../common/licenses-sdk'
import { useAdminProducts } from '../../hooks/use-licenses'
import { useInvalidateAdminProducts } from './useInvalidateAdminProducts'
import { CouponEditorPanel } from './ProductCouponEditor'
import { useLicenseProductContext } from '../../hooks/useProductContext'

// High page size ensures we can retrieve the coupon being edited even when it lives deep in the list.
const COUPONS_FETCH_PAGE_SIZE = 250

export const ProductCouponEditContent: React.FC = () => {
    const navigate = useNavigate()
    const { slug, couponId: couponIdParam } = useParams<{ slug: string; couponId: string }>()
    const { adminApi } = useLicensesSdk()
    const { toast } = useToast()
    const { isSysAdmin } = useContext(SessionContext)
    const queryClient = useQueryClient()
    const invalidateProducts = useInvalidateAdminProducts(queryClient)
    const productLicenseContext = useLicenseProductContext()

    const couponId = useMemo(() => {
        const parsed = Number(couponIdParam)
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null
    }, [couponIdParam])

    const couponQueryPrefix = useMemo(
        () => ['authlance', 'licenses', 'admin', 'products', slug ?? 'unknown', 'coupons'] as const,
        [slug]
    )

    const couponQueryKey = useMemo(
        () => [...couponQueryPrefix, 1, COUPONS_FETCH_PAGE_SIZE] as const,
        [couponQueryPrefix]
    )

    const listPath = slug ? `/licenses/admin/products/${slug}/coupons` : '/licenses/admin/products'

    const { data, isLoading, error } = useAdminProducts(adminApi, {
        includeInactive: true,
        includeInternal: true,
        page: 1,
        pageSize: COUPONS_FETCH_PAGE_SIZE,
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
        error: couponsError,
    } = useQuery<LicenseAdminCouponList | undefined>({
        queryKey: couponQueryKey,
        enabled: Boolean(adminApi && slug && couponId != null),
        keepPreviousData: true,
        queryFn: async () => {
            if (!adminApi || !slug) {
                return undefined
            }
            return listAdminProductCoupons(adminApi, slug, true, 1, COUPONS_FETCH_PAGE_SIZE)
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

    useEffect(() => {
        productLicenseContext.setCurrentProductSlug(slug)
    }, [productLicenseContext, slug])

    const couponItems: LicenseAdminCoupon[] = couponsPage?.items ?? []

    const selectedCoupon = useMemo(() => {
        if (couponId == null) {
            return undefined
        }
        return couponItems.find((coupon) => coupon.id === couponId)
    }, [couponId, couponItems])

    const updateCouponMutation = useMutation({
        mutationFn: (payload: LicenseAdminCouponRequest) => {
            if (!adminApi || !slug || couponId == null) {
                return Promise.reject(new Error('Select a coupon before saving changes.'))
            }
            return updateAdminProductCoupon(adminApi, slug, couponId, payload)
        },
        onSuccess: async (coupon) => {
            await invalidateProducts()
            await queryClient.invalidateQueries({ queryKey: couponQueryPrefix })
            toast({
                title: 'Coupon saved',
                description: `${coupon?.code} updated for ${slug}.`,
            })
        },
        onError: (error) => {
            const normalized = toLicenseOperatorError(error, 'Failed to update coupon.')
            toast({ title: 'Coupon failed', description: normalized.message, variant: 'destructive' })
        },
    })

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

    if (couponId == null) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Coupon not found</CardTitle>
                        <CardDescription>The requested coupon identifier is not valid.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => navigate(listPath)}>
                            Back to coupons
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

    if (couponsLoading && !selectedCoupon) {
        return <DefaultDashboardContent loading />
    }

    if (!selectedCoupon) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Coupon not found</CardTitle>
                        <CardDescription>The coupon you are trying to edit could not be found.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => navigate(listPath)}>
                            Back to coupons
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            <Card className="mx-auto w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Edit {selectedCoupon.code}</CardTitle>
                    <CardDescription>
                        Update coupon limits, behavior, and metadata for {product.name || product.slug}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CouponEditorPanel
                        mode="edit"
                        coupon={selectedCoupon}
                        pending={updateCouponMutation.isLoading}
                        onSubmit={(payload) => updateCouponMutation.mutateAsync(payload)}
                        onCancel={() => navigate(listPath)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
