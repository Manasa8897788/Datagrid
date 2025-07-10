import React, { useEffect, useState } from "react";
import DataTable from "./screens/dataGrid";
import { Box } from "@mui/material";
import { customerGrid, customerRows } from "./screens/data/data";
import dataService from "./services/dataService";

function App() {
  const [customData, setCustomData] = useState<any>([]);


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
        } else {
          // setError("Invalid response data");
        }
      } catch (err) {
        console.error(err);
        // setError("Failed to load data");
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log("Custom Data:", customData[0]);

  return (
    <div className="App">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          // alignItems: "center",
          // minHeight: "100vh",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "80%",
            border: "1px solid #cdcdcd",
            p: 3,
            borderRadius: 1,
            mt: 3,
          }}
        >
          {" "}
         
           <DataTable
            handleDelete={handleDelete}
            handleDeleteCell={handleDeleteCell}
            handleView={handleView}
            handleEdit={handleEdit}
            data={customData}
            gridMaster={customerGrid}
          />
        </Box>
      </Box>
    </div>
  );
}


export default App; 