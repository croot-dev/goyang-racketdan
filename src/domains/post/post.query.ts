/**
 * Post 데이터 액세스 레이어
 * SQL 쿼리만 담당
 */

import 'server-only'
import { sql } from '@/lib/db.server'
import { PostListItem } from './post.model'
import { ResponseList, ResponsePaging } from '../common/response.query'

/**
 * 게시글 목록 조회
 */
export async function getPostList(
  bbs_type_id: number = 1,
  page: number = 1,
  limit: number = 10
): Promise<ResponseList<PostListItem>> {
  const offset = (page - 1) * limit

  const [posts, countResult] = (await Promise.all([
    sql`
      SELECT
        p.post_id,
        p.bbs_type_id,
        p.title,
        p.writer_id,
        p.view_count,
        p.created_at,
        p.updated_at,
        m.nickname as writer_name
      FROM bbs_post p
      JOIN member m
        ON p.writer_id = m.member_id
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
  ])) as [PostListItem[], ResponsePaging[]]

  return {
    list: posts,
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
): Promise<PostListItem | null> {
  const result = (await sql`
    SELECT
      p.post_id,
      p.bbs_type_id,
      p.title,
      p.content,
      p.writer_id,
      p.view_count,
      p.created_at,
      p.updated_at,
      m.nickname as writer_name
    FROM bbs_post p
      JOIN member m
        ON p.writer_id = m.member_id
    WHERE post_id = ${post_id} 
      AND bbs_type_id = ${bbs_type_id}
  `) as PostListItem[]

  return result[0] || null
}

/**
 *
 */
export async function createPost({
  bbs_type_id,
  title,
  content,
  writer_id,
}: {
  bbs_type_id: number
  title: string
  content: string
  writer_id: string
}) {
  // 데이터베이스에 게시글 저장
  const newPost = await sql`
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
    RETURNING post_id, bbs_type_id, title, content, writer_id, view_count, created_at, updated_at
  `

  return newPost[0] as PostListItem
}
