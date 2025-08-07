import { AbsoluteCenter } from '@chakra-ui/react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AbsoluteCenter>
      <main>{children}</main>
    </AbsoluteCenter>
  )
}
