/**
 * EventAbsence 서비스 레이어
 * 비즈니스 로직을 처리하고 데이터 액세스 계층(쿼리)을 호출
 */

import 'server-only'
import {
  EventAbsence,
  EventAbsenceWithDetails,
  CreateEventAbsenceDto,
  UpdateEventAbsenceDto,
  EventAbsenceListResult,
  AbsenceType,
} from './event_absence.model'
import {
  getEventAbsenceList,
  getEventAbsenceById,
  getEventAbsenceByEventAndMember,
  getEventAbsencesByEventId,
  getEventAbsencesByMemberSeq,
  createEventAbsence,
  updateEventAbsence,
  deleteEventAbsence,
  getAbsenceCountByMember,
} from './event_absence.query'
import { getEventById } from '@/domains/event/event.query'
import { ServiceError, ErrorCode } from '@/lib/error'

// ============ EventAbsence Services ============

/**
 * 불참 기록 목록 조회
 */
export async function getEventAbsenceListService(
  page: number = 1,
  limit: number = 10
): Promise<EventAbsenceListResult> {
  return await getEventAbsenceList(page, limit)
}

/**
 * 불참 기록 상세 조회
 */
export async function getEventAbsenceDetailService(
  id: number
): Promise<EventAbsenceWithDetails> {
  const absence = await getEventAbsenceById(id)

  if (!absence) {
    throw new ServiceError(
      ErrorCode.NOT_FOUND,
      '불참 기록을 찾을 수 없습니다.'
    )
  }

  return absence
}

/**
 * 특정 이벤트의 불참 기록 조회
 */
export async function getEventAbsencesByEventService(eventId: number) {
  const event = await getEventById(eventId)

  if (!event) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  return await getEventAbsencesByEventId(eventId)
}

/**
 * 특정 회원의 불참 기록 조회
 */
export async function getEventAbsencesByMemberService(memberSeq: number) {
  return await getEventAbsencesByMemberSeq(memberSeq)
}

/**
 * 회원의 불참 통계 조회
 */
export async function getMemberAbsenceStatsService(memberSeq: number) {
  const [totalCount, lateCount, noShowCount] = await Promise.all([
    getAbsenceCountByMember(memberSeq),
    getAbsenceCountByMember(memberSeq, AbsenceType.LATE),
    getAbsenceCountByMember(memberSeq, AbsenceType.NO_SHOW),
  ])

  return {
    total: totalCount,
    late: lateCount,
    noShow: noShowCount,
  }
}

/**
 * 불참 기록 생성
 */
export async function createEventAbsenceService(
  data: CreateEventAbsenceDto,
  reporterMemberSeq?: number
): Promise<EventAbsence> {
  const { event_id, member_seq, absence_type, reason, late_minutes } = data

  // 이벤트 존재 확인
  const event = await getEventById(event_id)
  if (!event) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  // 이미 불참 기록이 있는지 확인
  const existingAbsence = await getEventAbsenceByEventAndMember(
    event_id,
    member_seq
  )
  if (existingAbsence) {
    throw new ServiceError(
      ErrorCode.DUPLICATE,
      '이미 해당 이벤트에 대한 불참 기록이 존재합니다.'
    )
  }

  // 지각인 경우 지각 시간 필수
  if (absence_type === AbsenceType.LATE) {
    if (!late_minutes || late_minutes <= 0) {
      throw new ServiceError(
        ErrorCode.INVALID_INPUT,
        '지각의 경우 지각 시간을 1분 이상 입력해주세요.'
      )
    }
  }

  // 불참인 경우 지각 시간 불필요
  if (absence_type === AbsenceType.NO_SHOW && late_minutes) {
    throw new ServiceError(
      ErrorCode.INVALID_INPUT,
      '불참의 경우 지각 시간을 입력할 수 없습니다.'
    )
  }

  // 사유 필수
  if (!reason || reason.trim().length === 0) {
    throw new ServiceError(ErrorCode.INVALID_INPUT, '사유를 입력해주세요.')
  }

  return await createEventAbsence({
    ...data,
    reported_by: reporterMemberSeq || null,
  })
}

/**
 * 불참 기록 수정
 */
export async function updateEventAbsenceService(
  data: UpdateEventAbsenceDto,
  requesterMemberSeq: number
): Promise<EventAbsence> {
  const existingAbsence = await getEventAbsenceById(data.id)

  if (!existingAbsence) {
    throw new ServiceError(
      ErrorCode.NOT_FOUND,
      '불참 기록을 찾을 수 없습니다.'
    )
  }

  // 신고자만 수정 가능 (본인이 신고한 경우)
  if (
    existingAbsence.reported_by &&
    existingAbsence.reported_by !== requesterMemberSeq
  ) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '본인이 등록한 불참 기록만 수정할 수 있습니다.'
    )
  }

  const { absence_type, reason, late_minutes } = data

  // 지각인 경우 지각 시간 필수
  if (absence_type === AbsenceType.LATE) {
    if (!late_minutes || late_minutes <= 0) {
      throw new ServiceError(
        ErrorCode.INVALID_INPUT,
        '지각의 경우 지각 시간을 1분 이상 입력해주세요.'
      )
    }
  }

  // 불참인 경우 지각 시간 불필요
  if (absence_type === AbsenceType.NO_SHOW && late_minutes) {
    throw new ServiceError(
      ErrorCode.INVALID_INPUT,
      '불참의 경우 지각 시간을 입력할 수 없습니다.'
    )
  }

  // 사유 필수
  if (!reason || reason.trim().length === 0) {
    throw new ServiceError(ErrorCode.INVALID_INPUT, '사유를 입력해주세요.')
  }

  return await updateEventAbsence(data)
}

/**
 * 불참 기록 삭제
 */
export async function deleteEventAbsenceService(
  id: number,
  requesterMemberSeq: number
): Promise<boolean> {
  const existingAbsence = await getEventAbsenceById(id)

  if (!existingAbsence) {
    throw new ServiceError(
      ErrorCode.NOT_FOUND,
      '불참 기록을 찾을 수 없습니다.'
    )
  }

  // 신고자만 삭제 가능
  if (
    existingAbsence.reported_by &&
    existingAbsence.reported_by !== requesterMemberSeq
  ) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '본인이 등록한 불참 기록만 삭제할 수 있습니다.'
    )
  }

  return await deleteEventAbsence(id)
}
