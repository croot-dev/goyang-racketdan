/**
 * Member 모델
 * 회원 테이블 스키마 정의
 */

import type { MemberGender } from '@/constants'

export interface Member {
  member_id: string
  email: string
  name: string
  nickname: string
  ntrp: string
  gender: MemberGender
  phone: string | null
  password_hash: string
  status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MemberWithRole extends Member {
  role_code: string
  role_name: string
}

/**
 * 회원 생성 DTO
 */
export interface CreateMemberDto {
  member_id: string
  email: string
  name: string
  nickname: string
  gender: MemberGender
  ntrp: string
  password_hash: string
  phone: string | null
}
