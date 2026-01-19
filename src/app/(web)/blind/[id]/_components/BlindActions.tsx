'use client'

import { Box, Button } from '@chakra-ui/react'
import Link from 'next/link'
import { useUserInfo } from '@/hooks/useAuth'
import { useMemo } from 'react'

interface BlindActionsProps {
  postId: number
  writerId: string
}

export default function BlindActions({ postId, writerId }: BlindActionsProps) {
  const { data: user } = useUserInfo()
  const isAuthor = useMemo(() => user?.member_id === writerId, [user])

  if (!isAuthor) {
    return null
  }

  return (
    <Box display="flex" gap={3}>
      <Link href={`/blind/edit/${postId}`}>
        <Button colorScheme="blue">수정</Button>
      </Link>
      <Button colorScheme="red" variant="outline">
        삭제
      </Button>
    </Box>
  )
}
