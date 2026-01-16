'use client'

import { Field, Stack, Button } from '@chakra-ui/react'
import {
  PasswordInput,
  PasswordStrengthMeter,
} from './_components/password-input'
import { useForm } from 'react-hook-form'

interface FormValues {
  newPassword: string
  confirmPassword: string
}

export default function AuthResetPw() {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()
  const livePassword = watch('newPassword', '')

  const getPasswordStrength = (password: string): number => {
    let score = 0

    // 조건별 점수 부여
    if (password.length >= 8) score++ // 충분한 길이
    if (/[A-Z]/.test(password)) score++ // 대문자 포함
    if (/[0-9]/.test(password)) score++ // 숫자 포함
    if (/[^A-Za-z0-9]/.test(password)) score++ // 특수문자 포함

    // 추가 보너스: 길이가 12자 이상이면 한 점 추가
    if (password.length >= 12) score++

    return score
  }

  const onSubmit = handleSubmit((data) => {
    console.log(data)
    return false
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <Field.Root>
          <Field.Label>New password</Field.Label>
          <PasswordInput {...(register('newPassword'), { required: true })} />
        </Field.Root>
        <Field.Root invalid={!!errors.confirmPassword}>
          <Field.Label>Confirm password</Field.Label>
          <PasswordInput {...register('confirmPassword')} />
        </Field.Root>
        <PasswordStrengthMeter value={getPasswordStrength(livePassword)} />
      </Stack>

      <Button type="submit">Submit</Button>
    </form>
  )
}
