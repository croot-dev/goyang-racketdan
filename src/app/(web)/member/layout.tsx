import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth.server'

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAuthSession()
  if (!session) {
    redirect('/auth/sign-in')
  }

  // 권한 체크 및 경로 리다이렉트는 middleware에서 처리

  return <>{children}</>
}
