'use client'

import { Button, Dialog, Text, Stack } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { clearAuthFlag } from '@/lib/auth.client'
import { request } from '@/lib/api.client'

interface WithdrawDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: string
}

export default function WithdrawDialog({
  open,
  onOpenChange,
  memberId,
}: WithdrawDialogProps) {
  const router = useRouter()

  const withdrawMutation = useMutation({
    mutationFn: () =>
      request<{ success: boolean }>(`/api/member/${memberId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      clearAuthFlag()
      localStorage.removeItem('kakaoUserTemp')
      alert('회원 탈퇴가 완료되었습니다.')
      router.push('/')
    },
    onError: () => {
      alert('회원 탈퇴 처리 중 오류가 발생했습니다.')
    },
  })

  const handleWithdraw = () => {
    withdrawMutation.mutate()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>회원 탈퇴</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Stack gap={3}>
              <Text>정말 탈퇴하시겠습니까?</Text>
              <Text fontSize="sm" color="red.500">
                탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
              </Text>
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
            </Dialog.ActionTrigger>
            <Button
              colorScheme="red"
              onClick={handleWithdraw}
              loading={withdrawMutation.isPending}
            >
              탈퇴하기
            </Button>
          </Dialog.Footer>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
