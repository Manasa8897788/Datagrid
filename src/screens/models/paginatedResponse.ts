export interface PaginatedResponse<D> {
  records: D[];
  totalPages: number;
  totalElements: number;
}
