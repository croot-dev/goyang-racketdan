'use client'

import {
  Box,
  Container,
  Flex,
  Button,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import { logout } from '@/lib/auth-client'
import { useAuth } from '@/hooks/useAuth'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated: isLoggedIn, user } = useAuth()

  const menuItems = [
    { label: '메인', href: '/' },
    { label: '공지사항', href: '/notice/list' },
    ...(isLoggedIn
      ? [
          { label: '대시보드', href: '/dashboard' },
          { label: '예약', href: '/reservation' },
          { label: '프로필', href: '/profile' },
        ]
      : []),
  ]

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <Box
      as="header"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Container maxW="container.xl">
        <Flex h={16} align="center" justify="space-between">
          {/* Logo */}
          <Link href="/">
            <Box
              fontWeight="bold"
              fontSize="xl"
              color="teal.500"
              cursor="pointer"
            >
              고양 라켓단
            </Box>
          </Link>

          {/* Desktop Navigation */}
          <HStack gap={6} display={{ base: 'none', md: 'flex' }}>
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Box
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: 'gray.100' }}
                  cursor="pointer"
                  fontWeight="medium"
                  color="gray.700"
                >
                  {item.label}
                </Box>
              </Link>
            ))}
          </HStack>

          {/* Auth Buttons (Desktop) */}
          <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
            {isLoggedIn ? (
              <>
                <Text fontSize="sm" color="gray.600">
                  {user?.nickname}님
                </Text>
                <Button
                  colorScheme="teal"
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <Link href="/auth/sign-in">
                <Button colorScheme="teal" size="sm">
                  로그인
                </Button>
              </Link>
            )}
          </HStack>

          {/* Mobile Menu Button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={() => setIsOpen(!isOpen)}
            variant="ghost"
            aria-label="Open menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </IconButton>
        </Flex>

        {/* Mobile Navigation */}
        {isOpen && (
          <Box pb={4} display={{ md: 'none' }}>
            <Flex direction="column" gap={2}>
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Box
                    px={3}
                    py={2}
                    rounded="md"
                    _hover={{ bg: 'gray.100' }}
                    cursor="pointer"
                    fontWeight="medium"
                    color="gray.700"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Box>
                </Link>
              ))}
              {isLoggedIn ? (
                <Box mt={2}>
                  <Text fontSize="sm" color="gray.600" mb={2} px={3}>
                    {user?.nickname}님
                  </Text>
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    size="sm"
                    width="full"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </Button>
                </Box>
              ) : (
                <Box mt={2}>
                  <Link href="/auth/sign-in">
                    <Button
                      colorScheme="teal"
                      size="sm"
                      width="full"
                      onClick={() => setIsOpen(false)}
                    >
                      로그인
                    </Button>
                  </Link>
                </Box>
              )}
            </Flex>
          </Box>
        )}
      </Container>
    </Box>
  )
}
