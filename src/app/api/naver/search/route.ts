import { NextRequest, NextResponse } from 'next/server'

interface NaverLocalSearchItem {
  title: string
  link: string
  category: string
  description: string
  telephone: string
  address: string
  roadAddress: string
  mapx: string
  mapy: string
}

interface NaverLocalSearchResponse {
  lastBuildDate: string
  total: number
  start: number
  display: number
  items: NaverLocalSearchItem[]
}

/**
 * 네이버 지역 검색 API
 * GET /api/naver/search?query=검색어
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 })
  }

  const clientId = process.env.NAVER_API_CLIENT_ID
  const clientSecret = process.env.NAVER_API_SECRET_KEY

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: '네이버 API 설정이 필요합니다.' },
      { status: 500 },
    )
  }

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=1`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      },
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: '네이버 검색 API 호출 실패' },
        { status: response.status },
      )
    }

    const data: NaverLocalSearchResponse = await response.json()

    if (data.items.length === 0) {
      return NextResponse.json({ error: '검색 결과가 없습니다.' }, { status: 404 })
    }

    const item = data.items[0]

    // 네이버 좌표계(KATEC)를 WGS84로 변환
    // 네이버 지역검색 API의 mapx, mapy는 KATECH 좌표계 (단위: 0.0000001도)
    const x = parseInt(item.mapx) / 10000000
    const y = parseInt(item.mapy) / 10000000

    return NextResponse.json({
      name: item.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
      address: item.roadAddress || item.address,
      x,
      y,
      telephone: item.telephone,
      category: item.category,
    })
  } catch (error) {
    console.error('Naver search error:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
