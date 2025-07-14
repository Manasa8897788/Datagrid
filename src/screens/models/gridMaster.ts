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
  actionKey: any;
  sortActionKey: any;
  gridPagination: GridPagination;
  gridColumns: GridColumns[];
  gridActions: Record<string, EndPoint>;
  callBacks: CallBacks;
}

interface EndPoint {
  uri: string;
  method: string;
}

interface CallBacks {
  onSelect?: (row: any) => void;
  onDelete?: (row: any) => void;
  onRowView?: (key: any) => void;
  onRowEdit?: (key: any) => void;
  onRowDelete?: (key: any) => void;
  onSort: (key: any) => void;
  onClearSort?: (key: any) => void;
  onFilter: (key: any) => void;
  onClearFilter?: (key: any) => void;
  onColumnSort?: (key: any) => void;
  onDownload?: (key: any) => void;
  onPagination?: (key1: any, key2: any) => void;
}
