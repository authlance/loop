import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@authlance/ui/lib/browser/components/table'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@authlance/ui/lib/browser/components/dropdown-menu'

import { GroupRow } from './types'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { Debouncer } from '@authlance/core/lib/browser/common/utils'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { MoreHorizontal } from 'lucide-react'
import { Group } from '@authlance/core/lib/browser/common/auth'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Input } from '@authlance/ui/lib/browser/components/input'
import { useGetGroups } from '../../hooks/useGroups'
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
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import useGroupActionsProvider from '../../hooks/useGroupActionProvider'
import { Label } from '@authlance/ui/lib/browser/components/label'

interface GroupsDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

function GroupsDataTable<TData, TValue>({ columns, data }: GroupsDataTableProps<TData, TValue>) {
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
                                    <TableHead
                                        key={header.id}
                                        style={
                                            header.column.columnDef.size
                                                ? { width: `${(header.column.columnDef.size) * 4}px` }
                                                : undefined
                                        }>
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

export const GroupsTableComponent: React.FC<{ groups: Group[] }> = ({ groups }) => {
    const navigate = useNavigate()
    const authContext = useContext(SessionContext)
    const groupActionsProvider = useGroupActionsProvider()

    const viewGroupAction = useCallback(async (targetGroup: Group) => {
        navigate(`/group/${targetGroup.name}/edit`)
    }, [])

    const viewGroupMembersAction = useCallback(async (targetGroup: Group) => {
        navigate(`/group/${targetGroup.name}/members`)
    }, [])

    const columns = useMemo(() => {
        const columnsDefs: ColumnDef<GroupRow>[] = [
            {
                header: 'Group',
                accessorKey: 'group',
                cell: (cell) => {
                    const groupRow = cell.row.original
                    return (
                        <div className="p-0">
                            <Button
                                variant="link"
                                size="default"
                                className='px-0'
                                onClick={() => viewGroupMembersAction(groupRow.groupRef)}
                            >
                                {groupRow.group}
                            </Button>
                        </div>
                    )
                },
            },
            {
                header: ({ column }) => <div className="w-full text-right"></div>,
                accessorKey: 'actions',
                size: 8,
                cell: (cell) => {
                    const groupRow = cell.row.original

                    return !groupRow.groupRef ? (
                        <></>
                    ) : (
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
                        </div>
                    )
                },
            },
        ]
        return columnsDefs
    }, [groups, authContext, viewGroupAction, viewGroupMembersAction, groupActionsProvider])

    const getGroupsData = useCallback((): GroupRow[] => {
        return groups.map((group) => ({
            group: group.name,
            groupRef: group,
        }))
    }, [groups])

    return (
        <>
            <div className="flex flex-col flex-1 gap-4 pt-0">
                <GroupsDataTable columns={columns} data={getGroupsData()} />
            </div>
        </>
    )
}

export const tryParseInt = (str: string | undefined, defaultValue: number): number => {
    if (str === undefined) {
        return defaultValue
    }
    const parsed = parseInt(str)
    return isNaN(parsed) ? defaultValue : parsed
}

export const ListGroupsComponent: React.FC = () => {
    const { page } = useParams<{ page?: string }>()
    const [searchParams] = useSearchParams()
    const currentPage = useMemo(() => tryParseInt(page, 1), [page])
    const filterFromUrl = () => searchParams.get('filter') || undefined
    const [filter, setFilter] = useState<string | undefined>(filterFromUrl())
    const inputRef = useRef<HTMLInputElement>(null)
    const [debouncer] = useState(new Debouncer(() => {}, 750))
    const navigate = useNavigate()
    const groupsData = useGetGroups(
        tryParseInt(page, 1),
        filterFromUrl() !== undefined ? { filter: filterFromUrl()! } : undefined
    )
    const totalPages = useMemo(() => groupsData.data?.pages || 1, [groupsData.data?.pages])

    const changeFilter = useCallback(
        (filter: string) => {
            debouncer.cancelAndReplaceCallback(() => {
                setFilter(filter)
                navigate(`/groups/1${filter ? `?filter=${encodeURIComponent(filter)}` : ''}`)
            })
        },
        [navigate, debouncer, setFilter]
    )

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleChangePage = useCallback((event: React.MouseEvent<HTMLElement>, targetPage: number) => {
        event.preventDefault()
        navigate(`/groups/${targetPage}${filter ? `?filter=${encodeURIComponent(filter)}` : ''}`)
    }, [])

    if (groupsData.isLoading || !groupsData.data) {
        return <DefaultDashboardContent loading={true} />
    }

    return (
        <div className="flex flex-col flex-1 h-full">
            {/* Scrollable content: includes search + table + pagination */}
            <div className="flex flex-col flex-1 gap-4">
                {/* Search input now inside the scrollable area */}
                <div>
                    <Label htmlFor='search-groups' className="sr-only">
                        Search Groups
                    </Label>
                    <Input
                        placeholder="Search"
                        defaultValue={filter || ''}
                        className="w-full"
                        onChange={(e) => changeFilter(e.target.value)}
                        ref={inputRef}
                        name='search-groups'
                        id='search-groups'
                    />
                </div>

                {/* Table */}
                <GroupsTableComponent groups={groupsData.data.groups} />

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <Pagination>
                        <PaginationContent>
                            <RenderIf isTrue={currentPage > 1}>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={`/groups/${currentPage - 1}`}
                                        onClick={(e) => handleChangePage(e, currentPage - 1)}
                                    />
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
                                        <PaginationLink
                                            href={`/groups/${currentPage - 2}`}
                                            onClick={(e) => handleChangePage(e, currentPage - 2)}
                                        >
                                            {currentPage - 2}
                                        </PaginationLink>
                                    </PaginationItem>
                                </RenderIf>
                                <PaginationItem>
                                    <PaginationLink
                                        href={`/groups/${currentPage - 1}`}
                                        onClick={(e) => handleChangePage(e, currentPage - 1)}
                                    >
                                        {currentPage - 1}
                                    </PaginationLink>
                                </PaginationItem>
                            </RenderIf>
                            <PaginationItem>
                                <PaginationLink isActive>{currentPage}</PaginationLink>
                            </PaginationItem>
                            <RenderIf isTrue={currentPage < totalPages}>
                                <RenderIf isTrue={currentPage < totalPages}>
                                    <PaginationItem>
                                        <PaginationLink
                                            href={`/groups/${currentPage + 1}`}
                                            onClick={(e) => handleChangePage(e, currentPage + 1)}
                                        >
                                            {currentPage + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                </RenderIf>
                                <RenderIf isTrue={currentPage < totalPages - 1}>
                                    <PaginationItem>
                                        <PaginationLink
                                            href={`/groups/${currentPage + 2}`}
                                            onClick={(e) => handleChangePage(e, currentPage + 2)}
                                        >
                                            {currentPage + 2}
                                        </PaginationLink>
                                    </PaginationItem>
                                </RenderIf>
                                <RenderIf isTrue={currentPage < totalPages - 2}>
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                </RenderIf>
                            </RenderIf>
                            <RenderIf isTrue={currentPage < totalPages}>
                                <PaginationItem>
                                    <PaginationNext
                                        href={`/groups/${currentPage + 1}`}
                                        onClick={(e) => handleChangePage(e, currentPage + 1)}
                                    />
                                </PaginationItem>
                            </RenderIf>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    )
}
