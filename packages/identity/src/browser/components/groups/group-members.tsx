import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
    addGroupMember,
    assignGroupMemberRoles,
    removeGroupMember,
    useGetGroup,
    useGetGroupMember,
    useGetGroupMembers,
} from '../../hooks/useGroups'
import { hasGroupRole, User } from '@authlance/core/lib/browser/common/auth'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    PaginationState,
    RowModel,
    RowSelectionState,
    useReactTable,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@authlance/ui/lib/browser/components/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@authlance/ui/lib/browser/components/dropdown-menu'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { MoreHorizontal } from 'lucide-react'
import RenderIf from '@authlance/core/lib/browser/components/RenderIf'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useGetRoles } from '../../hooks/useRoles'
import { MemberRoleRow } from '../roles/types'
import { Checkbox } from '@authlance/ui/lib/browser/components/checkbox'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@authlance/ui/lib/browser/components/pagination'
import { Input } from '@authlance/ui/lib/browser/components/input'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { Card, CardTitle, CardContent, CardDescription, CardFooter, CardHeader } from '@authlance/ui/lib/browser/components/card'
import { Label } from '@authlance/ui/lib/browser/components/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@authlance/ui/lib/browser/components/dialog'
import { useGroupContext } from '../../hooks/userGroupRoutes'
import { useAppDispatch } from '@authlance/core/lib/browser/store'
import { setRefreshTick } from '@authlance/core/lib/browser/store/slices/group-slice'
import { Avatar, AvatarFallback, AvatarImage } from '@authlance/ui/lib/browser/components/avatar'

interface GroupMemberRow {
    avatar: string
    group: string
    firstName: string
    lastName: string
    userRef: User
}

interface GroupMemberDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

