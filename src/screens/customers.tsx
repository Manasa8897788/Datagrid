import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import DataTable from "../screens/dataGrid";
import dataService from "../services/dataService";
import { customerGrid as customerGridDefault } from "../screens/data/data";
import { Customer } from "./models/customer";
import { GridMaster } from "./models/gridMaster";
import { validateInput } from "./data/validateInput";

const Customers: React.FC = () => {
  const [customData, setCustomData] = useState<Customer[]>([]);
  const [sortColumn, setSortColumn] = useState<string>("");
const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC");
const [offset, setOffset] = useState<number>(0);
const [pageSize, setPageSize] = useState<number>(10);

  const handleDelete = (val: any) => {
    console.log("handle Delete", val);
  };

  const handleDeleteCell = (value: any) => {
    console.log("handleDeleteCell", value);
  };

  const handleView = (value: any) => {
    console.log("handleView", value);
  };

  const handleEdit = (value: any) => {
    console.log("handleEdit", value);
  };
const handleSort = async (value: any) => {
  console.log("handleSort ->", value);

  try {
    const { sortActionKeys, order } = value;

    if (sortActionKeys && sortActionKeys.length > 0) {
      const column = sortActionKeys[0]; // Assuming single column sort
      const direction = order.toUpperCase() as "ASC" | "DESC";

      setSortColumn(column);
      setSortDirection(direction);

      const response = await dataService.getCustomersPaginatedAndSorted(
        offset,
        pageSize,
        column,
        direction
      );
console.log("Response from getCustomersPaginatedAndSorted:", response);
      setCustomData(response.records.content || []);
    } else {
      // If sort cleared
      setSortColumn("");
      setSortDirection("ASC");

      const response = await dataService.getCustomersPaginated(offset, pageSize);
      console.log("Response from getCustomersPaginated:", response);
      setCustomData(response.records.content || []);
    }
  } catch (error) {
    console.error("Error in handleSort:", error);
  }
};

   

const handlePagination = async (newOffset: number, newPageSize: number) => {
  setOffset(newOffset);
  setPageSize(newPageSize);

  try {
    let response;
    if (sortColumn) {
      response = await dataService.getCustomersPaginatedAndSorted(
        newOffset,
        newPageSize,
        sortColumn,
        sortDirection
      );
      
      console.log("Response from getCustomersPaginatedAndSorted:", response);
    } else {
      response = await dataService.getCustomersPaginated(newOffset, newPageSize);
      console.log("Response from getCustomersPaginated:", response);
    }

    setCustomData(response.content.records || []);
    // setCustomerGrid((prevGrid) => ({}));

  } catch (error) {
    console.error("Error in handlePagination:", error);
  }
};


  const handleFilter = (value: any) => {
    console.log("handleFilter", value);
  };

  const handleSelect = () => { };
  const handleClearSort = () => { };
  const handleClearFilter = () => { };
  const handleColumnSort = () => { };
  const handleDownload = () => { };

  const [customerGrid, setCustomerGrid] = useState<GridMaster>({
    ...validateInput,
    ...customerGridDefault,

    callBacks: {
      onSelect: handleSelect,
      onDelete: handleDelete,
      onRowView: handleView,
      onRowEdit: handleEdit,
      onRowDelete: handleDeleteCell,
      onSort: handleSort,
      onClearSort: handleClearSort,
      onFilter: handleFilter,
      onClearFilter: handleClearFilter,
      onColumnSort: handleColumnSort,
      onDownload: handleDownload,
      onPagination: handlePagination,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dataService.getCustomerMasterList();
        console.log("Response from getCustomerMasterList:", response.content);

        if (response.content && Array.isArray(response.content)) {
          setCustomData(response.content);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <Box
      sx={{
        width: "80%",
        height: "auto",
        // border: "1px solid #cdcdcd"
        p: "2.5rem",
        borderRadius: "1.5rem",
        background: "#fff",
        // borderRadius: ,
      }}
    >
      <DataTable data={customData}>{customerGrid}</DataTable>
    </Box>
  );
};

export default Customers;
