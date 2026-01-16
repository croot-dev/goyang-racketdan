'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { request } from '@/lib/api.client'

export const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  description: string
}

/**
 * 이벤트 목록 조회
 */
export function useEvents() {
  return useQuery({
    queryKey: eventKeys.list(),
    queryFn: () => request<CalendarEvent[]>('/api/events'),
  })
}

interface CreateEventInput {
  id: string
  title: string
  start: string
  end?: string
  description?: string
}

/**
 * 이벤트 생성 mutation
 */
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventInput) =>
      request<CalendarEvent>('/api/events', { body: data }),
    onSuccess: (newEvent) => {
      // 캐시에 새 이벤트 추가 (낙관적 업데이트)
      queryClient.setQueryData<CalendarEvent[]>(eventKeys.list(), (old) =>
        old ? [...old, newEvent] : [newEvent]
      )
    },
  })
}
