import { Field, Stack, Button, Input, Box, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { getPostService } from '@/services/post.service'

interface NoticeReadProps {
  postId: number
}

export default async function NoticeRead({ postId }: NoticeReadProps) {
  const post = await getPostService(postId, 1)

  if (!post) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.600">
          게시글을 찾을 수 없습니다.
        </Text>
        <Link href="/notice/list">
          <Button mt={4} variant="outline">
            목록으로
          </Button>
        </Link>
      </Box>
    )
  }

  return (
    <Stack gap={6}>
      {/* 게시글 정보 */}
      <Box>
        <Text fontSize="sm" color="gray.600" mb={2}>
          작성자: {post.writer_id} | 작성일:{' '}
          {new Date(post.created_at).toLocaleDateString('ko-KR')} | 조회수:{' '}
          {post.view_count}
        </Text>
      </Box>

      {/* 제목 */}
      <Field.Root>
        <Field.Label>제목</Field.Label>
        <Input value={post.title} readOnly bg="gray.50" />
      </Field.Root>

      {/* 내용 */}
      <Field.Root>
        <Field.Label>내용</Field.Label>
        <Box
          minH="300px"
          width="full"
          p={4}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          bg="gray.50"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
          css={{
            '& p': { marginBottom: '1em' },
            '& ul, & ol': { marginLeft: '1.5em', marginBottom: '1em' },
            '& h1, & h2, & h3': { fontWeight: 'bold', marginBottom: '0.5em' },
          }}
        />
      </Field.Root>

      {/* 버튼 */}
      <Box display="flex" gap={3} justifyContent="space-between">
        <Link href="/notice/list">
          <Button variant="outline">목록으로</Button>
        </Link>

        <Box display="flex" gap={3}>
          <Link href={`/notice/edit/${post.post_id}`}>
            <Button colorScheme="blue">수정</Button>
          </Link>
          <Button colorScheme="red" variant="outline">
            삭제
          </Button>
        </Box>
      </Box>
    </Stack>
  )
}
