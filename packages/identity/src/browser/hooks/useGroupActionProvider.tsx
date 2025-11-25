import { useAppSelector } from '@authlance/core/lib/browser/store'
import { GroupActionsProvider } from '../common/contributions'

const useGroupActionsProvider = () => {
    const container = useAppSelector((state) => state.app.container)
    return container.get(GroupActionsProvider) as GroupActionsProvider
}

export default useGroupActionsProvider
