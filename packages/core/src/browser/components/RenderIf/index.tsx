import React, { ReactNode } from 'react'

interface RenderIfProps {
  isTrue?: boolean
  children: ReactNode
}

const RenderIf = ({ isTrue, children }: RenderIfProps) => {
  if (isTrue) {
    return <>{children}</>
  }
  return null
}

export default RenderIf
