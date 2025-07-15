import { DataType } from "./dataType";

export interface RangeCriteria {
  field: string;
  from: string;
  to: string;
  type: DataType;
}

