import { Container } from 'inversify'
import { useAppSelector } from '@authlance/core/lib/browser/store'
import { GroupContext } from '../common/common'

export const useGroupContext = () => {
    const container = useAppSelector((state) => state.app.container) as Container
    return container.get<GroupContext>(GroupContext)
}
