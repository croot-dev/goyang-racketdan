'use client'

import { useState } from 'react'
import {
  Stack,
  Card,
  Input,
  Button,
  Text,
  Field,
  NativeSelect,
  SegmentGroup,
} from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'
import WithdrawDialog from '@/components/common/WithdrawDialog'
import { NTRP_LEVELS, MEMBER_GENDER } from '@/constants'
import type { MemberWithRole } from '@/domains/member/member.model'
import { useUpdateMember } from '@/hooks/useMember'
import { Controller, useForm } from 'react-hook-form'
import { useHookFormMask } from 'use-mask-input'

interface FormValues {
  member_id: string
  name: string
  birthdate: string
  gender: 'M' | 'F'
  nickname: string
  ntrp: string
  phone: string
}

const GENDER_OPTIONS = [
  { value: MEMBER_GENDER.MALE, label: '남성' },
  { value: MEMBER_GENDER.FEMALE, label: '여성' },
]

interface MemberFormProps {
  initialData: MemberWithRole
}

export default function MemberForm({ initialData }: MemberFormProps) {
  const updateMember = useUpdateMember()
  const [isEditing, setIsEditing] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      member_id: initialData.member_id,
      name: initialData.name,
      birthdate: initialData.birthdate,
      nickname: initialData.nickname,
      ntrp: initialData.ntrp,
      phone: initialData.phone ?? '',
      gender: initialData.gender,
    },
  })
  const registerWithMask = useHookFormMask(register)

  const handleSave = handleSubmit(async (formData) => {
    if (
      [
        !formData.name,
        !formData.birthdate,
        !formData.nickname,
        !formData.ntrp,
        !formData.phone,
      ].some((v) => v)
    ) {
      toaster.create({
        title: '입력 오류',
        description: '이름, 별명, NTRP는 필수 입력 항목입니다.',
        type: 'error',
      })
      return
    }

    const mutateData = {
      member_id: formData.member_id,
      name: formData.name,
      birthdate: formData.birthdate.replace(/-/g, ''),
      nickname: formData.nickname,
      ntrp: formData.ntrp,
      phone: formData.phone.replace(/-/g, ''),
      gender: formData.gender,
    }

    updateMember.mutate(mutateData, {
      onSuccess: (result) => {
        toaster.create({
          title: '성공',
          description: '프로필이 업데이트되었습니다.',
          type: 'success',
        })

        setIsEditing(false)
        location.reload()
      },
      onError: (error) => {
        console.log(error)
      },
    })
  })

  const handleCancel = () => {
    reset()
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

          <Field.Root invalid={!!errors.name} required>
            <Field.Label>이름</Field.Label>
            <Input
              {...register('name', {
                required: '이름을 입력해주세요',
                minLength: {
                  value: 2,
                  message: '이름은 최소 2자 이상이어야 합니다',
                },
                disabled: !isEditing,
              })}
              placeholder="박보검"
            />
            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
          </Field.Root>

          {/* 생년월일 */}
          <Field.Root invalid={!!errors.birthdate} required>
            <Field.Label>생년월일</Field.Label>
            <Input
              placeholder="YYYY-MM-DD"
              maxLength={10}
              inputMode="numeric"
              disabled={!isEditing}
              {...registerWithMask('birthdate', '9999-99-99', {
                required: '생년월일을 입력해주세요',
                validate: (value) => {
                  if (!value) {
                    return '생년월일을 다시 확인해주세요'
                  }

                  const year = Number(value.slice(0, 4))
                  const month = Number(value.slice(5, 7))
                  const day = Number(value.slice(8, 10))
                  const currentYear = new Date().getFullYear()

                  if (
                    year < 1970 ||
                    year > currentYear ||
                    month < 1 ||
                    month > 12 ||
                    day < 1 ||
                    day > 31
                  ) {
                    return '생년월일을 다시 확인해주세요'
                  }

                  return true
                },
              })}
            />

            <Field.HelperText>숫자 8자리 입력 (예: 19900101)</Field.HelperText>
            <Field.ErrorText>{errors.birthdate?.message}</Field.ErrorText>
          </Field.Root>

          {/* 별명 */}
          <Field.Root invalid={!!errors.nickname} required>
            <Field.Label>별명</Field.Label>
            <Input
              {...register('nickname', {
                required: '별명을 입력해주세요',
                minLength: {
                  value: 2,
                  message: '별명은 최소 2자 이상이어야 합니다',
                },
                maxLength: {
                  value: 10,
                  message: '별명은 최대 10자까지 가능합니다',
                },
                disabled: !isEditing,
              })}
              placeholder="별명을 입력해주세요"
            />
            <Field.ErrorText>{errors.nickname?.message}</Field.ErrorText>
          </Field.Root>

          {/* 성별 */}
          <Field.Root invalid={!!errors.gender} required>
            <Field.Label>성별</Field.Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <SegmentGroup.Root
                  value={field.value}
                  disabled={!isEditing}
                  onValueChange={(details) => {
                    details.value && field.onChange(details.value)
                  }}
                >
                  <SegmentGroup.Indicator />
                  <SegmentGroup.Items items={GENDER_OPTIONS} />
                </SegmentGroup.Root>
              )}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>테니스 등급 (NTRP)</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                {...register('ntrp', {
                  required: '테니스 등급을 선택해주세요',
                  validate: (value) =>
                    value !== '' || '테니스 등급을 선택해주세요',
                  disabled: !isEditing,
                })}
              >
                {NTRP_LEVELS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
            <Field.HelperText>
              현재 테니스 실력 수준을 선택해주세요
            </Field.HelperText>
            <Field.ErrorText>{errors.ntrp?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root>
            <Field.Label>전화번호</Field.Label>
            <Input
              placeholder="010-0000-0000"
              maxLength={13}
              inputMode="numeric"
              {...registerWithMask('phone', '010-9999-9999', {
                disabled: !isEditing,
                validate: (value) => {
                  if (!value) return true
                  const digits = value.replace(/\D/g, '')
                  if (digits.length !== 11)
                    return '전화번호 11자리를 입력해주세요'
                  if (!digits.startsWith('01'))
                    return '올바른 전화번호를 입력해주세요'
                  return true
                },
              })}
            />
            <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
          </Field.Root>
        </Stack>
      </Card.Body>
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
          <>
            <Button colorScheme="teal" onClick={() => setIsEditing(true)}>
              수정
            </Button>
            <Button
              variant="outline"
              colorPalette="red"
              onClick={() => setWithdrawDialogOpen(true)}
            >
              회원 탈퇴
            </Button>
          </>
        )}
      </Card.Footer>

      <WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        memberId={initialData.member_id}
      />
    </Card.Root>
  )
}
