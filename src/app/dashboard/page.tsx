'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Card,
  Button,
  Spinner,
} from '@chakra-ui/react'
import { logout } from '@/lib/auth-client'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()

  useEffect(() => {
    // 로딩이 끝난 후 인증되지 않았으면 로그인 페이지로 이동
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/sign-in')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" color="teal.500" />
      </Box>
    )
  }

  if (!user) {
    return null // 리다이렉트 중
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Stack gap={6}>
        <Box>
          <Heading size="2xl" mb={2}>
            안녕하세요, {user?.name}님! 👋
          </Heading>
          <Text color="gray.600" fontSize="lg">
            고양 라켓단에 오신 것을 환영합니다.
          </Text>
        </Box>

        <Stack gap={4}>
          <Card.Root>
            <Card.Header>
              <Heading size="lg">내 프로필</Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap={3}>
                <Box>
                  <Text fontWeight="bold" color="gray.700">
                    별명
                  </Text>
                  <Text>{user?.nickname}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.700">
                    이메일
                  </Text>
                  <Text>{user?.email}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.700">
                    테니스 등급 (NTRP)
                  </Text>
                  <Text>{user?.ntrp}</Text>
                </Box>
                {user?.phone && (
                  <Box>
                    <Text fontWeight="bold" color="gray.700">
                      전화번호
                    </Text>
                    <Text>{user?.phone}</Text>
                  </Box>
                )}
              </Stack>
            </Card.Body>
            <Card.Footer>
              <Button
                colorScheme="teal"
                onClick={() => router.push('/profile')}
              >
                프로필 수정
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                로그아웃
              </Button>
            </Card.Footer>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading size="lg">최근 공지사항</Heading>
            </Card.Header>
            <Card.Body>
              <Text color="gray.500">최근 공지사항이 없습니다.</Text>
            </Card.Body>
            <Card.Footer>
              <Button
                variant="outline"
                onClick={() => router.push('/notice/list')}
              >
                공지사항 보기
              </Button>
            </Card.Footer>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading size="lg">코트 예약</Heading>
            </Card.Header>
            <Card.Body>
              <Text color="gray.600">
                테니스 코트를 예약하고 함께 테니스를 즐겨보세요.
              </Text>
            </Card.Body>
            <Card.Footer>
              <Button
                colorScheme="teal"
                onClick={() => router.push('/reservation')}
              >
                예약하러 가기
              </Button>
            </Card.Footer>
          </Card.Root>
        </Stack>
      </Stack>
    </Container>
  )
}
