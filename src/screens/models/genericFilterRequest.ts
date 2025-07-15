import { RangeCriteria } from "./rangeCriteria";
import { FilterCriteria } from "./searchCriteria";

export interface GenericFilterRequest {
  searchKey?: string;
  searchableColumns?: string[];
  filters?: FilterCriteria[];
  ranges?: RangeCriteria[];
  sortColumns?: string[];
  sortDirection?: string;
  pageNumber?: number;
  pageSize?: number;
}
