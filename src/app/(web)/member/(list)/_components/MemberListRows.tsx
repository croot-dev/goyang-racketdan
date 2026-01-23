'use client'

import { useRouter } from 'next/navigation'
import { Box, Table, Text, Badge } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface Member {
  member_id: string
  nickname: string
  name: string
  email: string
  ntrp: string
  status: string
  created_at: string
}

interface MemberRowProps {
  member: Member
  displayNumber: number
  genderLabel: string
  age: number
  statusBadge: ReactNode
  allowDetail: boolean
}

export function MemberTableHeaderRow() {
  return (
    <Table.Row>
      <Table.ColumnHeader width="80px" textAlign="center">
        번호
      </Table.ColumnHeader>
      <Table.ColumnHeader width="120px" textAlign="center">
        닉네임
      </Table.ColumnHeader>
      <Table.ColumnHeader width="100px" textAlign="center">
        이름
      </Table.ColumnHeader>
      <Table.ColumnHeader>이메일</Table.ColumnHeader>
      <Table.ColumnHeader width="80px" textAlign="center">
        성별
      </Table.ColumnHeader>
      <Table.ColumnHeader width="80px" textAlign="center">
        나이
      </Table.ColumnHeader>
      <Table.ColumnHeader width="80px" textAlign="center">
        NTRP
      </Table.ColumnHeader>
      <Table.ColumnHeader width="100px" textAlign="center">
        상태
      </Table.ColumnHeader>
      <Table.ColumnHeader width="120px" textAlign="center">
        가입일
      </Table.ColumnHeader>
    </Table.Row>
  )
}

export function MemberTableRow({
  member,
  displayNumber,
  genderLabel,
  age,
  statusBadge,
  allowDetail,
}: MemberRowProps) {
  const router = useRouter()
  const onClickHandler = () => {
    if (allowDetail) {
      router.push(`/member/${member.member_id}`)
    }
  }

  return (
    <Table.Row
      cursor="pointer"
      _hover={{ bg: 'gray.50' }}
      transition="all 0.2s"
      onClick={onClickHandler}
    >
      <Table.Cell textAlign="center">{displayNumber}</Table.Cell>
      <Table.Cell textAlign="center">{member.nickname}</Table.Cell>
      <Table.Cell textAlign="center">{member.name}</Table.Cell>
      <Table.Cell>{member.email}</Table.Cell>
      <Table.Cell textAlign="center">{genderLabel}</Table.Cell>
      <Table.Cell textAlign="center">{age}</Table.Cell>
      <Table.Cell textAlign="center">{member.ntrp}</Table.Cell>
      <Table.Cell textAlign="center">{statusBadge}</Table.Cell>
      <Table.Cell textAlign="center">
        {new Date(member.created_at).toLocaleDateString('ko-KR')}
      </Table.Cell>
    </Table.Row>
  )
}

export function MemberCard({
  member,
  displayNumber,
  genderLabel,
  age,
  statusBadge,
  allowDetail,
}: MemberRowProps) {
  const router = useRouter()
  const onClickHandler = () => {
    if (allowDetail) {
      router.push(`/member/${member.member_id}`)
    }
  }

  return (
    <Box
      p={4}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      bg="white"
      cursor="pointer"
      _hover={{ borderColor: 'teal.300', bg: 'gray.50' }}
      transition="all 0.2s"
      onClick={onClickHandler}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={2}
      >
        <Text fontWeight="bold" fontSize="md" color="gray.900">
          {member.nickname}
        </Text>
        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
          #{displayNumber}
        </Text>
      </Box>
      <Box display="flex" flexDirection="column" gap={1}>
        <Text fontSize="sm" color="gray.600">
          {member.name} ({genderLabel}, {age})
        </Text>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
        >
          <Box display="flex" gap={2} alignItems="center">
            <Badge colorPalette="teal">NTRP {member.ntrp}</Badge>
            {statusBadge}
          </Box>
          <Text fontSize="xs" color="gray.500">
            {new Date(member.created_at).toLocaleDateString('ko-KR')}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
