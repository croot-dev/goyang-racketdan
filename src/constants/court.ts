/**
 * 테니스 코트 관련 상수
 */

/**
 * 코트 타입
 */
export const COURT_TYPE = Object.freeze({
  HARD: 'hard',
  CLAY: 'clay',
  GRASS: 'grass',
  TURF: 'turf',
} as const)

export type CourtType = (typeof COURT_TYPE)[keyof typeof COURT_TYPE]

export const COURT_TYPE_LABEL: Record<CourtType, string> = {
  [COURT_TYPE.HARD]: '하드',
  [COURT_TYPE.CLAY]: '클레이',
  [COURT_TYPE.TURF]: '인조잔디',
  [COURT_TYPE.GRASS]: '잔디',
}

/**
 * 편의시설 코드
 */
export const COURT_AMENITY = Object.freeze({
  PARKING: 'parking',
  SHOWER: 'shower',
  LOCKER: 'locker',
  RENTAL: 'rental',
  PRO_SHOP: 'pro_shop',
  CAFE: 'cafe',
  LESSON: 'lesson',
  NIGHT_LIGHT: 'night_light',
  REST_AREA: 'rest_area',
  WATER: 'water',
  WIFI: 'wifi',
  AIR_CONDITIONING: 'air_conditioning',
} as const)

export type CourtAmenity = (typeof COURT_AMENITY)[keyof typeof COURT_AMENITY]

export const COURT_AMENITY_LABEL: Record<CourtAmenity, string> = {
  [COURT_AMENITY.PARKING]: '주차장',
  [COURT_AMENITY.SHOWER]: '샤워실',
  [COURT_AMENITY.LOCKER]: '락커',
  [COURT_AMENITY.RENTAL]: '장비대여',
  [COURT_AMENITY.PRO_SHOP]: '프로샵',
  [COURT_AMENITY.CAFE]: '카페',
  [COURT_AMENITY.LESSON]: '레슨',
  [COURT_AMENITY.NIGHT_LIGHT]: '야간조명',
  [COURT_AMENITY.REST_AREA]: '휴게공간',
  [COURT_AMENITY.WATER]: '정수기',
  [COURT_AMENITY.WIFI]: '와이파이',
  [COURT_AMENITY.AIR_CONDITIONING]: '냉난방',
}

export const COURT_AMENITY_LIST = Object.values(COURT_AMENITY)
