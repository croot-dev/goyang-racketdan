/**
 * 인증 서비스 레이어
 * 비즈니스 로직을 처리하고 데이터 액세스 계층(쿼리)을 호출
 */

import 'server-only'
import bcrypt from 'bcryptjs'
import {
  getMemberByEmail,
  getMemberByNickname,
  createMember,
} from '@/domains/member/member.query'
import { Member, MemberWithRole } from '../member'
import { ServiceError, ErrorCode } from '@/lib/error'

/**
 * 회원가입 서비스
 */
export async function registerService(
  data: Pick<
    Member,
    | 'member_id'
    | 'email'
    | 'name'
    | 'birthdate'
    | 'nickname'
    | 'ntrp'
    | 'gender'
    | 'phone'
  >
): Promise<MemberWithRole> {
  const { member_id, email, name, birthdate, gender, nickname, ntrp, phone } =
    data

  // 필수 필드 검증
  if (!email || !name || !gender || !nickname || !ntrp) {
    throw new ServiceError(
      ErrorCode.MISSING_REQUIRED_FIELD,
      '필수 정보가 누락되었습니다.'
    )
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ServiceError(
      ErrorCode.VALIDATION_ERROR,
      '올바른 이메일 형식이 아닙니다.'
    )
  }

  // 이메일 중복 확인
  const existingUserByEmail = await getMemberByEmail(email)
  if (existingUserByEmail) {
    throw new ServiceError(
      ErrorCode.DUPLICATE_EMAIL,
      '이미 가입된 이메일입니다.'
    )
  }

  // 별명 중복 확인
  const existingUserByNickname = await getMemberByNickname(nickname)
  if (existingUserByNickname) {
    throw new ServiceError(
      ErrorCode.DUPLICATE_NICKNAME,
      '이미 사용 중인 별명입니다.'
    )
  }

  // 카카오 로그인이므로 비밀번호는 랜덤 해시값 생성
  const randomPassword = Math.random().toString(36).slice(-8)
  const passwordHash = await bcrypt.hash(randomPassword, 12)

  // 회원 생성
  const newMember = await createMember({
    member_id,
    email,
    name,
    birthdate,
    nickname,
    gender,
    ntrp,
    password_hash: passwordHash,
    phone: phone || null,
  })

  return newMember
}

/**
 * 이메일로 회원 조회 서비스
 */
export async function findMemberByEmailService(
  email: string
): Promise<Pick<
  Member,
  'member_id' | 'email' | 'name' | 'nickname' | 'ntrp' | 'gender' | 'phone'
> | null> {
  if (!email) {
    return null
  }

  const member = await getMemberByEmail(email)
  if (!member) {
    return null
  }

  return {
    member_id: member.member_id,
    email: member.email,
    name: member.name,
    nickname: member.nickname,
    ntrp: member.ntrp,
    gender: member.gender,
    phone: member.phone,
  }
}
