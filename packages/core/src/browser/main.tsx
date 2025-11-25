import * as React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import Main, { MainProps } from './start'

if (typeof document !== 'undefined') {
    // Load font only when running in the browser so server-side prerendering can skip CSS imports.
    require('typeface-ibm-plex-sans')
}

export interface RenderStartOptions {
    elementId?: string
    hydrate?: boolean
    mainProps?: MainProps
}

export const renderStart = (options?: RenderStartOptions) => {
    if (typeof document === 'undefined') {
        return
    }
    const target = document.getElementById(options?.elementId ?? 'loop-preload')
    if (!target) {
        throw new Error('Loop preload element not found')
    }
    const app = <Main {...(options?.mainProps ?? {})} />
    const shouldHydrate = options?.hydrate ?? target.hasChildNodes()
    if (shouldHydrate) {
        hydrateRoot(target, app)
        return
    }
    if (target.hasChildNodes()) {
        target.innerHTML = ''
    }
    createRoot(target).render(app)
}
