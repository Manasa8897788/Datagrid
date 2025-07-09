import { GridColumns } from "./gridColums";
import { GridPagination } from "./gridPagination";

export interface GridMaster {
  id: number;
  targetObject: string;
  title: string;
  filterReqd: boolean;
  searchReqd: boolean;
  paginationReqd: boolean;
  primaryColour: string;
  secondaryColour: string;
  actionReqd: boolean;
  indexReqd: boolean;
  dynamicLoad: boolean;
  recordsPerPage: number;
  gridPagination: GridPagination;
  gridColumns: GridColumns[];
  gridActions: Record<string, EndPoint>;
}

interface EndPoint {
  uri: string;
  method: string;
}
