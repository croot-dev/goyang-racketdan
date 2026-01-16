import { redirect } from 'next/navigation'
import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'
import { getMemberByIdWithRole } from '@/domains/member/member.query'
import ProfileForm from './_components/ProfileForm'
import { MEMBER_ROLE } from '@/constants'
import { getAuthSession } from '@/lib/auth.server'

export default async function ProfilePage() {
  const session = await getAuthSession()
  if (!session) {
    redirect('/auth/sign-in')
  }

  const member = await getMemberByIdWithRole(session.memberId)
  if (!member) {
    redirect('/auth/sign-in')
  }

  const isAuthorized = member.role_code === MEMBER_ROLE.ADMIN
  if (!isAuthorized) {
    alert('권한이 없습니다.')
    redirect('/dashboard')
  }

  return (
    <Container maxW="container.md" py={8}>
      <Stack gap={6}>
        <Box>
          <Heading size="2xl" mb={2}>
            프로필
          </Heading>
          <Text color="gray.600" fontSize="lg">
            회원 정보를 확인하고 수정할 수 있습니다.
          </Text>
        </Box>

        <ProfileForm initialData={member} />
      </Stack>
    </Container>
  )
}
