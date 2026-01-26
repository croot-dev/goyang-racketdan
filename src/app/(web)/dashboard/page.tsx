import { redirect } from 'next/navigation'
import { Box, Container, Heading, Text, Stack } from '@chakra-ui/react'
import ProfileCard from './_components/ProfileCard'
import RecentNoticesCard from './_components/RecentNoticesCard'
// import ReservationCard from './_components/ReservationCard'
import BlindCard from './_components/BlindCard'
import MyEventsCard from './_components/MyEventsCard'
import { getAuthSession } from '@/lib/auth.server'
import { getMemberById } from '@/domains/member'

export default async function DashboardPage() {
  const session = await getAuthSession()
  if (!session) {
    redirect('/auth/sign-in')
  }

  const user = await getMemberById(session?.memberId)
  if (!user) {
    return null // 리다이렉트 중
  }

  return (
    <Box>
      <Container maxW="container.xl" py={8}>
        <Stack gap={6}>
          <Box>
            <Heading size="2xl" mb={2}>
              안녕하세요, {user.nickname}님! 👋
            </Heading>
            <Text color="gray.600" fontSize="lg">
              이름없는 테니스 모임에 오신 것을 환영합니다.
            </Text>
          </Box>

          <Stack gap={4}>
            <RecentNoticesCard />
            <MyEventsCard />
            <BlindCard />
            {/* <ReservationCard /> */}
            <ProfileCard user={user} />
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
