import * as React from "react";
import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Box, TextField, Typography } from "@mui/material";
import { GridMaster } from "./models/gridMaster";
import { GridColumns } from "./models/gridColums";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

interface DataTableProps {
  data: any[];
  gridMaster: GridMaster;
}

const generateColumns = (cols: GridColumns[]): GridColDef[] => {
  return cols
    .filter((col) => col.displayable)
    .map((col) => ({
      field: col.code, // data field name (e.g., 'firstName')
      headerName: col.title, // column header label
      sortable: col.sortable, // enable/disable sorting
      //   flex: 1, // responsive width
      filterable: col.filterable, // MUI will allow column filter
    }));
};

export interface GridPagination {
  reqd: boolean;
  pageCount: number;
  recordPerPage: number[];
  dynamicLoad: boolean;
}

const getSearchableFields = (cols: GridColumns[]): string[] => {
  return cols.filter((col) => col.searchReqd).map((col) => col.code); // return list like ['firstName', 'lastName']
};

const DataTable: React.FC<DataTableProps> = ({ data, gridMaster }) => {
  const columns: GridColDef[] = generateColumns(gridMaster.gridColumns);
  const searchableFields = getSearchableFields(gridMaster.gridColumns);
  const pageSize = gridMaster.gridPagination.pageCount;

  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState(data);
  const [view, setView] = React.useState("list");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value.toLowerCase());

    const filtered = data.filter((row) =>
      searchableFields.some((field) => {
        const cellValue = row[field];
        return String(cellValue ?? "")
          .toLowerCase()
          .includes(value.toLowerCase());
      })
    );

    setFilteredRows(filtered);
  };

  const handleChangeView = (
    event: React.MouseEvent<HTMLElement>,
    nextView: string
  ) => {
    setView(nextView);
  };

  console.log("hihi", gridMaster.gridPagination.recordPerPage);

  return (
    <Box sx={{ width: "100%", maxWidth: "100vw" }}>
      {gridMaster.title && (
        <Typography variant="h5" component="h2" gutterBottom>
          {gridMaster.title}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          {gridMaster.searchReqd && (
            <TextField
              label="Search"
              variant="outlined"
              value={searchText}
              onChange={handleSearch}
              sx={{ mb: 2, width: 300 }}
            />
          )}
        </Box>

        <Box>
          <ToggleButtonGroup value={view} exclusive onChange={handleChangeView}>
            <ToggleButton value="list" aria-label="list">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="module" aria-label="module">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Paper sx={{ height: "100%", maxWidth: "100vw", width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          autoHeight
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize },
            },
          }}
          pageSizeOptions={
            gridMaster.gridPagination.recordPerPage || [5, 10, 20]
          }
          checkboxSelection
          //   sx={{
          //     "& .MuiDataGrid-virtualScroller": {
          //       overflowX: "auto",
          //       overflowY: "auto",
          //     },
          //   }}

          sx={{
            // optional: if you want inner scroll inside grid instead of box
            "& .MuiDataGrid-virtualScroller": {
              overflow: "auto",
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default DataTable;
