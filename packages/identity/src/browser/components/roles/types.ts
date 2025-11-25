import { User } from "@authlance/core/lib/browser/common/auth"

export interface RoleRow {
    role: string
    userRef: User
}

export interface MemberRoleRow {
    role: string
    group: string
    userRef: User
}
