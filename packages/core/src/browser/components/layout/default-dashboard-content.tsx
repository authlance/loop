import React from 'react'
import { useBrandIcon } from '../../hooks/useBrand'
import RenderIf from '../RenderIf'
import { SinglePage } from './Page'

export const DefaultDashboardContent: React.FC<{ loading?: boolean }> = ({ loading }) => {
    const brandIcon = useBrandIcon()

    return (
        <SinglePage>
            <div className={'flex flex-col justify-center items-center h-full absolute top-0 left-0 w-full bg-background/35'}>
                <div>
                    <img height={64} width={64} src={brandIcon} />
                </div>
                <RenderIf isTrue={loading === true}>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </RenderIf>
            </div>
        </SinglePage>
    )
}
