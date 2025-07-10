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
          alignItems: "center",
          background: "#E8EFFB",
          // minHeight: "100vh",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        <Customers />
      </Box>
    </div>
  );
}

export default App;
