import React, { useContext, useEffect } from 'react'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import Page, { PageContent } from '@authlance/core/lib/browser/components/layout/Page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@authlance/ui/lib/browser/components/card'
import { useNavigate } from 'react-router-dom'
import { useBrandIcon } from '@authlance/core/lib/browser/hooks/useBrand'

const Denied = () => {
    const { user, isSysAdmin } = useContext(SessionContext)
    const navigate = useNavigate()
    const brandicon = useBrandIcon()
    
    useEffect(() => {
        if (isSysAdmin) {
            navigate('/')
        }
    }, [isSysAdmin, navigate])


    return (
        <Page>
            <PageContent>
                <div className="flex justify-center">
                    <Card>
                        <CardHeader>
                            <CardTitle>Access denied</CardTitle>
                            <CardDescription>{`${ user && user.firstName ? (<span>${user.firstName + (user.lastName ? ` ${user.lastName})` : '')} is not authorized</span>): (<span>User is not authorized</span>)}`}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PageContent>
                                <div className="flex justify-center"><img height={64} width={64} src={brandicon} /></div>
                            </PageContent>
                        </CardContent>
                    </Card>
                </div>
            </PageContent>
        </Page>
    )
}

export default Denied
