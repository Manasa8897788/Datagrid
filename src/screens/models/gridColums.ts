import { DataType } from "./dataType";

export interface GridColumns {
  id: number;
  gridId: number;
  code: string;
  title: string;
  sortable: boolean;
  searchReqd: boolean;
  filterable: boolean;
  displayable: boolean;
  formElementType: any;
  enumValues?: any[];
  type: DataType;
  readOnly?: boolean;
}
