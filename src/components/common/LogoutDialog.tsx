'use client'

import { Button, Dialog, Text } from '@chakra-ui/react'
import { logout } from '@/lib/auth.client'

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const handleLogout = () => {
    onOpenChange(false)
    logout()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>로그아웃</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text>정말 로그아웃 하시겠습니까?</Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
            </Dialog.ActionTrigger>
            <Button colorScheme="red" onClick={handleLogout}>
              로그아웃
            </Button>
          </Dialog.Footer>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
