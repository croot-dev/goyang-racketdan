/**
 * Event 모델
 * 이벤트(모임) 관련 테이블 스키마 정의
 */

/**
 * 이벤트 참여 상태
 */
export const EventParticipantStatus = {
  JOIN: 'JOIN', // 참여 확정
  WAIT: 'WAIT', // 대기
  CANCEL: 'CANCEL', // 취소
} as const

export type EventParticipantStatusType =
  (typeof EventParticipantStatus)[keyof typeof EventParticipantStatus]

/**
 * 참여 변경 액션 타입
 */
export const EventActionType = {
  USER_JOIN: 'USER_JOIN', // 사용자가 참여 신청
  USER_CANCEL: 'USER_CANCEL', // 사용자가 참여 취소
  AUTO_PROMOTE: 'AUTO_PROMOTE', // 대기 → 자동 참여 전환
  HOST_CANCEL: 'HOST_CANCEL', // 주최자에 의한 취소
  ADMIN_UPDATE: 'ADMIN_UPDATE', // 관리자 개입
} as const

export type EventActionTypeType =
  (typeof EventActionType)[keyof typeof EventActionType]

/**
 * 이벤트(모임) 엔티티
 */
export interface Event {
  id: number
  title: string
  description: string | null
  start_datetime: string
  end_datetime: string
  location_name: string | null
  location_url: string | null
  max_participants: number
  current_participants: number
  host_member_seq: number
  created_at: string
  updated_at: string
}

/**
 * 이벤트 + 주최자 정보
 */
export interface EventWithHost extends Event {
  host_name: string
  host_nickname: string
}

/**
 * 이벤트 참여자
 */
export interface EventParticipant {
  id: number
  event_id: number
  member_seq: number
  status: EventParticipantStatusType
  wait_order: number | null
  created_at: string
  updated_at: string
}

/**
 * 참여자 + 회원 정보
 */
export interface EventParticipantWithMember extends EventParticipant {
  member_name: string
  member_nickname: string
}

/**
 * 이벤트 댓글
 */
export interface EventComment {
  id: number
  event_id: number
  member_seq: number
  content: string
  created_at: string
  updated_at: string
}

/**
 * 댓글 + 작성자 정보
 */
export interface EventCommentWithMember extends EventComment {
  member_name: string
  member_nickname: string
}

/**
 * 참여자 변경 로그
 */
export interface EventParticipantLog {
  id: number
  event_id: number
  member_seq: number
  from_status: EventParticipantStatusType | null
  to_status: EventParticipantStatusType
  action_type: EventActionTypeType
  actor_member_seq: number | null
  created_at: string
}

// ============ DTOs ============

/**
 * 이벤트 생성 DTO
 */
export interface CreateEventDto {
  title: string
  description?: string | null
  start_datetime: string
  end_datetime: string
  location_name?: string | null
  location_url?: string | null
  max_participants: number
  host_member_seq: number
}

/**
 * 이벤트 수정 DTO
 */
export interface UpdateEventDto {
  id: number
  title: string
  description?: string | null
  start_datetime: string
  end_datetime: string
  location_name?: string | null
  location_url?: string | null
  max_participants: number
}

/**
 * 댓글 생성 DTO
 */
export interface CreateEventCommentDto {
  event_id: number
  member_seq: number
  content: string
}

/**
 * 참여 신청 DTO
 */
export interface JoinEventDto {
  event_id: number
  member_seq: number
}

/**
 * 이벤트 목록 응답
 */
export interface EventListResult {
  events: EventWithHost[]
  total: number
  totalPages: number
}

/**
 * 이벤트 상세 응답
 */
export interface EventDetailResult {
  event: EventWithHost
  participants: EventParticipantWithMember[]
  comments: EventCommentWithMember[]
}
