import { AbsoluteCenter, Box, Heading } from '@chakra-ui/react'

export default function ReservationPage() {
  return (
    <Box position="relative" h="200px" bg="bg.muted">
      <AbsoluteCenter width={'full'}>
        <Heading size="4xl" letterSpacing={4}>
          👷 🚧🚧 👷‍♂️
        </Heading>
      </AbsoluteCenter>
    </Box>
  )
}
