import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  Chip,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  MoreVert as MoreVertIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
} from "@mui/icons-material";
import { GridMaster } from "./models/gridMaster";
import { GridColumns } from "./models/gridColums";

interface DataTableProps {
  data: any[];
  gridMaster: GridMaster;
  handleDelete?: () => void;
  handleDeleteCell?: (key?: any) => void;
  handleView?: (key?: any) => void;
  handleEdit?: (key?: any) => void;
}

const getSearchableFields = (cols: GridColumns[]): string[] => {
  return cols.filter((col) => col.searchReqd).map((col) => col.code);
};

const DataTable: React.FC<DataTableProps> = ({
  data,
  gridMaster,
  handleDelete,
  handleDeleteCell,
  handleView,
  handleEdit,
}) => {
  const searchableFields = getSearchableFields(gridMaster.gridColumns);

  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    gridMaster.gridPagination?.recordPerPage?.[0] || 100
  );
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [view, setView] = useState("list");

  useEffect(() => {
    const lowerText = searchText.toLowerCase();
    const filtered = data.filter((row) =>
      searchableFields.some((field) =>
        String(row[field] ?? "")
          .toLowerCase()
          .includes(lowerText)
      )
    );
    setFilteredData(filtered);
    setPage(1);
  }, [searchText, data]);

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const onHandleDelete = () => {
    if (handleDelete) {
      handleDelete();
    }
    console.log("delete clicked");
  };
  const ondeleteCell = (key: any) => {
    console.log("delete", key);
    if (handleDeleteCell) {
      handleDeleteCell(key);
    }
  };

  const onHandleView = (key: any) => {
    console.log("view", key);
    if (handleView) {
      handleView(key);
    }
  };
  const onHandleEdit = (key: any) => {
    console.log("edit ", key);
    if (handleEdit) {
      handleEdit(key);
    }
  };

  const handleChangeRowsPerPage = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<{ value: unknown }>
      | any
  ) => {
    setRowsPerPage(parseInt(event.target.value as string, 10));
    setPage(1);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredData.map((row, index) => index);
      setSelectedRows(newSelected);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (index: number) => {
    const selectedIndex = selectedRows.indexOf(index);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, index);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }
    setSelectedRows(newSelected);
  };

  const handleChangeView = (
    event: React.MouseEvent<HTMLElement>,
    nextView: string
  ) => {
    if (nextView !== null) {
      setView(nextView);
    }
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const generateInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  const getRandomColor = () => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header (commented out as per original) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          bgcolor: "background.paper",
          borderRadius: 2,

          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {/* Search */}
          {gridMaster.searchReqd && (
            <TextField
              placeholder="Search"
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "#666", mr: 1 }} />,
                sx: {
                  height: 40,
                  fontSize: 14,
                  backgroundColor: "white",
                },
              }}
              sx={{
                width: 350,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  pl: 1,
                },
              }}
            />
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              cursor: "pointer",
              px: 1,
              py: 0.5,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              height: 30,
            }}
          >
            <SortIcon sx={{ fontSize: 20, color: "#666" }} />
            <Typography variant="body2" color="text.secondary">
              Sort By
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              cursor: "pointer",
              px: 1,
              py: 0.5,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              height: 30,
            }}
          >
            <FilterListIcon sx={{ fontSize: 20, color: "#666" }} />
            <Typography variant="body2" color="text.secondary">
              Filters
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={onHandleDelete}>
            <DeleteIcon />
          </IconButton>

          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleChangeView}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                borderRadius: 1,
                border: "1px solid #e0e0e0",
                p: "6px 8px",
              },
            }}
          >
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Table */}
      <Paper sx={{ width: "100%", mb: 3, borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < filteredData.length
                    }
                    checked={
                      filteredData.length > 0 &&
                      selectedRows.length === filteredData.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {gridMaster.indexReqd && (
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      color="text.primary"
                    >
                      S.No
                    </Typography>
                  </TableCell>
                )}
                {gridMaster.gridColumns
                  .filter((col) => col.displayable && col.code !== "ID")
                  .map((col) => (
                    <TableCell key={col.code}>
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        color="text.primary"
                      >
                        {col.title}
                      </Typography>
                    </TableCell>
                  ))}
                {gridMaster.actionReqd && (
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      color="text.primary"
                    >
                      Actions
                    </Typography>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => {
                const isSelected = selectedRows.includes(index);
                const actualIndex = (page - 1) * rowsPerPage + index;

                const targetKey = Object.keys(row).filter((each) => {
                  return each === gridMaster.actionKey ? each : null;
                });

                return (
                  <TableRow
                    key={index}
                    hover
                    selected={isSelected}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isSelected}
                        onChange={() => handleSelectRow(index)}
                      />
                    </TableCell>
                    {gridMaster.indexReqd && (
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {String(actualIndex + 1).padStart(2, "0")}
                        </Typography>
                      </TableCell>
                    )}
                    {gridMaster.gridColumns
                      .filter((col) => col.displayable && col.code !== "ID")
                      .map((col, idx) => (
                        <>
                          <TableCell key={col.code}>
                            {col.code === "name" || col.code === "fullName" ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: getRandomColor(),
                                    fontSize: "14px",
                                  }}
                                >
                                  {generateInitials(row[col.code] || "N/A")}
                                </Avatar>
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {row[col.code]}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {row[col.code]}
                              </Typography>
                            )}
                          </TableCell>
                        </>
                      ))}

                    {gridMaster.actionReqd && (
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                          }}
                        >
                          <IconButton
                            onClick={() => {
                              if (targetKey[0]) {
                                const key: keyof typeof row = targetKey[0];
                                onHandleView(row[key]);
                              }
                            }}
                            size="small"
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              if (targetKey[0]) {
                                const key: keyof typeof row = targetKey[0];
                                onHandleEdit(row[key]);
                              }
                            }}
                            size="small"
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              if (targetKey[0]) {
                                const key: keyof typeof row = targetKey[0];
                                ondeleteCell(row[key]);
                              }
                            }}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={
                      (gridMaster.indexReqd ? 1 : 0) +
                      gridMaster.gridColumns.filter(
                        (col) => col.displayable && col.code !== "ID"
                      ).length + // Adjust colSpan for removed ID
                      (gridMaster.actionReqd ? 1 : 0) +
                      1
                    }
                    align="center"
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 3 }}
                    >
                      No records found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Footer with pagination and controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Download by
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select displayEmpty defaultValue="" sx={{ fontSize: "14px" }}>
              <MenuItem value="" disabled>
                <Typography variant="body2" color="text.secondary">
                  Select File Format
                </Typography>
              </MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="xlsx">Excel</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="text"
              size="small"
              startIcon={<ArrowDownwardIcon />}
              sx={{ textTransform: "none", color: "text.secondary" }}
            >
              First
            </Button>
            <Button
              variant="text"
              size="small"
              startIcon={<ArrowDownwardIcon />}
              sx={{ textTransform: "none", color: "text.secondary" }}
            >
              Back
            </Button>
          </Box>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            variant="outlined"
            shape="rounded"
            color="primary"
            size="small"
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "14px",
                minWidth: "32px",
                height: "32px",
              },
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="text"
              size="small"
              endIcon={<ArrowUpwardIcon />}
              sx={{ textTransform: "none", color: "text.secondary" }}
            >
              Next
            </Button>
            <Button
              variant="text"
              size="small"
              endIcon={<ArrowUpwardIcon />}
              sx={{ textTransform: "none", color: "text.secondary" }}
            >
              Last
            </Button>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Reload Pages
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                sx={{ fontSize: "14px" }}
              >
                {(
                  gridMaster.gridPagination?.recordPerPage || [
                    5, 10, 25, 50, 100,
                  ]
                ).map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DataTable;
