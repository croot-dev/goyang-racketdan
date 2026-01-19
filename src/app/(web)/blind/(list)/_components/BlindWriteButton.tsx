'use client'

import { Button } from '@chakra-ui/react'
import Link from 'next/link'

export default function BlindWriteButton() {
  return (
    <Link href="/blind/write">
      <Button colorScheme="teal">글쓰기</Button>
    </Link>
  )
}
