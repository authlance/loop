import { LicenseOperatorError } from '../../common/licenses-sdk'

export interface SeatLimitErrorContext {
    message: string
    seatLimit?: number
    required?: number
}

const parseDetailsObject = (details: unknown): Record<string, unknown> | undefined => {
    if (!details) {
        return undefined
    }
    if (typeof details === 'string') {
        try {
            const parsed = JSON.parse(details)
            if (parsed && typeof parsed === 'object') {
                return parsed as Record<string, unknown>
            }
        } catch {
            return undefined
        }
    }
    if (typeof details === 'object') {
        return details as Record<string, unknown>
    }
    return undefined
}

export const extractSeatLimitError = (error: LicenseOperatorError): SeatLimitErrorContext | undefined => {
    const payload = parseDetailsObject(error.details)
    if (!payload) {
        return undefined
    }
    const code = typeof payload.error === 'string' ? payload.error : undefined
    if (code !== 'seat_limit_exceeded') {
        return undefined
    }
    const seatLimit = typeof payload.seatLimit === 'number' ? payload.seatLimit : undefined
    const required = typeof payload.required === 'number' ? payload.required : undefined
    const message =
        typeof payload.message === 'string' && payload.message.trim() !== ''
            ? payload.message.trim()
            : 'Activating this product would exceed the licensed seat allocation.'
    return { message, seatLimit, required }
}
