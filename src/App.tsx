import React from 'react';
import DataTable from './screens/dataGrid';
import { Box } from '@mui/material';
import { GridMaster } from './screens/models/gridMaster';

function App() {
  return (
    <div className="App" >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>

        <DataTable/>
      </Box>
    </div>
  );
}

export default App;
