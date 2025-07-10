import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import DataTable from "../screens/dataGrid";
import dataService from "../services/dataService";
import { customerGrid } from "../screens/data/data";
import { Customer } from "./models/customer";

const Customers: React.FC = () => {
  
    const [customData, setCustomData] = useState<Customer[]>([]);

    const handleDelete = () => {
        console.log("handle Delete");
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
                border: "1px solid #cdcdcd",
                p: 3,
                borderRadius: 1,
                mt: 3,
            }}
        >
            <DataTable
                handleDelete={handleDelete}
                handleDeleteCell={handleDeleteCell}
                handleView={handleView}
                handleEdit={handleEdit}
                data={customData}
                gridMaster={customerGrid}
            />
        </Box>
    );
};

export default Customers;
