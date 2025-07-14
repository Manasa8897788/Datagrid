import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import DataTable from "../screens/dataGrid";
import dataService from "../services/dataService";
import { customerGrid } from "../screens/data/data";
import { Customer } from "./models/customer";

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
  const handleSort = (value: any) => {
    console.log("handleSort ->", value);
  };
  const handlePagination = async (offset: number, pageSize: number) => {
    try {
      const response = await dataService.getCustomersPaginated(offset, pageSize);
      console.log("Paginated response:", response);
      setCustomData(response.records.content || []);
      //  setTotalRecords(response.totalCount || 0);
    } catch (error) {
      console.error('Error fetching paginated customers:', error);
    }

  };
  const handleFilter = (value: any) => {
    console.log("handleFilter", value);
  };

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
      <DataTable
        handleDelete={handleDelete}
        handleDeleteCell={handleDeleteCell}
        handleView={handleView}
        handleEdit={handleEdit}
        handleSort={handleSort}
        handleFilter={handleFilter}
        handlePagination={handlePagination}
        data={customData}
        gridMaster={customerGrid}
      />
    </Box>
  );
};

export default Customers;
