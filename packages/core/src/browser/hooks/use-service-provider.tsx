import { ServiceProvider } from '../../common/services/service-provider'
import { useAppSelector } from '../store'

const useServiceProvider = () => {
    const container = useAppSelector((state) => state.app.container)
    if (!container) {
        throw new Error('Service provider container is not initialized');
    }
    return container.get<ServiceProvider>(ServiceProvider)
}

export default useServiceProvider
