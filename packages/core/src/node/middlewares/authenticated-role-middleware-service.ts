import { injectable, inject } from 'inversify'
import * as jwt from 'jsonwebtoken'
import express from 'express'
import { ApplicationConfigProvider } from '../backend-application'

@injectable()
export abstract class AuthenticatedRoleMiddlewareService {
    constructor(
        @inject(ApplicationConfigProvider) protected readonly appConfig: ApplicationConfigProvider
    ) { }

    // Each subclass will implement this to define the role it requires
    protected abstract getRequiredRole(): string

    public authenticate(req: express.Request, res: express.Response, next: express.NextFunction): void {
        const authHeader = req.headers['authorization'] || req.headers['Authorization']
        let token: string | undefined = undefined
        if (authHeader) {
            token = authHeader.toString().replace('Bearer ', '')
        }

        if (!token) {
            token = req.cookies['loopToken']
        }
        if (!token) {
            res.status(401).send('Unauthorized')
            return
        }

        try {
            const decoded = jwt.verify(token, this.appConfig.config.jwtSecret)
            if (typeof decoded === 'object' && decoded !== null) {
                req.user = decoded.user
                next()
            } else {
                throw new Error('Invalid token payload')
            }
        } catch (error) {
            res.status(401).send('Unauthorized')
        }
    }
}
