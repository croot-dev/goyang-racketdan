'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Member, MemberWithRole, UpdateMemberDto } from '@/domains/member'
import { request } from '@/lib/api.client'

export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (page: number, limit: number) =>
    [...memberKeys.lists(), { page, limit }] as const,
  details: () => [...memberKeys.all, 'detail'] as const,
  detail: (id: string) => [...memberKeys.details(), id] as const,
}

/**
 * 프로필 목록 mutation
 */
export function useMemberList({ page = 1, limit = 10 }) {
  return useQuery({
    queryKey: memberKeys.list(page, limit),
    queryFn: () => request(`/api/member`),
  })
}

/**
 * 프로필 조회 mutation
 */
export function useMember(member_id: string) {
  return useQuery({
    queryKey: memberKeys.detail(member_id),
    queryFn: () => request<MemberWithRole>(`/api/member/${member_id}`),
    enabled: !!member_id,
  })
}

/**
 * 프로필 수정 mutation
 */
export function useUpdateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<UpdateMemberDto>) =>
      request<{ user: Member }>(`/api/member/${data.member_id}`, {
        method: 'PUT',
        body: data,
        auth: true,
      }),
    onSuccess: (response) => {
      const updatedUser = response.user

      // detail 업데이트
      queryClient.setQueryData<Member>(
        memberKeys.detail(updatedUser.member_id),
        updatedUser
      )

      // list 업데이트
      queryClient.setQueriesData<Member[]>(
        { queryKey: memberKeys.lists() },
        (old) =>
          old?.map((m) =>
            m.member_id === updatedUser.member_id ? updatedUser : m
          )
      )
    },
  })
}
