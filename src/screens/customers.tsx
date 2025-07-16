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

  const getFilterdData = async (value: any) => {
    try {
      const response: any = await dataService.filterCustomers(value);
      console.log("Sorted response:", response);

      setCustomData(response?.content?.records || []);
      setCustomerGrid((prev) => ({
        ...prev,
        currentPage: customerGrid.currentPage,
        totalPages: response?.content?.totalPages || 1,
      }));
    } catch (error) {
      console.error("Error filterCustomers:", error);
    }
  };

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
    console.log("handleSort:", value);
    getFilterdData(value);
  };

  const handlePagination = async (pageNumber: number, pageSize: number) => {
    console.log("value :", pageNumber, pageSize);
    const currentPage = pageNumber < 1 ? 1 : pageNumber;
    const offset = currentPage - 1; // now offset >= 0 always

    try {
      const response = await dataService.getCustomersPaginated(
        offset,
        pageSize
      );
      console.log("Paginated response:", response);
      setCustomData(response?.content?.records || []);
      setCustomerGrid((prev) => ({
        ...prev,
        currentPage: currentPage,
        totalPages: response?.content?.totalPages || 1,
      }));
    } catch (error) {
      console.error("Error fetching paginated customers:", error);
    }
  };

  const handleFilter = (value: any) => {
    console.log("handleFilter", value);
    getFilterdData(value);
  };

  const handleSelect = () => {};
  const handleClearSort = () => {};
  const handleClearFilter = () => {};
  const handleColumnSort = () => {};
  const handleDownload = () => {};

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
        const response = await dataService.getCustomersPaginated(0, 5);
        console.log("PPPPaginated response:", response);
        console.log("PPData", response?.content?.records);
        setCustomData(response?.content?.records || []);
        //setTotalRecords(response.totalCount || 0);
        setCustomerGrid((prev) => ({
          ...prev,
          currentPage: 1,
          totalPages: response?.content?.totalPages || 1,
        }));
      } catch (error) {
        console.error("Error fetching paginated customers:", error);
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
