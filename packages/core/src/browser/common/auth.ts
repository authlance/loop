import cookie from 'cookie'
import { AxiosRequestConfig } from 'axios'
import type { CommonIdentityState } from '@authlance/common/lib/common/authlance-client/api'

export interface GroupRole {
    group: string
    user: string
    role: string
}

export interface User {
    identity: string
    firstName: string | undefined
    lastName: string | undefined
    avatar: string | undefined
    birthDate?: string
    gender?: 'male' | 'female' | 'other'
    email: string
    roles: string[]
    groups: string[]
    groupRoles: GroupRole[]
    state?: CommonIdentityState
}

export interface Group {
    id: number
    name: string
    longName: string
    avatar?: string
    homeUrl?: string
    description?: string
}

export const hasGroupRole = (role: string, targetGroup: string, roles: GroupRole[]): boolean => {
    return roles.some((r) => r.group === targetGroup && r.role === role)
}

export const UserEventEmitter = Symbol('UserEventEmitter')

export const getRequestHeaders = (): AxiosRequestConfig<any> | undefined => {
    if (typeof window === 'undefined') {
        return undefined
    }
    if (window && window.document) {
        const cookies = cookie.parse(document.cookie)
        if (cookies['loopToken']) {
            return { headers: { Authorization: 'Bearer ' + cookies['loopToken'] } }
        }
    }
    return undefined
}
