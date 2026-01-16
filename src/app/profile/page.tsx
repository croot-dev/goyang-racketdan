'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Heading,
  Stack,
  Card,
  Input,
  Button,
  Text,
  Spinner,
  Field,
  NativeSelect,
} from '@chakra-ui/react'
import { useUserInfo } from '@/hooks/useAuth'
import { toaster } from '@/components/ui/toaster'
import { NTRP_LEVELS, MEMBER_GENDER } from '@/constants'
import type { Member, UpdateMemberDto } from '@/domains/member/member.model'
import { useUpdateMember } from '@/hooks/useMember'

const GENDER_OPTIONS = [
  { value: MEMBER_GENDER.MALE, label: '남성' },
  { value: MEMBER_GENDER.FEMALE, label: '여성' },
] as const

export default function ProfilePage() {
  const router = useRouter()
  const updateMember = useUpdateMember()
  const { data: myInfo, isLoading: authLoading } = useUserInfo()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<UpdateMemberDto>>({
    member_id: '',
    name: '',
    nickname: '',
    ntrp: '',
    phone: '',
  })

  useEffect(() => {
    // 로딩이 끝난 후 인증되지 않았으면 로그인 페이지로 이동
    if (!authLoading && !myInfo) {
      router.push('/auth/sign-in')
    }
  }, [authLoading, myInfo, router])

  useEffect(() => {
    // 사용자 정보가 로드되면 폼 데이터 초기화
    if (myInfo) {
      setFormData({
        member_id: myInfo.member_id,
        name: myInfo.name,
        nickname: myInfo.nickname,
        ntrp: myInfo.ntrp,
        phone: myInfo.phone,
      })
    }
  }, [myInfo])

  const handleInputChange = (field: keyof Member, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    if (!formData.name || !formData.nickname || !formData.ntrp) {
      toaster.create({
        title: '입력 오류',
        description: '이름, 별명, NTRP는 필수 입력 항목입니다.',
        type: 'error',
      })
      return
    }

    setIsSaving(true)
    updateMember.mutate(formData, {
      onSuccess: (result) => {
        toaster.create({
          title: '성공',
          description: '프로필이 업데이트되었습니다.',
          type: 'success',
        })

        setIsEditing(false)
        setFormData(result.user)
      },
      onError: (error) => {
        console.log(error)
      },
    })
  }

  const handleCancel = () => {
    // 폼 데이터를 원래 사용자 정보로 되돌림
    if (myInfo) {
      setFormData({
        name: myInfo.name,
        nickname: myInfo.nickname,
        ntrp: myInfo.ntrp,
        phone: myInfo.phone || '',
      })
    }
    setIsEditing(false)
  }

  if (authLoading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" color="teal.500" />
      </Box>
    )
  }

  if (!myInfo) {
    return null // 리다이렉트 중
  }

  return (
    <Container maxW="container.md" py={8}>
      <Stack gap={6}>
        <Box>
          <Heading size="2xl" mb={2}>
            프로필
          </Heading>
          <Text color="gray.600" fontSize="lg">
            회원 정보를 확인하고 수정할 수 있습니다.
          </Text>
        </Box>

        <Card.Root>
          <Card.Header>
            <Text fontSize="lg" fontWeight="bold">
              내 정보
            </Text>
          </Card.Header>
          <Card.Body>
            <Stack gap={4}>
              <Field.Root readOnly>
                <Field.Label>이메일</Field.Label>
                <Input value={myInfo.email} disabled />
              </Field.Root>

              <Field.Root required>
                <Field.Label>이름</Field.Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>별명</Field.Label>
                <Input
                  value={formData.nickname}
                  onChange={(e) =>
                    handleInputChange('nickname', e.target.value)
                  }
                  disabled={!isEditing}
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>테니스 등급 (NTRP)</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    disabled={!isEditing}
                    value={formData.ntrp}
                    onChange={(e) => handleInputChange('ntrp', e.target.value)}
                  >
                    {NTRP_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field.Root>

              <Field.Root>
                <Field.Label>전화번호</Field.Label>
                <Input
                  value={formData.phone ?? ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="010-1234-5678"
                />
              </Field.Root>

              <Field.Root readOnly>
                <Field.Label>성별</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    value={myInfo.gender}
                    disabled={!isEditing}
                  >
                    {GENDER_OPTIONS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field.Root>
            </Stack>
          </Card.Body>
          <Card.Footer>
            {isEditing ? (
              <>
                <Button
                  colorScheme="teal"
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={isSaving}
                >
                  저장
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  취소
                </Button>
              </>
            ) : (
              <Button colorScheme="teal" onClick={() => setIsEditing(true)}>
                수정
              </Button>
            )}
          </Card.Footer>
        </Card.Root>
      </Stack>
    </Container>
  )
}
