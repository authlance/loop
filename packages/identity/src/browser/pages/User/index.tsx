import React, { useContext, useEffect, useState } from 'react'
import { injectable } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { useParams } from 'react-router-dom'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { User } from '@authlance/core/lib/browser/common/auth'
import { useGetUser } from '../../hooks/useUser'
import ProfileSettings from '../../components/profile-settings-component'
import RenderIf from '@authlance/core/lib/browser/components/RenderIf'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'

function UserProfilePage() {
    const { userId } = useParams<{ userId?: string }>()
    const { user } = useContext(SessionContext)
    const [ targetUser, setTargetUser ] = useState<User | undefined>( !userId ? user : undefined )
    const targetUserData = useGetUser(userId || '')

    useEffect(() => {
        if (userId && userId !== '' && targetUserData && targetUserData.data) {
            setTargetUser(targetUserData.data)
        }
    }, [userId, targetUserData])

    return (
        <>
            <RenderIf isTrue={ Boolean(targetUser) }>
                <ProfileSettings user={targetUser!} />
            </RenderIf>
            <RenderIf isTrue={ !Boolean(targetUser) }>
                <DefaultDashboardContent loading={true} />
            </RenderIf>
        </>
    )
}

const MyProfilePage: React.FC<{}> = () => {
    const { user } = useContext(SessionContext)

    return (
        <>
            <RenderIf isTrue={ Boolean(user) }>
                <ProfileSettings user={user!} />
            </RenderIf>
            <RenderIf isTrue={ !Boolean(user) }>
                <DefaultDashboardContent />
            </RenderIf>
        </>
    )
}

@injectable()
export class MyUserProfilePageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/user/profile',
            component: MyProfilePage,
            navBar: false,
            name: 'Profile Settings',
            exact: true,
            root: false,
            canGoBack: true,
            authRequired: true,
            forceParent: '/'
        }
    }
}

@injectable()
export class UserProfilePageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/user/profile/:userId',
            component: UserProfilePage,
            navBar: false,
            name: 'User Profile Settings',
            roles: ['sysadmin'],
            exact: true,
            root: false,
            canGoBack: true,
            authRequired: true,
            forceParent: '/'
        }
    }
}

export default UserProfilePage

