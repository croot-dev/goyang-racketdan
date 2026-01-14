/**
 * NTRP 테니스 등급 상수
 * National Tennis Rating Program
 */

export interface NtrpLevel {
  value: string
  label: string
}

export const NTRP_LEVELS: NtrpLevel[] = [
  { value: '', label: '선택하세요' },
  { value: '1.0', label: '1.0 - 입문' },
  { value: '1.5', label: '1.5' },
  { value: '2.0', label: '2.0 - 초급' },
  { value: '2.5', label: '2.5' },
  { value: '3.0', label: '3.0 - 중급' },
  { value: '3.5', label: '3.5' },
  { value: '4.0', label: '4.0 - 상급' },
  { value: '4.5', label: '4.5' },
  { value: '5.0', label: '5.0 - 최상급' },
]
