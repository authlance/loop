import React, { useCallback, useContext, useMemo, useState } from 'react'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { store } from '@authlance/core/lib/browser/store'
import { authlanceFactory } from '@authlance/core/lib/browser/common/authlance-sdk'
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
import { MoreHorizontal, Smartphone, Monitor, Laptop, Tablet, CircleDot, Circle } from 'lucide-react'
import { useGetGroup } from '../../../hooks/useGroups'
import {
    useGroupDevices,
    useDevicePresence,
    revokeDevice,
    removeDevice,
    GroupDevice,
} from '../../../hooks/useDevices'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@authlance/ui/lib/browser/components/dialog'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { Badge } from '@authlance/ui/lib/browser/components/badge'

interface DeviceRow {
    id: string
    name: string
    type: string
    status: string
    online: boolean
    lastSeenAt?: string
    createdAt: string
    deviceRef: GroupDevice
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

function DevicesTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
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
                                No devices registered.
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
        return 'Never'
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return 'Unknown'
    }
    return date.toLocaleString()
}

const getDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
        case 'ios':
        case 'android':
            return <Smartphone className="w-4 h-4" />
        case 'tablet':
        case 'ipad':
            return <Tablet className="w-4 h-4" />
        case 'macos':
        case 'windows':
        case 'linux':
            return <Monitor className="w-4 h-4" />
        default:
            return <Laptop className="w-4 h-4" />
    }
}

const getStatusBadge = (status: string, online: boolean) => {
    if (status === 'revoked') {
        return <Badge variant="destructive">Revoked</Badge>
    }
    if (status === 'pending') {
        return <Badge variant="secondary">Pending</Badge>
    }
    if (online) {
        return (
            <Badge variant="default" className="bg-green-600">
                <CircleDot className="w-3 h-3 mr-1" /> Online
            </Badge>
        )
    }
    return (
        <Badge variant="outline">
            <Circle className="w-3 h-3 mr-1" /> Offline
        </Badge>
    )
}

const getDevicesApi = () => {
    const state = store.getState()
    const token = state.auth.personalAccessToken || state.auth.token
    return authlanceFactory.groupDevicesApi(token || undefined)
}

