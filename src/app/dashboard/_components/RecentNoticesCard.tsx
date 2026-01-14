'use client'

import { useEffect, useState, useRef } from 'react'
import { Box, Text, Stack, Card, Button, Spinner } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Post {
  post_id: number
  title: string
  created_at: string
}

export default function RecentNoticesCard() {
  const router = useRouter()
  const [recentNotices, setRecentNotices] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    // Strict Mode에서 중복 호출 방지
    if (hasFetched.current) return

    const fetchRecentNotices = async () => {
      hasFetched.current = true
      try {
        const response = await fetch('/api/bbs/post?type=1&page=1&limit=3')
        if (response.ok) {
          const data = await response.json()
          setRecentNotices(data.posts || [])
        }
      } catch (error) {
        console.error('Failed to fetch notices:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentNotices()
  }, [])

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
        <Button variant="outline" onClick={() => router.push('/notice/list')}>
          공지사항 보기
        </Button>
      </Card.Footer>
    </Card.Root>
  )
}
