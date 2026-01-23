import { Box, Table, Stack, Text, Badge } from '@chakra-ui/react'
import { getMemberList } from '@/domains/member'
import { MEMBER_GENDER, MEMBER_ROLE } from '@/constants'
import dayjs from 'dayjs'
import {
  MemberTableRow,
  MemberCard,
  MemberTableHeaderRow,
} from './MemberListRows'
import { getAuthSession } from '@/lib/auth.server'

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
  const session = await getAuthSession()
  const { members, total, totalPages } = await getMemberList(currentPage, 10)
  const allowDetail = session?.roleCode === MEMBER_ROLE.ADMIN

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
              <MemberCard
                key={member.member_id}
                member={member}
                displayNumber={total - (currentPage - 1) * 10 - index}
                genderLabel={getGenderLabel(member.gender)}
                age={calculateAge(member.birthdate)}
                statusBadge={getStatusBadge(member.status)}
                allowDetail={allowDetail}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* 데스크톱 테이블 뷰 */}
      <Box display={{ base: 'none', md: 'block' }}>
        <Table.Root variant="outline" size="lg">
          <Table.Header>
            <MemberTableHeaderRow />
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
                <MemberTableRow
                  key={member.member_id}
                  member={member}
                  displayNumber={total - (currentPage - 1) * 10 - index}
                  genderLabel={getGenderLabel(member.gender)}
                  age={calculateAge(member.birthdate)}
                  statusBadge={getStatusBadge(member.status)}
                  allowDetail={allowDetail}
                />
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
            ),
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
