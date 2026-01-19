import {
  Box,
  Container,
  Heading,
  Stack,
  Skeleton,
  Text,
} from '@chakra-ui/react'
import { Suspense } from 'react'
import BlindForm from './_components/BlindForm'

export const metadata = {
  title: '블라인드 작성 - 이름없는 테니스 모임',
  description: '이름없는 테니스 모임 블라인드 글을 작성합니다.',
}

function BlindFormFallback() {
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

export default async function BlindWritePage() {
  return (
    <Container maxW="container.lg" py={10}>
      <Stack gap={8}>
        <Box>
          <Heading size="2xl">블라인드 작성</Heading>
          <Text marginTop={2}>
            🚨 한번 작성된 글은 수정/삭제 할 수 없습니다.
          </Text>
        </Box>
        <Suspense fallback={<BlindFormFallback />}>
          <BlindForm />
        </Suspense>
      </Stack>
    </Container>
  )
}
