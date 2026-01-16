'use client'

import { useMemo, useState } from 'react'
import {
  Stack,
  Card,
  Input,
  Button,
  Text,
  Field,
  NativeSelect,
} from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'
import { NTRP_LEVELS, MEMBER_GENDER, MEMBER_ROLE } from '@/constants'
import type { Member, UpdateMemberDto } from '@/domains/member/member.model'
import { useUpdateMember } from '@/hooks/useMember'
import { useUserInfo } from '@/hooks/useAuth'

const GENDER_OPTIONS = [
  { value: MEMBER_GENDER.MALE, label: '남성' },
  { value: MEMBER_GENDER.FEMALE, label: '여성' },
] as const

interface ProfileFormProps {
  initialData: Member
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const { data: userInfo } = useUserInfo()
  const updateMember = useUpdateMember()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UpdateMemberDto>>({
    member_id: initialData.member_id,
    name: initialData.name,
    nickname: initialData.nickname,
    ntrp: initialData.ntrp,
    phone: initialData.phone,
  })

  const isEditable = useMemo(
    () =>
      [
        initialData.member_id === userInfo?.member_id,
        userInfo?.role_code === MEMBER_ROLE.ADMIN,
      ].some((v) => v),
    [userInfo, initialData]
  )

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
    setFormData({
      member_id: initialData.member_id,
      name: initialData.name,
      nickname: initialData.nickname,
      ntrp: initialData.ntrp,
      phone: initialData.phone || '',
    })
    setIsEditing(false)
  }

  return (
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
            <Input value={initialData.email} disabled />
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
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              disabled={!isEditing}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>테니스 등급 (NTRP)</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={formData.ntrp}
                disabled={!isEditing}
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
                value={initialData.gender}
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
      {isEditable && (
        <Card.Footer>
          {isEditing ? (
            <>
              <Button
                colorScheme="teal"
                onClick={handleSave}
                loading={updateMember.isPending}
                disabled={updateMember.isPending}
              >
                저장
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateMember.isPending}
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
      )}
    </Card.Root>
  )
}
