import * as React from 'react'

import { setTheme, ThemeColors } from '../store/slices/app-slice'
import { useAppDispatch, useAppSelector } from '../store'

interface LayoutContainerProps {
    theme: ThemeColors
    setThemeLayout: (theme: ThemeColors) => void
}

interface LayoutContainerRenderProps {
    render?: (props: LayoutContainerProps) => React.ReactElement
    children?: (props: LayoutContainerProps) => React.ReactElement
}

const LayoutContainer: React.FC<LayoutContainerRenderProps> = ({ render, children }) => {
    const { theme } = useAppSelector((state) => state.app)
    const dispatch = useAppDispatch()

    const setThemeLayout = (color: ThemeColors) => dispatch(setTheme(color))

    if (render) {
        return render({ theme, setThemeLayout })
    }

    if (children) {
        return children({ theme, setThemeLayout })
    }

    return <></>
}

export default LayoutContainer
