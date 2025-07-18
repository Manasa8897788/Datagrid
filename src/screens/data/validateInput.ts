import { DataType } from "../models/dataType";
import { GridMaster } from "../models/gridMaster";

export const validateInput: Partial<GridMaster> = {
  id: 1,
  targetObject: "customer",
  title: "Customer List",
  filterReqd: true,
  searchReqd: true,
  paginationReqd: true,
  primaryColour: "#1E90FF",
  secondaryColour: "#F0F8FF",
  actionReqd: true,
  indexReqd: true,
  dynamicLoad: false,
  recordsPerPage: 10,
  actionKey: "firstName",
  sortActionKey: "code",
  gridPagination: {
    reqd: true,
    pageCount: 10,
    recordPerPage: [10,20,50,100],
    dynamicLoad: false,
  },
  gridColumns: [
    {
      id: 2,
      code: "firstName",
      title: "First Name",
      sortable: true,
      searchReqd: true,
      filterable: false,
      displayable: true,
      formElementType: "text",
      type: DataType.STRING,
    },
  ],
};
