import { redirect } from 'next/navigation'
import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'
import MemberForm from './_components/MemberForm'
import { getMemberByIdWithRole } from '@/domains/member'
import { getAuthSession } from '@/lib/auth.server'

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

  const initialData = await getMemberByIdWithRole(memberId)
  if (!initialData) {
    redirect('/management/member')
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

        <MemberForm initialData={initialData} />
      </Stack>
    </Container>
  )
}
