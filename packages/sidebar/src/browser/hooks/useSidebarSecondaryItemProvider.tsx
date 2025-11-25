import { Container } from 'inversify'
import { useAppSelector } from '@authlance/core/lib/browser/store'
import { SecondaryItemProvider } from '@authlance/core/lib/browser/common/ui-contributions'

const useSidebarSecondaryItemProvider = () => {
    const container = useAppSelector((state) => state.app.container) as Container
    return container.get<SecondaryItemProvider>(SecondaryItemProvider)
}

export default useSidebarSecondaryItemProvider
