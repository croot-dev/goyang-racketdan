// 이 파일은 하위 호환성을 위해 유지됩니다.
// 새로운 코드는 auth-client.ts를 사용하세요.

export {
  isLoggedIn,
  getUser,
  setUser,
  logout,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  authenticatedFetch,
  type User,
} from './auth-client'
