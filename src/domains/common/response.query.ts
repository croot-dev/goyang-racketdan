export interface ResponsePaging {
  total: number
  totalPages: number
}

export interface ResponseList<T> extends ResponsePaging {
  list: T[]
}
