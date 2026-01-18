'use client'

import { Box, Text, Stack, Card, Button, Spinner, Badge, Flex } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMyEvents } from '@/hooks/useEvent'

export default function MyEventsCard() {
  const router = useRouter()
  const { data: events, isLoading } = useMyEvents(5)

  return (
    <Card.Root>
      <Card.Header>
        <Text fontSize="lg" fontWeight="bold">
          내 일정
        </Text>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <Stack gap={2}>
            <Spinner size="sm" />
            <Text color="gray.500">로딩 중...</Text>
          </Stack>
        ) : events && events.length > 0 ? (
          <Stack gap={0}>
            {events.map((event) => (
              <Link key={event.id} href={`/schedule/event/${event.id}`}>
                <Box
                  p={3}
                  borderRadius="md"
                  _hover={{ bg: 'gray.50' }}
                  cursor="pointer"
                >
                  <Flex justify="space-between" align="start" gap={3}>
                    <Box flex="1">
                      <Flex align="center" gap={2} mb={1}>
                        <Text fontWeight="medium" lineClamp={1}>
                          {event.title}
                        </Text>
                        {event.my_status === 'WAIT' && (
                          <Badge colorPalette="yellow" size="sm">
                            대기
                          </Badge>
                        )}
                      </Flex>
                      <Text fontSize="sm" color="gray.600">
                        {Intl.DateTimeFormat('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        }).format(new Date(event.start_datetime))}
                      </Text>
                      {event.location_name && (
                        <Text fontSize="sm" color="gray.500">
                          {event.location_name}
                        </Text>
                      )}
                    </Box>
                    <Badge colorPalette="blue" flexShrink={0}>
                      {event.current_participants}/{event.max_participants}명
                    </Badge>
                  </Flex>
                </Box>
              </Link>
            ))}
          </Stack>
        ) : (
          <Text color="gray.500">참여한 일정이 없습니다.</Text>
        )}
      </Card.Body>
      <Card.Footer>
        <Button variant="outline" onClick={() => router.push('/schedule')}>
          일정 보기
        </Button>
      </Card.Footer>
    </Card.Root>
  )
}
