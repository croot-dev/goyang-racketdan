/**
 * 멤버 서비스 레이어
 * 비즈니스 로직을 처리하고 데이터 액세스 계층(쿼리)을 호출
 */

import 'server-only'
import { Member, MemberListResult } from './member.model'
import {
  getMemberByNickname,
  getMemberById,
  updateMember,
  getMemberList,
} from './member.query'
import type { MemberGender } from '@/constants'
import { ServiceError, ErrorCode } from '@/lib/error'

interface ModifyMemberData {
  member_id: string
  requester_id: string // 요청자 ID (인증된 사용자)
  name: string
  nickname: string
  ntrp: string
  gender: MemberGender
  phone?: string | null
}

/**
 * 회원 목록 조회
 * @param data
 * @returns
 */
export async function getMemberListService(
  page: number = 1,
  limit: number = 10
): Promise<MemberListResult> {
  return await getMemberList(page, limit)
}

/**
 * 회원 정보 수정
 */
export async function modifyMemberService(
  data: ModifyMemberData
): Promise<Member> {
  const { member_id, requester_id, name, gender, nickname, ntrp, phone } = data

  // 필수 필드 검증
  if (!member_id) {
    throw new ServiceError(ErrorCode.INVALID_INPUT, '알 수 없는 사용자입니다.')
  }

  if (!requester_id) {
    throw new ServiceError(ErrorCode.UNAUTHORIZED, '사용자 인증이 필요합니다.')
  }

  // 권한 검증: 본인만 수정 가능
  if (requester_id !== member_id) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '본인의 정보만 수정할 수 있습니다.'
    )
  }

  // 대상 회원 존재 여부 확인
  const existingMember = await getMemberById(member_id)
  if (!existingMember) {
    throw new ServiceError(
      ErrorCode.MEMBER_NOT_FOUND,
      '회원을 찾을 수 없습니다.'
    )
  }

  // 별명 중복 확인 (본인 제외)
  const memberByNickname = await getMemberByNickname(nickname)
  if (memberByNickname && memberByNickname.member_id !== member_id) {
    throw new ServiceError(
      ErrorCode.DUPLICATE_NICKNAME,
      '이미 사용 중인 별명입니다.'
    )
  }

  // 회원 정보 업데이트
  const updatedMember = await updateMember({
    member_id,
    name,
    nickname,
    gender,
    ntrp,
    phone: phone || null,
  })

  return updatedMember
}
