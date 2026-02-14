import { useAppSelector } from '@authlance/core/lib/browser/store'
import { TierSelectionUIProvider } from '../common/contributions'

const useTierSelectionUIProvider = () => {
    const container = useAppSelector((state) => state.app.container)
    if (!container || !container.isBound(TierSelectionUIProvider)) {
        return undefined
    }
    return container.get(TierSelectionUIProvider) as TierSelectionUIProvider
}

export default useTierSelectionUIProvider
