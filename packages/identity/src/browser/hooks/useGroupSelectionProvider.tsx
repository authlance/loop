import { useAppSelector } from '@authlance/core/lib/browser/store'
import { GroupSelectionProvider } from '../common/contributions'

const useGroupSelectionProvider = () => {
    const container = useAppSelector((state) => state.app.container)
    return container.get(GroupSelectionProvider) as GroupSelectionProvider
}

export default useGroupSelectionProvider
