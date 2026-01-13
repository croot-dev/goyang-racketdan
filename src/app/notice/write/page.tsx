import { Box, Container, Heading, Stack, Skeleton } from '@chakra-ui/react'
import { Suspense } from 'react'
import Header from '@/components/layouts/Header'
import NoticeWriteForm from '@/components/notice/NoticeWriteForm'

export const metadata = {
  title: '공지사항 작성 - 고양 라켓단',
  description: '고양 라켓단 공지사항을 작성합니다.',
}

function NoticeWriteFormFallback() {
  return (
    <Stack gap={6}>
      <Box>
        <Skeleton height="20px" width="60px" mb={2} />
        <Skeleton height="40px" />
      </Box>

      <Box>
        <Skeleton height="20px" width="60px" mb={2} />
        <Skeleton height="300px" />
      </Box>

      <Box display="flex" gap={3} justifyContent="flex-end">
        <Skeleton height="40px" width="80px" />
        <Skeleton height="40px" width="100px" />
      </Box>
    </Stack>
  )
}

export default function NoticeWritePage() {
  return (
    <Box>
      <Header />

      <Container maxW="container.lg" py={10}>
        <Stack gap={8}>
          <Heading size="2xl">공지사항 작성</Heading>

          <Suspense fallback={<NoticeWriteFormFallback />}>
            <NoticeWriteForm />
          </Suspense>
        </Stack>
      </Container>
    </Box>
  )
}
