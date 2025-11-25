import { useState } from 'react'
import { useAppSelector } from '../store'
import { Emitter } from '../../common'
import { User, UserEventEmitter } from '../common/auth'

export const useUserEmmiter = () => {
    const container = useAppSelector((state) => state.app.container)
    const [ userEmitter, setUserEmitter ] = useState<Emitter<User | undefined> | undefined>(undefined)

    if (container && !userEmitter) {
        setUserEmitter(container.get(UserEventEmitter) as Emitter<User | undefined>)
    }

    return userEmitter
}
