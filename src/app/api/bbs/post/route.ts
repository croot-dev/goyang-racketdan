import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { getPostListService, createPostService } from '@/services/post.service'

// 게시글 목록 조회 API (인증 불필요)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bbs_type_id = parseInt(searchParams.get('type') || '1')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const result = await getPostListService(bbs_type_id, page, limit)

    return NextResponse.json({
      success: true,
      ...result,
      page,
      limit,
    })
  } catch (error) {
    console.error('게시글 목록 조회 에러:', error)
    return NextResponse.json(
      { error: '게시글 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 게시글 작성 API (인증 필요)
export async function POST(req: NextRequest) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const body = await authenticatedReq.json()
      const { bbs_type_id, title, content } = body

      // 서비스 레이어를 통해 게시글 생성
      const post = await createPostService({
        bbs_type_id: parseInt(bbs_type_id) || 1,
        title,
        content,
        writer_id: user.userId,
      })

      console.log('게시글 작성 성공:', {
        postId: post.post_id,
        userId: user.userId,
      })

      return NextResponse.json({
        success: true,
        ...post,
      })
    } catch (error) {
      console.error('게시글 작성 에러:', error)

      // 비즈니스 로직 에러 처리
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json(
        { error: '게시글 작성 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  })
}
