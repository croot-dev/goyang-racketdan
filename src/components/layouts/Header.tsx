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
import { useMemo, useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import { useUserInfo } from '@/hooks/useAuth'
import LogoutDialog from '@/components/common/LogoutDialog'
import { MEMBER_ROLE } from '@/constants'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const { data: user } = useUserInfo()
  const isLoggedIn = useMemo(() => !!user, [user])
  const isAdmin = useMemo(() => user?.role_code === MEMBER_ROLE.ADMIN, [user])

  const menuItems = [
    { label: '공지사항', href: '/notice' },
    ...(!!isLoggedIn
      ? [
          { label: '대시보드', href: '/dashboard' },
          { label: '일정', href: '/schedule' },
          { label: '예약', href: '/reservation' },
          isAdmin
            ? { label: '회원목록', href: '/member' }
            : { label: '프로필', href: `/member/${user?.member_id}` },
        ]
      : []),
  ]

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true)
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
                  onClick={handleLogoutClick}
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
                    onClick={handleLogoutClick}
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

      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      />
    </Box>
  )
}
