import { RangeCriteria } from "./rangeCriteria";
import { FilterCriteria } from "./searchCriteria";

export interface GenericFilterRequest {
  searchKey?: string | null;
  searchableColumns?: string[] | null;
  filters?: FilterCriteria[] | null;
  ranges?: RangeCriteria[] | null;
  sortColumns?: string[] | null;
  sortDirection?: string | null;
  pageNumber?: number | null;
  pageSize?: number | null;
}
