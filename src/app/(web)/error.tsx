'use client'

import { useEffect } from 'react'
import { Box, Container, Heading, Text, Button } from '@chakra-ui/react'
import { ServiceError } from '@/lib/error'

interface ErrorProps {
  error: (Error & { digest?: string }) | ServiceError
  reset: () => void
}

export default function BlindError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Container maxW="container.xl" py={10}>
      <Box textAlign="center" py={20}>
        <Heading size="lg" mb={4}>
          오류가 발생했습니다
        </Heading>
        <Text color="gray.600" mb={6}>
          페이지를 불러오는 중 문제가 발생했습니다.
        </Text>
        <Box display="flex" gap={3} justifyContent="center">
          <Button onClick={reset} variant="outline">
            다시 시도
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
