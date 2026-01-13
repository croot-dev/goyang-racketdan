import { sql } from '@/lib/db'

export interface Post {
  post_id: number
  bbs_type_id: number
  title: string
  content?: string
  writer_id: string
  view_count: number
  created_at: string
  updated_at: string
}

export interface PostListResult {
  posts: Post[]
  total: number
  totalPages: number
}

/**
 * 게시글 목록 조회
 */
export async function getPostList(
  bbs_type_id: number = 1,
  page: number = 1,
  limit: number = 10
): Promise<PostListResult> {
  const offset = (page - 1) * limit

  const [posts, countResult] = (await Promise.all([
    sql`
      SELECT
        post_id,
        bbs_type_id,
        title,
        writer_id,
        view_count,
        created_at,
        updated_at
      FROM bbs_post
      WHERE bbs_type_id = ${bbs_type_id}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*) as total
      FROM bbs_post
      WHERE bbs_type_id = ${bbs_type_id}
    `,
  ])) as [Post[], { total: number }[]]

  return {
    posts,
    total: Number(countResult[0].total),
    totalPages: Math.ceil(Number(countResult[0].total) / limit),
  }
}

/**
 * 단일 게시글 조회
 */
export async function getPost(
  post_id: number,
  bbs_type_id: number = 1
): Promise<Post | null> {
  const result = await sql`
    SELECT
      post_id,
      bbs_type_id,
      title,
      content,
      writer_id,
      view_count,
      created_at,
      updated_at
    FROM bbs_post
    WHERE post_id = ${post_id} AND bbs_type_id = ${bbs_type_id}
  `

  return (result[0] as Post) || null
}
