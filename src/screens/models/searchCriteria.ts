import { DataType } from "./dataType";

export interface SearchCriteria {
  field: string;
  values: string[];
  type: DataType;
}


