import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Download, MoreHorizontal, CreditCard } from 'lucide-react'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
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
import { Label } from '@authlance/ui/lib/browser/components/label'
import { Input } from '@authlance/ui/lib/browser/components/input'
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
import {
    triggerLicenseDownload,
    useLicensesSdk,
    toLicenseOperatorError,
    type PaginatedLicenseList,
    type LicenseListQuery,
} from '../../common/licenses-sdk'
import { LicensesDataTable } from './LicensesDataTable'
import { InternalHttpControllerLicenseListItem } from '../../../common/authlance-licenses'
import { useGroupLicenses } from '../../hooks/use-licenses'
import { type ColumnDef } from '@tanstack/react-table'

const normalizeGroup = (value: string | undefined) => value?.trim().toLowerCase()

interface LicensesGroupContentProps {
    mode?: 'session' | 'route'
}

interface LicenseRow {
    id: string
    license: InternalHttpControllerLicenseListItem
}

interface LicenseSubscriptionState {
    status: 'loading' | 'ready' | 'error'
    canManage: boolean
    customerId?: string
    seats?: number
}

type LicenseSubscriptionStateMap = Record<string, LicenseSubscriptionState>

interface LicenseTableProps {
    licenses?: PaginatedLicenseList
    loading: boolean
    refreshing: boolean
    onDownload: (licenseId: string) => void
    downloadingId?: string
    onPageChange: (next: number) => void
    query: LicenseListQuery
    subscriptionStates?: LicenseSubscriptionStateMap
    onManageSubscription?: (licenseId: string) => void
    managingSubscriptionId?: string
}

