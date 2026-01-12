'use client'

import { getUser } from '@/lib/auth'
import { Field, Stack, Button, Input, Container } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'

interface FormValues {
  bbs_type_id: string
  writer_id: string
  title: string
  content: string
}

export default function ManagementNoticeCreate() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()
  const onSubmit = handleSubmit(async (formData) => {
    const res = await fetch('/api/bbs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
    })

    if (res.ok) {
      const {post_id, bbs_type_id} = await res.json()
      const params = new URLSearchParams()
      params.set('id', post_id)
      params.set('type', bbs_type_id)
      router.push(['/api/bbs',params.toString()].join('?'))
    }
    return false
  })

  const user = getUser()

  return (
    <Container maxW="md" py={10} width="full">
    <form onSubmit={onSubmit}>
      <Stack>
        <Input {...register('bbs_type_id', {value:'1'})} type='hidden'/>
        <Input {...register('writer_id', {value:user?.id})} type='hidden'/>
        <Field.Root>
          <Field.Label>Title</Field.Label>
          <Input {...register('title', { required: true })} />
        </Field.Root>
        <Field.Root>
          <Field.Label>Content</Field.Label>
          <Input {...register('content', { required: true })} />
        </Field.Root>
      </Stack>

      <Button type="submit">Submit</Button>
    </form>
    </Container>
  )
}
