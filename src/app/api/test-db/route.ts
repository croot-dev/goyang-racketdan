import { NextResponse } from 'next/server'
import { sql } from '@/lib/db.server'

export async function GET() {
  try {
    // 간단한 쿼리로 연결 테스트
    const result = await sql`SELECT NOW() as current_time, version() as db_version`

    return NextResponse.json({
      success: true,
      message: 'DB 연결 성공!',
      data: {
        currentTime: result[0].current_time,
        dbVersion: result[0].db_version,
      }
    })
  } catch (error) {
    console.error('DB 연결 에러:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'DB 연결 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}
