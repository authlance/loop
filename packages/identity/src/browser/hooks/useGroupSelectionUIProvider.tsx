import { useAppSelector } from '@authlance/core/lib/browser/store'
import { GroupSelectionUIProvider } from '../common/contributions'

const useGroupSelectionUIProvider = () => {
    const container = useAppSelector((state) => state.app.container)
    if (!container || !container.isBound(GroupSelectionUIProvider)) {
        return undefined
    }
    return container.get(GroupSelectionUIProvider) as GroupSelectionUIProvider
}

export default useGroupSelectionUIProvider
