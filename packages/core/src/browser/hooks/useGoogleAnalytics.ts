import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getRuntimeConfig } from '../runtime-config'

type GTagFunction = (...args: any[]) => void

declare global {
    interface Window {
        dataLayer?: unknown[]
        gtag?: GTagFunction
    }
}

let initializedMeasurementId: string | undefined

function initializeGoogleAnalytics(measurementId: string) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return
    }

    if (!document.querySelector(`script[data-ga-loader="${measurementId}"]`)) {
        const script = document.createElement('script')
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
        script.setAttribute('data-ga-loader', measurementId)
        document.head?.appendChild(script)
    }

    window.dataLayer = window.dataLayer || []

    if (typeof window.gtag !== 'function') {
        window.gtag = function gtag() {
            window.dataLayer = window.dataLayer || []
            window.dataLayer.push(arguments)
        }
    }

    window.gtag('js', new Date())
    window.gtag('config', measurementId, { send_page_view: false })
    initializedMeasurementId = measurementId
}

function trackPageView(measurementId: string, pagePath: string) {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
        return
    }

    window.gtag('config', measurementId, {
        page_path: pagePath,
    })
}

export function useGoogleAnalytics(): void {
    const location = useLocation()
    const measurementId = useMemo(() => {
        const rawId = getRuntimeConfig().googleAnalyticsMeasurementId
        if (typeof rawId !== 'string') {
            return undefined
        }
        const trimmed = rawId.trim()
        return trimmed.length > 0 ? trimmed : undefined
    }, [])

    useEffect(() => {
        if (!measurementId) {
            return
        }
        if (initializedMeasurementId === measurementId) {
            return
        }
        initializeGoogleAnalytics(measurementId)
    }, [measurementId])

    useEffect(() => {
        if (!measurementId) {
            return
        }
        const pagePath = `${location.pathname}${location.search}${location.hash}`
        trackPageView(measurementId, pagePath)
    }, [measurementId, location])
}