function GroupMembersDataTable<TData, TValue>({ columns, data }: GroupMemberDataTableProps<TData, TValue>) {
    const [pagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const table = useReactTable({
        data,
        columns,
        state: {
            pagination,
        },
        manualPagination: false,
        manualFiltering: false,
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
                                        }
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

export const GroupMembers: React.FC<{ group: string }> = ({ group }) => {
    const { user, targetGroup, adminApi } = useContext(SessionContext)
    const navigate = useNavigate()
    const isMyGroup = targetGroup === group
    const { isLoading, data: groupMembers } = useGetGroupMembers(isMyGroup, group)
    const { isLoading: isLoadingGroup, data: groupData } = useGetGroup(isMyGroup, group)
    const [confirmRemoveUser, setConfirmRemoveUser] = React.useState<User | undefined>(undefined)
    const toast = useToast()
    const queryClient = useQueryClient()
    const groupContext = useGroupContext()
    const dispatch = useAppDispatch()

    const isAdmin = useMemo(() => {
        if (!user) {
            return false
        }
        return (
            user.roles.includes('sysadmin') ||
            user.roles.includes('admin') ||
            hasGroupRole('group-admin', group, user.groupRoles)
        )
    }, [user])

    const isSysAdmin = useMemo(() => {
        if (!user) {
            return false
        }
        return user.roles.includes('sysadmin')
    }, [user])

    const editGroupMemberRole = useCallback(
        async (userRef: User) => {
            if (!isAdmin) {
                return
            }
            navigate(`/group/${group}/edit-member/${userRef.identity}`)
        },
        [group, isAdmin, navigate]
    )

    const removeGroupMemberHandler = useCallback(
        async (userRef: User) => {
            if (!isAdmin) {
                return
            }
            try {
                await removeGroupMember(isMyGroup, group, userRef.identity, queryClient, adminApi!)
                toast.toast({
                    title: 'Member removed',
                    description: `User ${userRef.firstName} ${userRef.lastName} removed from group ${group}`,
                    variant: 'default',
                    duration: 5000,
                })
            } catch (error) {
                toast.toast({
                    title: 'Error removing member',
                    description: 'An error occurred while removing the member',
                    variant: 'destructive',
                    duration: 5000,
                })
            }
        },
        [isAdmin, adminApi, isMyGroup, group, queryClient, toast]
    )

    const avatarFallback = useMemo(() => {
        if (user && user.firstName && user.lastName && user.firstName.length > 0 && user.lastName.length > 0) {
            return user.firstName.charAt(0) + user.lastName.charAt(0)
        }
        if (user && user.firstName && user.firstName.length >= 2) {
            return user.firstName.substring(0, 2)
        }
        return 'NA'
    }, [user])

    const columns = useMemo(() => {
        const columnsDefs: ColumnDef<GroupMemberRow>[] = [
            {
                header: '',
                size: 10,
                accessorKey: 'avatar',
                cell: (cell) => {
                    const userRow = cell.row.original
                    return (
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={userRow.avatar} alt={userRow.firstName} />
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                        </Avatar>
                    )
                }
            },
            {
                header: 'Name',
                accessorKey: 'firstName',
                cell: (cell) => {
                    const userRow = cell.row.original
                    return (
                        <div className="flex flex-row items-center gap-2">
                            <Button variant="link" size="default" className='px-0' onClick={() => navigate(`/user/profile/${userRow.userRef.identity}`)}>
                                {userRow.firstName}
                            </Button>
                        </div>
                    )
                }
            },
            {
                header: 'Last Name',
                accessorKey: 'lastName',
            },
            {
                header: 'Email',
                accessorKey: 'userRef.email',
                cell: (cell) => {
                    const userRow = cell.row.original
                    return <span className="text-muted-foreground">{userRow.userRef.email}</span>
                },
            },
            {
                header: 'Admin',
                accessorKey: 'userRef',
                cell: (cell) => {
                    const userRow = cell.row.original
                    if (!userRow.userRef.groupRoles) {
                        return <span className="text-muted-foreground">No</span>
                    }
                    const isAdmin = hasGroupRole('group-admin', group, userRow.userRef.groupRoles)
                    return <span className={isAdmin ? 'text-green-500' : 'text-destructive'}>{isAdmin ? 'Yes' : 'No'}</span>
                },
            },
            {
                header: ({ column }) => <div className="w-full text-right"></div>,
                accessorKey: 'actions',
                size: 8,
                cell: (cell) => {
                    const userRow = cell.row.original

                    if (!isAdmin) {
                        return <></>
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
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setConfirmRemoveUser(userRow.userRef)
                                        }}
                                    >
                                        Remove Member
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => editGroupMemberRole(userRow.userRef)}>
                                        Edit Roles
                                    </DropdownMenuItem>
                                    <RenderIf isTrue={isSysAdmin}>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                if (!userRow.userRef.identity) {
                                                    return
                                                }
                                                navigate(`/user/profile/${userRow.userRef.identity}`)
                                            }}
                                        >
                                            View Profile
                                        </DropdownMenuItem>
                                    </RenderIf>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                },
            },
        ]
        return columnsDefs
    }, [user, isAdmin, group, isSysAdmin])

    const getUsersData = useCallback((): GroupMemberRow[] => {
        if (!groupMembers || !group) {
            return []
        }
        const rows = groupMembers.map((member) => ({
            avatar: member.avatar || '',
            group: group,
            firstName: member.firstName || '',
            lastName: member.lastName || '',
            userRef: member,
        }))
        return rows
    }, [groupMembers, group])

    useEffect(() => {
        if (!groupData) {
            groupContext.setGroup(undefined)
            dispatch(setRefreshTick())
            return
        }
        groupContext.setGroup(groupData)
        dispatch(setRefreshTick())
    }, [groupData, groupContext, dispatch])

    if (isLoading || !groupMembers || isLoadingGroup || !groupData) {
        return (
            <DefaultDashboardContent loading={true} />
        )
    }

    return (
        <div className="flex flex-col flex-1 h-full">
            <div className="flex flex-col flex-1 gap-4">
                <GroupMembersDataTable columns={columns} data={getUsersData()} />
            </div>
            <Dialog open={!!confirmRemoveUser} onOpenChange={() => setConfirmRemoveUser(undefined)}>
            <DialogContent>
                <DialogTitle>Remove Member</DialogTitle>
                <DialogDescription>
                Are you sure you want to remove{' '}
                <strong>{confirmRemoveUser?.firstName} {confirmRemoveUser?.lastName}</strong>
                {' '}from group <strong>{group}</strong>?
                </DialogDescription>
                <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmRemoveUser(undefined)}>Cancel</Button>
                <Button
                    variant="destructive"
                    onClick={async () => {
                    if (confirmRemoveUser) {
                        await removeGroupMemberHandler(confirmRemoveUser)
                        setConfirmRemoveUser(undefined)
                    }
                    }}
                >
                    Remove
                </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
    )
}

const addGroupMemberFormSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
})

export type AddGroupMemberFormValues = z.infer<typeof addGroupMemberFormSchema>

export const AddGroupMember: React.FC<{ group: string }> = ({ group }) => {
    const { user, targetGroup, adminApi } = useContext(SessionContext)
    const navigate = useNavigate()
    const isMyGroup = targetGroup === group
    const { isLoading, data: groupData } = useGetGroup(isMyGroup, group)
    const toast = useToast()
    const queryClient = useQueryClient()
    const groupContext = useGroupContext()
    const dispatch = useAppDispatch()

    const isAdmin = useMemo(() => {
        if (!user) {
            return false
        }
        return (
            user.roles.includes('sysadmin') ||
            user.roles.includes('admin') ||
            hasGroupRole('group-admin', group, user.groupRoles)
        )
    }, [user, group])

    const onSubmit = useCallback(
        async (data: AddGroupMemberFormValues) => {
            if (!isAdmin) {
                return
            }
            try {
                const response = await addGroupMember(isMyGroup, group, data.firstName, data.lastName, data.email, queryClient, adminApi!)
                if (response.error) {
                    toast.toast({
                        title: 'Error adding member',
                        description: response.error,
                        variant: 'destructive',
                        duration: 5000,
                    })
                    return
                }
                toast.toast({
                    title: 'Member added',
                    description: `User ${data.firstName} ${data.lastName} added to group ${group}`,
                    variant: 'default',
                    duration: 5000,
                })
                navigate(`/group/${group}/members`)
            } catch (error) {
                console.error('Error adding member:', error)
                toast.toast({
                    title: 'Error adding member',
                    description: 'An error occurred while adding the member',
                    variant: 'destructive',
                    duration: 5000,
                })
            }
        },
        [isMyGroup, user, group, navigate, isAdmin, toast, queryClient, adminApi]
    )

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<AddGroupMemberFormValues>({
        resolver: zodResolver(addGroupMemberFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
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

    if (isLoading || !groupData) {
        return (
            <DefaultDashboardContent loading={isLoading} />
        )
    }

    return (
        <Card className="w-full md:max-w-2xl">
            <CardHeader>
                <CardTitle>Member Information</CardTitle>
                <CardDescription>Fill in the details below to add a new member to the group.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-2">
                        <div>
                            <Label htmlFor="firstName">
                                First Name
                            </Label>
                            <Input
                                id="firstName"
                                type="text"
                                {...register('firstName')}
                            />
                            {errors.firstName && (
                                <p className="mt-2 text-sm text-destructive">{errors.firstName.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="lastName">
                                Last Name
                            </Label>
                            <Input
                                id="lastName"
                                type="text"
                                {...register('lastName')}
                            />
                            {errors.lastName && <p className="mt-2 text-sm text-destructive">{errors.lastName.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                            />
                            {errors.email && <p className="mt-2 text-sm text-destructive">{errors.email.message}</p>}
                        </div>
                    </div>
                    <div className="flex justify-start">
                        <Button type="submit" disabled={!isValid}>
                            Add Member
                        </Button>
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <div>
                    <p className="text-sm text-muted-foreground">
                        After adding the member, you can assign roles and permissions in the group settings.
                    </p>
                </div>
            </CardFooter>
        </Card>
    )
}

interface MemberRolesDataTableProps<TData, TValue> {
    pages: number
    currentPage: number
    setCurrentPage: (page: number) => void
    currentFilter: string | undefined
    rowSelection: RowSelectionState
    setRowSelection: (rowSelection: RowSelectionState) => void
    roleSelectionChanged: (row: RowModel<MemberRoleRow>) => void
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

function MemberRolesDataTable<TData, TValue>({
    columns,
    data,
    rowSelection,
    setRowSelection,
    roleSelectionChanged,
    pages,
    currentPage,
    setCurrentPage,
}: MemberRolesDataTableProps<TData, TValue>) {
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

export const EditGroupMember: React.FC<{ group: string; identity: string }> = ({ group, identity }) => {
    const { user, targetGroup, debouncer, adminApi } = useContext(SessionContext)
    const navigate = useNavigate()
    const isMyGroup = targetGroup === group
    const { isLoading, data: groupData } = useGetGroup(isMyGroup, group)
    const [filter, setFilter] = useState<string | undefined>(undefined)
    const [currentPage, setCurrentPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [roleAssignSelection, setRoleAssignSelection] = useState({} as RowSelectionState)
    const [assignRolesModel, setAssignRolesModel] = useState<RowModel<MemberRoleRow> | undefined>(undefined)
    const { isLoading: isLoadingRoles, data: rolesData } = useGetRoles(
        user,
        currentPage,
        false,
        filter ? { filter, perPage: '10' } : { perPage: '10' }
    )
    const { isLoading: isLoadingMember, data: memberData } = useGetGroupMember(isMyGroup, group, identity)
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

    const rows = useMemo(() => {
        if (!rolesData || !memberData) {
            return []
        }

        const allRoles = rolesData.roles.map((role) => ({
            role: role,
            group: group,
            userRef: memberData.user,
        }))

        return allRoles
    }, [rolesData, memberData, group])

    useEffect(() => {
        if (!memberData || !rows.length) {
            return
        }

        const selected: RowSelectionState = {}
        rows.forEach((row, index) => {
            const isAssigned = memberData.groupRoles.some((gr) => gr.group === group && gr.role === row.role)
            if (isAssigned) {
                selected[index.toString()] = true
            }
        })

        setRoleAssignSelection(selected)
    }, [memberData, rows, group, setRoleAssignSelection])

    const columns = useMemo(() => {
        const columnsDefs: ColumnDef<MemberRoleRow>[] = [
            {
                id: 'select',
                size: 16,
                header: ({ column }) => <div className="w-full text-left"></div>,
                cell: ({ row }) => (
                    <Checkbox
                        className="my-4 max-w-4"
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
    }, [memberData])

    const handleAssignRoles = useCallback(async () => {
        if (!memberData) {
            return
        }
        if (assignRolesModel) {
            const selectedRoles = assignRolesModel.rows.map((row) => row.original.role)
            const response = await assignGroupMemberRoles(
                isMyGroup,
                group,
                memberData.user.identity,
                selectedRoles,
                queryClient,
                adminApi
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
                description: `Roles assigned to ${memberData.user.firstName} ${memberData.user.lastName} in group ${group}`,
                variant: 'default',
                duration: 5000,
            })
            navigate(`/group/${group}/members`)
        }
    }, [assignRolesModel, memberData, group, queryClient, isMyGroup, toast, adminApi])

    useEffect(() => {
        if (rolesData) {
            setPages(rolesData.pages)
        }
    }, [rolesData])

    if (isLoading || !groupData || isLoadingMember || !memberData || isLoadingRoles || !rolesData) {
        return <DefaultDashboardContent />
    }

    return (
        <div className='space-y-4'>
            <div>
                <div className="flex flex-row justify-between">
                    <h2 className="text-lg font-medium">
                        <span className='text-foreground/70'>Group</span> {groupData.longName && groupData.longName !== '' ? groupData.longName : groupData.name}
                    </h2>
                </div>
                <div className="flex flex-row justify-between">
                    <h2 className="text-lg font-medium">
                        <span className='text-foreground/70'>Edit Member Roles for</span> {memberData.user.firstName} {memberData.user.lastName}
                    </h2>
                </div>
            </div>
            
            <div className="flex flex-col justify-center flex-1 gap-4">
                <Input
                    placeholder="Search"
                    onChange={(e) => changeFilter(e.target.value)}
                    className="w-full"
                ></Input>
            </div>
            <MemberRolesDataTable
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
