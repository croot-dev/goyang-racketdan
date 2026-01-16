'use client'

import { Text, Card, Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function ReservationCard() {
  const router = useRouter()

  return (
    <Card.Root>
      <Card.Header>
        <Text fontSize="lg" fontWeight="bold">
          코트 예약
        </Text>
      </Card.Header>
      <Card.Body>
        <Text color="gray.600">
          테니스 코트를 예약하고 함께 테니스를 즐겨보세요.
        </Text>
      </Card.Body>
      <Card.Footer>
        <Button colorScheme="teal" onClick={() => router.push('/schedule')}>
          예약하러 가기
        </Button>
      </Card.Footer>
    </Card.Root>
  )
}
