'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Card,
  Link,
} from '@chakra-ui/react'
import { LuCalendarCheck2, LuMapPin } from 'react-icons/lu'
import NaverMap from '@/components/common/NaverMap'
import Script from 'next/script'

const CourtLocationType = Object.freeze({
  INDOOR: 'indoor',
  OUTDOOR: 'outdoor',
} as const)

type CourtLocationType =
  (typeof CourtLocationType)[keyof typeof CourtLocationType]

export interface Court {
  id: number | string
  name: string
  locationType: CourtLocationType
  url?: string
  naverPid?: string
}

const courts = [
  {
    name: '성사시립테니스장',
    locationType: CourtLocationType.OUTDOOR,
    url: 'https://www.gytennis.or.kr/',
  },
  {
    name: '금문테니스장 화전점',
    locationType: CourtLocationType.OUTDOOR,
    naverPid: '1283432341',
  },
  {
    name: '테니스빌리지 식사풍동점',
    locationType: CourtLocationType.INDOOR,
    naverPid: '1036711328',
  },
  {
    name: '테니스써밋 일산점',
    locationType: CourtLocationType.INDOOR,
    naverPid: '1804315636',
  },
  {
    name: '에어코트 테니스장',
    locationType: CourtLocationType.OUTDOOR,
    naverPid: '1799873595',
  },
  {
    name: '고양루프탑테니스',
    locationType: CourtLocationType.OUTDOOR,
    naverPid: '1060866445',
  },
  {
    name: '그린테니스클럽',
    locationType: CourtLocationType.OUTDOOR,
    naverPid: '12018376',
    url: 'tel:02-359-3858',
  },
  {
    name: '테니스빌리지 백석장항점',
    locationType: CourtLocationType.INDOOR,
    naverPid: '2043996936',
  },
  {
    name: '은평구민체육센터테니스장',
    locationType: CourtLocationType.INDOOR,
    naverPid: '18694064',
    url: 'https://www.efmc.or.kr/fmcs/32?facilities_type=C&rent_type=1001&center=EFMC01&part=15&place=3',
  },
].map<Court>((v, i) => ({
  ...v,
  id: i,
  ...(!v.url &&
    v.naverPid && { url: `https://map.naver.com/p/entry/place/${v.naverPid}` }),
}))

const CourtLocationTypeLabels: Record<CourtLocationType, string> = {
  indoor: '실내 코트',
  outdoor: '야외 코트',
}

function CourtCard({
  info,
  isSelected,
  onSelect,
}: {
  info: Court
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <>
      <Card.Root
        borderColor={isSelected ? 'teal.500' : undefined}
        borderWidth={isSelected ? '2px' : '1px'}
        _hover={{ shadow: 'md', borderColor: 'teal.500' }}
        transition="all 0.2s"
        onClick={onSelect}
      >
        <Card.Body padding={3}>
          <Stack gap={2}>
            <Stack direction="row" justify="space-between" align="center">
              <Stack direction="row" justify="space-between" align="center">
                <LuMapPin
                  color={
                    isSelected ? 'var(--chakra-colors-teal-500' : undefined
                  }
                />
                <Text fontWeight="medium">{info.name}</Text>
              </Stack>
              <Stack direction="row" gap={2}>
                <Link
                  href={
                    info.naverPid
                      ? `https://map.naver.com/p/entry/place/${info.naverPid}?placePath=/ticket`
                      : info.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  color="gray.500"
                  _hover={{ color: 'teal.600' }}
                  padding={2}
                >
                  <LuCalendarCheck2 />
                </Link>
              </Stack>
            </Stack>
          </Stack>
        </Card.Body>
      </Card.Root>
    </>
  )
}

export default function ReservationPage() {
  const [selectedCourt, setselectedCourt] = useState<Court | null>(null)

  const indoorCourts = courts.filter((court) => court.locationType === 'indoor')
  const outdoorCourts = courts.filter(
    (court) => court.locationType === 'outdoor',
  )

  const handleSelect = (court: Court) => {
    if (selectedCourt?.id === court.id) {
      setselectedCourt(null)
    } else {
      setselectedCourt(court)
    }
  }

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NCP_CLIENT_ID}`}
        strategy="beforeInteractive"
      />
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps-geocoder.js`}
        strategy="beforeInteractive"
      />
      <Container maxW="container.md" py={8}>
        <Stack gap={6}>
          <Box textAlign="center">
            <Heading size="xl" mb={2}>
              코트 예약
            </Heading>
            <Text color="gray.600">외부 예약 사이트로 이동합니다</Text>
          </Box>

          <Box>
            <NaverMap courts={courts} selectedCourt={selectedCourt} />
          </Box>

          {indoorCourts.length > 0 && (
            <Stack gap={3}>
              <Heading size="md" color="gray.700">
                {CourtLocationTypeLabels.indoor}
              </Heading>
              <Stack gap={2}>
                {indoorCourts.map((court) => (
                  <CourtCard
                    key={court.id}
                    info={court}
                    isSelected={selectedCourt?.id === court.id}
                    onSelect={() => handleSelect(court)}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          {outdoorCourts.length > 0 && (
            <Stack gap={3}>
              <Heading size="md" color="gray.700">
                {CourtLocationTypeLabels.outdoor}
              </Heading>
              <Stack gap={2}>
                {outdoorCourts.map((court) => (
                  <CourtCard
                    key={court.id}
                    info={court}
                    isSelected={selectedCourt?.id === court.id}
                    onSelect={() => handleSelect(court)}
                  />
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Container>
    </>
  )
}
