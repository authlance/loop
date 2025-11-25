import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { ArrowLeft } from 'lucide-react'
import {
    createAdminProduct,
    toLicenseOperatorError,
    useLicensesSdk,
    type LicenseAdminProductRequest,
} from '../../common/licenses-sdk'
import { useInvalidateAdminProducts } from './useInvalidateAdminProducts'
import { ProductForm } from './ProductForm'
import { extractSeatLimitError } from './seat-limit-error'

export const ProductCreateContent: React.FC = () => {
    const navigate = useNavigate()
    const { adminApi } = useLicensesSdk()
    const { toast } = useToast()
    const { isSysAdmin } = useContext(SessionContext)
    const queryClient = useQueryClient()
    const invalidateProducts = useInvalidateAdminProducts(queryClient)

    const createProductMutation = useMutation({
        mutationFn: (payload: LicenseAdminProductRequest) => createAdminProduct(adminApi, payload),
        onSuccess: async (product) => {
            await invalidateProducts()
            toast({
                title: 'Product created',
                description: `${product?.name ?? product?.slug} is ready to use.`,
            })
            navigate('/licenses/admin/products')
        },
        onError: (error) => {
            const normalized = toLicenseOperatorError(error, 'Failed to create product.')
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
            toast({ title: 'Create failed', description: normalized.message, variant: 'destructive' })
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

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Create product</h1>
                    <p className="text-sm text-muted-foreground">Define pricing metadata for a new Authlance product.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => navigate('/licenses/admin/products')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to catalog
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Product details</CardTitle>
                    <CardDescription>Select a product key, configure pricing, and review metadata before publishing.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductForm
                        mode="create"
                        pending={createProductMutation.isLoading}
                        onSubmit={(payload) => createProductMutation.mutateAsync(payload)}
                        onCancel={() => navigate('/licenses/admin/products')}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
