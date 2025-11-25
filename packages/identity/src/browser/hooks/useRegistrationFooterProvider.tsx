import { useAppSelector } from '@authlance/core/lib/browser/store'
import { RegistrationFooterProvider } from '../common/contributions'

const useRegistrationFooterProvider = () => {
    const container = useAppSelector((state) => state.app.container)
    if (!container || !container.isBound(RegistrationFooterProvider)) {
        return undefined
    }
    return container.get(RegistrationFooterProvider) as RegistrationFooterProvider
}

export default useRegistrationFooterProvider
