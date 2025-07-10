import React from "react";
import { Box } from "@mui/material";
import Customers from "./screens/customers";

function App() {
  return (
    <div className="App">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Customers />
      </Box>
    </div>
  );
}

export default App;
