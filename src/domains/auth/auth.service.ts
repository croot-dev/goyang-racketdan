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
import { Member } from '../member'

/**
 * 회원가입 서비스
 */
export async function registerService(
  data: Pick<
    Member,
    'member_id' | 'email' | 'name' | 'nickname' | 'ntrp' | 'gender' | 'phone'
  >
): Promise<Member> {
  const { member_id, email, name, gender, nickname, ntrp, phone } = data

  // 필수 필드 검증
  if (!email || !name || !gender || !nickname || !ntrp) {
    throw new Error('필수 정보가 누락되었습니다.')
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('올바른 이메일 형식이 아닙니다.')
  }

  // 이메일 중복 확인
  const existingUserByEmail = await getMemberByEmail(email)
  if (existingUserByEmail) {
    throw new Error('이미 가입된 이메일입니다.')
  }

  // 별명 중복 확인
  const existingUserByNickname = await getMemberByNickname(nickname)
  if (existingUserByNickname) {
    throw new Error('이미 사용 중인 별명입니다.')
  }

  // 카카오 로그인이므로 비밀번호는 랜덤 해시값 생성
  const randomPassword = Math.random().toString(36).slice(-8)
  const passwordHash = await bcrypt.hash(randomPassword, 12)

  // 회원 생성
  const newMember = await createMember({
    member_id,
    email,
    name,
    nickname,
    gender,
    ntrp,
    password_hash: passwordHash,
    phone: phone || null,
  })

  // 비밀번호 제외한 사용자 정보 반환
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
