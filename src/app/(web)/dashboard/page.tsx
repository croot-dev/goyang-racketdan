'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Container, Heading, Text, Stack, Spinner } from '@chakra-ui/react'
import { useUserInfo } from '@/hooks/useAuth'
import ProfileCard from './_components/ProfileCard'
import RecentNoticesCard from './_components/RecentNoticesCard'
import ReservationCard from './_components/ReservationCard'

export default function DashboardPage() {
  const router = useRouter()
  const { data: user, isFetched, isLoading } = useUserInfo()

  useEffect(() => {
    // 로딩이 끝난 후 인증되지 않았으면 로그인 페이지로 이동
    if (isFetched && !isLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [isFetched, isLoading, user, router])

  if (!isFetched || isLoading) {
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

  return (
    <Box>
      <Container maxW="container.xl" py={8}>
        <Stack gap={6}>
          <Box>
            <Heading size="2xl" mb={2}>
              안녕하세요, {user.name}님! 👋
            </Heading>
            <Text color="gray.600" fontSize="lg">
              고양 라켓단에 오신 것을 환영합니다.
            </Text>
          </Box>

          <Stack gap={4}>
            <ProfileCard user={user} />
            <RecentNoticesCard />
            <ReservationCard />
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
