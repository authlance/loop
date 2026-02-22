import { useAppSelector } from '@authlance/core/lib/browser/store'
import { TierSelectionVisibilityProvider } from '../common/contributions'

const useTierSelectionVisibilityProvider = () => {
    const container = useAppSelector((state) => state.app.container)
    if (!container || !container.isBound(TierSelectionVisibilityProvider)) {
        return undefined
    }
    return container.get(TierSelectionVisibilityProvider) as TierSelectionVisibilityProvider
}

export default useTierSelectionVisibilityProvider
