
import React, { useEffect, useState, useMemo } from "react";
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
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Pagination, // Make sure Pagination is imported
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  LastPage as LastPageIcon,
  FirstPage as FirstPageIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon
} from "@mui/icons-material";
import { GridMaster } from "./models/gridMaster"; // Corrected import path
import { GridColumns } from "./models/gridColums"; // Corrected import path

interface DataTableProps {
  data: any[]; // Data should have a unique 'id' field
  gridMaster: GridMaster;
}

const getSearchableFields = (cols: GridColumns[]): string[] => {
  return cols.filter((col) => col.searchReqd).map((col) => col.code);
};

const DataTable: React.FC<DataTableProps> = ({ data, gridMaster }) => {
  const searchableFields = useMemo(() => getSearchableFields(gridMaster.gridColumns), [gridMaster.gridColumns]);

  const [searchText, setSearchText] = useState("");
  // State for sorting configuration
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    gridMaster.gridPagination?.recordPerPage?.[0] || gridMaster.recordsPerPage || 10
  );
  // Store IDs (numbers) of selected rows, not array indices
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [view, setView] = useState("list"); // 'list' for table, 'grid' for card view

  // Memoize filtered and sorted data to avoid re-calculations on every render
  const processedData = useMemo(() => {
    let currentFilteredData = data.filter((row) =>
      searchableFields.some((field) =>
        String(row[field] ?? "").toLowerCase().includes(searchText.toLowerCase())
      )
    );

    if (sortConfig.key) {
      currentFilteredData.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        // Fallback for non-string types (numbers, dates, etc.)
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return currentFilteredData;
  }, [data, searchText, searchableFields, sortConfig]);

  const totalPages = Math.ceil(processedData.length / rowsPerPage);
  const paginatedData = processedData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Reset page to 1 and clear selections whenever search text or sorting configuration changes
  useEffect(() => {
    setPage(1);
    setSelectedRows([]); // Clear selections on data change (search/sort)
  }, [searchText, sortConfig]);


  const handleChangePage = (event: React.ChangeEvent<unknown> | null, newPage: number) => {
    setPage(newPage);
    setSelectedRows([]); // Clear selections on page change
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{ value: unknown }> | any) => {
    setRowsPerPage(parseInt(event.target.value as string, 10));
    setPage(1); // Reset to first page when rows per page changes
    setSelectedRows([]); // Clear selections on rowsPerPage change
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Select all currently paginated data IDs
      const newSelectedIds = paginatedData.map((row) => row.id); // Use row.id
      setSelectedRows((prevSelected) => Array.from(new Set([...prevSelected, ...newSelectedIds])));
    } else {
      // Deselect all currently paginated data IDs from the global selectedRows
      const currentPageIds = new Set(paginatedData.map((row) => row.id));
      setSelectedRows((prevSelected) => prevSelected.filter(id => !currentPageIds.has(id)));
    }
  };

  const handleSelectRow = (id: number) => { // Expecting ID (number) now
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
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

  const handleSort = (columnCode: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === columnCode && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === columnCode && sortConfig.direction === 'desc') {
      // If already descending, clicking again removes sort
      setSortConfig({ key: null, direction: null });
      return;
    }
    setSortConfig({ key: columnCode, direction });
  };

  const generateInitials = (firstName: string, lastName: string, middleName?: string) => {
    let initials = '';
    if (firstName) initials += firstName.charAt(0);
    if (middleName) initials += middleName.charAt(0);
    if (lastName) initials += lastName.charAt(0);
    return initials.toUpperCase();
  };

  const getRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Determine if all rows on the current page are selected
  const isAllCurrentPageSelected = paginatedData.length > 0 &&
    paginatedData.every(row => selectedRows.includes(row.id));

  // Determine if some rows on the current page are selected (for indeterminate state)
  const isCurrentPageIndeterminate = paginatedData.some(row => selectedRows.includes(row.id)) &&
    !isAllCurrentPageSelected;

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
          <IconButton>
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
      <Paper sx={{ width: '100%', mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={isCurrentPageIndeterminate}
                    checked={isAllCurrentPageSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {gridMaster.indexReqd && (
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" color="text.primary">
                      S.No
                    </Typography>
                  </TableCell>
                )}
                {gridMaster.gridColumns
                  .filter((col) => col.displayable && col.code !== "id")
                  .map((col) => (
                    <TableCell
                      key={col.code}
                      onClick={() => col.sortable && handleSort(col.code)}
                      sx={{ cursor: col.sortable ? 'pointer' : 'default' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight="600" color="text.primary">
                          {col.title}
                        </Typography>
                        {col.sortable && (
                           <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                             <ArrowUpwardIcon
                               sx={{
                                 fontSize: '12px',
                                 color: sortConfig.key === col.code && sortConfig.direction === 'asc' ? 'primary.main' : '#ccc',
                                 marginBottom: '-4px'
                               }}
                             />
                             <ArrowDownwardIcon
                               sx={{
                                 fontSize: '12px',
                                 color: sortConfig.key === col.code && sortConfig.direction === 'desc' ? 'primary.main' : '#ccc',
                                 marginTop: '-4px'
                               }}
                             />
                           </Box>
                         )}
                      </Box>
                    </TableCell>
                  ))}
                {gridMaster.actionReqd && (
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="600" color="text.primary">
                      Actions
                    </Typography>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => {
                const isSelected = selectedRows.includes(row.id);
                // The crucial line for correct S.No:
                const actualIndex = (page - 1) * rowsPerPage + index;

                return (
                  <TableRow
                    key={row.id}
                    hover
                    selected={isSelected}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isSelected}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </TableCell>
                    {gridMaster.indexReqd && (
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {String(actualIndex + 1).padStart(2, '0')}
                        </Typography>
                      </TableCell>
                    )}
                    {gridMaster.gridColumns
                      .filter((col) => col.displayable && col.code !== "id")
                      .map((col) => (
                        <TableCell key={col.code}>
                          {(col.code === "firstName" || col.code === "fullName") ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: getRandomColor(),
                                  fontSize: '14px'
                                }}
                              >
                                {generateInitials(row.firstName, row.lastName, row.middleName)}
                              </Avatar>
                              <Typography variant="body2" color="text.primary">
                                {`${row.firstName || ''} ${row.middleName ? row.middleName + ' ' : ''}${row.lastName || ''}`}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {row[col.code]}
                            </Typography>
                          )}
                        </TableCell>
                      ))}
                    {gridMaster.actionReqd && (
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton size="small" color="primary">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error">
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
                      gridMaster.gridColumns.filter(col => col.displayable && col.code !== "id").length +
                      (gridMaster.actionReqd ? 1 : 0) +
                      1 // for the checkbox column
                    }
                    align="center"
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
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
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Download by
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              displayEmpty
              defaultValue=""
              sx={{ fontSize: '14px' }}
            >
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="text"
              size="small"
              startIcon={<FirstPageIcon />}
              sx={{ textTransform: 'none', color: 'text.secondary', minWidth: 'unset', px: 1 }}
              onClick={() => handleChangePage(null, 1)}
              disabled={page === 1}
            >
              First
            </Button>
            <Button
              variant="text"
              size="small"
              startIcon={<KeyboardArrowLeftIcon />}
              sx={{ textTransform: 'none', color: 'text.secondary', minWidth: 'unset', px: 1 }}
              onClick={() => handleChangePage(null, page - 1)}
              disabled={page === 1}
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
              '& .MuiPaginationItem-root': {
                fontSize: '14px',
                minWidth: '32px',
                height: '32px'
              }
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="text"
              size="small"
              endIcon={<KeyboardArrowRightIcon />}
              sx={{ textTransform: 'none', color: 'text.secondary', minWidth: 'unset', px: 1 }}
              onClick={() => handleChangePage(null, page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
            <Button
              variant="text"
              size="small"
              endIcon={<LastPageIcon />}
              sx={{ textTransform: 'none', color: 'text.secondary', minWidth: 'unset', px: 1 }}
              onClick={() => handleChangePage(null, totalPages)}
              disabled={page === totalPages}
            >
              Last
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Reload Pages
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                sx={{ fontSize: '14px' }}
              >
                {(gridMaster.gridPagination?.recordPerPage || [5, 10, 25, 50, 100]).map(size => (
                  <MenuItem key={size} value={size}>{size}</MenuItem>
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