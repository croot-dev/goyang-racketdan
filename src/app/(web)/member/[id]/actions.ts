'use server'

import { revalidatePath } from 'next/cache'

/**
 * 회원 프로필 페이지 캐시 무효화
 * 프로필 수정 후 서버 컴포넌트의 데이터를 갱신하기 위해 사용
 */
export async function revalidateMemberProfile(memberId: string) {
  revalidatePath(`/member/${memberId}`)
}
