import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import DataTable from "../screens/dataGrid";
import dataService from "../services/dataService";
import { customerGrid as customerGridDefault } from "../screens/data/data";
import { Customer } from "./models/customer";
import { GridMaster } from "./models/gridMaster";

const Customers: React.FC = () => {
  const [customData, setCustomData] = useState<Customer[]>([]);

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
      const direction = order.toUpperCase(); 
      const columns = sortActionKeys.join(","); 

      const sortedData = await dataService.getCustomerMasterListBySort(columns, direction);
      setCustomData(sortedData);
    } else {
      const response = await dataService.getCustomerMasterList();
      if (response.content && Array.isArray(response.content)) {
        setCustomData(response.content);
      }
    }
  } catch (error) {
    console.error("Error in handleSort:", error);
  }
};
  const handlePagination = async (offset: number, pageSize: number) => {
    try {
      const response = await dataService.getCustomersPaginated(
        offset,
        pageSize
      );
      console.log("Paginated response:", response);
      setCustomData(response.records.content || []);
      //  setTotalRecords(response.totalCount || 0);
    } catch (error) {
      console.error("Error fetching paginated customers:", error);
    }
  };
  const handleFilter = (value: any) => {
    console.log("handleFilter", value);
  };

  const handleSelect = () => {};
  const handleClearSort = () => {};
  const handleClearFilter = () => {};
  const handleColumnSort = () => {};
  const handleDownload = () => {};

  const [customerGrid, setCustomerGrid] = useState<GridMaster>({
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
