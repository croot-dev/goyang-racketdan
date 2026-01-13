/**
 * Member 모델
 * 회원 테이블 스키마 정의
 */

export interface Member {
  id: string
  email: string
  name: string
  nickname: string
  ntrp: string
  sex: 'male' | 'female'
  phone: string | null
  password_hash: string
  status: string
  created_at: string
  updated_at: string
}

/**
 * 회원 생성 DTO
 */
export interface CreateMemberDto {
  email: string
  name: string
  nickname: string
  sex: 'male' | 'female'
  ntrp: string
  password_hash: string
  phone?: string | null
}

/**
 * 회원 정보 (비밀번호 제외)
 */
export type MemberInfo = Omit<Member, 'password_hash'>

/**
 * 공개 회원 정보 (민감 정보 제외)
 */
export interface PublicMemberInfo {
  id: string
  nickname: string
  ntrp: string
  sex: 'male' | 'female'
}
