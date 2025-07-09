import { EpType } from "../enums/epType";

export interface GridEndpoints{
  id: number;
  gridId: number;
  epType: EpType;
  uri: string;
  method: string;
}

