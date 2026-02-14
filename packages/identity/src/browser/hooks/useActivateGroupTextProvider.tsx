import { useAppSelector } from '@authlance/core/lib/browser/store'
import { ActivateGroupTextProvider } from '../common/contributions'

const useActivateGroupTextProvider = () => {
    const container = useAppSelector((state) => state.app.container)
    if (!container || !container.isBound(ActivateGroupTextProvider)) {
        return undefined
    }
    return container.get(ActivateGroupTextProvider) as ActivateGroupTextProvider
}

export default useActivateGroupTextProvider
