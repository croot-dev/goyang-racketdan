/**
 * Auth 모델
 * 인증/인가 관련 타입 정의
 */

/**
 * 로그인 요청 데이터
 */
export interface LoginDto {
  email: string
  password: string
}

/**
 * 카카오 사용자 정보
 */
export interface KakaoUserInfo {
  id: number
  kakao_account?: {
    email?: string
    name?: string
    profile?: {
      nickname?: string
    }
  }
}
