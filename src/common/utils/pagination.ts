import { APP_CONSTANTS } from "@/common/constants/app.constants"

export interface PaginationDto {
  skip?: number
  take?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function getPaginationParams(
  page: number = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE,
  limit: number = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
): { skip: number; take: number } {
  const take = Math.min(limit, APP_CONSTANTS.PAGINATION.MAX_LIMIT)
  const skip = (page - 1) * take
  return { skip, take }
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
