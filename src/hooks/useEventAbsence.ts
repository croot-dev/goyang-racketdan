'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { request } from '@/lib/api.client'
import type {
  EventAbsence,
  EventAbsenceWithDetails,
  EventAbsenceWithMember,
  EventAbsenceListResult,
  AbsenceTypeType,
} from '@/domains/event_absence/event_absence.model'

export const eventAbsenceKeys = {
  all: ['eventAbsences'] as const,
  list: () => [...eventAbsenceKeys.all, 'list'] as const,
  detail: (id: number) => [...eventAbsenceKeys.all, 'detail', id] as const,
  byEvent: (eventId: number) =>
    [...eventAbsenceKeys.all, 'event', eventId] as const,
  byMember: (memberSeq: number) =>
    [...eventAbsenceKeys.all, 'member', memberSeq] as const,
}

/**
 * 불참 기록 목록 조회
 */
export function useEventAbsences(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [...eventAbsenceKeys.list(), page, limit],
    queryFn: async () => {
      const result = await request<EventAbsenceListResult & { page: number; limit: number }>(
        `/api/event-absence?page=${page}&limit=${limit}`
      )
      return result
    },
  })
}

/**
 * 불참 기록 상세 조회
 */
export function useEventAbsenceDetail(id: number) {
  return useQuery({
    queryKey: eventAbsenceKeys.detail(id),
    queryFn: () => request<EventAbsenceWithDetails>(`/api/event-absence/${id}`),
    enabled: id > 0,
  })
}

/**
 * 특정 이벤트의 불참 기록 조회
 */
export function useEventAbsencesByEvent(eventId: number) {
  return useQuery({
    queryKey: eventAbsenceKeys.byEvent(eventId),
    queryFn: () =>
      request<{ absences: EventAbsenceWithMember[] }>(
        `/api/event-absence/event/${eventId}`
      ),
    enabled: eventId > 0,
  })
}

/**
 * 특정 회원의 불참 기록 조회
 */
export function useEventAbsencesByMember(
  memberSeq: number,
  includeStats: boolean = false
) {
  return useQuery({
    queryKey: [...eventAbsenceKeys.byMember(memberSeq), includeStats],
    queryFn: () =>
      request<{
        absences: EventAbsenceWithDetails[]
        stats?: { total: number; late: number; noShow: number }
      }>(`/api/event-absence/member/${memberSeq}?stats=${includeStats}`),
    enabled: memberSeq > 0,
  })
}

/**
 * 불참 기록 생성 Input
 */
export interface CreateEventAbsenceInput {
  event_id: number
  member_seq: number
  absence_type: AbsenceTypeType
  reason: string
  late_minutes?: number
}

/**
 * 불참 기록 생성 mutation
 */
export function useCreateEventAbsence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventAbsenceInput) =>
      request<EventAbsence>('/api/event-absence', {
        method: 'POST',
        body: data,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventAbsenceKeys.list() })
      queryClient.invalidateQueries({
        queryKey: eventAbsenceKeys.byEvent(variables.event_id),
      })
      queryClient.invalidateQueries({
        queryKey: eventAbsenceKeys.byMember(variables.member_seq),
      })
    },
  })
}

/**
 * 불참 기록 수정 Input
 */
export interface UpdateEventAbsenceInput {
  id: number
  absence_type: AbsenceTypeType
  reason: string
  late_minutes?: number
}

/**
 * 불참 기록 수정 mutation
 */
export function useUpdateEventAbsence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateEventAbsenceInput) =>
      request<EventAbsence>(`/api/event-absence/${id}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventAbsenceKeys.list() })
      queryClient.invalidateQueries({
        queryKey: eventAbsenceKeys.detail(variables.id),
      })
    },
  })
}

/**
 * 불참 기록 삭제 mutation
 */
export function useDeleteEventAbsence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      request(`/api/event-absence/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventAbsenceKeys.list() })
    },
  })
}
