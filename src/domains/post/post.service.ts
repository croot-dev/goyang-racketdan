/**
 * 게시글 서비스 레이어
 * 비즈니스 로직을 처리하고 데이터 액세스 계층(쿼리)을 호출
 */

import 'server-only'
import { getPostList, getPost } from './post.query'
import {
  PostListItem,
  PostListResult,
  CreatePostDto,
  PostDto,
} from './post.model'
import { sql } from '@/lib/db.server'
import { ServiceError, ErrorCode } from '@/lib/error'

/**
 * 게시글 목록 조회
 */
export async function getPostListService(
  bbs_type_id: number = 1,
  page: number = 1,
  limit: number = 10
): Promise<PostListResult> {
  // 페이지 유효성 검증
  if (page < 1) page = 1
  if (limit < 1 || limit > 100) limit = 10

  return await getPostList(bbs_type_id, page, limit)
}

/**
 * 단일 게시글 조회
 */
export async function getPostService(post_id: number, bbs_type_id: number = 1) {
  if (!post_id || post_id < 1) {
    return null
  }

  return await getPost(post_id, bbs_type_id)
}

/**
 * 게시글 생성
 */
export async function createPostService(data: CreatePostDto) {
  const { bbs_type_id, title, content, writer_id } = data

  // 유효성 검증
  if (!title || title.trim().length === 0) {
    throw new ServiceError(ErrorCode.VALIDATION_ERROR, '제목을 입력해주세요.')
  }

  if (!content || content.trim().length === 0) {
    throw new ServiceError(ErrorCode.VALIDATION_ERROR, '내용을 입력해주세요.')
  }

  if (!writer_id) {
    throw new ServiceError(ErrorCode.UNAUTHORIZED, '작성자 정보가 필요합니다.')
  }

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
      ${title.trim()},
      ${content.trim()},
      ${writer_id},
      NOW(),
      NOW()
    )
    RETURNING post_id, bbs_type_id, title, content, writer_id, view_count, created_at, updated_at
  `

  return newPost[0] as PostListItem
}

/**
 * 게시글 수정
 */
export async function updatePostService(
  post_id: number,
  data: {
    title: string
    content: string
    user_id: string
  },
  bbs_type_id: number = 1
) {
  const { title, content, user_id } = data

  // 유효성 검증
  if (!title || title.trim().length === 0) {
    throw new ServiceError(ErrorCode.VALIDATION_ERROR, '제목을 입력해주세요.')
  }

  if (!content || content.trim().length === 0) {
    throw new ServiceError(ErrorCode.VALIDATION_ERROR, '내용을 입력해주세요.')
  }

  if (!user_id) {
    throw new ServiceError(ErrorCode.UNAUTHORIZED, '사용자 인증이 필요합니다.')
  }

  // 게시글 존재 여부 확인
  const existingPost = await getPost(post_id, bbs_type_id)
  if (!existingPost) {
    throw new ServiceError(
      ErrorCode.POST_NOT_FOUND,
      '게시글을 찾을 수 없습니다.'
    )
  }

  // 작성자 권한 확인
  if (existingPost.writer_id !== user_id) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '게시글을 수정할 권한이 없습니다.'
    )
  }

  // 데이터베이스 업데이트
  const updatedPost = (await sql`
    UPDATE bbs_post
    SET
      title = ${title.trim()},
      content = ${content.trim()},
      updated_at = NOW()
    WHERE post_id = ${post_id} AND bbs_type_id = ${bbs_type_id}
    RETURNING post_id, bbs_type_id, title, content, writer_id, view_count, created_at, updated_at
  `) as PostDto[]

  return updatedPost[0] || null
}

/**
 * 게시글 삭제
 */
export async function deletePostService(
  post_id: number,
  user_id: string,
  bbs_type_id: number = 1
): Promise<boolean> {
  if (!post_id || post_id < 1) {
    throw new ServiceError(
      ErrorCode.INVALID_INPUT,
      '유효하지 않은 게시글 ID입니다.'
    )
  }

  if (!user_id) {
    throw new ServiceError(ErrorCode.UNAUTHORIZED, '사용자 인증이 필요합니다.')
  }

  // 게시글 존재 여부 확인
  const existingPost = await getPost(post_id, bbs_type_id)
  if (!existingPost) {
    throw new ServiceError(
      ErrorCode.POST_NOT_FOUND,
      '게시글을 찾을 수 없습니다.'
    )
  }

  // 작성자 권한 확인
  if (existingPost.writer_id !== user_id) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '게시글을 삭제할 권한이 없습니다.'
    )
  }

  // 데이터베이스에서 삭제
  const result = await sql`
    DELETE FROM bbs_post
    WHERE post_id = ${post_id} AND bbs_type_id = ${bbs_type_id}
    RETURNING post_id
  `

  return result.length > 0
}

/**
 * 조회수 증가
 */
export async function incrementViewCountService(
  post_id: number,
  bbs_type_id: number = 1
): Promise<void> {
  await sql`
    UPDATE bbs_post
    SET view_count = view_count + 1
    WHERE post_id = ${post_id} AND bbs_type_id = ${bbs_type_id}
  `
}
