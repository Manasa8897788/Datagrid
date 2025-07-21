import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import DataTable from "../screens/dataGrid";
import dataService from "../services/dataService";
import { customerGrid as customerGridDefault } from "../screens/data/data";
import { Customer } from "./models/customer";
import { GridMaster } from "./models/gridMaster";
import { validateInput } from "./data/validateInput";
import { exportToExcel } from "./excelExport";
import { exportToPDF } from "./exportPdf";
import { PageState } from "./models/pageState";

interface CustomersProps { }

const Customers: React.FC<CustomersProps> = () => {
  const [customData, setCustomData] = useState<Customer[]>([]);

  const getFilterdData = async (value: any) => {
    setCustomerGrid((prev) => ({
      ...prev,
      pageState: PageState.LOADING,
    }));

    try {
      const response: any = await dataService.filterCustomers(value);
      console.log("Sorted response:", response);

      setCustomData(response?.content?.records || []);

      setCustomerGrid((prev) => ({
        ...prev,
        // currentPage: value.pageNumber + 1 || customerGrid.currentPage,
        currentPage: value.pageNumber + 1,
        currentPageSize: value.pageSize || customerGrid.currentPageSize,
        totalPages: response?.content?.totalPages || 1,
        pageState: PageState.SUCCESS,
      }));
    } catch (error) {
      setCustomData([]);
      setCustomerGrid((prev) => ({
        ...prev,
        pageState: PageState.ERROR,
      }));
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

  const handleSearch = (value: any) => {
    console.log("handleSearch", value);
    getFilterdData(value);
  };
  const handleSort = (value: { column: keyof Customer; direction: "asc" | "desc" }) => {
    console.log("Sort Triggered:", value);

    const { column, direction } = value;

    if (!column) {
      console.warn("No column provided for sorting");
      return;
    }

    const sortedData = [...customData].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (aValue === undefined || bValue === undefined) return 0;

      if (typeof aValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      if (typeof aValue === "number") {
        return direction === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }

      return 0;
    });

    console.log("Sorted Data:", sortedData);
    setCustomData(sortedData);

    setCustomerGrid((prev) => ({
      ...prev,
      sortBy: column,
      sortDirection: direction,
    }));
  };

  const handleColumnSearch = async (value: {
    column: string;
    searchText: string;
  }) => {
    const { column, searchText } = value;
    console.log("handleColumnSearch", value);

    setCustomerGrid((prev) => ({
      ...prev,
      pageState: PageState.LOADING,
    }));

    try {
      const response = await dataService.fetchCustomersByColumn(
        column,
        searchText
      );
      const records = response?.content;

      setCustomData(records);
      console.log("Column search records:", records);
      console.log("Column search response:", response);
      setCustomerGrid((prev) => ({
        ...prev,
        currentPage: 1,
        totalPages: response?.content?.totalPages || 1,
        pageState: PageState.SUCCESS,
      }));
    } catch (error) {
      setCustomData([]);
      setCustomerGrid((prev) => ({
        ...prev,
        pageState: PageState.ERROR,
      }));
      console.error("Error fetching customers by column search:", error);
    }
  };

  const handlePagination = async (value: any) => {
    const {
      page: pageNumber,
      rowsPerPage: pageSize,
      isFilter,
      filteredData,
    } = value;
    const currentPage = pageNumber < 1 ? 1 : pageNumber;
    const offset = currentPage - 1;

    if (isFilter) {
      console.log("filteredData", filteredData);
      getFilterdData({
        ...filteredData,
        pageNumber: offset,
      });
      console.log("filter");
    } else {
      setCustomerGrid((prev) => ({
        ...prev,
        pageState: PageState.LOADING,
      }));
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
          pageState: PageState.SUCCESS,
        }));
      } catch (error) {
        setCustomerGrid((prev) => ({
          ...prev,
          pageState: PageState.ERROR,
        }));
        setCustomData([]);
        console.error("Error fetching paginated customers:", error);
      }
      console.log("paginated");
    }
  };

  const handleFilter = (value: any) => {
    console.log("handleFilter", value);
    // getFilterdData(value);
  };
  const handleClearAll = async () => {
    fetchData();
  };

  const handleSelect = () => { };
  const handleClearSort = () => { };
  const handleClearFilter = () => { };
  const handleColumnSort = () => { };

  const handleDownload = async (format: "xlsx" | "pdf") => {
    try {
      const response = await dataService.getCustomerMasterList();
      const exportData = response?.content || [];
      console.log("Export Data:", exportData);
      const exportableColumns = customerGrid.gridColumns
        .filter((col) => col.displayable && col.code !== "ID")
        .map((col) => ({ title: col.title, code: col.code }));

      if (format === "xlsx") {
        exportToExcel(exportData, exportableColumns, "Customer_Master_Export");
      }

      if (format === "pdf") {
        exportToPDF(
          exportData,
          exportableColumns.map(({ code, title }) => ({
            code,
            name: title,
          })),
          "Customer_Master_Export"
        );
      }
    } catch (error) {
      console.error("Error during export:", error);
    }
  };
  const [customerGrid, setCustomerGrid] = useState<GridMaster>({
    ...validateInput,
    ...customerGridDefault,

    callBacks: {
      onSelect: handleSelect,
      onDelete: handleDelete,
      onSearch: handleSearch,
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
      onClearAll: handleClearAll,
      onColumnSearch: handleColumnSearch,
    },
  });

  const fetchData = async () => {
    try {
      const response = await dataService.getCustomersPaginated(0, 10);
      console.log("Paginated response:", response);
      console.log("Data", response?.content?.records);
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

  useEffect(() => {
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
      <DataTable data={customData} gridMaster={customerGrid}>
        {customerGrid}
      </DataTable>
    </Box>
  );
};

export default Customers;
