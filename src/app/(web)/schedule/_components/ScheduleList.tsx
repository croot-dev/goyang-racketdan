'use client'

import { useRouter } from 'next/navigation'
import { Box, Card, Flex, Heading, Stack, Text, Badge } from '@chakra-ui/react'
import type { CalendarEvent } from '@/hooks/useEvent'

interface ScheduleListProps {
  events: CalendarEvent[]
}

export default function ScheduleList({ events }: ScheduleListProps) {
  const router = useRouter()

  if (events.length === 0) {
    return (
      <Box mt={8}>
        <Heading size="md" mb={4}>
          일정 목록
        </Heading>
        <Text color="gray.500">등록된 일정이 없습니다.</Text>
      </Box>
    )
  }

  console.log(events)

  return (
    <Box mt={8}>
      <Heading size="md" mb={4}>
        일정 목록
      </Heading>

      <Stack gap={3}>
        {events.map((event) => (
          <Card.Root
            key={event.id}
            cursor="pointer"
            onClick={() => router.push(`/schedule/event/${event.id}`)}
            _hover={{ shadow: 'md' }}
          >
            <Card.Body>
              <Flex justify="space-between" align="start">
                <Box>
                  <Heading size="sm">{event.title}</Heading>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {Intl.DateTimeFormat('ko-KR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                      hour12: false,
                    }).format(new Date(event.start))}
                    {event.end &&
                      ' ~ ' +
                        Intl.DateTimeFormat('ko-KR', {
                          timeStyle: 'short',
                          hour12: false,
                        }).format(new Date(event.end))}
                  </Text>
                  {event.extendedProps?.location_name && (
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      📍 {event.extendedProps.location_name}
                    </Text>
                  )}
                </Box>
                <Badge colorPalette="blue">
                  {event.extendedProps?.current_participants ?? 0}/
                  {event.extendedProps?.max_participants ?? 0}명
                </Badge>
              </Flex>
            </Card.Body>
          </Card.Root>
        ))}
      </Stack>
    </Box>
  )
}
