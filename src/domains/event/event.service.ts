/**
 * Event 서비스 레이어
 * 비즈니스 로직을 처리하고 데이터 액세스 계층(쿼리)을 호출
 */

import 'server-only'
import {
  Event,
  EventParticipant,
  EventComment,
  CreateEventDto,
  UpdateEventDto,
  CreateEventCommentDto,
  EventListResult,
  EventDetailResult,
  EventParticipantStatus,
  EventActionType,
} from './event.model'
import {
  getEventList,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  getParticipantByEventAndMember,
  createParticipant,
  updateParticipantStatus,
  getMaxWaitOrder,
  getFirstWaiter,
  updateEventCurrentParticipants,
  getJoinedParticipantCount,
  getEventComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  createParticipantLog,
} from './event.query'
import { ServiceError, ErrorCode } from '@/lib/error'

// ============ Event Services ============

/**
 * 이벤트 목록 조회
 */
export async function getEventListService(
  page: number = 1,
  limit: number = 10
): Promise<EventListResult> {
  return await getEventList(page, limit)
}

/**
 * 이벤트 상세 조회
 */
export async function getEventDetailService(
  eventId: number
): Promise<EventDetailResult> {
  const event = await getEventById(eventId)

  if (!event) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  const [participants, comments] = await Promise.all([
    getEventParticipants(eventId),
    getEventComments(eventId),
  ])

  return { event, participants, comments }
}

/**
 * 이벤트 생성
 */
export async function createEventService(data: CreateEventDto): Promise<Event> {
  const { title, max_participants, host_member_seq } = data

  if (!title || title.trim().length === 0) {
    throw new ServiceError(ErrorCode.INVALID_INPUT, '제목을 입력해주세요.')
  }

  if (max_participants <= 0) {
    throw new ServiceError(
      ErrorCode.INVALID_INPUT,
      '최대 참여 인원은 1명 이상이어야 합니다.'
    )
  }

  if (!host_member_seq) {
    throw new ServiceError(ErrorCode.UNAUTHORIZED, '로그인이 필요합니다.')
  }

  return await createEvent(data)
}

/**
 * 이벤트 수정
 */
export async function updateEventService(
  data: UpdateEventDto,
  requesterMemberSeq: number
): Promise<Event> {
  const existingEvent = await getEventById(data.id)

  if (!existingEvent) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  // 주최자만 수정 가능
  if (existingEvent.host_member_seq !== requesterMemberSeq) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '이벤트 주최자만 수정할 수 있습니다.'
    )
  }

  // 현재 참여자 수보다 최대 인원을 줄일 수 없음
  if (data.max_participants < existingEvent.current_participants) {
    throw new ServiceError(
      ErrorCode.INVALID_INPUT,
      '현재 참여자 수보다 적게 설정할 수 없습니다.'
    )
  }

  return await updateEvent(data)
}

/**
 * 이벤트 삭제
 */
export async function deleteEventService(
  eventId: number,
  requesterMemberSeq: number
): Promise<boolean> {
  const existingEvent = await getEventById(eventId)

  if (!existingEvent) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  // 주최자만 삭제 가능
  if (existingEvent.host_member_seq !== requesterMemberSeq) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '이벤트 주최자만 삭제할 수 있습니다.'
    )
  }

  return await deleteEvent(eventId)
}

// ============ Participant Services ============

/**
 * 이벤트 참여 신청
 */
export async function joinEventService(
  eventId: number,
  memberSeq: number
): Promise<EventParticipant> {
  const event = await getEventById(eventId)

  if (!event) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  // 이미 참여 중인지 확인
  const existingParticipant = await getParticipantByEventAndMember(
    eventId,
    memberSeq
  )

  if (existingParticipant) {
    if (existingParticipant.status === EventParticipantStatus.JOIN) {
      throw new ServiceError(
        ErrorCode.ALREADY_JOINED,
        '이미 참여 중인 이벤트입니다.'
      )
    }
    if (existingParticipant.status === EventParticipantStatus.WAIT) {
      throw new ServiceError(
        ErrorCode.ALREADY_WAITING,
        '이미 대기 중인 이벤트입니다.'
      )
    }
  }

  // 정원 확인
  const currentCount = await getJoinedParticipantCount(eventId)
  let participant: EventParticipant

  if (currentCount < event.max_participants) {
    // 바로 참여
    participant = await createParticipant(
      eventId,
      memberSeq,
      EventParticipantStatus.JOIN,
      null
    )
    await updateEventCurrentParticipants(eventId, currentCount + 1)

    // 로그 기록
    await createParticipantLog(
      eventId,
      memberSeq,
      null,
      EventParticipantStatus.JOIN,
      EventActionType.USER_JOIN,
      memberSeq
    )
  } else {
    // 대기 등록
    const maxWaitOrder = await getMaxWaitOrder(eventId)
    participant = await createParticipant(
      eventId,
      memberSeq,
      EventParticipantStatus.WAIT,
      maxWaitOrder + 1
    )

    // 로그 기록
    await createParticipantLog(
      eventId,
      memberSeq,
      null,
      EventParticipantStatus.WAIT,
      EventActionType.USER_JOIN,
      memberSeq
    )
  }

  return participant
}

