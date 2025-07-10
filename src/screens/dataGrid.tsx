import React, { useEffect, useRef, useState } from "react";
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
  ClickAwayListener,
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
import SortByData from "./sort/sort";
import { exportToExcel } from "./excelExport";
import { exportToPDF } from "./exportPdf";

interface DataTableProps {
  data: any[];
  gridMaster: GridMaster;
  handleDelete?: () => void;
  handleDeleteCell?: (key?: any) => void;
  handleView?: (key?: any) => void;
  handleEdit?: (key?: any) => void;
  handleSort?: (key?: any) => void;
  handleFilter?: (key?: any) => void;
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
  handleSort,
  handleFilter,
}) => {
  const searchableFields = getSearchableFields(gridMaster.gridColumns);
  const [exportFormat, setExportFormat] = useState("");

  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    gridMaster.gridPagination?.recordPerPage?.[0] || 100
  );
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [view, setView] = useState("list");
  const [showSort, setShowSort] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setShowSort((prev) => !prev);
  };

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

  const handleExportFormatChange = (event: any) => {
    const format = event.target.value;
    setExportFormat(format); // <-- sets selected format for display

    const exportableColumns = gridMaster.gridColumns.filter(
      (col) => col.displayable && col.code !== "ID"
    );

    if (format === "xlsx") {
      exportToExcel(
        filteredData,
        exportableColumns,
        "DataTableExport"
      );
    }

    if (format === "pdf") {
      exportToPDF(
          filteredData,
          exportableColumns.map(col => ({ code: col.code, name: col.title })),
          "DataTableExport"
      );
    }
  };



  return (
    <Box sx={{ p: 1 }}>
      {/* Header (commented out as per original) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          boxShadow: "none",
          bgcolor: "background.paper",
          borderRadius: 2,
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ mr: 1.8, color: gridMaster.primaryColour, fontWeight: 400 }}
            color="text.secondary"
            gutterBottom
          >
            Data Grid Table Sample
          </Typography>
        </Box>
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
                startAdornment: (
                  <SearchIcon sx={{ color: gridMaster.primaryColour, mr: 1 }} />
                ),
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

          <Box sx={{ position: "relative", display: "inline-block" }}>
            <ClickAwayListener onClickAway={() => setShowSort(false)}>
              <Box>
                <Box
                  ref={triggerRef}
                  onClick={handleToggle}
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
                  <SortIcon
                    sx={{ fontSize: 20, color: gridMaster.primaryColour }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Sort By
                  </Typography>
                </Box>

                {showSort && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "100%",
                      mt: 1,
                      zIndex: 10,
                      boxShadow: 3,
                      backgroundColor: "background.paper",
                    }}
                  >
                    <SortByData
                      onClose={() => setShowSort(false)}
                      sortActionKey={gridMaster.sortActionKey}
                      handleSort={handleSort && handleSort}
                    />
                  </Box>
                )}
              </Box>
            </ClickAwayListener>
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mr: 6 }}>
          <IconButton
            onClick={onHandleDelete}
            sx={{
              width: 35,
              height: 35,
              border: "1px solid #C0C9D4",
              borderRadius: 1,
              m: 0,
            }}
          >
            {/* <DeleteIcon /> */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.6155 20C7.17117 20 6.79083 19.8418 6.4745 19.5255C6.15817 19.2092 6 18.8288 6 18.3845V5.99999H5.5C5.35833 5.99999 5.23958 5.95199 5.14375 5.85599C5.04792 5.75999 5 5.64108 5 5.49924C5 5.35741 5.04792 5.23874 5.14375 5.14324C5.23958 5.04774 5.35833 4.99999 5.5 4.99999H9C9 4.79366 9.07658 4.61383 9.22975 4.46049C9.38292 4.30733 9.56275 4.23074 9.76925 4.23074H14.2308C14.4372 4.23074 14.6171 4.30733 14.7703 4.46049C14.9234 4.61383 15 4.79366 15 4.99999H18.5C18.6417 4.99999 18.7604 5.04799 18.8562 5.14399C18.9521 5.23999 19 5.35891 19 5.50074C19 5.64258 18.9521 5.76124 18.8562 5.85674C18.7604 5.95224 18.6417 5.99999 18.5 5.99999H18V18.3845C18 18.8288 17.8418 19.2092 17.5255 19.5255C17.2092 19.8418 16.8288 20 16.3845 20H7.6155ZM17 5.99999H7V18.3845C7 18.564 7.05767 18.7115 7.173 18.827C7.2885 18.9423 7.436 19 7.6155 19H16.3845C16.564 19 16.7115 18.9423 16.827 18.827C16.9423 18.7115 17 18.564 17 18.3845V5.99999ZM10.3082 17C10.4502 17 10.569 16.9521 10.6645 16.8562C10.76 16.7604 10.8078 16.6417 10.8078 16.5V8.49999C10.8078 8.35833 10.7597 8.23958 10.6637 8.14374C10.5677 8.04791 10.4488 7.99999 10.307 7.99999C10.1652 7.99999 10.0465 8.04791 9.951 8.14374C9.8555 8.23958 9.80775 8.35833 9.80775 8.49999V16.5C9.80775 16.6417 9.85575 16.7604 9.95175 16.8562C10.0476 16.9521 10.1664 17 10.3082 17ZM13.693 17C13.8348 17 13.9535 16.9521 14.049 16.8562C14.1445 16.7604 14.1923 16.6417 14.1923 16.5V8.49999C14.1923 8.35833 14.1442 8.23958 14.0483 8.14374C13.9524 8.04791 13.8336 7.99999 13.6917 7.99999C13.5497 7.99999 13.431 8.04791 13.3355 8.14374C13.24 8.23958 13.1923 8.35833 13.1923 8.49999V16.5C13.1923 16.6417 13.2403 16.7604 13.3363 16.8562C13.4323 16.9521 13.5512 17 13.693 17Z"
                fill="#101010"
              />
            </svg>
          </IconButton>

          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleChangeView}
            size="small"
            sx={{
              width: 35,
              height: 35,
              "& .MuiToggleButton-root": {
                borderRadius: 1,
                border: "1px solid #C0C9D4",
                p: "6px 8px",
              },
            }}
          >
            <ToggleButton
              value="list"
              sx={{
                border: "none",
              }}
            >
              {/* <ViewListIcon /> */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.5 17.8845C19.6417 17.8845 19.7604 17.8366 19.8563 17.7408C19.9521 17.6448 20 17.5258 20 17.384C20 17.2422 19.9521 17.1235 19.8563 17.028C19.7604 16.9323 19.6417 16.8845 19.5 16.8845H8.15375C8.01208 16.8845 7.89333 16.9325 7.7975 17.0285C7.70167 17.1245 7.65375 17.2434 7.65375 17.3853C7.65375 17.5271 7.70167 17.6458 7.7975 17.7413C7.89333 17.8368 8.01208 17.8845 8.15375 17.8845H19.5ZM19.5 12.5C19.6417 12.5 19.7604 12.452 19.8563 12.356C19.9521 12.26 20 12.1411 20 11.9993C20 11.8574 19.9521 11.7388 19.8563 11.6433C19.7604 11.5478 19.6417 11.5 19.5 11.5H8.15375C8.01208 11.5 7.89333 11.548 7.7975 11.644C7.70167 11.74 7.65375 11.8589 7.65375 12.0008C7.65375 12.1426 7.70167 12.2613 7.7975 12.3568C7.89333 12.4523 8.01208 12.5 8.15375 12.5H19.5ZM19.5 7.1155C19.6417 7.1155 19.7604 7.0675 19.8563 6.9715C19.9521 6.8755 20 6.75658 20 6.61475C20 6.47292 19.9521 6.35425 19.8563 6.25875C19.7604 6.16325 19.6417 6.1155 19.5 6.1155H8.15375C8.01208 6.1155 7.89333 6.16342 7.7975 6.25925C7.70167 6.35525 7.65375 6.47417 7.65375 6.616C7.65375 6.75783 7.70167 6.8765 7.7975 6.972C7.89333 7.06767 8.01208 7.1155 8.15375 7.1155H19.5ZM4.6155 18C4.78983 18 4.93592 17.9428 5.05375 17.8285C5.17175 17.7143 5.23075 17.5727 5.23075 17.4037C5.23075 17.2241 5.17175 17.0734 5.05375 16.9517C4.93592 16.8301 4.78983 16.7692 4.6155 16.7692C4.441 16.7692 4.29483 16.8301 4.177 16.9517C4.059 17.0734 4 17.2241 4 17.4037C4 17.5727 4.059 17.7143 4.177 17.8285C4.29483 17.9428 4.441 18 4.6155 18ZM4.6155 12.6345C4.78983 12.6345 4.93592 12.5772 5.05375 12.4625C5.17175 12.3478 5.23075 12.1937 5.23075 12C5.23075 11.8312 5.17175 11.6896 5.05375 11.5753C4.93592 11.4609 4.78983 11.4037 4.6155 11.4037C4.441 11.4037 4.29483 11.4609 4.177 11.5753C4.059 11.6896 4 11.8312 4 12C4 12.1937 4.059 12.3478 4.177 12.4625C4.29483 12.5772 4.441 12.6345 4.6155 12.6345ZM4.6155 7.23075C4.78983 7.23075 4.93592 7.17358 5.05375 7.05925C5.17175 6.94508 5.23075 6.8035 5.23075 6.6345C5.23075 6.45483 5.17175 6.30417 5.05375 6.1825C4.93592 6.06083 4.78983 6 4.6155 6C4.441 6 4.29483 6.06083 4.177 6.1825C4.059 6.30417 4 6.45483 4 6.6345C4 6.8035 4.059 6.94508 4.177 7.05925C4.29483 7.17358 4.441 7.23075 4.6155 7.23075Z"
                  fill="#101010"
                />
              </svg>
            </ToggleButton>

            <ToggleButton
              value="grid"
              sx={{
                border: "none",
              }}
            >
              {/* <ViewModuleIcon /> */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 11C4.732 11 4.49833 10.9003 4.299 10.701C4.09967 10.5017 4 10.268 4 10V5C4 4.732 4.09967 4.49833 4.299 4.299C4.49833 4.09967 4.732 4 5 4H10C10.268 4 10.5017 4.09967 10.701 4.299C10.9003 4.49833 11 4.732 11 5V10C11 10.268 10.9003 10.5017 10.701 10.701C10.5017 10.9003 10.268 11 10 11H5ZM5 20C4.732 20 4.49833 19.9003 4.299 19.701C4.09967 19.5017 4 19.268 4 19V14C4 13.732 4.09967 13.4983 4.299 13.299C4.49833 13.0997 4.732 13 5 13H10C10.268 13 10.5017 13.0997 10.701 13.299C10.9003 13.4983 11 13.732 11 14V19C11 19.268 10.9003 19.5017 10.701 19.701C10.5017 19.9003 10.268 20 10 20H5ZM14 11C13.732 11 13.4983 10.9003 13.299 10.701C13.0997 10.5017 13 10.268 13 10V5C13 4.732 13.0997 4.49833 13.299 4.299C13.4983 4.09967 13.732 4 14 4H19C19.268 4 19.5017 4.09967 19.701 4.299C19.9003 4.49833 20 4.732 20 5V10C20 10.268 19.9003 10.5017 19.701 10.701C19.5017 10.9003 19.268 11 19 11H14ZM14 20C13.732 20 13.4983 19.9003 13.299 19.701C13.0997 19.5017 13 19.268 13 19V14C13 13.732 13.0997 13.4983 13.299 13.299C13.4983 13.0997 13.732 13 14 13H19C19.268 13 19.5017 13.0997 19.701 13.299C19.9003 13.4983 20 13.732 20 14V19C20 19.268 19.9003 19.5017 19.701 19.701C19.5017 19.9003 19.268 20 19 20H14ZM5 10H10V5H5V10ZM14 10H19V5H14V10ZM14 19H19V14H14V19ZM5 19H10V14H5V19Z"
                  fill="#101010"
                />
              </svg>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Table */}
      <Paper
        sx={{
          boxShadow: "none",
          width: "100%",
          mb: 3,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#F8F9FD", borderBottom: "none" }}>
              <TableRow
                sx={{
                  // bgcolor: "#F8F9FD",
                  py: "2 !important",
                  whiteSpace: "nowrap",
                  border: "none",
                }}
              >
                <TableCell padding="checkbox" sx={{ borderBottom: "none" }}>
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
                  <TableCell
                    sx={{
                      borderBottom: "none",
                    }}
                  >
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
                    <TableCell
                      key={col.code}
                      sx={{ borderBottom: "none", py: 3 }}
                    >
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
                  <TableCell align="center" sx={{ borderBottom: "none" }}>
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
                            {/* <VisibilityIcon fontSize="small" /> */}
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12.0045 15.1538C13.0207 15.1538 13.8829 14.7981 14.5913 14.0868C15.2996 13.3754 15.6538 12.5117 15.6538 11.4955C15.6538 10.4793 15.2981 9.61708 14.5868 8.90875C13.8754 8.20042 13.0117 7.84625 11.9955 7.84625C10.9793 7.84625 10.1171 8.20192 9.40876 8.91325C8.70043 9.62458 8.34626 10.4883 8.34626 11.5045C8.34626 12.5207 8.70193 13.3829 9.41326 14.0913C10.1246 14.7996 10.9883 15.1538 12.0045 15.1538ZM12 14.2C11.25 14.2 10.6125 13.9375 10.0875 13.4125C9.56251 12.8875 9.30001 12.25 9.30001 11.5C9.30001 10.75 9.56251 10.1125 10.0875 9.5875C10.6125 9.0625 11.25 8.8 12 8.8C12.75 8.8 13.3875 9.0625 13.9125 9.5875C14.4375 10.1125 14.7 10.75 14.7 11.5C14.7 12.25 14.4375 12.8875 13.9125 13.4125C13.3875 13.9375 12.75 14.2 12 14.2ZM12 18C10.023 18 8.20985 17.4769 6.56051 16.4308C4.91118 15.3846 3.57885 14.0128 2.56351 12.3155C2.48018 12.1782 2.42085 12.0428 2.38551 11.9095C2.35035 11.7762 2.33276 11.6393 2.33276 11.499C2.33276 11.3587 2.35035 11.2222 2.38551 11.0895C2.42085 10.9568 2.48018 10.8218 2.56351 10.6845C3.57885 8.98717 4.91118 7.61542 6.56051 6.56925C8.20985 5.52308 10.023 5 12 5C13.977 5 15.7902 5.52308 17.4395 6.56925C19.0888 7.61542 20.4212 8.98717 21.4365 10.6845C21.5198 10.8218 21.5792 10.9572 21.6145 11.0905C21.6497 11.2238 21.6673 11.3607 21.6673 11.501C21.6673 11.6413 21.6497 11.7778 21.6145 11.9105C21.5792 12.0432 21.5198 12.1782 21.4365 12.3155C20.4212 14.0128 19.0888 15.3846 17.4395 16.4308C15.7902 17.4769 13.977 18 12 18ZM12 17C13.8833 17 15.6125 16.5042 17.1875 15.5125C18.7625 14.5208 19.9667 13.1833 20.8 11.5C19.9667 9.81667 18.7625 8.47917 17.1875 7.4875C15.6125 6.49583 13.8833 6 12 6C10.1167 6 8.38751 6.49583 6.81251 7.4875C5.23751 8.47917 4.03335 9.81667 3.20001 11.5C4.03335 13.1833 5.23751 14.5208 6.81251 15.5125C8.38751 16.5042 10.1167 17 12 17Z"
                                fill="#141414"
                              />
                            </svg>
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
                            {/* <EditIcon fontSize="small" /> */}
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 19H6.098L16.7962 8.302L15.698 7.20375L5 17.902V19ZM4.80775 20C4.57892 20 4.38708 19.9226 4.23225 19.7678C4.07742 19.6129 4 19.4211 4 19.1923V18.152C4 17.9308 4.04358 17.7201 4.13075 17.5198C4.21792 17.3194 4.33392 17.1468 4.47875 17.002L17.1807 4.2865C17.2832 4.19517 17.3963 4.12458 17.52 4.07475C17.6438 4.02492 17.7729 4 17.9072 4C18.0416 4 18.1717 4.02117 18.2977 4.0635C18.4236 4.10583 18.5397 4.18208 18.6462 4.29225L19.7135 5.3655C19.8237 5.47183 19.899 5.5885 19.9395 5.7155C19.9798 5.84267 20 5.96975 20 6.09675C20 6.23225 19.9772 6.36192 19.9315 6.48575C19.8858 6.60942 19.8132 6.7225 19.7135 6.825L6.998 19.5212C6.85317 19.6661 6.68058 19.7821 6.48025 19.8693C6.27992 19.9564 6.06917 20 5.848 20H4.80775ZM16.2375 7.7625L15.698 7.20375L16.7962 8.302L16.2375 7.7625Z"
                                fill="#141414"
                              />
                            </svg>
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
                            {/* <DeleteIcon fontSize="small" /> */}
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.6155 20C7.17117 20 6.79083 19.8418 6.4745 19.5255C6.15817 19.2092 6 18.8288 6 18.3845V5.99999H5.5C5.35833 5.99999 5.23958 5.95199 5.14375 5.85599C5.04792 5.75999 5 5.64108 5 5.49924C5 5.35741 5.04792 5.23874 5.14375 5.14324C5.23958 5.04774 5.35833 4.99999 5.5 4.99999H9C9 4.79366 9.07658 4.61383 9.22975 4.46049C9.38292 4.30733 9.56275 4.23074 9.76925 4.23074H14.2308C14.4372 4.23074 14.6171 4.30733 14.7703 4.46049C14.9234 4.61383 15 4.79366 15 4.99999H18.5C18.6417 4.99999 18.7604 5.04799 18.8562 5.14399C18.9521 5.23999 19 5.35891 19 5.50074C19 5.64258 18.9521 5.76124 18.8562 5.85674C18.7604 5.95224 18.6417 5.99999 18.5 5.99999H18V18.3845C18 18.8288 17.8418 19.2092 17.5255 19.5255C17.2092 19.8418 16.8288 20 16.3845 20H7.6155ZM17 5.99999H7V18.3845C7 18.564 7.05767 18.7115 7.173 18.827C7.2885 18.9423 7.436 19 7.6155 19H16.3845C16.564 19 16.7115 18.9423 16.827 18.827C16.9423 18.7115 17 18.564 17 18.3845V5.99999ZM10.3082 17C10.4502 17 10.569 16.9521 10.6645 16.8562C10.76 16.7604 10.8078 16.6417 10.8078 16.5V8.49999C10.8078 8.35833 10.7597 8.23958 10.6637 8.14374C10.5677 8.04791 10.4488 7.99999 10.307 7.99999C10.1652 7.99999 10.0465 8.04791 9.951 8.14374C9.8555 8.23958 9.80775 8.35833 9.80775 8.49999V16.5C9.80775 16.6417 9.85575 16.7604 9.95175 16.8562C10.0476 16.9521 10.1664 17 10.3082 17ZM13.693 17C13.8348 17 13.9535 16.9521 14.049 16.8562C14.1445 16.7604 14.1923 16.6417 14.1923 16.5V8.49999C14.1923 8.35833 14.1442 8.23958 14.0483 8.14374C13.9524 8.04791 13.8336 7.99999 13.6917 7.99999C13.5497 7.99999 13.431 8.04791 13.3355 8.14374C13.24 8.23958 13.1923 8.35833 13.1923 8.49999V16.5C13.1923 16.6417 13.2403 16.7604 13.3363 16.8562C13.4323 16.9521 13.5512 17 13.693 17Z"
                                fill="#141414"
                              />
                            </svg>
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
            <Select
              displayEmpty
              value={exportFormat} 
              onChange={handleExportFormatChange}
              sx={{ fontSize: "14px" }}
            >
              <MenuItem value="" disabled>
                <Typography variant="body2" color="text.secondary">
                  Select File Format
                </Typography>
              </MenuItem>
              <MenuItem value="xlsx">Excel</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>

        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          </Box> */}
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
          {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          </Box> */}
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
