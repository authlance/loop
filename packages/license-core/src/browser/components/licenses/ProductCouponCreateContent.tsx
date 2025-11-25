import React, { useContext, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
    createAdminProductCoupon,
    toLicenseOperatorError,
    useLicensesSdk,
    type LicenseAdminCouponRequest,
} from '../../common/licenses-sdk'
import { useAdminProducts } from '../../hooks/use-licenses'
import { useInvalidateAdminProducts } from './useInvalidateAdminProducts'
import { CouponEditorPanel } from './ProductCouponEditor'
import { useLicenseProductContext } from '../../hooks/useProductContext'

// Fetch a broader slice so the selected product is discoverable without a dedicated lookup endpoint.
const PRODUCTS_FETCH_PAGE_SIZE = 250

export const ProductCouponCreateContent: React.FC = () => {
    const navigate = useNavigate()
    const { slug } = useParams<{ slug: string }>()
    const { adminApi } = useLicensesSdk()
    const { toast } = useToast()
    const { isSysAdmin } = useContext(SessionContext)
    const queryClient = useQueryClient()
    const invalidateProducts = useInvalidateAdminProducts(queryClient)
    const productLicenseContext = useLicenseProductContext()

    const couponQueryPrefix = useMemo(
        () => ['authlance', 'licenses', 'admin', 'products', slug ?? 'unknown', 'coupons'] as const,
        [slug]
    )

    const { data, isLoading, error } = useAdminProducts(adminApi, {
        includeInactive: true,
        includeInternal: true,
        page: 1,
        pageSize: PRODUCTS_FETCH_PAGE_SIZE,
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

    useEffect(() => {
        productLicenseContext.setCurrentProductSlug(slug)
    }, [productLicenseContext, slug])

    const createCouponMutation = useMutation({
        mutationFn: (payload: LicenseAdminCouponRequest) => {
            if (!adminApi || !slug) {
                return Promise.reject(new Error('Select a product before creating coupons.'))
            }
            return createAdminProductCoupon(adminApi, slug, payload)
        },
        onSuccess: async (coupon) => {
            await invalidateProducts()
            await queryClient.invalidateQueries({ queryKey: couponQueryPrefix })
            toast({
                title: 'Coupon created',
                description: `${coupon?.code} added to ${slug}.`,
            })
            navigate(`/licenses/admin/products/${slug}/coupons`, { replace: true })
        },
        onError: (error) => {
            const normalized = toLicenseOperatorError(error, 'Failed to create coupon.')
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
            <Card className="mx-auto w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Add coupon</CardTitle>
                    <CardDescription>
                        Create a coupon that can be redeemed during checkout for {product.name || product.slug}. Choose how it behaves during
                        checkout before saving.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CouponEditorPanel
                        mode="create"
                        pending={createCouponMutation.isLoading}
                        onSubmit={(payload) => createCouponMutation.mutateAsync(payload)}
                        onCancel={() => navigate(`/licenses/admin/products/${slug}/coupons`)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