export const DevicesList: React.FC<{ group: string }> = ({ group }) => {
    const { targetGroup } = useContext(SessionContext)
    const isMyGroup = targetGroup === group
    const { data: groupData, isLoading: isLoadingGroup } = useGetGroup(isMyGroup, group)
    const groupId = groupData?.id
    const { data: devices, isLoading: isLoadingDevices } = useGroupDevices(groupId)
    const { data: presence } = useDevicePresence(groupId)

    const [deviceToRevoke, setDeviceToRevoke] = useState<GroupDevice | undefined>(undefined)
    const [deviceToRemove, setDeviceToRemove] = useState<GroupDevice | undefined>(undefined)
    const toast = useToast()
    const queryClient = useQueryClient()

    // Build online status map from presence data
    const onlineMap = useMemo(() => {
        const map: Record<string, boolean> = {}
        if (presence?.devices) {
            presence.devices.forEach((d) => {
                if (d.deviceId) {
                    map[d.deviceId] = d.online ?? false
                }
            })
        }
        return map
    }, [presence])

    const deviceRows = useMemo<DeviceRow[]>(() => {
        if (!devices) {
            return []
        }
        return devices.map((device) => ({
            id: device.deviceId || '',
            name: device.deviceName || '',
            type: device.deviceType || '',
            status: device.status || '',
            online: device.deviceId ? (onlineMap[device.deviceId] ?? false) : false,
            lastSeenAt: device.lastSeenAt,
            createdAt: device.createdAt || '',
            deviceRef: device,
        }))
    }, [devices, onlineMap])

    const columns = useMemo<ColumnDef<DeviceRow>[]>(
        () => [
            {
                header: 'Device',
                accessorKey: 'name',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        {getDeviceIcon(row.original.type)}
                        <span>{row.original.name}</span>
                    </div>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ row }) => getStatusBadge(row.original.status, row.original.online),
            },
            {
                header: 'Last Seen',
                accessorKey: 'lastSeenAt',
                cell: ({ row }) => <span>{formatDate(row.original.lastSeenAt)}</span>,
            },
            {
                header: 'Registered',
                accessorKey: 'createdAt',
                cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>,
            },
            {
                header: '',
                accessorKey: 'actions',
                cell: ({ row }) => {
                    const handleRevokeClick = () => {
                        setDeviceToRevoke(row.original.deviceRef)
                    }
                    const handleRemoveClick = () => {
                        setDeviceToRemove(row.original.deviceRef)
                    }

                    const isRevoked = row.original.status === 'revoked'

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
                                    {!isRevoked && (
                                        <DropdownMenuItem onClick={handleRevokeClick} className="text-orange-600">
                                            Revoke Device
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={handleRemoveClick} className="text-destructive">
                                        Remove Device
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

    const confirmRevoke = useCallback(async () => {
        if (!groupId || !deviceToRevoke) {
            setDeviceToRevoke(undefined)
            return
        }
        const devicesApi = getDevicesApi()
        const result = await revokeDevice(
            groupId,
            deviceToRevoke.deviceId || '',
            devicesApi,
            queryClient
        )
        if (result.success) {
            toast.toast({
                title: 'Device revoked',
                description: `${deviceToRevoke.deviceName} has been revoked`,
                duration: 5000,
            })
        } else {
            toast.toast({
                title: 'Unable to revoke device',
                description: result.error || 'An unexpected error occurred',
                duration: 5000,
                variant: 'destructive',
            })
        }
        setDeviceToRevoke(undefined)
    }, [groupId, deviceToRevoke, queryClient, toast])

    const confirmRemove = useCallback(async () => {
        if (!groupId || !deviceToRemove) {
            setDeviceToRemove(undefined)
            return
        }
        const devicesApi = getDevicesApi()
        const result = await removeDevice(
            groupId,
            deviceToRemove.deviceId || '',
            devicesApi,
            queryClient
        )
        if (result.success) {
            toast.toast({
                title: 'Device removed',
                description: `${deviceToRemove.deviceName} has been removed`,
                duration: 5000,
            })
        } else {
            toast.toast({
                title: 'Unable to remove device',
                description: result.error || 'An unexpected error occurred',
                duration: 5000,
                variant: 'destructive',
            })
        }
        setDeviceToRemove(undefined)
    }, [groupId, deviceToRemove, queryClient, toast])

    if (isLoadingGroup || !groupId || isLoadingDevices) {
        return <DefaultDashboardContent loading={true} />
    }

    const devicesCount = devices?.length || 0
    const maxDevices = presence?.max || 5

    return (
        <div className="flex flex-col flex-1 gap-4">
            <div className="rounded-md border p-4 bg-muted/30 text-sm text-muted-foreground">
                <div className="flex justify-between items-center">
                    <span>
                        {devicesCount >= maxDevices
                            ? `This group has reached the maximum of ${maxDevices} devices. Remove a device to add a new one.`
                            : `Devices registered: ${devicesCount} / ${maxDevices}`}
                    </span>
                    {presence && presence.devices && (
                        <span className="text-green-600">
                            {presence.devices.filter((d) => d.online).length} online
                        </span>
                    )}
                </div>
            </div>
            <DevicesTable columns={columns} data={deviceRows} />

            {/* Revoke Dialog */}
            <Dialog open={!!deviceToRevoke} onOpenChange={() => setDeviceToRevoke(undefined)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Revoke Device</DialogTitle>
                        <DialogDescription>
                            This device will no longer be able to access group secrets. The device can be removed later.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeviceToRevoke(undefined)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmRevoke}>
                            Revoke
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Dialog */}
            <Dialog open={!!deviceToRemove} onOpenChange={() => setDeviceToRemove(undefined)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Device</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The device will be permanently removed from this group.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeviceToRemove(undefined)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmRemove}>
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default DevicesList
