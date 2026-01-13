'use client'
import { useState, useEffect, useRef } from 'react'
import { getUser } from '@/lib/auth.client'
import { UserInfo } from '@/domains/auth/auth.model'

/**
 * 인증 상태를 관리하는 커스텀 훅
 * HttpOnly 쿠키를 사용하므로 서버에 요청하여 인증 상태 확인
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    // Strict Mode에서 중복 호출 방지
    if (hasFetched.current) return

    const checkAuth = async () => {
      hasFetched.current = true
      setIsLoading(true)

      // 서버에서 사용자 정보 가져오기 (HttpOnly 쿠키 사용)
      const userData = await getUser()

      if (userData) {
        setIsAuthenticated(true)
        setUser(userData)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  return {
    isAuthenticated,
    user,
    isLoading,
  }
}
