'use client'

import { Field, Fieldset, Input, Stack, Button } from '@chakra-ui/react'
import { PasswordInput } from '@/components/ui/password-input'
import { useForm } from 'react-hook-form'

interface FormValues {
  username: string
  password: string
}

export default function AuthSignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = handleSubmit((data) => {
    console.log(data)
    return false
  })

  return (
    <form onSubmit={onSubmit}>
      <Fieldset.Root size="lg" maxW="md">
        <Stack>
          <Fieldset.Legend>Contact details</Fieldset.Legend>
          <Fieldset.HelperText>
            Please provide your contact details below.
          </Fieldset.HelperText>
        </Stack>

        <Fieldset.Content>
          <Field.Root invalid={!!errors.username}>
            <Field.Label>Username</Field.Label>
            <Input {...(register('username'), { required: true })} />
            <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label>Password</Field.Label>
            <PasswordInput {...(register('password'), { required: true })} />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>
        </Fieldset.Content>

        <Button type="submit" alignSelf="flex-start">
          Submit
        </Button>
      </Fieldset.Root>
    </form>
  )
}