const LicensesTable: React.FC<LicenseTableProps> = ({
    licenses,
    loading,
    refreshing,
    onDownload,
    downloadingId,
    onPageChange,
    query,
    subscriptionStates,
    onManageSubscription,
    managingSubscriptionId,
}) => {
    const formatDateLabel = useCallback((value: string | undefined) => {
        if (!value) {
            return '—'
        }
        const parsed = new Date(value)
        if (Number.isNaN(parsed.getTime())) {
            return '—'
        }
        return parsed.toLocaleString()
    }, [])

    const rows = licenses?.items ?? []
    const total = licenses?.total ?? 0
    const pageSize = licenses?.pageSize ?? query.pageSize ?? 10
    const currentPage = licenses?.page ?? query.page ?? 1
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const renderPagination = totalPages > 1

    const data = useMemo<LicenseRow[]>(() => {
        return rows.map((license, index) => ({
            id: license.licenseId && license.licenseId.trim() !== '' ? license.licenseId : `license-row-${index}`,
            license,
        }))
    }, [rows])

    const columns = useMemo<ColumnDef<LicenseRow>[]>(
        () => [
            {
                id: 'licenseId',
                header: 'License',
                cell: ({ row }) => {
                    const value = row.original.license.licenseId?.trim()
                    return (
                        <span className="font-mono text-xs sm:text-sm text-muted-foreground">
                            {value && value.length > 0 ? value : '—'}
                        </span>
                    )
                },
            },
            {
                id: 'productKey',
                header: 'Product Key',
                cell: ({ row }) => {
                    const productKey = row.original.license.productKey?.trim() || '—'
                    return <span className="font-mono text-xs sm:text-sm text-foreground">{productKey}</span>
                },
            },
            {
                id: 'plan',
                header: 'Plan',
                cell: ({ row }) => {
                    const plan = row.original.license.plan?.toUpperCase() || '—'
                    return <Badge variant="outline" className="uppercase tracking-wide">{plan}</Badge>
                },
            },
            {
                id: 'seats',
                header: 'Seats',
                cell: ({ row }) => {
                    const licenseId = row.original.license.licenseId?.trim() || ''
                    const seatState = licenseId ? subscriptionStates?.[licenseId] : undefined
                    if (!seatState || seatState.status === 'loading') {
                        return <span className="text-xs text-muted-foreground">Loading…</span>
                    }
                    if (seatState.status === 'error') {
                        return <span className="text-xs text-muted-foreground">Unavailable</span>
                    }
                    if (seatState.seats != null) {
                        return <span className="text-sm font-medium text-foreground">{seatState.seats}</span>
                    }
                    return <span className="text-sm text-muted-foreground">—</span>
                },
            },
            {
                id: 'domain',
                header: 'Domain',
                cell: ({ row }) => {
                    const domain = row.original.license.domain?.trim() || '—'
                    return <span className="text-sm font-medium text-foreground">{domain}</span>
                },
            },
            {
                id: 'issued',
                header: 'Issued',
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">{formatDateLabel(row.original.license.createdAt)}</span>
                ),
            },
            {
                id: 'expires',
                header: 'Expires',
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">{formatDateLabel(row.original.license.exp)}</span>
                ),
            },
            {
                id: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const statusRaw = row.original.license.status?.trim() || 'UNKNOWN'
                    const status = statusRaw.toUpperCase()
                    const isActive = status === 'ACTIVE'
                    return <Badge variant={isActive ? 'default' : 'outline'}>{status}</Badge>
                },
            },
            {
                id: 'actions',
                header: () => <span className="sr-only">Actions</span>,
                enableHiding: false,
                cell: ({ row }) => {
                    const { license } = row.original
                    const licenseId = license.licenseId?.trim() || ''
                    const downloading = downloadingId === licenseId && licenseId !== ''
                    const subscriptionState = licenseId ? subscriptionStates?.[licenseId] : undefined
                    const canManageSubscription =
                        Boolean(
                            licenseId &&
                                subscriptionState &&
                                subscriptionState.status === 'ready' &&
                                subscriptionState.canManage &&
                                subscriptionState.customerId
                        ) && Boolean(onManageSubscription)
                    const managing = Boolean(managingSubscriptionId && managingSubscriptionId === licenseId)

                    return (
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        aria-label={`Actions for ${licenseId || 'license'}`}
                                    >
                                        {downloading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <MoreHorizontal className="h-4 w-4" />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        disabled={!licenseId || downloading}
                                        onSelect={(event) => {
                                            event.preventDefault()
                                            if (!licenseId || downloading) {
                                                return
                                            }
                                            onDownload(licenseId)
                                        }}
                                    >
                                        {downloading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Preparing…
                                            </>
                                        ) : (
                                            <>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download license
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    {canManageSubscription && (
                                        <DropdownMenuItem
                                            disabled={!licenseId || downloading || managing}
                                            onSelect={(event) => {
                                                event.preventDefault()
                                                if (!licenseId || downloading || managing) {
                                                    return
                                                }
                                                onManageSubscription?.(licenseId)
                                            }}
                                        >
                                            {managing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Opening portal…
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Manage subscription
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                },
            },
        ],
    [downloadingId, formatDateLabel, managingSubscriptionId, onDownload, onManageSubscription, subscriptionStates])

    if (loading && !licenses?.items) {
        return <DefaultDashboardContent loading={true} />
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle>Issued licenses</CardTitle>
                        <CardDescription>Historical and active licenses for this group.</CardDescription>
                    </div>
                    {refreshing && !loading && (
                        <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground sm:mt-0">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Syncing latest data…
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <LicensesDataTable columns={columns} data={data} emptyMessage="No licenses found yet." />
            </CardContent>
            {renderPagination && (
                <CardFooter>
                    <Pagination>
                        <PaginationContent>
                            {currentPage > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(event) => {
                                            event.preventDefault()
                                            onPageChange(currentPage - 1)
                                        }}
                                    />
                                </PaginationItem>
                            )}
                            {currentPage > 2 && (
                                <>
                                    <PaginationItem>
                                        <PaginationLink
                                            href="#"
                                            onClick={(event) => {
                                                event.preventDefault()
                                                onPageChange(1)
                                            }}
                                        >
                                            1
                                        </PaginationLink>
                                    </PaginationItem>
                                    {currentPage > 3 && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}
                                </>
                            )}
                            {currentPage > 1 && (
                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        onClick={(event) => {
                                            event.preventDefault()
                                            onPageChange(currentPage - 1)
                                        }}
                                    >
                                        {currentPage - 1}
                                    </PaginationLink>
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <PaginationLink href="#" isActive>
                                    {currentPage}
                                </PaginationLink>
                            </PaginationItem>
                            {currentPage < totalPages && (
                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        onClick={(event) => {
                                            event.preventDefault()
                                            onPageChange(currentPage + 1)
                                        }}
                                    >
                                        {currentPage + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            )}
                            {currentPage + 1 < totalPages && (
                                <>
                                    {currentPage + 2 < totalPages && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}
                                    <PaginationItem>
                                        <PaginationLink
                                            href="#"
                                            onClick={(event) => {
                                                event.preventDefault()
                                                onPageChange(totalPages)
                                            }}
                                        >
                                            {totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                </>
                            )}
                            {currentPage < totalPages && (
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(event) => {
                                            event.preventDefault()
                                            onPageChange(currentPage + 1)
                                        }}
                                    />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </CardFooter>
            )}
        </Card>
    )
}

export const TrialIssuer: React.FC<{
    groupName: string
    licenseApiAvailable: boolean
    issuing: boolean
    onIssue: (payload: { email: string; domain: string }) => void
    initialEmail?: string
    initialDomain?: string
}> = ({ groupName, licenseApiAvailable, issuing, onIssue, initialEmail, initialDomain }) => {
    const [email, setEmail] = useState(initialEmail || '')
    const [domain, setDomain] = useState(initialDomain || groupName)

    useEffect(() => {
        setDomain(groupName)
    }, [groupName])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Issue trial license</CardTitle>
                <CardDescription>Trials are time-limited and will reuse an active license when available.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="trial-email">Admin email</Label>
                    <Input
                        id="trial-email"
                        type="email"
                        placeholder="owner@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="trial-domain">Domain</Label>
                    <Input
                        id="trial-domain"
                        placeholder="example.com"
                        value={domain}
                        onChange={(event) => setDomain(event.target.value)}
                        autoComplete="off"
                    />
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                    If a trial already exists, the existing license will be returned instead.
                </span>
                <Button
                    onClick={() => onIssue({ email: email.trim(), domain: domain.trim() })}
                    disabled={!licenseApiAvailable || issuing}
                >
                    {issuing ? 'Issuing…' : 'Issue trial'}
                </Button>
            </CardFooter>
        </Card>
    )
}

export const LicensesGroupContent: React.FC<LicensesGroupContentProps> = ({ mode = 'route' }) => {
    const navigate = useNavigate()
    const params = useParams<{ groupName: string }>()
    const { user, targetGroup, isSysAdmin } = useContext(SessionContext)
    const { licenseApi, paymentsApi } = useLicensesSdk()
    const { toast } = useToast()

    const routeGroup = params.groupName || ''
    const sessionGroup = targetGroup?.trim() ?? ''
    const activeGroup = (mode === 'session' ? sessionGroup : routeGroup).trim()
    const normalizedParam = normalizeGroup(activeGroup)
    const normalizedTarget = normalizeGroup(targetGroup || undefined)
    const userGroups = user?.groups || []
    const isMember = useMemo(() => userGroups.some((group) => normalizeGroup(group) === normalizedParam), [userGroups, normalizedParam])
    const hasActiveGroup = activeGroup.length > 0
    const canView = hasActiveGroup && Boolean(isSysAdmin || isMember || normalizedTarget === normalizedParam)

    const [page, setPage] = useState(1)
    const [downloadingId, setDownloadingId] = useState<string | undefined>(undefined)
    const [subscriptionStates, setSubscriptionStates] = useState<LicenseSubscriptionStateMap>({})
    const [managingSubscriptionId, setManagingSubscriptionId] = useState<string | undefined>(undefined)
    const query = useMemo<LicenseListQuery>(() => ({ page, pageSize: 10 }), [page])

    const {
        data: licenses,
        isLoading: licensesLoading,
        isFetching: licensesFetching,
        error: licensesError,
    } = useGroupLicenses(licenseApi, canView ? activeGroup : undefined, query)

    useEffect(() => {
        if (!licensesError) {
            return
        }
        const message = licensesError instanceof Error ? licensesError.message : 'Unable to load licenses right now.'
        toast({
            title: 'Failed to load licenses',
            description: message,
            variant: 'destructive',
        })
    }, [licensesError, toast])

    const handleDownload = useCallback(
        async (licenseId: string) => {
            if (!licenseApi || !licenseId) {
                return
            }
            try {
                setDownloadingId(licenseId)
                const response = await licenseApi.authlanceLicenseLicenseIdGet(licenseId)
                triggerLicenseDownload(response.data, { fileName: `authlance-license-${licenseId}` })
                toast({
                    title: 'License downloaded',
                    description: `${licenseId} saved locally.`,
                })
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Download failed. Try again later.'
                toast({
                    title: 'Unable to download license',
                    description: message,
                    variant: 'destructive',
                })
            } finally {
                setDownloadingId(undefined)
            }
        },
        [licenseApi, toast]
    )

    const loadSubscriptionState = useCallback(
        async (licenseId: string) => {
            if (!paymentsApi || !licenseId) {
                return
            }
            try {
                const response = await paymentsApi.authlanceLicensePaymentsApiV1VerifyPaymentLicenseIdGet(licenseId)
                const licenseSummary = response.data?.license
                const productSummary = response.data?.product
                const rawCustomerId =
                    typeof licenseSummary?.stripeCustomerId === 'string' ? licenseSummary.stripeCustomerId.trim() : ''
                const interval =
                    typeof productSummary?.billingInterval === 'string' ? productSummary.billingInterval.trim() : ''
                const normalizedInterval = interval.toLowerCase()
                const productTypeMeta =
                    typeof productSummary?.metadata?.product_type === 'string'
                        ? productSummary.metadata.product_type.trim().toLowerCase()
                        : ''
                const licenseModeMeta =
                    typeof productSummary?.metadata?.license_mode === 'string'
                        ? productSummary.metadata.license_mode.trim().toLowerCase()
                        : ''
                const supportsSubscriptionBilling =
                    productTypeMeta === 'subscription' ||
                    licenseModeMeta === 'subscription' ||
                    (normalizedInterval !== '' && normalizedInterval !== 'one_time')
                const canManage = Boolean(rawCustomerId && supportsSubscriptionBilling)
                const seats = typeof licenseSummary?.seats === 'number' ? licenseSummary.seats : undefined
                setSubscriptionStates((previous) => ({
                    ...previous,
                    [licenseId]: {
                        status: 'ready',
                        canManage,
                        customerId: rawCustomerId || undefined,
                        seats,
                    },
                }))
            } catch (error) {
                setSubscriptionStates((previous) => ({
                    ...previous,
                    [licenseId]: {
                        status: 'error',
                        canManage: false,
                        seats: previous[licenseId]?.seats,
                    },
                }))
                console.warn(`Failed to load subscription info for license ${licenseId}`, error)
            }
        },
        [paymentsApi]
    )

    useEffect(() => {
        if (!paymentsApi) {
            return
        }
        const items = Array.isArray(licenses?.items) ? licenses.items : []
        if (items.length === 0) {
            return
        }
        const pending: string[] = []
        for (const item of items) {
            const licenseId = item.licenseId?.trim()
            if (!licenseId || subscriptionStates[licenseId]) {
                continue
            }
            pending.push(licenseId)
        }
        if (pending.length === 0) {
            return
        }
        setSubscriptionStates((previous) => {
            let next = previous
            let updated = false
            for (const licenseId of pending) {
                if (previous[licenseId]) {
                    continue
                }
                if (!updated) {
                    next = { ...previous }
                    updated = true
                }
                next[licenseId] = { status: 'loading', canManage: false }
            }
            return updated ? next : previous
        })
        pending.forEach((licenseId) => {
            loadSubscriptionState(licenseId)
        })
    }, [licenses, paymentsApi, loadSubscriptionState, subscriptionStates])

    const handleManageSubscription = useCallback(
        async (licenseId: string) => {
            if (!paymentsApi) {
                toast({
                    title: 'Unable to open billing portal',
                    description: 'You need an active session to manage subscriptions.',
                    variant: 'destructive',
                })
                return
            }
            const state = subscriptionStates[licenseId]
            if (!state || state.status !== 'ready' || !state.canManage || !state.customerId) {
                toast({
                    title: 'Subscription not available',
                    description: 'We could not find an active Stripe subscription for this license.',
                    variant: 'destructive',
                })
                return
            }
            try {
                setManagingSubscriptionId(licenseId)
                const response = await paymentsApi.authlanceLicensePaymentsApiV1CustomerPortalPost({
                    customerId: state.customerId,
                })
                const portalUrl = typeof response.data?.url === 'string' ? response.data.url.trim() : ''
                if (!portalUrl) {
                    throw new Error('Stripe did not return a billing portal URL.')
                }
                if (typeof window !== 'undefined' && window.location) {
                    window.location.assign(portalUrl)
                } else {
                    console.warn('Billing portal URL ready', portalUrl)
                }
            } catch (error) {
                const normalized = toLicenseOperatorError(error, 'Failed to open the billing portal.')
                toast({
                    title: 'Unable to open billing portal',
                    description: normalized.message,
                    variant: 'destructive',
                })
            } finally {
                setManagingSubscriptionId(undefined)
            }
        },
        [paymentsApi, subscriptionStates, toast]
    )

    const licensesInitialLoading = licensesLoading && !licenses
    const licensesRefreshing = licensesFetching && !licensesInitialLoading

    if (!hasActiveGroup) {
        const title = mode === 'session' ? 'No group selected' : 'Group not specified'
        const description =
            mode === 'session'
                ? 'Choose a target group from the navigation before viewing licenses.'
                : 'Provide a group identifier in the URL to inspect its licenses.'
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => navigate('/')}>
                            Back to home
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (!canView) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Access restricted</CardTitle>
                        <CardDescription>
                            You need to be a system administrator or a member of {activeGroup} to view its licenses.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => navigate('/')}>
                            Back to home
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <CardDescription>{activeGroup}</CardDescription>
                </div>
            </div>

            <LicensesTable
                licenses={licenses}
                loading={licensesInitialLoading}
                refreshing={licensesRefreshing}
                onDownload={handleDownload}
                downloadingId={downloadingId}
                onPageChange={setPage}
                query={query}
                subscriptionStates={subscriptionStates}
                onManageSubscription={handleManageSubscription}
                managingSubscriptionId={managingSubscriptionId}
            />
        </div>
    )
}
