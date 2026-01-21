export const dynamic = 'force-dynamic'

import { AbsoluteCenter } from '@chakra-ui/react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AbsoluteCenter width="full" zIndex={10} background={'white'}>
      {children}
    </AbsoluteCenter>
  )
}
