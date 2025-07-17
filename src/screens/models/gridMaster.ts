import { GridColumns } from "./gridColums";
import { GridPagination } from "./gridPagination";
import { PageState } from "./pageState";

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
  actionKey: any;
  sortActionKey: any;
  gridPagination: GridPagination;
  gridColumns: GridColumns[];
  gridActions: Record<string, EndPoint>;
  callBacks: CallBacks;
  serverSide: boolean;
  serverSidePagination: boolean;
  currentPage?: number;
  currentPageSize?: number;
  totalPages?: number;
  pageState?: PageState;
}

interface EndPoint {
  uri: string;
  method: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

interface CallBacks {
  onSelect?: (row: any) => void;
  onDelete?: (row: any) => void;
  onSearch?: (key: any) => void;
  onRowView?: (key: any) => void;
  onRowEdit?: (key: any) => void;
  onRowDelete?: (key: any) => void;
  onSort: (key: any) => void;
  onClearSort?: (key: any) => void;
  onFilter: (key: any) => void;
  onClearFilter?: (key: any) => void;
  onColumnSort?: (key: any) => void;
  onDownload?: (key: any) => void;
  onPagination?: (key: any) => void;
  onClearAll?: (key: any) => void;
  onColumnSearch?: (key: any) => void;

}
