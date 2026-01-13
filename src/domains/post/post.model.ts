/**
 * Post 모델
 * 게시글 테이블 스키마 정의
 */

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

/**
 * 게시글 생성 DTO
 */
export interface CreatePostDto {
  bbs_type_id: number
  title: string
  content: string
  writer_id: string
}

/**
 * 게시글 수정 DTO
 */
export interface UpdatePostDto {
  title?: string
  content?: string
}

/**
 * 게시글 목록 응답
 */
export interface PostListResult {
  posts: Post[]
  total: number
  totalPages: number
}

/**
 * 게시판 타입
 */
export enum BbsType {
  NOTICE = 1,
  COMMUNITY = 2,
  FAQ = 3,
}
