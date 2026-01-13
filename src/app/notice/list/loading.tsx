import { Box, Container, Heading, Stack, Skeleton } from '@chakra-ui/react'
import Header from '@/components/layouts/Header'

export default function NoticeListLoading() {
  return (
    <Box>
      <Header />

      <Container maxW="container.xl" py={10}>
        <Stack gap={6}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading size="2xl">공지사항</Heading>
            <Skeleton height="40px" width="100px" />
          </Box>

          <Box>
            <Stack gap={3}>
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} height="60px" />
              ))}
            </Stack>
          </Box>

          <Box display="flex" justifyContent="center" gap={2} mt={6}>
            <Skeleton height="40px" width="200px" />
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
