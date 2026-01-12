import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const post_id = searchParams.get('id')
    const post_type = searchParams.get('type')

    // 필수 필드 검증
    if (!post_id || !post_type) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 500 }
      )
    }

    // 데이터베이스에 사용자 저장
    const writing = await sql`
      SELECT (
        title,
        content,
        writer_id,
        view_count,
        created_at,
        updated_at
      )
        FROM bbs_post
        WHERE post_id=${post_id} AND bbs_type_id=${post_type}
    `

    return NextResponse.json(
      {
        success: true,
        writing: (Array.isArray(writing) ? writing[0] : writing) ?? null
      }
    )

  } catch (error) {
    console.error('글 조회 에러:', error)
    return NextResponse.json(
      { error: '글 조회 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST (req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json()
    const { bbs_type_id, title, content } = body

    // 필수 필드 검증
    if ([bbs_type_id, title, content].some(value => !value)) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 500 }
      )
    }

    const writer_id = body.writer_id

    // 데이터베이스에 사용자 저장
    const newWriting = await sql`
      INSERT INTO bbs_post (
        bbs_type_id,
        title,
        content,
        writer_id,
        created_at,
        updated_at
      )
      VALUES (
        ${bbs_type_id},
        ${title},
        ${content},
        ${writer_id},
        NOW(),
        NOW()
      )
      RETURNING post_id,bbs_type_id,title,content,writer_id,view_count,created_at,updated_at
    `

    const writing = newWriting[0]

    console.log('글 작성 성공:', {
      postId: writing.post_id,
    })

    return NextResponse.json(writing)
  } catch (error) {
    console.error('글 작성 에러:', error)
    return NextResponse.json(
      { error: '글 작성 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

