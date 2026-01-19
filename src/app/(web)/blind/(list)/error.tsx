'use client'

import { useEffect } from 'react'
import { ErrorCode, getServiceErrorCode } from '@/lib/error'
import AccessDenied from '@/components/common/AccessDenied'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BlindError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Blind page error:', error)
  }, [error])

  // ServiceError의 FORBIDDEN 에러인 경우 권한 없음 페이지 표시
  const code = getServiceErrorCode(error)
  const isForbidden = code === ErrorCode.FORBIDDEN

  if (isForbidden) {
    return (
      <AccessDenied
        title="접근 권한이 없습니다"
        message="관리자에게 문의 바랍니다."
        showBackButton
        backUrl="/"
      />
    )
  } else {
    throw error
  }
}
