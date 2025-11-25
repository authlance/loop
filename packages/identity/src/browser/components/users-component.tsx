import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Debouncer } from '@authlance/core/lib/browser/common/utils'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@authlance/ui/lib/browser/components/table'
import { useGetUsers } from '../hooks/useUsers'
import { Input } from '@authlance/ui/lib/browser/components/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@authlance/ui/lib/browser/components/dropdown-menu'
import { MoreHorizontal, Search } from 'lucide-react'
import { User } from '@authlance/core/lib/browser/common/auth'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@authlance/ui/lib/browser/components/pagination'
import RenderIf from '@authlance/core/lib/browser/components/RenderIf'
import useUserActionsProvider from '../hooks/useUserActionProvider'
import { Label } from '@authlance/ui/lib/browser/components/label'
import { Avatar, AvatarFallback, AvatarImage } from '@authlance/ui/lib/browser/components/avatar'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'

const tryParseInt = (str: string | undefined, defaultValue: number): number => {
    if (str === undefined) {
        return defaultValue
    }
    const parsed = parseInt(str)
    return isNaN(parsed) ? defaultValue : parsed
}

interface UserRow {
    id: string
    name: string
    email: string
    userRef: User
    avatar?: string
}

interface DataTableProps<TData, TValue> {
    pages: number
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

function DataTable<TData, TValue>({
    columns,
    data,
    pages,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        pageCount: pages,
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
                                    <TableHead key={header.id} style={
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

const UsersComponent: React.FC<Record<string, never>> = () => {
    const navigate = useNavigate()
    const [ searchParams ] = useSearchParams()
    const { page } = useParams()
    const filterFromUrl = () => searchParams.get('filter') || undefined
    const usersData = useGetUsers(
        tryParseInt(page, 1),
        filterFromUrl() !== undefined ? { filter: filterFromUrl()! } : undefined
    )
    const totalPages = useMemo(() => usersData.data?.pages || 1, [usersData.data?.pages])
    const currentPage = useMemo(() => tryParseInt(page, 1), [page])
    const [filter, setFilter] = useState<string | undefined>(filterFromUrl())
    const [debouncer] = useState(new Debouncer(() => {}, 750))
    const userActionsProvider = useUserActionsProvider()
    const authContext = useContext(SessionContext)

    const changeFilter = useCallback(
        (filter: string) => {
            debouncer.cancelAndReplaceCallback(() => {
                setFilter(filter)
                navigate(`/users/1${filter ? `?filter=${encodeURIComponent(filter)}` : ''}`)
            })
        },
        [navigate, debouncer, setFilter]
    )

    const viewProfile = useCallback(
        (targetUser: User) => {
            navigate(`/user/profile/${targetUser.identity}`)
        },
        [navigate]
    )

     const avatarFallback = useCallback((user: User) => {
        if (user && user.firstName && user.lastName && user.firstName.length > 0 && user.lastName.length > 0) {
            return user.firstName.charAt(0) + user.lastName.charAt(0)
        }
        if (user && user.firstName && user.firstName.length >= 2) {
            return user.firstName.substring(0, 2)
        }
        return 'NA'
    }, [])

    const columns = useMemo(() => {
        const contributedActions = userActionsProvider.getActions()

        const columnsDefs: ColumnDef<UserRow>[] = [
            {
                header: '',
                size: 10,
                accessorKey: 'avatar',
                cell: (cell) => {
                    const userRow = cell.row.original
                    const user = userRow.userRef
                    return (
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={userRow.avatar} alt={userRow.name} />
                            <AvatarFallback>{avatarFallback(user)}</AvatarFallback>
                        </Avatar>
                    )
                }
            },
            {
                header: 'Name',
                accessorKey: 'name',
                cell : (cell) => {
                    const userRow = cell.row.original
                    return (
                        <div className="p-0">
                            <Button layout={'block'} variant="link" size="icon" onClick={() => viewProfile(userRow.userRef)}>
                                {userRow.name}
                            </Button>
                        </div>
                    )
                }
            },
            {
                header: 'Email',
                accessorKey: 'email',
            },
            {
                header: ({ column }) => <div className="w-full text-right"></div>,
                accessorKey: 'actions',
                size: 8,
                cell: (cell) => {
                    const userRow = cell.row.original

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
                                <DropdownMenuItem onClick={() => viewProfile(userRow.userRef)}>View Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                    e.preventDefault()
                                    navigate(`/users/${userRow.userRef.identity}/roles`)
                                }}>View Roles</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                    e.preventDefault()
                                    navigate(`/user/groups/${userRow.userRef.identity}`)
                                }}>View Groups</DropdownMenuItem>
                                {contributedActions
                                    .filter((action) => (action.isVisible ? action.isVisible(authContext, userRow.userRef) : true))
                                    .map((action, index) => {
                                        const label = action.getLabel ? action.getLabel(userRow.userRef) : action.label
                                        return (
                                            <DropdownMenuItem
                                                key={index + '-action-provider'}
                                                onClick={() => action.action(userRow.userRef)}
                                            >
                                                {label}
                                            </DropdownMenuItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                },
            },
        ]
        return columnsDefs
    }, [userActionsProvider, viewProfile, navigate, avatarFallback])

    const getUsersData = useCallback((): UserRow[] => {
        if (usersData.isLoading || !usersData.data) {
            return []
        }
        return usersData.data.users.map((user) => {
            return {
                userRef: user,
                id: user.identity,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                avatar: user.avatar || undefined,
            }
        })
    }, [usersData, usersData.isLoading, usersData.data])

    const handleChangePage = useCallback((event: React.MouseEvent<HTMLElement>, targetPage: number) => {
        event.preventDefault()
        navigate(`/users/${targetPage}${filter ? `?filter=${encodeURIComponent(filter)}` : ''}`)
    }, [])

    useEffect(() => {
        const actions = userActionsProvider.getActions()
        actions.forEach(action => action.setNavigate(navigate))
    }, [userActionsProvider])

    return (
        <div className='space-y-4'>
            <div className="flex flex-row justify-center gap-4">
                <Label htmlFor="search" className='sr-only'>Search</Label>
                <div className="relative w-full">
                    <Search className="absolute w-4 -translate-y-1/2 pointer-events-none left-3 top-1/2 text-muted-foreground" />
                    <Input
                        id="search" 
                        placeholder="Search" 
                        onChange={(e) => changeFilter(e.target.value)} 
                        className="w-full pl-9"
                    />
                </div>
            </div>
            <div className="flex flex-col flex-1">
                <DataTable
                    columns={columns}
                    data={getUsersData()}
                    pages={totalPages}
                />
            </div>
            <div>
                <Pagination>
                    <PaginationContent>
                        <RenderIf isTrue={currentPage > 1}>
                            <PaginationItem>
                                <PaginationPrevious href={`/users/${currentPage - 1}`} onClick={(e) => handleChangePage(e, currentPage - 1)}/>
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
                                    <PaginationLink href={`/users/${currentPage - 2}`} onClick={(e) => handleChangePage(e, currentPage-2)}>{ currentPage - 2 }</PaginationLink>
                                </PaginationItem>
                            </RenderIf>
                            <PaginationItem>
                                <PaginationLink href={`/users/${currentPage - 1}`} onClick={(e) => handleChangePage(e, currentPage - 1)}>{ currentPage - 1 }</PaginationLink>
                            </PaginationItem>
                        </RenderIf>
                        <PaginationItem>
                            <PaginationLink isActive>
                                { currentPage }
                            </PaginationLink>
                        </PaginationItem>
                        <RenderIf isTrue={currentPage < totalPages}>
                            <RenderIf isTrue={currentPage < totalPages}>
                                <PaginationItem>
                                    <PaginationLink href={`/users/${currentPage + 1}`} onClick={(e) => handleChangePage(e, currentPage + 1)} >{ currentPage + 1 }</PaginationLink>
                                </PaginationItem>
                            </RenderIf>
                            <RenderIf isTrue={currentPage < totalPages - 1}>
                                <PaginationItem>
                                    <PaginationLink href={`/users/${currentPage + 2}`} onClick={(e) => handleChangePage(e, currentPage + 2)} >{ currentPage + 2 }</PaginationLink>
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
                                <PaginationNext href={`/users/${currentPage + 1}`} onClick={(e) => handleChangePage(e, currentPage + 1)} />
                            </PaginationItem>
                        </RenderIf>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}

export default UsersComponent
