'use client'

import { Text, Card, Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function ReservationCard() {
  const router = useRouter()

  return (
    <Card.Root>
      <Card.Header>
        <Text fontSize="lg" fontWeight="bold">
          블라인드
        </Text>
      </Card.Header>
      <Card.Body>
        <Text color="gray.600">
          남몰래 하고 싶은 이야기가 있나요? <br />
          블라인드 게시판에서 자유롭게
        </Text>
      </Card.Body>
      <Card.Footer>
        <Button colorScheme="teal" onClick={() => router.push('/blind')}>
          블라인드 가기
        </Button>
      </Card.Footer>
    </Card.Root>
  )
}
