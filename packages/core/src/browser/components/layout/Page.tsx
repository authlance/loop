import React, { PropsWithChildren } from 'react'

interface PageProps extends PropsWithChildren<{}> {}

const Page: React.FC<PageProps> = ({ children }) => (
    <div className="flex">
        {children}
    </div>
)

export default Page

export const PageContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <article className="w-full">{children}</article>
)

export const SinglePage: React.FC<PageProps> = ({ children }) => (
    <div className="flex justify-center h-full">
        <div className="w-full h-full overflow-hidden">
            <div className="flex items-center justify-center w-full h-full overflow-auto">
                {children}
            </div>
        </div>
    </div>
)
