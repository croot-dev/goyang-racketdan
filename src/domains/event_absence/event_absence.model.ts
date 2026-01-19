/**
 * EventAbsence 모델
 * 이벤트 불참/지각 관련 테이블 스키마 정의
 */

import { ResponsePaging } from '../common/response.query'

/**
 * 불참 유형
 */
export const AbsenceType = {
  LATE: 'LATE', // 지각
  NO_SHOW: 'NO_SHOW', // 불참
} as const

export type AbsenceTypeType = (typeof AbsenceType)[keyof typeof AbsenceType]

/**
 * 불참 기록 엔티티
 */
export interface EventAbsence {
  id: number
  event_id: number
  member_seq: number
  absence_type: AbsenceTypeType
  reason: string
  late_minutes: number | null
  reported_by: number | null
  created_at: string
  updated_at: string
}

/**
 * 불참 기록 + 회원 정보
 */
export interface EventAbsenceWithMember extends EventAbsence {
  member_name: string
  member_nickname: string
}

/**
 * 불참 기록 + 회원 정보 + 신고자 정보
 */
export interface EventAbsenceWithDetails extends EventAbsenceWithMember {
  reporter_name: string | null
  reporter_nickname: string | null
  event_title: string
}

// ============ DTOs ============

/**
 * 불참 기록 생성 DTO
 */
export interface CreateEventAbsenceDto {
  event_id: number
  member_seq: number
  absence_type: AbsenceTypeType
  reason: string
  late_minutes?: number | null
  reported_by?: number | null
}

/**
 * 불참 기록 수정 DTO
 */
export interface UpdateEventAbsenceDto {
  id: number
  absence_type: AbsenceTypeType
  reason: string
  late_minutes?: number | null
}

/**
 * 불참 기록 목록 응답
 */
export interface EventAbsenceListResult extends ResponsePaging {
  list: EventAbsenceWithDetails[]
}
