'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  Flex,
  Heading,
  Stack,
  Text,
  Badge,
  Separator,
  HStack,
} from '@chakra-ui/react'
import {
  useEvents,
  toCalendarEvent,
  type CalendarEvent,
} from '@/hooks/useEvent'

interface ScheduleListProps {
  events: CalendarEvent[]
  currentMonth: { year: number; month: number }
}

function getNextMonth(year: number, month: number) {
  if (month === 12) {
    return { year: year + 1, month: 1 }
  }
  return { year, month: month + 1 }
}

export default function ScheduleList({
  events,
  currentMonth,
}: ScheduleListProps) {
  const router = useRouter()
  const nextMonth = getNextMonth(currentMonth.year, currentMonth.month)

  const { data: nextMonthData } = useEvents(1, 100, nextMonth)

  const allEvents = useMemo(() => {
    const nextEvents = nextMonthData?.map(toCalendarEvent) || []
    const combined = [...events, ...nextEvents]

    const uniqueEvents = combined.filter(
      (event, index, self) =>
        index === self.findIndex((e) => e.id === event.id),
    )

    return uniqueEvents.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    )
  }, [events, nextMonthData])

  if (allEvents.length === 0) {
    return (
      <Box>
        <Heading size="md" mb={4}>
          일정 목록
        </Heading>
        <Text color="gray.500">등록된 일정이 없습니다.</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Heading size="md" mb={4}>
        일정 목록
      </Heading>

      <Stack gap={3}>
        {allEvents.map((event, index) => {
          const eventDate = new Date(event.start)
          const isNextMonth =
            eventDate.getFullYear() === nextMonth.year &&
            eventDate.getMonth() + 1 === nextMonth.month
          const prevEventDate =
            index > 0 ? new Date(allEvents[index - 1].start) : null
          const isPrevCurrentMonth =
            prevEventDate &&
            prevEventDate.getFullYear() === currentMonth.year &&
            prevEventDate.getMonth() + 1 === currentMonth.month
          const showDivider = isNextMonth && isPrevCurrentMonth

          return (
            <Box key={event.id}>
              {showDivider && (
                <HStack pb={3}>
                  <Separator flex="1" />
                  <Text flexShrink="0" color="gray.500" fontSize="sm">
                    {nextMonth.month}월
                  </Text>
                  <Separator flex="1" />
                </HStack>
              )}
              <Card.Root
                cursor="pointer"
                onClick={() => router.push(`/schedule/event/${event.id}`)}
                _hover={{ shadow: 'md' }}
              >
                <Card.Body
                  css={{ '--card-padding': 'var(--chakra-spacing-3)' }}
                >
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
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}
