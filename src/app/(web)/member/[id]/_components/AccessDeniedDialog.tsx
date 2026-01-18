'use client'

import { useEffect } from 'react'
import { useAlertDialog } from '@/components/ui/alert-dialog'
import { redirect } from 'next/navigation'

export default function AccessDeniedDialog() {
  const { alert } = useAlertDialog()

  useEffect(() => {
    alert({
      title: '조회 권한이 없습니다',
      message: '본인 정보이거나 관리자만 조회할 수 있습니다.',
      confirmText: '확인',
      onConfirm: () => redirect('/member'),
    })
  }, [alert])

  return null
}
