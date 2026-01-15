import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { getMemberListService } from '@/domains/member'
import { handleApiError } from '@/lib/api.error'

// 멤버 목록 조회 API (인증 불필요)
export async function GET(req: NextRequest) {
  return withAuth(req, async (authenticatedReq) => {
    try {
      const { searchParams } = new URL(authenticatedReq.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')

      const result = await getMemberListService(page, limit)

      return NextResponse.json({
        success: true,
        ...result,
        page,
        limit,
      })
    } catch (error) {
      console.error('게시글 목록 조회 에러:', error)
      return handleApiError(error, '게시글 목록 조회 중 오류가 발생했습니다.')
    }
  })
}
