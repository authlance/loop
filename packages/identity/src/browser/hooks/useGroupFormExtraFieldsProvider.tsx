import { useAppSelector } from '@authlance/core/lib/browser/store'
import { GroupFormExtraFieldsProvider } from '../common/contributions'

const useGroupFormExtraFieldsProvider = () => {
    const container = useAppSelector((state) => state.app.container)
    if (!container || !container.isBound(GroupFormExtraFieldsProvider)) {
        return undefined
    }
    return container.get(GroupFormExtraFieldsProvider) as GroupFormExtraFieldsProvider
}

export default useGroupFormExtraFieldsProvider
