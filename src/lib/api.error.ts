/**
 * API 에러 핸들링 유틸리티
 * API Route에서 Service 에러를 HTTP 응답으로 변환
 */

import { NextResponse } from 'next/server'
import { ServiceError, ErrorCode } from './error'

interface ErrorResponse {
  error: string
  code: string
}

/**
 * Service 에러를 HTTP 응답으로 변환하는 핸들러
 */
export function handleApiError(
  error: unknown,
  defaultMessage: string = '요청 처리 중 오류가 발생했습니다.'
): NextResponse<ErrorResponse> {
  // ServiceError인 경우 정의된 코드와 상태로 응답
  if (error instanceof ServiceError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  // 일반 Error인 경우 500으로 응답
  if (error instanceof Error) {
    console.error('Unhandled error:', error)
    return NextResponse.json(
      { error: error.message || defaultMessage, code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    )
  }

  // 알 수 없는 에러
  console.error('Unknown error:', error)
  return NextResponse.json(
    { error: defaultMessage, code: ErrorCode.INTERNAL_ERROR },
    { status: 500 }
  )
}
