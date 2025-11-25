import { injectable } from 'inversify'
import { UserAction, UserActionContribution } from '../../common/contributions'
import type { User } from '@authlance/core/lib/browser/common/auth'
import { authlanceFactory, AdminApi } from '@authlance/core/lib/browser/common/authlance-sdk'
import { store } from '@authlance/core/lib/browser/store'
import { getOrCreateQueryClient } from '@authlance/core/lib/browser/query-client'
import { toast } from '@authlance/ui/lib/browser/hooks/use-toast'

const BAN_SUCCESS = 'User banned'
const UNBAN_SUCCESS = 'User unbanned'
const ERROR_TITLE = 'Unable to update user'
const ERROR_DESCRIPTION = 'Please try again or contact an administrator.'

@injectable()
export class BanUserActionContribution implements UserActionContribution {
    getAction(): UserAction {
        return {
            label: 'Toggle User State',
            getLabel: (user: User) => (this.isActive(user) ? 'Ban User' : 'Unban User'),
            setNavigate: () => {
                // No navigation required for this action.
            },
            isVisible: (authContext, user) => {
                if (!authContext.user) {
                    return false
                }
                if (authContext.user.roles && authContext.user.roles.includes('sysadmin') === false) {
                    return false
                }
                return Boolean(user.roles && user.roles.includes('sysadmin') === false)
            },
            action: (user: User) => {
                const work = async () => {
                    await this.toggleUserState(user)
                }
                work()
            },
        }
    }

    private createAdminApi(): AdminApi {
        const state = store.getState()
        const token = state.auth.personalAccessToken || state.auth.token
        return authlanceFactory.adminApi(token || undefined)
    }

    private async toggleUserState(user: User): Promise<void> {
        const adminApi = this.createAdminApi()
        const queryClient = getOrCreateQueryClient()
        const identifier = user.email || user.identity

        try {
            if (this.isActive(user)) {
                await adminApi.authlanceIdentityApiV1AdminUserIdentityBanPost(user.identity, {
                    revokeSessions: true,
                })
                toast({
                    title: BAN_SUCCESS,
                    description: `${identifier} has been moved to inactive state.`,
                })
            } else {
                await adminApi.authlanceIdentityApiV1AdminUserIdentityUnbanPost(user.identity)
                toast({
                    title: UNBAN_SUCCESS,
                    description: `${identifier} has been moved back to active state.`,
                })
            }
            await queryClient.invalidateQueries({ queryKey: ['duna-users'] })
            await queryClient.invalidateQueries({ queryKey: ['duna-user', `identity-${user.identity}`] })
        } catch (error) {
            console.error('Failed to toggle user state', error)
            toast({
                title: ERROR_TITLE,
                description: ERROR_DESCRIPTION,
                variant: 'destructive',
            })
        }
    }

    private isActive(user: User): boolean {
        return (user.state ?? 'active') === 'active'
    }
}
