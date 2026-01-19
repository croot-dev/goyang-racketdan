import { Box, Container, Heading, Text, Button } from '@chakra-ui/react'
import Link from 'next/link'

interface AccessDeniedProps {
  title?: string
  message?: string
  showBackButton?: boolean
  backUrl?: string
  backLabel?: string
}

export default function AccessDenied({
  title = '접근 권한이 없습니다',
  message = '로그인 하시거나 관리자에게 문의 바랍니다.',
  showBackButton = true,
  backUrl = '/',
  backLabel = '돌아가기',
}: AccessDeniedProps) {
  return (
    <Container maxW="container.xl" py={10}>
      <Box textAlign="center" py={20}>
        <Heading size="lg" mb={4}>
          {title}
        </Heading>
        <Text color="gray.600" mb={6}>
          {message}
        </Text>
        {showBackButton && (
          <Link href={backUrl}>
            <Button colorPalette="teal">{backLabel}</Button>
          </Link>
        )}
      </Box>
    </Container>
  )
}
