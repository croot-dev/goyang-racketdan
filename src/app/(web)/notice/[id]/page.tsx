import { Box, Container, Heading, Stack, Skeleton } from '@chakra-ui/react'
import { Suspense } from 'react'
import NoticeRead from './_components/NoticeRead'
import { getAuthSession } from '@/lib/auth.server'
import AccessDeniedDialog from './_components/AccessDeniedDialog'

export const metadata = {
  title: '공지사항 상세 - 고양 라켓단',
  description: '고양 라켓단 공지사항 상세내용을 조회합니다.',
}

interface PageProps {
  params: Promise<{ id: string }>
}

function NoticeReadFallback() {
  return (
    <Stack gap={6}>
      <Box>
        <Skeleton height="20px" width="300px" mb={4} />
      </Box>

      <Box>
        <Skeleton height="20px" width="60px" mb={2} />
        <Skeleton height="40px" />
      </Box>

      <Box>
        <Skeleton height="20px" width="60px" mb={2} />
        <Skeleton height="300px" />
      </Box>

      <Box display="flex" gap={3} justifyContent="space-between">
        <Skeleton height="40px" width="100px" />
        <Box display="flex" gap={3}>
          <Skeleton height="40px" width="80px" />
          <Skeleton height="40px" width="80px" />
        </Box>
      </Box>
    </Stack>
  )
}

export default async function NoticeReadPage({ params }: PageProps) {
  const { id } = await params
  const postId = parseInt(id)

  const session = await getAuthSession()
  if (!session) {
    return <AccessDeniedDialog />
  }

  return (
    <Container maxW="container.lg" py={10}>
      <Stack gap={8}>
        <Heading size="2xl">공지사항</Heading>

        <Suspense fallback={<NoticeReadFallback />}>
          <NoticeRead postId={postId} />
        </Suspense>
      </Stack>
    </Container>
  )
}
