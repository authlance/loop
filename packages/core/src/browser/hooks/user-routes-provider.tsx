import { Container } from 'inversify'
import { RoutesProvider } from '../../common/routes/routes'
import { useAppSelector } from '../store'

const useRoutesProvider = () => {
    const container = useAppSelector((state) => state.app.container) as Container
    return container.get<RoutesProvider>(RoutesProvider)
}

export default useRoutesProvider
