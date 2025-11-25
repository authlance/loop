import React, { useContext, useEffect } from 'react'
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
import { Badge } from '@authlance/ui/lib/browser/components/badge'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import {
    toLicenseOperatorError,
    updateAdminProduct,
    useLicensesSdk,
    describePricingMode,
    type LicenseAdminProductRequest,
} from '../../common/licenses-sdk'
import { useAdminProducts } from '../../hooks/use-licenses'
import { useInvalidateAdminProducts } from './useInvalidateAdminProducts'
import { ProductForm } from './ProductForm'
import { extractSeatLimitError } from './seat-limit-error'

// Keep this large to surface the product being edited without additional lookup APIs.
const PRODUCTS_FETCH_PAGE_SIZE = 250

export const ProductEditContent: React.FC = () => {
    const navigate = useNavigate()
    const { slug } = useParams<{ slug: string }>()
    const { adminApi } = useLicensesSdk()
    const { toast } = useToast()
    const { isSysAdmin } = useContext(SessionContext)
    const queryClient = useQueryClient()
    const invalidateProducts = useInvalidateAdminProducts(queryClient)

    const { data, isLoading, isFetching, error, refetch } = useAdminProducts(adminApi, {
        includeInactive: true,
        includeInternal: true,
        page: 1,
        pageSize: PRODUCTS_FETCH_PAGE_SIZE,
    })

    useEffect(() => {
        if (!error) {
            return
        }
        const message = error instanceof Error ? error.message : 'Unable to load product right now.'
        toast({
            title: 'Failed to load product',
            description: message,
            variant: 'destructive',
        })
    }, [error, toast])

    const updateProductMutation = useMutation({
        mutationFn: (payload: LicenseAdminProductRequest) => {
            if (!adminApi || !slug) {
                return Promise.reject(new Error('Product slug is required to update a product.'))
            }
            return updateAdminProduct(adminApi, slug, payload)
        },
        onSuccess: async (product) => {
            await invalidateProducts()
            toast({
                title: 'Product updated',
                description: `${product?.name ?? product?.slug} saved.`,
            })
            navigate('/licenses/admin/products')
        },
        onError: (error) => {
            const normalized = toLicenseOperatorError(error, 'Failed to update product.')
            const seatLimit = extractSeatLimitError(normalized)
            if (seatLimit) {
                const detail =
                    seatLimit.seatLimit != null && seatLimit.required != null
                        ? `(${seatLimit.required} required, limit ${seatLimit.seatLimit})`
                        : ''
                const description = `${seatLimit.message} ${detail} Review seat usage to free capacity or upgrade your license.`
                toast({ title: 'Seat limit reached', description: description.trim(), variant: 'destructive' })
                return
            }
            toast({ title: 'Update failed', description: normalized.message, variant: 'destructive' })
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Edit product</h1>
                    <p className="text-sm text-muted-foreground">Update pricing metadata and coupon limits.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => navigate('/licenses/admin/products')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to catalog
                    </Button>
                    <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                        {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        {isFetching ? 'Refreshing…' : 'Refresh'}
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <CardTitle>{product.name || 'Untitled product'}</CardTitle>
                        {product.plan && (
                            <Badge variant="outline" className="uppercase tracking-wide text-xs">
                                {product.plan}
                            </Badge>
                        )}
                        {product.productKey && (
                            <Badge variant="outline" className="uppercase tracking-wide text-xs">
                                {product.productKey}
                            </Badge>
                        )}
                        <Badge variant="secondary">{describePricingMode(product)}</Badge>
                        <Badge variant={product.active ? 'default' : 'secondary'}>
                            {product.active ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                    <CardDescription>
                        Slug: {product.slug} | Product key: {product.productKey || '—'}
                    </CardDescription>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                        <span>Stripe product: {product.stripeProductId || '—'}</span>
                        <span>Stripe price: {product.stripePriceId || '—'}</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <ProductForm
                        mode="edit"
                        product={product}
                        pending={updateProductMutation.isLoading}
                        onSubmit={(payload) => updateProductMutation.mutateAsync(payload)}
                        onCancel={() => navigate('/licenses/admin/products')}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
