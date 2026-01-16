'use client'

import { Box, Text, Stack, Card, Button, Spinner } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePostList } from '@/hooks/usePosts'
import { BbsType } from '@/domains/post/post.model'

export default function RecentNoticesCard() {
  const router = useRouter()
  const { data, isLoading } = usePostList({
    bbsTypeId: BbsType.NOTICE,
    page: 1,
    limit: 3,
  })
  const recentNotices = data?.list || []

  return (
    <Card.Root>
      <Card.Header>
        <Text fontSize="lg" fontWeight="bold">
          최근 공지사항
        </Text>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <Stack gap={2}>
            <Spinner size="sm" />
            <Text color="gray.500">로딩 중...</Text>
          </Stack>
        ) : recentNotices.length > 0 ? (
          <Stack gap={3}>
            {recentNotices.map((notice) => (
              <Link key={notice.post_id} href={`/notice/${notice.post_id}`}>
                <Box
                  p={3}
                  borderRadius="md"
                  _hover={{ bg: 'gray.50' }}
                  cursor="pointer"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={3}
                >
                  <Text fontWeight="medium" lineClamp={1} flex="1">
                    {notice.title}
                  </Text>
                  <Text fontSize="sm" color="gray.500" flexShrink={0}>
                    {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                  </Text>
                </Box>
              </Link>
            ))}
          </Stack>
        ) : (
          <Text color="gray.500">최근 공지사항이 없습니다.</Text>
        )}
      </Card.Body>
      <Card.Footer>
        <Button variant="outline" onClick={() => router.push('/notice')}>
          공지사항 보기
        </Button>
      </Card.Footer>
    </Card.Root>
  )
}
