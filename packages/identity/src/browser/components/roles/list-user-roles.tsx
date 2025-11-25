import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@authlance/ui/lib/browser/components/table'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    RowModel,
    RowSelectionState,
    useReactTable,
} from '@tanstack/react-table'

import { User } from '@authlance/core/lib/browser/common/auth'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { assignUserRoles, useGetRoles } from '../../hooks/useRoles'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetUser } from '../../hooks/useUser'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@authlance/ui/lib/browser/components/pagination'
import RenderIf from '@authlance/core/lib/browser/components/RenderIf'
import { Checkbox } from '@authlance/ui/lib/browser/components/checkbox'
import { Input } from '@authlance/ui/lib/browser/components/input'

interface UserRoleRow {
    role: string
    userRef: User
}

interface UserRolesDataTableProps<TData, TValue> {
    pages: number
    currentPage: number
    setCurrentPage: (page: number) => void
    currentFilter: string | undefined
    rowSelection: RowSelectionState
    setRowSelection: (rowSelection: RowSelectionState) => void
    roleSelectionChanged: (row: RowModel<UserRoleRow>) => void
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

function UserRolesDataTable<TData, TValue>({
    columns,
    data,
    rowSelection,
    setRowSelection,
    roleSelectionChanged,
    pages,
    currentPage,
    setCurrentPage,
}: UserRolesDataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        pageCount: pages,
        manualPagination: true,
        manualFiltering: true,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: (rowSelection) => {
            setRowSelection(rowSelection as RowSelectionState)
        },
        state: {
            rowSelection,
        },
    })

    useEffect(() => {
        roleSelectionChanged(table.getFilteredSelectedRowModel() as any)
    }, [roleSelectionChanged, table.getFilteredSelectedRowModel()])

    const handleChangePage = useCallback(
        (event: React.MouseEvent<HTMLElement>, page: number) => {
            event.preventDefault()
            setCurrentPage(page)
        },
        [setCurrentPage]
    )

    return (
        <div className="space-y-4">
            <div>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            style={{
                                                minWidth: header.column.columnDef.size
                                                    ? `${header.column.columnDef.size}px`
                                                    : 'auto',
                                                maxWidth: header.column.columnDef.size
                                                    ? `${header.column.columnDef.size}px`
                                                    : 'auto',
                                            }}
                                            key={header.id}
                                        >
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
                                        <TableCell
                                            key={cell.id}
                                            style={{
                                                minWidth: cell.column.columnDef.size
                                                    ? `${cell.column.columnDef.size}px`
                                                    : 'auto',
                                                maxWidth: cell.column.columnDef.size
                                                    ? `${cell.column.columnDef.size}px`
                                                    : 'auto',
                                            }}
                                        >
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
            <div>
                <Pagination>
                    <PaginationContent>
                        <RenderIf isTrue={currentPage > 1}>
                            <PaginationItem>
                                <PaginationPrevious href="#" onClick={(e) => handleChangePage(e, currentPage - 1)} />
                            </PaginationItem>
                        </RenderIf>
                        <RenderIf isTrue={currentPage > 1}>
                            <RenderIf isTrue={currentPage > 3}>
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            </RenderIf>
                            <RenderIf isTrue={currentPage > 2}>
                                <PaginationItem>
                                    <PaginationLink href="#" onClick={(e) => handleChangePage(e, currentPage - 2)}>
                                        {currentPage - 2}
                                    </PaginationLink>
                                </PaginationItem>
                            </RenderIf>
                            <PaginationItem>
                                <PaginationLink href="#" onClick={(e) => handleChangePage(e, currentPage - 1)}>
                                    {currentPage - 1}
                                </PaginationLink>
                            </PaginationItem>
                        </RenderIf>
                        <PaginationItem>
                            <PaginationLink isActive>{currentPage}</PaginationLink>
                        </PaginationItem>
                        <RenderIf isTrue={currentPage < pages}>
                            <RenderIf isTrue={currentPage < pages}>
                                <PaginationItem>
                                    <PaginationLink href="#" onClick={(e) => handleChangePage(e, currentPage + 1)}>
                                        {currentPage + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            </RenderIf>
                            <RenderIf isTrue={currentPage < pages - 1}>
                                <PaginationItem>
                                    <PaginationLink href="#" onClick={(e) => handleChangePage(e, currentPage + 2)}>
                                        {currentPage + 2}
                                    </PaginationLink>
                                </PaginationItem>
                            </RenderIf>
                            <RenderIf isTrue={currentPage < pages - 2}>
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            </RenderIf>
                        </RenderIf>
                        <RenderIf isTrue={currentPage < pages}>
                            <PaginationItem>
                                <PaginationNext href="#" onClick={(e) => handleChangePage(e, currentPage + 1)} />
                            </PaginationItem>
                        </RenderIf>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}

const UserRolesView: React.FC<{ user: User }> = ({ user }) => {
    const { debouncer, adminApi } = useContext(SessionContext)
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [filter, setFilter] = useState<string | undefined>(undefined)
    const { isLoading: isLoadingRoles, data: rolesData } = useGetRoles(
        user,
        currentPage,
        true,
        filter ? { filter, perPage: '10' } : { perPage: '10' }
    )
    const [roleAssignSelection, setRoleAssignSelection] = useState({} as RowSelectionState)
    const [assignRolesModel, setAssignRolesModel] = useState<RowModel<UserRoleRow> | undefined>(undefined)
    const toast = useToast()
    const queryClient = useQueryClient()

    const changeFilter = useCallback(
        (filter: string) => {
            debouncer.cancelAndReplaceCallback(() => {
                setFilter(filter)
            })
        },
        [debouncer, setFilter]
    )

    const handleAssignRoles = useCallback(async () => {
        if (!user) {
            return
        }
        if (assignRolesModel) {
            const selectedRoles = assignRolesModel.rows.map((row) => row.original.role)
            const response = await assignUserRoles(
                user.identity,
                selectedRoles,
                queryClient,
                adminApi!
            )
            if (response.error) {
                toast.toast({
                    title: 'Error assigning roles',
                    description: response.error,
                    variant: 'destructive',
                    duration: 5000,
                })
                return
            }
            toast.toast({
                title: 'Roles assigned',
                description: `Roles assigned to ${user.firstName} ${user.lastName} at system level.`,
                variant: 'default',
                duration: 5000,
            })
            navigate(`/users`)
        }
    }, [assignRolesModel, user, queryClient, navigate, toast, adminApi])

    const rows = useMemo(() => {
        if (!rolesData || !user) {
            return []
        }

        const allRoles = rolesData.roles.map((role) => ({
            role: role,
            userRef: user,
        }))

        return allRoles
    }, [rolesData, user])

    useEffect(() => {
        if (!user || !rows.length) {
            return
        }

        const selected: RowSelectionState = {}
        rows.forEach((row, index) => {
            const isAssigned = user.roles.some((role) => role === row.role)
            if (isAssigned) {
                selected[index.toString()] = true
            }
        })

        setRoleAssignSelection(selected)
    }, [user, rows, setRoleAssignSelection])

    const columns = useMemo(() => {
        const columnsDefs: ColumnDef<UserRoleRow>[] = [
            {
                id: 'select',
                size: 16,
                header: ({ column }) => <div className="w-full text-left"></div>,
                cell: ({ row }) => (
                    <Checkbox
                        className="my-2 max-w-4"
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
            },
            {
                header: 'Role',
                accessorKey: 'role',
            },
        ]
        return columnsDefs
    }, [user])

    useEffect(() => {
        if (rolesData) {
            setPages(rolesData.pages)
        }
    }, [rolesData])

    if (isLoadingRoles || !rolesData) {
        return <DefaultDashboardContent loading={true} />
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col justify-center flex-1 gap-4">
                <Input
                    placeholder="Search"
                    onChange={(e) => changeFilter(e.target.value)}
                    className="w-full"
                ></Input>
            </div>
            <UserRolesDataTable
                columns={columns}
                data={rows}
                rowSelection={roleAssignSelection}
                setRowSelection={setRoleAssignSelection}
                roleSelectionChanged={setAssignRolesModel}
                pages={pages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                currentFilter={filter}
            />
            
            <div className="flex">
                <Button
                    variant="default"
                    onClick={async (event: React.MouseEvent<HTMLElement>) => {
                        event.preventDefault()
                        handleAssignRoles()
                    }}
                >
                    Update Roles
                </Button>
            </div>
        </div>
    )
}

export const UserRolesComponent: React.FC<Record<string, never>> = () => {
    const { identity } = useParams<{ identity?: string }>()
    const { isLoading, data: user } = useGetUser(identity || '')

    if (isLoading || !user) {
        return <DefaultDashboardContent loading={true} />
    }

    return <UserRolesView user={user} />
}

export default UserRolesView
