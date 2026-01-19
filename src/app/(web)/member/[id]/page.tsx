import { redirect } from 'next/navigation'
import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'
import MemberTabs from './_components/MemberTabs'
import { getMemberByIdWithRole } from '@/domains/member'
import { getAuthSession } from '@/lib/auth.server'
import { MEMBER_ROLE } from '@/constants'
import AccessDenied from '@/components/common/AccessDenied'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id: memberId } = await params

  const session = await getAuthSession()
  if (!session) {
    redirect('/auth/sign-in')
  }

  const isMe = session?.memberId === memberId

  if (!isMe && session.roleCode !== MEMBER_ROLE.ADMIN) {
    return (
      <AccessDenied
        title="접근 권한이 없습니다"
        message="회원만 조회할 수 있습니다."
        showBackButton
      />
    )
  }

  const initialData = await getMemberByIdWithRole(memberId)
  if (!initialData) {
    redirect('/member')
  }

  return (
    <Container maxW="container.md" py={8}>
      <Stack gap={6}>
        {isMe ? (
          <Box>
            <Heading size="2xl" mb={2}>
              내 정보
            </Heading>
            <Text color="gray.600" fontSize="lg">
              내 정보를 확인하고 수정할 수 있습니다.
            </Text>
          </Box>
        ) : (
          <Box>
            <Heading size="2xl" mb={2}>
              프로필
            </Heading>
            <Text color="gray.600" fontSize="lg">
              회원 정보를 확인하고 수정할 수 있습니다.
            </Text>
          </Box>
        )}

        <MemberTabs
          initialData={initialData}
          isAdmin={session.roleCode === MEMBER_ROLE.ADMIN}
        />
      </Stack>
    </Container>
  )
}
