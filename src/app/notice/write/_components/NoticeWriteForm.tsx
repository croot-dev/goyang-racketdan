'use client'

import { Field, Stack, Button, Input, Box } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useCreatePost } from '@/hooks/usePosts'

// Quill 에디터를 동적으로 로드 (SSR 방지)
const QuillEditor = dynamic(() => import('./QuillEditor'), {
  ssr: false,
  loading: () => <Box minH="300px" bg="gray.100" borderRadius="md" />,
})

export default function NoticeWriteForm() {
  const router = useRouter()
  const createPost = useCreatePost()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    createPost.mutate(
      {
        bbs_type_id: '1',
        title,
        content,
      },
      {
        onSuccess: (result) => {
          router.push(`/notice/${result}`)
          setIsSubmitting(false)
        },
        onError: (error) => {
          console.error('글 작성 에러:', error)
          alert('글 작성 중 오류가 발생했습니다.')
        },
        onSettled: () => {
          setIsSubmitting(false)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={6}>
        <Field.Root required>
          <Field.Label>제목</Field.Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            size="lg"
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>내용</Field.Label>
          <QuillEditor
            value={content}
            onChange={setContent}
            placeholder="내용을 입력하세요..."
          />
        </Field.Root>

        <Box display="flex" gap={3} justifyContent="flex-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            colorScheme="teal"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            작성하기
          </Button>
        </Box>
      </Stack>
    </form>
  )
}
