import React from "react";
import DataTable from "./screens/dataGrid";
import { Box } from "@mui/material";
import { customerGrid, customerRows } from "./screens/data/data";

function App() {
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
          {/* this box takes 80% width */}
          <DataTable
            handleDelete={handleDelete}
            handleDeleteCell={handleDeleteCell}
            handleView={handleView}
            handleEdit={handleEdit}
            data={customerRows}
            gridMaster={customerGrid}
          />
        </Box>
      </Box>
    </div>
  );
}

export default App;
