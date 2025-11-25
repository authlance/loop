import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { HydraContext } from '@authlance/core/lib/browser/common/hydra-sdk'
import { OAuth2Client } from '@ory/client'
import { useClients } from '../../hooks/useClients'
import { Emitter } from '@authlance/core/lib/common/event'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { useNavigate } from 'react-router-dom'
import { ColumnDef, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@authlance/ui/lib/browser/components/table'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
} from '@authlance/ui/lib/browser/components/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@authlance/ui/lib/browser/components/dropdown-menu'
import { MoreHorizontal, Pen, Trash2 } from 'lucide-react'
import RenderIf from '@authlance/core/lib/browser/components/RenderIf'
import { useQueryClient } from '@tanstack/react-query'

interface OpenIdClientRow {
    id: string
    name: string
    clientRef: OAuth2Client
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
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
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                )
                            })}
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
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export const OidcClientsComponent: React.FC<{ token?: string }> = ({ token }) => {
    const navigate = useNavigate()
    const { oauthSDK } = useContext(HydraContext)
    const emitter = useMemo(() => new Emitter<string>(), [])
    const [loadToken, setLoadToken] = useState<string>(token || '00000000-0000-0000-0000-000000000000')
    const queryClient = useQueryClient()
    const clients = useClients(oauthSDK, loadToken)
    const nextToken: string | undefined = useMemo<string | undefined>(
        () => (clients.data?.tokens.has('next') ? clients.data?.tokens.get('next') : undefined),
        [clients.data?.tokens]
    )
    const previousToken: string | undefined = useMemo<string | undefined>(
        () => (clients.data?.tokens.has('prev') ? clients.data?.tokens.get('prev') : undefined),
        [clients.data?.tokens]
    )

    const [clientToDelete, setClientToDelete] = useState<OAuth2Client | undefined>(undefined)

    const viewClient = useCallback(
        (client: OAuth2Client) => {
            navigate(`/oauth-client/${client.client_id || ''}`)
        },
        [navigate]
    )

    const confirmDeleteClient = useCallback((client: OAuth2Client) => {
        setClientToDelete(client)
    }, [])

    const deleteClient = useCallback(async () => {
        if (clientToDelete) {
            await oauthSDK.deleteOAuth2Client({ id: clientToDelete.client_id || '' })
            setClientToDelete(undefined)
            queryClient.invalidateQueries(['oauth-clients']);
        }
    }, [oauthSDK, clientToDelete, queryClient])

    const columns = useMemo(() => {
        const columnsDefs: ColumnDef<OpenIdClientRow>[] = [
            {
                header: 'Client ID',
                accessorKey: 'id',
            },
            {
                header: 'Client Name',
                accessorKey: 'name',
            },
            {
                header: 'Actions',
                accessorKey: 'actions',
                cell: (cell) => {
                    const openIdClientRow = cell.row.original

                    return (
                        <Dialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="w-8 h-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => viewClient(openIdClientRow.clientRef)}>
                                        View Client
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => confirmDeleteClient(openIdClientRow.clientRef)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete Client
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Dialog>
                    )
                },
            },
        ]
        return columnsDefs
    }, [])

    const getUsersData = useCallback((): OpenIdClientRow[] => {
        if (clients.isLoading || !clients.data) {
            return []
        }
        return clients.data.data.map((client) => {
            return {
                clientRef: client,
                id: client.client_id || '',
                name: client.client_name || '',
                actions: (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => navigate(`/oauth-client/${client.client_id || ''}`)}>
                            <Pen />
                        </Button>
                    </div>
                ),
            }
        })
    }, [clients, clients.isLoading, clients.data])

    useEffect(() => {
        const disposable = emitter.event((token) => {
            setLoadToken(token)
        })
        return () => {
            disposable.dispose()
        }
    }, [emitter])

    return (
        <div className="flex flex-col flex-1 h-full">
            <div className="flex flex-col flex-1 gap-4">
                <DataTable columns={columns} data={getUsersData()} />
            </div>
            <div className="flex justify-between mb-4">
                <RenderIf isTrue={!!previousToken}>
                    <Button
                        onClick={() => emitter.fire(previousToken || '00000000-0000-0000-0000-000000000000')}
                        disabled={!previousToken}
                    >
                        Previous
                    </Button>
                </RenderIf>
                <RenderIf isTrue={!!nextToken}>
                    <Button
                        onClick={() => emitter.fire(nextToken || '00000000-0000-0000-0000-000000000000')}
                        disabled={!nextToken}
                    >
                        Next
                    </Button>
                </RenderIf>
            </div>
            <Dialog open={!!clientToDelete} onOpenChange={(isOpen) => !isOpen && setClientToDelete(undefined)}>
                <DialogContent>
                    <DialogHeader>
                        <h2 className="text-lg font-semibold">Confirm Deletion</h2>
                    </DialogHeader>
                    <p>
                        Are you sure you want to delete the client{' '}
                        <strong>{clientToDelete?.client_name || 'this client'}</strong>?
                    </p>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setClientToDelete(undefined)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={deleteClient}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default OidcClientsComponent
