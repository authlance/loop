import { useAppSelector } from '@authlance/core/lib/browser/store'
import { ActivateGroupFormProvider } from '../common/contributions'

const useActivateGroupFormProvider = () => {
    const container = useAppSelector((state) => state.app.container)
    if (!container || !container.isBound(ActivateGroupFormProvider)) {
        return undefined
    }
    return container.get(ActivateGroupFormProvider) as ActivateGroupFormProvider
}

export default useActivateGroupFormProvider
