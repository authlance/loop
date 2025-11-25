export const parseJsonRecord = (input: string, fieldName: string): Record<string, string> | undefined => {
    const trimmed = input.trim()
    if (trimmed === '') {
        return undefined
    }
    try {
        const parsed = JSON.parse(trimmed)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error(`${fieldName} must be a JSON object.`)
        }
        const record: Record<string, string> = {}
        for (const [key, value] of Object.entries(parsed)) {
            if (value === undefined || value === null) {
                continue
            }
            record[String(key)] = typeof value === 'string' ? value : String(value)
        }
        return Object.keys(record).length > 0 ? record : undefined
    } catch (error) {
        throw new Error(`${fieldName} must be valid JSON.`)
    }
}

export const parseUnitAmount = (value: string) => {
    const trimmed = value.trim()
    if (trimmed === '') {
        throw new Error('Price is required.')
    }
    if (trimmed.includes('.')) {
        const parsedFloat = Number.parseFloat(trimmed)
        if (Number.isNaN(parsedFloat)) {
            throw new Error('Price must be a valid number.')
        }
        return Math.round(parsedFloat * 100)
    }
    const parsed = Number.parseInt(trimmed, 10)
    if (Number.isNaN(parsed)) {
        throw new Error('Price must be a valid number.')
    }
    return parsed
}

export const parsePositiveIntegerField = (value: string, field: string, fallback?: number) => {
    const trimmed = value.trim()
    if (trimmed === '') {
        if (fallback !== undefined) {
            return fallback
        }
        throw new Error(`${field} is required.`)
    }
    const parsed = Number.parseInt(trimmed, 10)
    if (Number.isNaN(parsed) || parsed <= 0) {
        throw new Error(`${field} must be a whole number greater than zero.`)
    }
    return parsed
}

export const parseOptionalPositiveIntegerField = (value: string, field: string) => {
    const trimmed = value.trim()
    if (trimmed === '') {
        return undefined
    }
    const parsed = Number.parseInt(trimmed, 10)
    if (Number.isNaN(parsed) || parsed <= 0) {
        throw new Error(`${field} must be a whole number greater than zero.`)
    }
    return parsed
}

export const parseNonNegativeIntegerField = (value: string, field: string, fallback = 0) => {
    const trimmed = value.trim()
    if (trimmed === '') {
        return fallback
    }
    const parsed = Number.parseInt(trimmed, 10)
    if (Number.isNaN(parsed) || parsed < 0) {
        throw new Error(`${field} must be zero or a positive number.`)
    }
    return parsed
}

export const parseOptionalUnitAmount = (value: string, field: string) => {
    const trimmed = value.trim()
    if (trimmed === '') {
        return undefined
    }
    let amount: number
    if (trimmed.includes('.')) {
        const parsedFloat = Number.parseFloat(trimmed)
        if (Number.isNaN(parsedFloat)) {
            throw new Error(`${field} must be a valid number.`)
        }
        amount = Math.round(parsedFloat * 100)
    } else {
        const parsed = Number.parseInt(trimmed, 10)
        if (Number.isNaN(parsed)) {
            throw new Error(`${field} must be a valid number.`)
        }
        amount = parsed
    }
    if (amount <= 0) {
        throw new Error(`${field} must be greater than zero.`)
    }
    return amount
}

export const parseOptionalPositiveFloatField = (value: string, field: string) => {
    const trimmed = value.trim()
    if (trimmed === '') {
        return undefined
    }
    const parsed = Number.parseFloat(trimmed)
    if (Number.isNaN(parsed) || parsed <= 0) {
        throw new Error(`${field} must be greater than zero.`)
    }
    return parsed
}
