'use client'

import { useState } from 'react'
import { Box, Text, Stack, Card, Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import LogoutDialog from '@/components/common/LogoutDialog'
import { Member } from '@/domains/member'

interface ProfileCardProps {
  user: Member
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const router = useRouter()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  return (
    <>
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="bold">
            내 프로필
          </Text>
        </Card.Header>
        <Card.Body>
          <Stack gap={3}>
            <Box>
              <Text fontWeight="bold" color="gray.700">
                별명
              </Text>
              <Text>{user.nickname}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" color="gray.700">
                이메일
              </Text>
              <Text>{user.email}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" color="gray.700">
                테니스 등급 (NTRP)
              </Text>
              <Text>{user.ntrp}</Text>
            </Box>
            {user.phone && (
              <Box>
                <Text fontWeight="bold" color="gray.700">
                  전화번호
                </Text>
                <Text>{user.phone}</Text>
              </Box>
            )}
          </Stack>
        </Card.Body>
        <Card.Footer>
          <Button colorScheme="teal" onClick={() => router.push('/profile')}>
            프로필 수정
          </Button>
          <Button variant="outline" onClick={() => setLogoutDialogOpen(true)}>
            로그아웃
          </Button>
        </Card.Footer>
      </Card.Root>

      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      />
    </>
  )
}
