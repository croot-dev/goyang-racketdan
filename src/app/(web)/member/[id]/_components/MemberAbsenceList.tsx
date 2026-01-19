'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Stack,
  Text,
  Badge,
  HStack,
  VStack,
  EmptyState,
} from '@chakra-ui/react'
import { useEventAbsencesByMember } from '@/hooks/useEventAbsence'
import { AbsenceType } from '@/domains/event_absence/event_absence.model'
import { LuCalendarX, LuClock, LuCircleAlert, LuPlus } from 'react-icons/lu'
import AddAbsenceDialog from './AddAbsenceDialog'

interface MemberAbsenceListProps {
  memberSeq: number
}

export default function MemberAbsenceList({
  memberSeq,
}: MemberAbsenceListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data, isLoading } = useEventAbsencesByMember(memberSeq, true)

  if (isLoading) {
    return (
      <Card.Root>
        <Card.Body>
          <Text>로딩 중...</Text>
        </Card.Body>
      </Card.Root>
    )
  }

  const absences = data?.absences || []
  const stats = data?.stats

  return (
    <Stack gap={4}>
      {/* 통계 카드 */}
      {stats && (
        <HStack gap={4}>
          <Card.Root flex={1}>
            <Card.Body py={4}>
              <VStack>
                <Text fontSize="sm" color="gray.500">
                  전체
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats.total}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
          <Card.Root flex={1}>
            <Card.Body py={4}>
              <VStack>
                <Text fontSize="sm" color="gray.500">
                  지각
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {stats.late}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
          <Card.Root flex={1}>
            <Card.Body py={4}>
              <VStack>
                <Text fontSize="sm" color="gray.500">
                  불참
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {stats.noShow}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </HStack>
      )}

      {/* 불참 기록 목록 */}
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold">
              지각/불참 기록
            </Text>
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              <LuPlus />
              추가
            </Button>
          </HStack>
        </Card.Header>
        <Card.Body>
          {absences.length === 0 ? (
            <EmptyState.Root>
              <EmptyState.Content>
                <EmptyState.Indicator>
                  <LuCalendarX />
                </EmptyState.Indicator>
                <EmptyState.Title>기록이 없습니다</EmptyState.Title>
                <EmptyState.Description>
                  지각 또는 불참 기록이 없습니다.
                </EmptyState.Description>
              </EmptyState.Content>
            </EmptyState.Root>
          ) : (
            <Stack gap={3}>
              {absences.map((absence) => (
                <Box
                  key={absence.id}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  _hover={{ bg: 'gray.50' }}
                >
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      {absence.absence_type === AbsenceType.LATE ? (
                        <Badge colorPalette="orange" variant="subtle">
                          <LuClock />
                          <Text ml={1}>지각</Text>
                        </Badge>
                      ) : (
                        <Badge colorPalette="red" variant="subtle">
                          <LuCircleAlert />
                          <Text ml={1}>불참</Text>
                        </Badge>
                      )}
                      {absence.late_minutes && (
                        <Text fontSize="sm" color="gray.500">
                          {absence.late_minutes}분
                        </Text>
                      )}
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(absence.created_at).toLocaleDateString('ko-KR')}
                    </Text>
                  </HStack>
                  <Text fontWeight="medium" mb={1}>
                    {absence.event_title}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {absence.reason}
                  </Text>
                  {absence.reporter_nickname && (
                    <Text fontSize="xs" color="gray.400" mt={2}>
                      신고자: {absence.reporter_nickname}
                    </Text>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Card.Body>
      </Card.Root>

      <AddAbsenceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        memberSeq={memberSeq}
      />
    </Stack>
  )
}
