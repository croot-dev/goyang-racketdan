import Link from 'next/link'
import { Box, Table, Stack, Text, Badge } from '@chakra-ui/react'
import { getMemberList } from '@/domains/member'
import { MEMBER_GENDER } from '@/constants'
import dayjs from 'dayjs'

interface MemberListProps {
  currentPage: number
}

function getGenderLabel(gender: string) {
  return gender === MEMBER_GENDER.MALE ? '남' : '여'
}

function getStatusBadge(status: string) {
  if (status === 'active') {
    return <Badge colorPalette="green">활성</Badge>
  }
  return <Badge colorPalette="gray">비활성</Badge>
}

function calculateAge(birthdate: string): number {
  const today = new Date()
  const birthObj = dayjs(birthdate, 'YYYYMMDD')

  return today.getFullYear() - birthObj.year()
}

export default async function MemberList({ currentPage }: MemberListProps) {
  const { members, total, totalPages } = await getMemberList(
    currentPage,
    10
  )

  return (
    <>
      {/* 모바일 카드 뷰 */}
      <Box display={{ base: 'block', md: 'none' }}>
        {members.length === 0 ? (
          <Box
            textAlign="center"
            py={10}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <Text color="gray.600">회원이 없습니다.</Text>
          </Box>
        ) : (
          <Stack gap={3}>
            {members.map((member, index) => (
              <Link key={member.member_id} href={`/member/${member.member_id}`}>
                <Box
                  p={4}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  bg="white"
                  cursor="pointer"
                  _hover={{ borderColor: 'teal.300', bg: 'gray.50' }}
                  transition="all 0.2s"
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
                      #{total - (currentPage - 1) * 10 - index}
                    </Text>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Text fontSize="sm" color="gray.600">
                      {member.name} ({getGenderLabel(member.gender)},{' '}
                      {calculateAge(member.birthdate)}세)
                    </Text>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={2}
                    >
                      <Box display="flex" gap={2} alignItems="center">
                        <Badge colorPalette="teal">NTRP {member.ntrp}</Badge>
                        {getStatusBadge(member.status)}
                      </Box>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(member.created_at).toLocaleDateString(
                          'ko-KR'
                        )}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Link>
            ))}
          </Stack>
        )}
      </Box>

      {/* 데스크톱 테이블 뷰 */}
      <Box display={{ base: 'none', md: 'block' }}>
        <Table.Root variant="outline" size="lg">
          <Table.Header>
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
          </Table.Header>
          <Table.Body>
            {members.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={9} textAlign="center" py={10}>
                  회원이 없습니다.
                </Table.Cell>
              </Table.Row>
            ) : (
              members.map((member, index) => (
                <Link
                  key={member.member_id}
                  href={`/member/${member.member_id}`}
                  style={{ display: 'contents' }}
                >
                  <Table.Row
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    transition="all 0.2s"
                  >
                    <Table.Cell textAlign="center">
                      {total - (currentPage - 1) * 10 - index}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {member.nickname}
                    </Table.Cell>
                    <Table.Cell textAlign="center">{member.name}</Table.Cell>
                    <Table.Cell>{member.email}</Table.Cell>
                    <Table.Cell textAlign="center">
                      {getGenderLabel(member.gender)}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {calculateAge(member.birthdate)}세
                    </Table.Cell>
                    <Table.Cell textAlign="center">{member.ntrp}</Table.Cell>
                    <Table.Cell textAlign="center">
                      {getStatusBadge(member.status)}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {new Date(member.created_at).toLocaleDateString('ko-KR')}
                    </Table.Cell>
                  </Table.Row>
                </Link>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Box
          display="flex"
          justifyContent="center"
          gap={2}
          mt={6}
          flexWrap="wrap"
        >
          {currentPage > 1 && (
            <a href={`/member?page=${currentPage - 1}`}>
              <Box
                as="button"
                px={{ base: 3, md: 4 }}
                py={2}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                _hover={{ bg: 'gray.50' }}
                fontSize={{ base: 'sm', md: 'md' }}
              >
                이전
              </Box>
            </a>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <a key={pageNum} href={`/member?page=${pageNum}`}>
                <Box
                  as="button"
                  px={{ base: 3, md: 4 }}
                  py={2}
                  border="1px solid"
                  borderColor={
                    pageNum === currentPage ? 'teal.500' : 'gray.300'
                  }
                  borderRadius="md"
                  bg={pageNum === currentPage ? 'teal.500' : 'white'}
                  color={pageNum === currentPage ? 'white' : 'inherit'}
                  _hover={{
                    bg: pageNum === currentPage ? 'teal.600' : 'gray.50',
                  }}
                  fontSize={{ base: 'sm', md: 'md' }}
                  minW={{ base: '36px', md: '40px' }}
                >
                  {pageNum}
                </Box>
              </a>
            )
          )}

          {currentPage < totalPages && (
            <a href={`/member?page=${currentPage + 1}`}>
              <Box
                as="button"
                px={{ base: 3, md: 4 }}
                py={2}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                _hover={{ bg: 'gray.50' }}
                fontSize={{ base: 'sm', md: 'md' }}
              >
                다음
              </Box>
            </a>
          )}
        </Box>
      )}
    </>
  )
}
