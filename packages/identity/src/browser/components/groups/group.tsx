import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Label } from '@authlance/ui/lib/browser/components/label'
import { Input } from '@authlance/ui/lib/browser/components/input'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { useLocation, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { createGroup, updateGroup, useGetGroup, useIsGroupAvailable } from '../../hooks/useGroups'
import { Group, hasGroupRole } from '@authlance/core/lib/browser/common/auth'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { Card, CardContent, CardFooter, CardHeader } from '@authlance/ui/lib/browser/components/card'
import { Textarea } from '@authlance/ui/lib/browser/components/textarea'
import { useDropzone } from 'react-dropzone'
import { Avatar, AvatarFallback, AvatarImage } from '@authlance/ui/lib/browser/components/avatar'
import { Upload, UserIcon } from 'lucide-react'
import { getOrCreateQueryClient } from '@authlance/core/lib/browser/query-client'
import { Toaster } from '@authlance/ui/lib/browser/components/toaster'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import RenderIf from '@authlance/core/lib/browser/components/RenderIf'
import { useSubscriptionTiers } from '../../hooks/useSubscriptionTiers'
import { PaymentTierDto } from '@authlance/common/lib/common/types/subscriptions'
import { TierSelectionStep } from './TierSelectionStep'
import useActivateGroupTextProvider from '../../hooks/useActivateGroupTextProvider'
import useTierSelectionUIProvider from '../../hooks/useTierSelectionUIProvider'

const formSchema = z.object({
    shortName: z.string().min(3, 'Short name is required'),
    longName: z.string().min(4, 'Long name is required'),
    homeUrl: z.string().optional(),
    description: z.string().optional(),
})

export type FormValues = z.infer<typeof formSchema>

const MAX_FILE_SIZE = 2 * 1024 * 1024

export const GroupForm: React.FC<{
    longName: string
    showAvatar: boolean
    title: string
    currentName?: string
    homeUrl?: string
    description?: string
    avatar?: string
    aside?: boolean
    setFile?: (file: File | undefined) => void
    onSubmit: (data: FormValues, signature: string) => Promise<void>
}> = ({ currentName, longName, showAvatar, title, homeUrl, description, avatar, setFile, onSubmit, aside = false }) => {
    const { user, debouncer } = useContext(SessionContext)
    const queryClient = useQueryClient()
    const [validName, setValidName] = useState(true)
    const [shortName, setShortName] = useState<string>(currentName || '')
    const isSysAdmin = useMemo(() => user?.roles.includes('sysadmin'), [user])
    const { data: isAvailableData } = useIsGroupAvailable(isSysAdmin === true, user?.identity || '', shortName)
    const [preview, setPreview] = useState<string | undefined>(avatar)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [_fileError, setFileError] = useState<string | undefined>(undefined)

    const { getRootProps, getInputProps, open } = useDropzone({
        accept: { 'image/*': [] },
        maxFiles: 1,
        noClick: true,
        onDrop: (acceptedFiles) => {
            if (!setFile) {
                console.error('setFile function is not provided')
                return
            }
            const file = acceptedFiles[0]
            if (file.size > MAX_FILE_SIZE) {
                setFileError('File size exceeds 2MB. Please choose a smaller file.')
                return
            }

            setFileError(undefined)
            setFile(file)
            setPreview(URL.createObjectURL(file))
        },
    })

    const handleShortNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            debouncer.cancelAndReplaceCallback(async () => {
                const value = e.target.value.trim()
                setShortName(value)
                await queryClient.invalidateQueries(['duna-group-available'])
            })
        },
        [debouncer, queryClient, setShortName]
    )

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors, isValid },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            shortName,
            longName,
            homeUrl,
            description,
        },
    })

    const avatarFallback = useMemo(() => {
        if (shortName && shortName.length >= 2) {
            return shortName.substring(0, 2)
        }
        return 'NA'
    }, [shortName])

    useEffect(() => {
        if (shortName && currentName && currentName === shortName) {
            setValidName(true)
            clearErrors('shortName')
            return
        }
        if (shortName === '') {
            setValidName(false)
            setError('shortName', {
                type: 'manual',
                message: 'Short name is required',
            })
            return
        }
        if (!isAvailableData || !isAvailableData.available || !isAvailableData.signature) {
            setError('shortName', {
                type: 'manual',
                message: 'Error checking group availability',
            })
            setValidName(false)
            return
        }
        if (shortName.length < 3) {
            setError('shortName', {
                type: 'manual', 
                message: 'Group name must be at least 3 characters long',
            })
            setValidName(false)
            return
        }
        const isValidGroupName = (input: string) => /^[a-zA-Z][\x21-\x7E]*[a-zA-Z]$/.test(input)
        const currentNameValid = isValidGroupName(shortName)
        if (!currentNameValid) {
            setError('shortName', {
                type: 'manual',
                message: 'Group name must can\'t have special characters and cannot contain spaces',
            })
            setValidName(false)
            return
        }
        
        if (isAvailableData.available) {
            setValidName(true)
            clearErrors('shortName')
        } else {
            setValidName(false)
            setError('shortName', {
                type: 'manual',
                message: 'Group name is already taken',
            })
        }
    }, [isAvailableData, currentName, setShortName, setError, clearErrors, shortName])

    return (
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            {aside && (
                <aside className='w-full md:w-64'>
                    <Card>
                        <CardContent className='p-2'>
                            <nav className='flex flex-col space-y-0.5 space-x-2 md:space-x-0'>
                                <Button
                                    variant="ghost"
                                    type='button'
                                    className='justify-start gap-2 bg-accent text-accent-foreground' // ADDED bg-accent text-accent-foreground only for selected buttons
                                >
                                    <UserIcon className="w-4 h-4" /> Profile
                                </Button>
                            </nav>
                        </CardContent>
                    </Card>
                </aside>
            )}
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <RenderIf isTrue={showAvatar}>
                        <div className="flex justify-center">
                            <div
                                {...getRootProps()}
                                className="relative items-center justify-center w-24 h-24 overflow-hidden cursor-pointer border-2flex group"
                            >
                                <Avatar className="w-24 h-24 rounded-full">
                                    <AvatarImage src={preview} alt={shortName} />
                                    <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-white transition-opacity bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100">
                                    Drag and drop
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <Button
                                variant="ghost"
                                type={'button'}
                                onClick={(e) => {
                                    e.preventDefault()
                                    open()
                                }}
                                className="flex items-center space-x-2"
                            >
                                <Upload className="w-4 h-4" />
                                <span>Upload New Image</span>
                            </Button>
                            <input type="file" ref={fileInputRef} className="hidden" {...getInputProps()} />
                        </div>
                    </RenderIf>
                </CardHeader>
                <form
                    onSubmit={handleSubmit((data) => {
                        if (isAvailableData && isAvailableData.available && isAvailableData.signature) {
                            onSubmit(data, isAvailableData.signature)
                        }
                    })}
                    className=""
                >
                    <CardContent className="space-y-4">
                        <div className="flex flex-row justify-between">
                            <h2 className="text-lg font-semibold">{title}</h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            {/* Short Name Field */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="shortName">Short Name</Label>
                                <Input id="shortName" {...register('shortName')} onChange={handleShortNameChange} />
                                {errors.shortName && (
                                    <span className="text-sm text-destructive">{errors.shortName.message}</span>
                                )}
                            </div>

                            {/* Long Name Field */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="longName">Long Name</Label>
                                <Input id="longName" {...register('longName')} />
                                {errors.longName && <span className="text-sm text-destructive">{errors.longName.message}</span>}
                            </div>
                            
                            <RenderIf isTrue={showAvatar}>
                                {/* Home URL Field */}
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="homeUrl">Home URL</Label>
                                    <Input id="homeUrl" type="url" {...register('homeUrl')} />
                                    {errors.homeUrl && <span className="text-sm text-destructive">{errors.homeUrl.message}</span>}
                                </div>

                                {/* Description Field */}
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" {...register('description')} rows={4} />
                                    {errors.description && (
                                        <span className="text-sm text-destructive">{errors.description.message}</span>
                                    )}
                                </div>
                            </RenderIf>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-start">
                        <Button disabled={!validName || !isValid} type="submit">
                            Submit
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export const CreateGroup: React.FC<Record<string, never>> = () => {
    const { user, adminApi } = useContext(SessionContext)
    const toast = useToast()
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const handleSubmit = useCallback(
        async (data: FormValues, _signature: string) => {
            const targetGroup: Group = {
                id: -1,
                name: data.shortName,
                longName: data.longName,
                homeUrl: data.homeUrl,
                description: data.description,
            }
            const response = await createGroup(targetGroup, queryClient, adminApi!)
            if (response.error) {
                toast.toast({
                    title: 'Error creating group',
                    description: response.error,
                    variant: 'destructive',
                    duration: 5000,
                })
                return
            }
            toast.toast({
                title: 'Group created',
                description: 'Group was created successfully',
                variant: 'default',
                duration: 5000,
            })
            navigate(`/group/${data.shortName}/edit`)
        },
        [toast, queryClient, navigate]
    )

    useEffect(() => {
        if (!user) {
            console.error('User is not authenticated')
            navigate('/')
            return
        }
        if (!user.roles.includes('sysadmin') && !user.roles.includes('admin')) {
            console.error('User does not have permission to create groups')
            navigate('/')
            return
        }
    }, [user])

    return (
        <div>
            <GroupForm showAvatar={false} title={'Create Group'} longName="" onSubmit={handleSubmit} aside={false} />
        </div>
    )
}

export const EditGroup: React.FC<{ group: string }> = ({ group }) => {
    const { user, targetGroup, adminApi } = useContext(SessionContext)
    const navigate = useNavigate()
    const isMyGroup = targetGroup === group
    const { isLoading, data: groupData } = useGetGroup(isMyGroup, group)
    const queryClient = useQueryClient()
    const toast = useToast()
    const [image, setImage] = useState<File | undefined>(undefined)

    const handleSubmit = useCallback(
        async (data: FormValues) => {
            if (!groupData) {
                toast.toast({
                    title: 'Error',
                    description: 'Group data is not available',
                    variant: 'destructive',
                    duration: 5000,
                })
                return
            }
            const updatedGroup: Group = {
                avatar: groupData.avatar,
                id: groupData.id,
                name: data.shortName || groupData.name,
                longName: data.longName || '',
                homeUrl: data.homeUrl,
                description: data.description,
            }
            if (image) {
                updatedGroup.avatar = undefined
            }

            const result = await updateGroup(isMyGroup, updatedGroup, queryClient, image, adminApi!)
            if (result.error) {
                toast.toast({
                    title: 'Error updating group',
                    description: result.error,
                    variant: 'destructive',
                    duration: 5000,
                })
                return
            }
            toast.toast({
                title: 'Group updated',
                description: 'Group was updated successfully',
                variant: 'default',
                duration: 5000,
            })
            if (updatedGroup.name !== groupData.name) {
                navigate(`/group/${groupData.name}/edit`)
            }
        },
        [toast, queryClient, groupData, isMyGroup, image, image]
    )

    useEffect(() => {
        if (!user) {
            console.error('User is not authenticated')
            navigate('/')
            return
        }

        if (!user.roles.includes('sysadmin') && !user.roles.includes('admin')) {
            let canEdit = false
            if (targetGroup && user.groupRoles && group === targetGroup) {
                canEdit = hasGroupRole('group-admin', targetGroup, user.groupRoles)
            }
            if (!canEdit) {
                console.error('User does not have permission to edit this group')
                navigate('/')
                return
            }
        }
    }, [user, targetGroup, group])

    if (isLoading || !groupData) {
        return <DefaultDashboardContent loading={isLoading} />
    }

    return (
        <div>
            <GroupForm
                longName={groupData.longName || ''}
                homeUrl={groupData.homeUrl}
                description={groupData.description}
                currentName={group}
                onSubmit={handleSubmit}
                setFile={setImage}
                showAvatar={true}
                title={'Edit Group'}
                aside={true}
            />
        </div>
    )
}

export const ActivateGroup: React.FC<{ paymentTier: PaymentTierDto }> = ({ paymentTier }) => {
    const { user, targetGroup, paymentsApi } = useContext(SessionContext)
    const toast = useToast()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const activateGroupTextProvider = useActivateGroupTextProvider()
    const textOverride = useMemo(() => activateGroupTextProvider?.getTextOverride(), [activateGroupTextProvider])

    const handleSubmit = useCallback(
        async (data: FormValues, signature: string) => {
            if (!user?.verified) {
                toast.toast({
                    title: 'Verification required',
                    description: 'Verify your account before purchasing a subscription.',
                    variant: 'destructive',
                    duration: 5000,
                })
                const returnTo = `${window.location.pathname}${window.location.search}`
                navigate(`/verify?return_to=${encodeURIComponent(returnTo)}`)
                return
            }

            const targetGroupData: Group = {
                id: -1,
                name: data.shortName,
                longName: data.longName,
                homeUrl: data.homeUrl,
                description: data.description,
            }
            try {
                const response = await paymentsApi.authlancePaymentsApiV1CheckoutSessionPost({
                    lookupKey: paymentTier.lookupKey,
                    organizationLongName: targetGroupData.longName,
                    organizationName: targetGroupData.name,
                    signature,
                })
                if (response.status === 200) {
                    const session = response.data
                    if (session && session.url) {
                        window.location.href = session.url
                    } else {
                        toast.toast({
                            title: 'Error creating checkout session',
                            description: 'No session ID returned from the server.',
                            variant: 'destructive',
                            duration: 5000,
                        })
                    }
                }
            } catch (error) {
                console.error('Error creating checkout session:', error)
                toast.toast({
                    title: 'Error creating checkout session',
                    description: 'There was an error creating the checkout session. Please try again later.',
                    variant: 'destructive',
                    duration: 5000,
                })
                return
            }
        },
        [paymentTier, toast, queryClient, navigate, user]
    )

    useEffect(() => {
        if (!user) {
            console.error('User is not authenticated')
            navigate('/')
            return
        }
        if (!user.verified) {
            const returnTo = `${window.location.pathname}${window.location.search}`
            navigate(`/verify?return_to=${encodeURIComponent(returnTo)}`)
            return
        }
        if (targetGroup) {
            const isGroupAdmin = user.groupRoles && user.groupRoles.some(role => role.role === 'group-admin' && role.group === targetGroup)
            if (!isGroupAdmin && !user.roles.includes('sysadmin')) {
                console.error('User does not have permission to activate a group')
                toast.toast({
                    title: 'Permission Denied',
                    description: 'You do not have permission to activate a group.',
                    variant: 'destructive',
                    duration: 5000,
                })
                navigate('/')
                return
            }
        }
    }, [user, targetGroup, navigate])

    return (
        <div className="p-4">
            <div className="flex justify-center">
                <div className="w-full max-w-md">
                    <GroupForm
                        showAvatar={false}
                        title={textOverride ? textOverride.getTitle(paymentTier) : 'Create Organization and Activate Subscription'}
                        longName=""
                        onSubmit={handleSubmit}
                        aside={false}
                    />
                    {textOverride ? textOverride.getDescription(paymentTier) : (
                        <p className="mb-4 text-sm text-gray-500">
                            Creating an Organization and Activating a Subscription will result in a charge of {paymentTier.price.toFixed(2)} {paymentTier.billingCycle} for the {paymentTier.tierName} plan.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

interface ActivateGroupComponentProps {
    queryClient?: QueryClient
}

export const ActivateGroupComponent: React.FC<ActivateGroupComponentProps> = ({ queryClient }) => {
    const { user } = useContext(SessionContext)
    const navigate = useNavigate()
    const location = useLocation()
    const preSelectedTier = (location.state as { selectedTier?: PaymentTierDto } | null)?.selectedTier ?? null
    const [authenticated, setAuthenticated] = useState(false)
    const [selectedTier, setSelectedTier] = useState<PaymentTierDto | null>(preSelectedTier)
    const [step, setStep] = useState<'tier-selection' | 'group-form'>(preSelectedTier ? 'group-form' : 'tier-selection')
    const { isLoading, data: subscriptionTiers } = useSubscriptionTiers()
    const tierSelectionUIProvider = useTierSelectionUIProvider()
    const tierSelectionUIOverride = useMemo(() => tierSelectionUIProvider?.getTierSelectionUI(), [tierSelectionUIProvider])

    useEffect(() => {
        if (!user) {
            setAuthenticated(false)
        } else {
            setAuthenticated(true)
        }
    }, [user])

    // Single tier: skip tier selection, go directly to form
    useEffect(() => {
        if (subscriptionTiers && subscriptionTiers.length === 1) {
            setSelectedTier(subscriptionTiers[0])
            setStep('group-form')
        }
    }, [subscriptionTiers])

    if (!authenticated) {
        return <></>
    }

    if (user && !user.verified) {
        const returnTo = `${window.location.pathname}${window.location.search}`
        return (
            <div className="p-4">
                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Verify your account</h2>
                    </CardHeader>
                    <CardContent>
                        You must verify your account before purchasing a subscription.
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => navigate(`/verify?return_to=${encodeURIComponent(returnTo)}`)}>
                            Verify account
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (isLoading || !subscriptionTiers || subscriptionTiers.length === 0) {
        return <DefaultDashboardContent loading={isLoading} />
    }

    const handleTierSelect = (tier: PaymentTierDto) => {
        setSelectedTier(tier)
    }

    const handleContinue = () => {
        if (selectedTier) {
            setStep('group-form')
        }
    }

    const handleBack = () => {
        setStep('tier-selection')
    }

    return (
        <QueryClientProvider client={queryClient ?? getOrCreateQueryClient()}>
            {step === 'tier-selection' && subscriptionTiers.length > 1 && (
                tierSelectionUIOverride
                    ? tierSelectionUIOverride.getContent({
                        tiers: subscriptionTiers,
                        selectedTier,
                        onSelectTier: handleTierSelect,
                        onContinue: handleContinue,
                    })
                    : <TierSelectionStep
                        tiers={subscriptionTiers}
                        selectedTier={selectedTier}
                        onSelectTier={handleTierSelect}
                        onContinue={handleContinue}
                    />
            )}
            {step === 'group-form' && selectedTier && (
                <div>
                    {subscriptionTiers.length > 1 && (
                        <div className="p-4">
                            <Button variant="ghost" onClick={handleBack}>
                                &larr; Back to plan selection
                            </Button>
                        </div>
                    )}
                    <ActivateGroup paymentTier={selectedTier} />
                </div>
            )}
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
