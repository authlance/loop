import { interfaces } from 'inversify'

export interface ServerRenderContainerProvider {
    getContainer(): interfaces.Container
    /**
     * Returns a monotonically increasing version that changes whenever the container instance changes.
     */
    getVersion(): number
    setContainer(container: interfaces.Container): void
}

export class MutableServerRenderContainerProvider implements ServerRenderContainerProvider {
    protected container: interfaces.Container | undefined
    protected version = 0

    getContainer(): interfaces.Container {
        if (!this.container) {
            throw new Error('Server render container has not been initialized')
        }
        return this.container
    }

    getVersion(): number {
        return this.version
    }

    setContainer(container: interfaces.Container): void {
        this.container = container
        this.version++
    }
}
