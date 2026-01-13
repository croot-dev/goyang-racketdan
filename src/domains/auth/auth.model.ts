/**
 * Auth 모델
 * 인증/인가 관련 타입 정의
 */

/**
 * JWT 토큰 페이로드
 */
export interface TokenPayload {
  userId: string
  email?: string
  name?: string
}

/**
 * 회원가입 요청 데이터
 */
export interface RegisterDto {
  email: string
  name: string
  gender: string // 'M' or 'F'
  nickname: string
  ntrp: string
  phone?: string
}

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

/**
 * 인증된 사용자 정보 (클라이언트용)
 */
export interface AuthUser {
  id: string
  email?: string
  name?: string
  nickname?: string
  ntrp: string
  phone?: string
}

/**
 * 회원 정보 (비밀번호 제외)
 */
export interface UserInfo {
  id: string
  email: string
  name: string
  nickname: string
  ntrp: string
  sex: 'male' | 'female'
  phone: string
}
