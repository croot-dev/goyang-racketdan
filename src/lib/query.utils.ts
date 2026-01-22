/**
 * 페이지네이션 및 쿼리 관련 유틸리티
 */

/**
 * 페이지네이션 설정 상수
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const

/**
 * 페이지네이션 파라미터 인터페이스
 */
export interface PaginationParams {
  page: number
  limit: number
}

/**
 * 페이지네이션 결과 인터페이스
 */
export interface PaginationResult {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * URL SearchParams에서 페이지네이션 파라미터를 안전하게 파싱
 *
 * - page는 최소 1로 보장
 * - limit는 MIN_LIMIT ~ MAX_LIMIT 범위로 보장
 * - 잘못된 값(NaN, 음수 등)은 기본값으로 대체
 *
 * @param pageStr - page 파라미터 문자열
 * @param limitStr - limit 파라미터 문자열
 * @returns 안전하게 파싱된 page, limit 객체
 *
 * @example
 * const { page, limit } = parsePaginationParams(
 *   searchParams.get('page'),
 *   searchParams.get('limit')
 * )
 */
export function parsePaginationParams(
  pageStr?: string | null,
  limitStr?: string | null
): PaginationParams {
  const parsedPage = parseInt(pageStr || '', 10)
  const parsedLimit = parseInt(limitStr || '', 10)

  const page = Number.isNaN(parsedPage) || parsedPage < 1
    ? PAGINATION_CONFIG.DEFAULT_PAGE
    : parsedPage

  const limit = Number.isNaN(parsedLimit)
    ? PAGINATION_CONFIG.DEFAULT_LIMIT
    : Math.min(
        PAGINATION_CONFIG.MAX_LIMIT,
        Math.max(PAGINATION_CONFIG.MIN_LIMIT, parsedLimit)
      )

  return { page, limit }
}

/**
 * 페이지네이션 offset 계산
 *
 * @param page - 현재 페이지 (1부터 시작)
 * @param limit - 페이지당 항목 수
 * @returns SQL OFFSET 값
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

/**
 * 총 페이지 수 계산
 *
 * @param total - 전체 항목 수
 * @param limit - 페이지당 항목 수
 * @returns 총 페이지 수
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit)
}

/**
 * 페이지네이션 결과 객체 생성
 *
 * @param page - 현재 페이지
 * @param limit - 페이지당 항목 수
 * @param total - 전체 항목 수
 * @returns 페이지네이션 결과 객체
 */
export function createPaginationResult(
  page: number,
  limit: number,
  total: number
): PaginationResult {
  return {
    page,
    limit,
    total,
    totalPages: calculateTotalPages(total, limit),
  }
}

/**
 * 정수를 안전하게 파싱 (범위 제한 포함)
 *
 * @param value - 파싱할 문자열
 * @param defaultValue - 파싱 실패 시 기본값
 * @param min - 최소값 (선택)
 * @param max - 최대값 (선택)
 * @returns 파싱된 정수
 */
export function parseIntSafe(
  value: string | null | undefined,
  defaultValue: number,
  min?: number,
  max?: number
): number {
  const parsed = parseInt(value || '', 10)

  if (Number.isNaN(parsed)) {
    return defaultValue
  }

  let result = parsed

  if (min !== undefined) {
    result = Math.max(min, result)
  }

  if (max !== undefined) {
    result = Math.min(max, result)
  }

  return result
}
