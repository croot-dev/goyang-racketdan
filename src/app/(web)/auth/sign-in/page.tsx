'use client'

import { Box, Heading, Text, Stack } from '@chakra-ui/react'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export default function AuthSignIn() {
  const REST_API_KEY = process.env.KAKAO_RESTAPI_KEY
  const [redirectUri, setRedirectUri] = useState('')

  console.log(process.env)
  useEffect(() => {
    setRedirectUri(`${window.location.origin}${process.env.KAKAO_REDIRECT_URI}`)
  }, [])

  const { data: kakaoAuthUrl, refetch } = useQuery<string>({
    queryKey: ['kakao-login'],
    queryFn: async () => {
      // 이름, 생년월일, 성별, 이메일 정보 동의 요청
      // const scope = 'profile_nickname,account_email,name,birthyear,birthday,gender'
      const scope = 'profile_nickname,profile_image,account_email'
      return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${redirectUri}&scope=${scope}`
    },
    enabled: false, // This ensures the query doesn't run on component mount
  })

  useEffect(() => {
    if (kakaoAuthUrl) {
      window.location.href = kakaoAuthUrl
    }
  }, [kakaoAuthUrl])

  const loginWithKakao = () => {
    refetch() // Call refetch to trigger the query manually
  }

  return (
    <Box
      width="full"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <Stack gap={6} align="center" maxW="md" w="full" p={8}>
        <Stack gap={2} align="center" textAlign="center">
          <Heading size="2xl" color="teal.500">
            이름없는 테니스 모임
          </Heading>
          <Text fontSize="lg" color="gray.600">
            카카오 계정으로 간편하게 시작하세요
          </Text>
        </Stack>

        <Box
          as="button"
          onClick={loginWithKakao}
          cursor="pointer"
          transition="transform 0.2s"
          _hover={{ transform: 'scale(1.05)' }}
        >
          <Image
            src="https://k.kakaocdn.net/14/dn/btroDszwNrM/I6efHub1SN5KCJqLm1Ovx1/o.jpg"
            width={183}
            height={45}
            alt="카카오 로그인 버튼"
          />
        </Box>

        <Text fontSize="sm" color="gray.500" textAlign="center">
          카카오 계정으로 로그인하면 자동으로 회원가입이 완료됩니다
        </Text>
      </Stack>
    </Box>
  )
}
