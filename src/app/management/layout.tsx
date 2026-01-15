import { redirect } from 'next/navigation'
import { getAuthUserFromNextRequest } from '@/lib/jwt.server'
import { MEMBER_ROLE } from '@/constants'
import { headers } from 'next/headers'

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const request = new Request('http://localhost', { headers: headersList })
  const user = await getAuthUserFromNextRequest(request)

  if (!user) {
    redirect('/auth/sign-in')
  }

  if (user.roleCode !== MEMBER_ROLE.ADMIN) {
    redirect('/')
  }

  return <>{children}</>
}
