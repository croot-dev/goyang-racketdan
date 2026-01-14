'use client'

import { Box, Button } from '@chakra-ui/react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

interface NoticeActionsProps {
  postId: number
  writerId: string
}

export default function NoticeActions({ postId, writerId }: NoticeActionsProps) {
  const { user } = useAuth()
  const isAuthor = user?.member_id === writerId

  if (!isAuthor) {
    return null
  }

  return (
    <Box display="flex" gap={3}>
      <Link href={`/notice/edit/${postId}`}>
        <Button colorScheme="blue">수정</Button>
      </Link>
      <Button colorScheme="red" variant="outline">
        삭제
      </Button>
    </Box>
  )
}
