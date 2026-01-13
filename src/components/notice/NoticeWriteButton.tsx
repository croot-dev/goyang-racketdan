'use client'

import { Button } from '@chakra-ui/react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function NoticeWriteButton() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <Link href="/notice/write">
      <Button colorScheme="teal">글쓰기</Button>
    </Link>
  )
}
