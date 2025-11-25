import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@authlance/ui/lib/browser/components/table'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { Group, User } from '@authlance/core/lib/browser/common/auth'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetUser, useGetUserGroups } from '../../hooks/useUser'
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
import { Input } from '@authlance/ui/lib/browser/components/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@authlance/ui/lib/browser/components/dropdown-menu'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { MoreHorizontal } from 'lucide-react'
import useGroupActionsProvider from '../../hooks/useGroupActionProvider'
import { Label } from '@authlance/ui/lib/browser/components/label'

interface UserGroupRow {
    groupRef: Group
    userRef: User
}

interface UserGroupsDataTableProps<TData, TValue> {
    pages: number
    currentPage: number
    setCurrentPage: (page: number) => void
    currentFilter: string | undefined
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

function UserGroupsDataTable<TData, TValue>({
    columns,
    data,
    pages,
    currentPage,
    setCurrentPage,
}: UserGroupsDataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        pageCount: pages,
        manualPagination: true,
        manualFiltering: true,
        getCoreRowModel: getCoreRowModel(),
    })

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
            <div className="flex items-center justify-between p-2">
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

const UserGroupsView: React.FC<{ user: User }> = ({ user }) => {
    const { debouncer } = useContext(SessionContext)
    const authContext = useContext(SessionContext)
    const navigate = useNavigate()
    const [filter, setFilter] = useState<string | undefined>(undefined)
    const { isLoading: isLoadingRoles, data: groupsData } = useGetUserGroups(user)
    const [currentPage, setCurrentPage] = useState(1)
    const groupActionsProvider = useGroupActionsProvider()

    const changeFilter = useCallback(
        (filter: string) => {
            debouncer.cancelAndReplaceCallback(() => {
                setFilter(filter)
            })
        },
        [debouncer, setFilter]
    )

    const rows = useMemo(() => {
        if (!groupsData || !user) {
            return []
        }

        const allRoles = groupsData.map((group) => ({
            groupRef: group,
            userRef: user,
        }))

        return allRoles
    }, [groupsData, user])

    const filteredRows = useMemo(() => {
        if (!filter) {
            return rows
        }
        const f = filter.toLowerCase()
        return rows.filter(
            (r) => r.groupRef.name.toLowerCase().includes(f) || r.groupRef.longName.toLowerCase().includes(f)
        )
    }, [rows, filter])

    const pageCount = useMemo(() => Math.max(1, Math.ceil(filteredRows.length / 10)), [filteredRows.length])

    const pageRows = useMemo(
        () => filteredRows.slice((currentPage - 1) * 10, currentPage * 10),
        [filteredRows, currentPage]
    )

    const viewGroupAction = useCallback(async (targetGroup: Group) => {
        navigate(`/group/${targetGroup.name}/edit`)
    }, [])

    const viewGroupMembersAction = useCallback(async (targetGroup: Group) => {
        navigate(`/group/${targetGroup.name}/members`)
    }, [])

    const columns = useMemo(() => {
        const columnsDefs: ColumnDef<UserGroupRow>[] = [
            {
                header: 'Group',
                cell: ({ row }) => {
                    const group = row.original.groupRef
                    return (
                        <div className="p-0">
                            <Button variant="link" size="default" className='px-0' onClick={() => viewGroupAction(group)}>
                                {group.name}
                            </Button>
                        </div>
                    )
                },
            },
            {
                header: 'Group Name',
                cell: ({ row }) => {
                    const group = row.original.groupRef.longName
                    return <span className="text-sm font-medium text-gray-900">{group === '' ? 'N/A' : group}</span>
                },
            },
            {
                header: ({ column }) => <div className="w-full text-right"></div>,
                accessorKey: 'actions',
                size: 8,
                cell: (cell) => {
                    const groupRow = cell.row.original

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-8 h-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={(e) => viewGroupAction(groupRow.groupRef)}>
                                    Edit Group
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => viewGroupMembersAction(groupRow.groupRef)}>
                                    View Members
                                </DropdownMenuItem>
                                {groupActionsProvider.getActions().map((action, index) => (
                                    <DropdownMenuItem
                                        key={index}
                                        onClick={() => action.action(authContext, groupRow.groupRef)}
                                    >
                                        {action.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                },
            },
        ]
        return columnsDefs
    }, [user, groupActionsProvider, authContext, viewGroupAction, viewGroupMembersAction])

    useEffect(() => {
        if (currentPage > pageCount) {
            setCurrentPage(pageCount)
        }
    }, [currentPage, pageCount])

    if (isLoadingRoles || !groupsData) {
        return <DefaultDashboardContent loading={true} />
    }

    return (
        <div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col justify-center">
                    <Label htmlFor="search" className='sr-only'>Search</Label>
                    <Input
                        placeholder="Search"
                        onChange={(e) => changeFilter(e.target.value)}
                        className="w-full"
                        name="search"
                        id="search"
                    ></Input>
                </div>
                <UserGroupsDataTable
                    columns={columns}
                    data={pageRows}
                    pages={pageCount}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    currentFilter={filter}
                />
            </div>
        </div>
    )
}

export const UserGroupsComponent: React.FC<Record<string, never>> = () => {
    const { setIdentity } = useContext(SessionContext)
    const { identity } = useParams<{ identity?: string }>()
    const { isLoading, data: user } = useGetUser(identity || '')

    useEffect(() => {
        setIdentity(identity || undefined)
    }, [identity, setIdentity])

    if (isLoading || !user) {
        return <DefaultDashboardContent loading={true} />
    }

    return <UserGroupsView user={user} />
}

export default UserGroupsComponent
