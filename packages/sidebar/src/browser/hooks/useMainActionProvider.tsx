import { Container } from 'inversify'
import { useAppSelector } from '@authlance/core/lib/browser/store'
import { MainActionProvider } from '@authlance/core/lib/browser/common/ui-contributions'

const useMainActionProvider = () => {
    const container = useAppSelector((state) => state.app.container) as Container
    return container.get<MainActionProvider>(MainActionProvider)
}

export default useMainActionProvider