/**
 * 이벤트 참여 취소
 */
export async function cancelEventService(
  eventId: number,
  memberSeq: number
): Promise<void> {
  const participant = await getParticipantByEventAndMember(eventId, memberSeq)

  if (!participant) {
    throw new ServiceError(
      ErrorCode.PARTICIPANT_NOT_FOUND,
      '참여 정보를 찾을 수 없습니다.'
    )
  }

  const previousStatus = participant.status

  // 상태를 CANCEL로 변경
  await updateParticipantStatus(
    eventId,
    memberSeq,
    EventParticipantStatus.CANCEL,
    null
  )

  // 로그 기록
  await createParticipantLog(
    eventId,
    memberSeq,
    previousStatus,
    EventParticipantStatus.CANCEL,
    EventActionType.USER_CANCEL,
    memberSeq
  )

  // 참여 확정자가 취소한 경우, 대기자 자동 승격
  if (previousStatus === EventParticipantStatus.JOIN) {
    const event = await getEventById(eventId)
    if (event) {
      const currentCount = await getJoinedParticipantCount(eventId)
      await updateEventCurrentParticipants(eventId, currentCount)

      // 대기자 승격
      await promoteFirstWaiter(eventId)
    }
  }
}

/**
 * 대기자 1순위 자동 승격
 */
async function promoteFirstWaiter(eventId: number): Promise<void> {
  const event = await getEventById(eventId)
  if (!event) return

  const currentCount = await getJoinedParticipantCount(eventId)
  if (currentCount >= event.max_participants) return

  const firstWaiter = await getFirstWaiter(eventId)
  if (!firstWaiter) return

  // 대기 → 참여로 변경
  await updateParticipantStatus(
    eventId,
    firstWaiter.member_seq,
    EventParticipantStatus.JOIN,
    null
  )

  // 참여자 수 업데이트
  await updateEventCurrentParticipants(eventId, currentCount + 1)

  // 로그 기록
  await createParticipantLog(
    eventId,
    firstWaiter.member_seq,
    EventParticipantStatus.WAIT,
    EventParticipantStatus.JOIN,
    EventActionType.AUTO_PROMOTE,
    null
  )
}

/**
 * 주최자가 참여자 취소 처리
 */
export async function hostCancelParticipantService(
  eventId: number,
  targetMemberSeq: number,
  hostMemberSeq: number
): Promise<void> {
  const event = await getEventById(eventId)

  if (!event) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  if (event.host_member_seq !== hostMemberSeq) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '이벤트 주최자만 참여자를 취소할 수 있습니다.'
    )
  }

  const participant = await getParticipantByEventAndMember(
    eventId,
    targetMemberSeq
  )

  if (!participant) {
    throw new ServiceError(
      ErrorCode.PARTICIPANT_NOT_FOUND,
      '참여 정보를 찾을 수 없습니다.'
    )
  }

  const previousStatus = participant.status

  await updateParticipantStatus(
    eventId,
    targetMemberSeq,
    EventParticipantStatus.CANCEL,
    null
  )

  // 로그 기록
  await createParticipantLog(
    eventId,
    targetMemberSeq,
    previousStatus,
    EventParticipantStatus.CANCEL,
    EventActionType.HOST_CANCEL,
    hostMemberSeq
  )

  // 참여자 수 업데이트 및 대기자 승격
  if (previousStatus === EventParticipantStatus.JOIN) {
    const currentCount = await getJoinedParticipantCount(eventId)
    await updateEventCurrentParticipants(eventId, currentCount)
    await promoteFirstWaiter(eventId)
  }
}

// ============ Comment Services ============

/**
 * 댓글 작성
 */
export async function createCommentService(
  data: CreateEventCommentDto
): Promise<EventComment> {
  const event = await getEventById(data.event_id)

  if (!event) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  if (!data.content || data.content.trim().length === 0) {
    throw new ServiceError(ErrorCode.INVALID_INPUT, '댓글 내용을 입력해주세요.')
  }

  return await createComment(data)
}

/**
 * 댓글 수정
 */
export async function updateCommentService(
  commentId: number,
  content: string,
  requesterMemberSeq: number
): Promise<EventComment> {
  const comment = await getCommentById(commentId)

  if (!comment) {
    throw new ServiceError(
      ErrorCode.COMMENT_NOT_FOUND,
      '댓글을 찾을 수 없습니다.'
    )
  }

  if (comment.member_seq !== requesterMemberSeq) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '본인의 댓글만 수정할 수 있습니다.'
    )
  }

  if (!content || content.trim().length === 0) {
    throw new ServiceError(ErrorCode.INVALID_INPUT, '댓글 내용을 입력해주세요.')
  }

  return await updateComment(commentId, content)
}

/**
 * 댓글 삭제
 */
export async function deleteCommentService(
  commentId: number,
  requesterMemberSeq: number
): Promise<boolean> {
  const comment = await getCommentById(commentId)

  if (!comment) {
    throw new ServiceError(
      ErrorCode.COMMENT_NOT_FOUND,
      '댓글을 찾을 수 없습니다.'
    )
  }

  if (comment.member_seq !== requesterMemberSeq) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '본인의 댓글만 삭제할 수 있습니다.'
    )
  }

  return await deleteComment(commentId)
}
