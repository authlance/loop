import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { useGetGroup } from '../../hooks/useGroups'
import { useGroupPersonalAccessTokens, createPersonalAccessToken } from '../../hooks/usePersonalAccessTokens'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { Input } from '@authlance/ui/lib/browser/components/input'
import { Textarea } from '@authlance/ui/lib/browser/components/textarea'
import { Label } from '@authlance/ui/lib/browser/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@authlance/ui/lib/browser/components/select'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@authlance/ui/lib/browser/components/card'
import { useNavigate } from 'react-router-dom'
import { ControllersPersonalaccesstokensPersonalAccessTokenResponse } from '@authlance/common/lib/common/authlance-client/api'
import { RadioGroup, RadioGroupItem } from '@authlance/ui/lib/browser/components/radio-group'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@authlance/ui/lib/browser/components/form'
import { useGroupContext } from '../../hooks/userGroupRoutes'
import { useAppDispatch } from '@authlance/core/lib/browser/store'
import { setRefreshTick } from '@authlance/core/lib/browser/store/slices/group-slice'

const formSchema = z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters'),
    scope: z.enum(['full_scope', 'public_scope']),
    expiresInDays: z.enum(['60', '90', '1825']),
})

const expirationOptions: Array<{ label: string; value: '60' | '90' | '1825'; description: string }> = [
    { label: '60 days', value: '60', description: 'Recommended for temporary access.' },
    { label: '90 days', value: '90', description: 'Balanced option for integrations.' },
    { label: '5 years', value: '1825', description: 'Long-lived token for trusted systems.' },
]

export const CreatePersonalAccessTokenForm: React.FC<{ group: string }> = ({ group }) => {
    const { personalAccessTokensApi, targetGroup } = useContext(SessionContext)
    const isMyGroup = targetGroup === group
    const { data: groupData, isLoading: isLoadingGroup } = useGetGroup(isMyGroup, group)
    const groupId = groupData?.id
    const { data: tokens, isLoading: isLoadingTokens } = useGroupPersonalAccessTokens(groupId)
    const queryClient = useQueryClient()
    const toast = useToast()
    const navigate = useNavigate()
    const [createdToken, setCreatedToken] = useState<ControllersPersonalaccesstokensPersonalAccessTokenResponse | undefined>(
        undefined
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const groupContext = useGroupContext()
    const dispatch = useAppDispatch()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            scope: 'public_scope',
            expiresInDays: '60',
        },
    })

    useEffect(() => {
        if (!groupData) {
            groupContext.setGroup(undefined)
            dispatch(setRefreshTick())
            return
        }
        groupContext.setGroup(groupData)
        dispatch(setRefreshTick())
    }, [groupData, groupContext, dispatch])

    const isAtLimit = useMemo(() => (tokens?.length || 0) >= 10, [tokens])

    const submitDisabled = isSubmitting || isAtLimit || !form.formState.isValid

    const onSubmit = form.handleSubmit(async (values) => {
        if (!groupId) {
            return
        }
        setIsSubmitting(true)
        const payload = {
            name: values.name.trim(),
            groupId,
            expiresInDays: Number(values.expiresInDays),
            scopes: [values.scope],
        }
        const result = await createPersonalAccessToken(payload, queryClient, personalAccessTokensApi)
        setIsSubmitting(false)
        if (result.error || !result.token) {
            toast.toast({
                title: 'Unable to create personal access token',
                description: result.error || 'An unexpected error occurred',
                variant: 'destructive',
                duration: 5000,
            })
            return
        }
        setCreatedToken(result.token)
        toast.toast({
            title: 'Personal access token created',
            description: 'Copy this token now. It will not be shown again.',
            duration: 5000,
        })
    })

    const handleGoBack = () => {
        navigate(`/group/${group}/personal-access-tokens`)
    }

    const copyToken = async () => {
        if (!createdToken?.token) {
            return
        }
        try {
            await navigator.clipboard.writeText(createdToken.token)
            toast.toast({
                title: 'Token copied',
                description: 'The personal access token is now in your clipboard.',
                duration: 4000,
            })
        } catch (error) {
            toast.toast({
                title: 'Unable to copy token',
                description: 'Copy the token manually.',
                duration: 5000,
            })
        }
    }

    if (isLoadingGroup || !groupId || isLoadingTokens) {
        return <DefaultDashboardContent loading={true} />
    }

    if (createdToken) {
        return (
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Personal Access Token Created</CardTitle>
                    <CardDescription>This token value is shown only once. Store it securely.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Token</Label>
                        <Textarea readOnly value={createdToken.token || ''} className="mt-2" rows={3} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" onClick={copyToken}>
                            Copy Token
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleGoBack}>
                            OK
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (isAtLimit) {
        return (
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Personal Access Token Limit Reached</CardTitle>
                    <CardDescription>
                        This group already has 10 personal access tokens. Delete an existing token before creating a new one.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button type="button" onClick={handleGoBack}>
                        Back to tokens
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Create Personal Access Token</CardTitle>
                <CardDescription>Configure the token details and choose an expiration policy.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form className="space-y-6" onSubmit={onSubmit}>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="CI pipeline" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="scope"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Scope</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select scope" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="public_scope">Public Scope</SelectItem>
                                            <SelectItem value="full_scope">Full Scope</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Choose the access level this token should grant.
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="expiresInDays"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expiration</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="grid gap-3"
                                        >
                                            {expirationOptions.map((option) => (
                                                <FormItem
                                                    key={option.value}
                                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                                >
                                                    <FormControl>
                                                        <RadioGroupItem value={option.value} />
                                                    </FormControl>
                                                    <div className="space-y-1">
                                                        <FormLabel className="font-normal">
                                                            {option.label}
                                                        </FormLabel>
                                                        <p className="text-xs text-muted-foreground">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                </FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleGoBack}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitDisabled}>
                            {isSubmitting ? 'Creating…' : 'Create Token'}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}

export default CreatePersonalAccessTokenForm
