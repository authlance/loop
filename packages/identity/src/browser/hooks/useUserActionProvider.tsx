import { useAppSelector } from '@authlance/core/lib/browser/store'
import { UserActionsProvider } from '../common/contributions'

const useUserActionsProvider = () => {
    const container = useAppSelector((state) => state.app.container)
    return container.get(UserActionsProvider) as UserActionsProvider
}

export default useUserActionsProvider
