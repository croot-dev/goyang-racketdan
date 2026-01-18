'use client'

import { useEffect } from 'react'
import { redirect } from 'next/navigation'
import { useAlertDialog } from '@/components/ui/alert-dialog'

export default function AccessDeniedDialog() {
  const { alert } = useAlertDialog()

  useEffect(() => {
    alert({
      title: '조회 권한이 없습니다',
      message: '회원만 조회할 수 있습니다.',
      confirmText: '확인',
      onConfirm: () => redirect('/notice'),
    })
  }, [alert])

  return null
}
