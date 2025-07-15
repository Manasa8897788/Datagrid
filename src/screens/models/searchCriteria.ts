import { DataType } from "./dataType";

export interface FilterCriteria {
  field: string;
  values: string[];
  type: DataType;
}


