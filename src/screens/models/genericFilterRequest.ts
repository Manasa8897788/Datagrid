import { RangeCriteria } from "./rangeCriteria";
import { SearchCriteria } from "./searchCriteria";

export interface GenericFilterRequest {
    searchKey?: string;
    searchableColumns?: string[];
    filters?: SearchCriteria[];
    ranges?: RangeCriteria[];
    sortColumns?: string[];
    sortDirection?: string;
    pageNumber?: number;
    pageSize?: number;

}

