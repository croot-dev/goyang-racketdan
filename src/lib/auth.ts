// 클라이언트 사이드 인증 헬퍼 함수

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false

  // localStorage에 사용자 정보가 있는지 확인
  const user = localStorage.getItem('user')
  return !!user
}

export function getUser() {
  if (typeof window === 'undefined') return null

  const userStr = localStorage.getItem('user')
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function setUser(user: any) {
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(user))
}

export function logout() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('user')
  localStorage.removeItem('kakaoUserTemp')
  window.location.href = '/'
}
