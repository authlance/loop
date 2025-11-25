import { Container } from 'inversify'
import { useAppSelector } from '@authlance/core/lib/browser/store'
import { PaymentsReportContext } from '../common/types'

export const usePaymentsReportContext = () => {
    const container = useAppSelector((state) => state.app.container) as Container
    return container.get<PaymentsReportContext>(PaymentsReportContext)
}
