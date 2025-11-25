import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@authlance/ui/lib/browser/components/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@authlance/ui/lib/browser/components/dropdown-menu'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { MoreHorizontal } from 'lucide-react'
import { useGetGroup } from '../../hooks/useGroups'
import { useGroupPersonalAccessTokens, revokePersonalAccessToken } from '../../hooks/usePersonalAccessTokens'
import type { ControllersPersonalaccesstokensPersonalAccessTokenResponse } from '@authlance/common/lib/common/authlance-client/api'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@authlance/ui/lib/browser/components/dialog'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useGroupContext } from '../../hooks/userGroupRoutes'
import { setRefreshTick } from '@authlance/core/lib/browser/store/slices/group-slice'
import { useAppDispatch } from '@authlance/core/lib/browser/store'

interface PersonalAccessTokenRow {
    id: string
    name: string
    scope: string
    scopeLabel: string
    expiresAt?: string
    tokenRef: ControllersPersonalaccesstokensPersonalAccessTokenResponse
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

function PersonalAccessTokensTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        manualPagination: true,
        manualFiltering: true,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No personal access tokens found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

const formatDate = (value?: string): string => {
    if (!value) {
        return 'No expiration'
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return 'Unknown'
    }
    return date.toLocaleDateString()
}

const scopeLabels: Record<string, string> = {
    full_scope: 'Full Scope',
    public_scope: 'Public Scope',
}

export const PersonalAccessTokensList: React.FC<{ group: string }> = ({ group }) => {
    const { personalAccessTokensApi, targetGroup } = useContext(SessionContext)
    const isMyGroup = targetGroup === group
    const { data: groupData, isLoading: isLoadingGroup } = useGetGroup(isMyGroup, group)
    const groupId = groupData?.id
    const { data: tokens, isLoading: isLoadingTokens } = useGroupPersonalAccessTokens(groupId)
const [tokenToDelete, setTokenToDelete] = useState<ControllersPersonalaccesstokensPersonalAccessTokenResponse | undefined>(
        undefined
    )
    const toast = useToast()
    const queryClient = useQueryClient()
    const groupContext = useGroupContext()
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!groupData) {
            groupContext.setGroup(undefined)
            dispatch(setRefreshTick())
            return
        }
        groupContext.setGroup(groupData)
        dispatch(setRefreshTick())
    }, [groupData, groupContext, dispatch])

    const tokenRows = useMemo<PersonalAccessTokenRow[]>(() => {
        if (!tokens) {
            return []
        }
        return tokens.map((token) => {
            const scopeValue = token.scopes && token.scopes.length > 0
                ? token.scopes[0]
                : token.effectiveScope || ''
            return {
                id: token.id || '',
                name: token.name || '',
                scope: scopeValue,
                scopeLabel: scopeLabels[scopeValue] || (scopeValue || 'Default'),
                expiresAt: token.expiresAt,
                tokenRef: token,
            }
        })
    }, [tokens])

    const columns = useMemo<ColumnDef<PersonalAccessTokenRow>[]>(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
            },
            {
                header: 'Scope',
                accessorKey: 'scopeLabel',
                cell: ({ row }) => {
                    const { scopeLabel } = row.original
                    if (!scopeLabel) {
                        return <span className="text-muted-foreground">Default</span>
                    }
                    return <span>{scopeLabel}</span>
                },
            },
            {
                header: 'Expiration Date',
                accessorKey: 'expiresAt',
                cell: ({ row }) => <span>{formatDate(row.original.expiresAt)}</span>,
            },
            {
                header: '',
                accessorKey: 'actions',
                cell: ({ row }) => {
                    const handleDeleteClick = () => {
                        setTokenToDelete(row.original.tokenRef)
                    }

                    return (
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="w-8 h-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive">
                                        Delete Token
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                },
            },
        ],
        []
    )

    const confirmDelete = useCallback(async () => {
        if (!groupId || !tokenToDelete || !tokenToDelete.id) {
            setTokenToDelete(undefined)
            return
        }
        const result = await revokePersonalAccessToken(tokenToDelete.id, groupId, queryClient, personalAccessTokensApi)
        if (result.success) {
            toast.toast({
                title: 'Token deleted',
                description: `${tokenToDelete.name || 'Personal access token'} has been deleted`,
                duration: 5000,
            })
        } else {
            toast.toast({
                title: 'Unable to delete token',
                description: result.error || 'An unexpected error occurred',
                duration: 5000,
                variant: 'destructive',
            })
        }
        setTokenToDelete(undefined)
    }, [groupId, tokenToDelete, queryClient, personalAccessTokensApi, toast])

    if (isLoadingGroup || !groupId || isLoadingTokens) {
        return <DefaultDashboardContent loading={true} />
    }

    const tokensCount = tokens?.length || 0

    return (
        <div className="flex flex-col flex-1 gap-4">
            <div className="rounded-md border p-4 bg-muted/30 text-sm text-muted-foreground">
                {tokensCount >= 10
                    ? 'This group has reached the maximum of 10 personal access tokens. Delete an existing token to create a new one.'
                    : 'Each group can create up to 10 personal access tokens. Tokens are only shown once at creation time.'}
            </div>
            <PersonalAccessTokensTable columns={columns} data={tokenRows} />
            <Dialog open={!!tokenToDelete} onOpenChange={() => setTokenToDelete(undefined)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Personal Access Token</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The token will stop working immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setTokenToDelete(undefined)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PersonalAccessTokensList
