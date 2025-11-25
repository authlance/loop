import { Container } from 'inversify'
import { useAppSelector } from "@authlance/core/lib/browser/store"
import { LicenseProductContext } from '../common/types'


export const useLicenseProductContext = () => {
    const container = useAppSelector((state) => state.app.container) as Container
    return container.get<LicenseProductContext>(LicenseProductContext)
}
