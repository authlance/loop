import React, { useContext, useEffect, useMemo, useState } from 'react'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getOrCreateQueryClient } from '@authlance/core/lib/browser/query-client'
import { Toaster } from '@authlance/ui/lib/browser/components/toaster'
import { useGetMyGroups } from '../../hooks/useGroups'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { useNavigate } from 'react-router-dom'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { Avatar, AvatarFallback, AvatarImage } from '@authlance/ui/lib/browser/components/avatar'
import { Group } from '@authlance/core/lib/browser/common/auth'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@authlance/ui/lib/browser/components/card'
import useGroupSelectionProvider from '../../hooks/useGroupSelectionProvider'
import useGroupSelectionUIProvider from '../../hooks/useGroupSelectionUIProvider'

export const GroupSelectionComponent: React.FC<Record<string, never>> = () => {
    const authSession = useContext(SessionContext)
    const navigate = useNavigate()
    const { isLoading, data: groups } = useGetMyGroups(authSession.user ? authSession.user.identity : '')
    const groupSelectionProvider = useGroupSelectionProvider()
    const selectionHandler = useMemo(() => groupSelectionProvider.getHandler(), [groupSelectionProvider])

    const handleGroupSelection = (group: Group) => {
        selectionHandler.onGroupSelected(group, authSession, navigate)
    }

    useEffect(() => {
        if (isLoading) {
            return
        }

        if (groups && groups.length === 0) {
            navigate(`/`)
        }
    }, [groups, isLoading])

    if (isLoading) {
        return <DefaultDashboardContent loading={isLoading} />
    }

    return (
        <div className="flex justify-center w-full h-full px-4 py-8">
            <Card className="w-full max-w-2xl flex flex-col max-h-[600px]">
                <CardHeader>
                    <CardTitle className='text-xl'>Select a Group</CardTitle>
                    <CardDescription>Please select a group to continue.</CardDescription>
                </CardHeader>

                <CardContent className="overflow-y-auto grow">
                    <div className="flex flex-col items-center w-full space-y-4">
                        {groups && groups.length > 0 ? (
                            groups.map((group) => (
                                <div
                                    key={group.id}
                                    className="flex items-center justify-between w-full max-w-2xl p-4 border rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={group.avatar} alt={group.name} />
                                            <AvatarFallback>{group.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-lg font-medium">{group.longName || group.name}</div>
                                            <div className="text-sm text-muted-foreground">{group.description}</div>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleGroupSelection(group)}>Go</Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground">No groups available.</div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-start">
                    <Button onClick={() => navigate('/create-organization')}>New Group</Button>
                </CardFooter>
            </Card>
        </div>
    )
}

interface GroupContextComponentProps {
    queryClient?: QueryClient
}

export const GroupContextComponent: React.FC<GroupContextComponentProps> = ({ queryClient }) => {
    const authSession = useContext(SessionContext)
    const [authenticated, setAuthenticated] = useState(false)
    const groupSelectionUIProvider = useGroupSelectionUIProvider()
    const contributedUI = useMemo(() => groupSelectionUIProvider?.getGroupSelectionUI(), [groupSelectionUIProvider])

    useEffect(() => {
        if (!authSession.user) {
            setAuthenticated(false)
        } else {
            setAuthenticated(true)
        }
    }, [authSession.user])

    if (!authenticated) {
        return <></>
    }

    return (
        <QueryClientProvider client={queryClient ?? getOrCreateQueryClient()}>
            {contributedUI ? contributedUI.getContent(authSession) : <GroupSelectionComponent />}
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
