import type React from "react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  ClickAwayListener,
  TableSortLabel,
  Drawer,
  type SelectChangeEvent,
  Button,
  Chip,
  InputAdornment,
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
  Close,
  Search,
} from "@mui/icons-material";
import type { GridMaster } from "./models/gridMaster";
import type { GridColumns } from "./models/gridColums";
import SortByData from "./sort/sort";
import FilterByData from "./Filter/filter";
import CustomAlertDialog from "./utils/customAlert";
import CancelIcon from "@mui/icons-material/Cancel";
import DynamicForm from "./dynamicForms";
import RowsPerPageSelector from "./RowsPerPageSelector";
import type { FilterCriteria } from "./models/searchCriteria";
import type { RangeCriteria } from "./models/rangeCriteria";
import type { GenericFilterRequest } from "./models/genericFilterRequest";
import ClearIcon from "@mui/icons-material/Clear";

/**
 * Enhanced client-side filtering function that handles all filter types
 * @param customers - Original data array
 * @param filterConfig - Filter configuration object
 * @returns Filtered data
 */
function filterCustomers(customers: any[], filterConfig: any) {
  let filteredData = [...customers];

  // 1. Search Key Filtering (searches across searchable columns)
  if (filterConfig.searchKey && filterConfig.searchableColumns) {
    const searchTerm = filterConfig.searchKey.toLowerCase();
    filteredData = filteredData.filter((customer) => {
      return filterConfig.searchableColumns.some((column: string) => {
        const value = customer[column];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm);
      });
    });
  }

  // 2. Field-based Filters (exact match or inclusion)
  if (filterConfig.filters && filterConfig.filters.length > 0) {
    filteredData = filteredData.filter((customer) => {
      return filterConfig.filters.every((filter: any) => {
        const fieldValue = customer[filter.field];
        // Handle null values in filter values
        if (filter.values.includes(null)) {
          if (fieldValue === null) return true;
        }
        // For non-null values, check if field value is in filter values
        if (fieldValue !== null) {
          return filter.values.includes(fieldValue);
        }
        return false;
      });
    });
  }

  // 3. Range Filters (for dates and numbers)
  if (filterConfig.ranges && filterConfig.ranges.length > 0) {
    filteredData = filteredData.filter((customer) => {
      return filterConfig.ranges.every((range: any) => {
        const fieldValue = customer[range.field];
        if (fieldValue === null) return false;

        if (range.type === "DATE") {
          const customerDate = new Date(fieldValue);
          const fromDate = new Date(range.from);
          const toDate = new Date(range.to);
          return customerDate >= fromDate && customerDate <= toDate;
        }

        if (range.type === "DATE_AND_TIME") {
          const customerDateTime = new Date(fieldValue);
          const fromDateTime = new Date(range.from);
          const toDateTime = new Date(range.to);
          return (
            customerDateTime >= fromDateTime && customerDateTime <= toDateTime
          );
        }

        if (range.type === "NUMBER") {
          const numValue = Number(fieldValue);
          return numValue >= range.from && numValue <= range.to;
        }

        return true;
      });
    });
  }

  // 4. Sorting
  if (filterConfig.sortColumns && filterConfig.sortColumns.length > 0) {
    filteredData.sort((a, b) => {
      for (const column of filterConfig.sortColumns) {
        const aValue = a[column];
        const bValue = b[column];

        // Handle null values (put them at the end)
        if (aValue === null && bValue === null) continue;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        let comparison = 0;

        // Date comparison
        if (typeof aValue === "string" && typeof bValue === "string") {
          // Try to parse as date first
          const dateA = new Date(aValue);
          const dateB = new Date(bValue);

          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            comparison = dateA.getTime() - dateB.getTime();
          } else {
            // String comparison
            comparison = aValue.localeCompare(bValue);
          }
        }
        // Number comparison
        else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        }
        // Mixed type comparison
        else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        if (comparison !== 0) {
          return filterConfig.sortDirection === "DESC"
            ? -comparison
            : comparison;
        }
      }
      return 0;
    });
  }

  return {
    data: filteredData,
  };
}

interface DataTableProps {
  data: any[];
  gridMaster?: GridMaster;
  children: GridMaster;
  onStatusMessageChange?: (message: string) => void;
}

const getSearchableFields = (cols: GridColumns[]): string[] => {
  return cols.filter((col) => col.searchReqd).map((col) => col.code);
};

const DataTable: React.FC<DataTableProps> = ({
  data,
  gridMaster,
  children,
  onStatusMessageChange,
}) => {
  const gridMasterObj = gridMaster || children;
  const {
    callBacks,
    totalPages: serverPages,
    currentPage,
    serverSidePagination,
    serverSide,
  } = gridMaster || children;

  // ============ STATE MANAGEMENT ============

  // Store original data - this should never change unless new data is passed
  const [originalData, setOriginalData] = useState<any[]>([]);

  // Filter states
  const [selectedEnums, setSelectedEnums] = useState<FilterCriteria[] | any>(
    []
  );
  const [selectedRanges, setSelectedRanges] = useState<RangeCriteria[]>([]);
  const [searchText, setSearchText] = useState("");

  // Service data for API calls
  const [serviceData, setServiceData] = useState<GenericFilterRequest>(
    {} as GenericFilterRequest
  );

  // UI states
  const [exportFormat, setExportFormat] = useState("");
  const [pendingFormat, setPendingFormat] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<any>(null);
  const [sortType, setSortType] = useState<"asc" | "desc">("asc");
  const [isOnSearchClicked, setIsOnSearchClicked] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Filtered data state - this will hold the current filtered/sorted data
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    gridMasterObj.gridPagination?.recordPerPage?.[0] || 100
  );
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [view, setView] = useState("list");

  // Sort and filter UI states
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<any>([]);

  // Column search states
  const [searchOpenCols, setSearchOpenCols] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchValues, setSearchValues] = useState<{ [key: string]: string }>(
    {}
  );

  const triggerRef = useRef<HTMLDivElement>(null);
  const searchableColumns = gridMasterObj.gridColumns
    .filter((col) => col.searchReqd && col.displayable)
    .map((each) => each.code);

  // ============ INITIALIZE ORIGINAL DATA ============

  /**
   * Initialize original data when new data is received
   * This ensures we always have a reference to the unfiltered data
   */
  useEffect(() => {
    if (Array.isArray(data)) {
      setOriginalData([...data]);
      // If no filters are applied, show all data
      if (!serverSide) {
        setFilteredData([...data]);
      }
    }
  }, [data, serverSide]);

  // ============ FILTER CONFIGURATION BUILDER ============

  /**
   * Build service data configuration for both client and server side filtering
   */
  const buildServiceData = useCallback(() => {
    const newServiceData: GenericFilterRequest = {
      searchKey: searchText || null,
      searchableColumns: searchText ? searchableColumns : null,
      filters:
        selectedEnums.length > 0
          ? selectedEnums.map((each: any) => ({
              field: each.fieldCode,
              values: each.values,
              type: each.type,
            }))
          : null,
      ranges: selectedRanges.length > 0 ? selectedRanges : null,
      sortColumns: selectedColumns.length > 0 ? selectedColumns : null,
      sortDirection: selectedColumns.length > 0 ? sortType.toUpperCase() : null,
      pageNumber: page - 1,
      pageSize: rowsPerPage,
    };

    return newServiceData;
  }, [
    searchText,
    searchableColumns,
    selectedEnums,
    selectedRanges,
    selectedColumns,
    sortType,
    page,
    rowsPerPage,
  ]);

  // ============ CLIENT-SIDE FILTERING ============

  /**
   * Apply client-side filtering when not using server-side filtering
   */
  useEffect(() => {
    if (!serverSide && !serverSidePagination) {
      const currentServiceData = buildServiceData();
      setServiceData(currentServiceData);

      // Apply filtering to original data
      const filteredResult = filterCustomers(originalData, currentServiceData);
      setFilteredData(filteredResult.data);

      // Reset to first page when filters change
      setPage(1);
    }
  }, [
    serverSide,
    serverSidePagination,
    originalData,
    searchText,
    selectedEnums,
    selectedRanges,
    selectedColumns,
    sortType,
    buildServiceData,
  ]);

  // ============ SERVER-SIDE FILTERING ============

  /**
   * Handle server-side filtering and search
   */
  useEffect(() => {
    if (serverSide) {
      const currentServiceData = buildServiceData();
      setServiceData(currentServiceData);

      // Trigger server-side search when search is clicked
      if (isOnSearchClicked && callBacks.onSearch) {
        setIsOnSearchClicked(false);
        callBacks.onSearch(currentServiceData);
      }

      // For server-side, just display the data as received
      setFilteredData(data);
    }
  }, [serverSide, data, isOnSearchClicked, callBacks, buildServiceData]);

  // ============ UTILITY FUNCTIONS ============

  /**
   * Check if service data is empty (no filters applied)
   */
  const isServiceDataEmpty = (value: GenericFilterRequest): boolean => {
    const isEmptyArray = (arr?: any[] | null): boolean =>
      !arr || arr.length === 0;
    const isEmptyString = (str?: string | null): boolean =>
      !str || str.trim() === "";

    return (
      isEmptyString(value.searchKey) &&
      isEmptyArray(value.filters) &&
      isEmptyArray(value.ranges) &&
      isEmptyArray(value.sortColumns)
    );
  };

  /**
   * Generate status messages for applied filters and sorts
   */
  function getSortMessage(columns: string[], direction: string | null) {
    if (!columns?.length || !direction) return "";
    return `Sorted by ${columns.join(", ")} (${direction.toUpperCase()})`;
  }

  function getFilterMessage(
    enums: FilterCriteria[] | any[],
    ranges: RangeCriteria[] | any[]
  ) {
    const parts: string[] = [];

    enums?.forEach((e: any) => {
      if (e.values?.length) {
        const field = capitalize(e.fieldCode);
        const vals = e.values.map(capitalize).join(", ");
        parts.push(`${field}: ${vals}`);
      }
    });

    ranges?.forEach((r: any) => {
      const field = capitalize(r.field);
      const from = formatValue(r.from);
      const to = formatValue(r.to);
      parts.push(`${field}: ${from} – ${to}`);
    });

    return parts.length ? `Filtered by ${parts.join("; ")}` : "";
  }

  function capitalize(str: string) {
    return str[0]?.toUpperCase() + str.slice(1).toLowerCase();
  }

  function formatValue(val: any) {
    if (!val) return "";
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
  }

  // ============ STATUS MESSAGE UPDATES ============

  useEffect(() => {
    const sortMsg = getSortMessage(selectedColumns, sortType);
    const filterMsg = getFilterMessage(selectedEnums, selectedRanges);
    const combined = [sortMsg, filterMsg].filter(Boolean).join(" • ");

    if (onStatusMessageChange) {
      onStatusMessageChange(combined);
    } else {
      setStatusMessage(combined);
    }
  }, [
    selectedColumns,
    sortType,
    selectedEnums,
    selectedRanges,
    onStatusMessageChange,
  ]);

  // ============ EVENT HANDLERS ============

  /**
   * Handle clear all filters - FIXED VERSION
   */
  const handleClearAll = useCallback(() => {
    // Reset all filter states
    setSelectedEnums([]);
    setSelectedRanges([]);
    setSearchText("");
    setSelectedColumns([]);
    setSortType("asc");
    setPage(1);

    // Reset service data
    const emptyServiceData: GenericFilterRequest = {
      searchKey: null,
      searchableColumns: null,
      filters: null,
      ranges: null,
      sortColumns: null,
      sortDirection: null,
      pageNumber: 0,
      pageSize: rowsPerPage,
    };
    setServiceData(emptyServiceData);

    // For client-side: restore original data
    if (!serverSide) {
      setFilteredData([...originalData]);
    }

    // For server-side: call the clear callback
    if (callBacks.onClearAll) {
      callBacks.onClearAll(emptyServiceData);
    }
  }, [originalData, serverSide, rowsPerPage, callBacks]);

  /**
   * Handle column search toggle
   */
  const handleToggleSearch = (colCode: string) => {
    setSearchOpenCols((prev) => {
      const newState: { [key: string]: boolean } = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });
      return {
        ...newState,
        [colCode]: !prev[colCode],
      };
    });

    setSearchValues((prev) => {
      const isCurrentlyOpen = searchOpenCols[colCode];
      return {
        ...prev,
        [colCode]: isCurrentlyOpen ? "" : prev[colCode],
      };
    });
  };

  const handleSearchChange = (colCode: string, value: string) => {
    setSearchValues((prev) => ({
      ...prev,
      [colCode]: value,
    }));
  };

  /**
   * Handle table sorting
   */
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    setOrder(newOrder);
    setOrderBy(property);

    if (!serverSide) {
      const sorted = [...filteredData].sort((a, b) => {
        const aVal = a[property] ?? "";
        const bVal = b[property] ?? "";
        return newOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
      setFilteredData(sorted);
    }
  };

  /**
   * Handle pagination changes
   */
  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);

    if (serverSidePagination && callBacks?.onPagination) {
      const paginationData = {
        page: newPage,
        rowsPerPage: rowsPerPage,
        filteredData: { ...serviceData, pageNumber: newPage - 1 },
        isFilter: !isServiceDataEmpty(serviceData),
      };
      callBacks.onPagination(paginationData);
    }
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent) => {
    const newRowsPerPage = Number.parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  // ============ SELECTION HANDLERS ============

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const key: keyof (typeof filteredData)[0] = gridMasterObj.actionKey;
      const newSelected = filteredData.map((row) => row[key]);
      setSelectedRows(newSelected);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (index: any) => {
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

  // ============ ACTION HANDLERS ============

  const onHandleDelete = () => {
    if (callBacks.onDelete && selectedRows.length > 0) {
      callBacks.onDelete(selectedRows);
    }
  };

  const ondeleteCell = (key: any) => {
    if (callBacks.onRowDelete) {
      callBacks.onRowDelete(key);
    }
  };

  const onHandleView = (key: any) => {
    if (callBacks.onRowView) {
      callBacks.onRowView(key);
    }
  };

  const onHandleEdit = (key: any, data: any) => {
    if (callBacks.onRowEdit) {
      setDrawerOpen(true);
      setDrawerData(data);
      callBacks.onRowEdit(key);
    }
  };

  const handleChangeView = (
    event: React.MouseEvent<HTMLElement>,
    nextView: string
  ) => {
    if (nextView !== null) {
      setView(nextView);
    }
  };

  // ============ COMPUTED VALUES ============

  // Calculate pagination values
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    if (serverSidePagination) {
      return filteredData; // Server handles pagination
    }
    return filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  }, [filteredData, page, rowsPerPage, serverSidePagination]);

  // ============ UTILITY FUNCTIONS FOR UI ============

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

  // ============ EXPORT HANDLERS ============

  const handleExportFormatChange = (event: any) => {
    const format = event.target.value;
    setPendingFormat(format);
    setConfirmOpen(true);
  };

  const handleConfirmDownload = async () => {
    setExportFormat(pendingFormat);
    setConfirmOpen(false);
    try {
      await gridMasterObj.callBacks?.onDownload?.(pendingFormat);
    } catch (error) {
      console.error("Error in dynamic download:", error);
    }
    setPendingFormat("");
  };

  const handleCancelDownload = () => {
    setPendingFormat("");
    setConfirmOpen(false);
  };

  // ============ RENDER ============

  return (
    <Box sx={{ p: 1 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexDirection: { xs: "column", md: "row" },
          mb: 3,
          boxShadow: "none",
          bgcolor: "background.paper",
          borderRadius: 2,
          borderColor: "divider",
          gap: 2,
        }}
      >
        {/* Title */}
        <Box>
          <Typography
            variant="h5"
            sx={{
              mr: { xs: 0, md: 1.8 },
              color: gridMaster?.primaryColour,
              fontWeight: 400,
            }}
            color="text.secondary"
            gutterBottom
          >
            {gridMasterObj?.title}
          </Typography>
        </Box>

        {/* Controls Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: 2,
            flexWrap: "nowrap",
            width: { xs: "100%", md: "auto" },
            minWidth: 0,
          }}
        >
          {/* Search Input */}
          {gridMasterObj.searchReqd && (
            <TextField
              placeholder="Search"
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  searchText.trim().length >= 3 &&
                  callBacks.onSearch
                ) {
                  setIsOnSearchClicked(true);
                }
              }}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    sx={{ color: gridMasterObj.primaryColour, mr: 1 }}
                  />
                ),
                sx: {
                  height: 40,
                  fontSize: 14,
                  backgroundColor: "white",
                },
              }}
              sx={{
                width: { xs: 200, sm: 250, md: 300 },
                minWidth: 150,
                flexShrink: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  pl: 1,
                },
              }}
            />
          )}

          {/* Sort Button */}
          <Box
            sx={{
              position: "relative",
              display: "inline-block",
              flexShrink: 0,
            }}
          >
            <ClickAwayListener onClickAway={() => setShowSort(false)}>
              <Box>
                <Box
                  ref={triggerRef}
                  onClick={() => setShowSort((prev) => !prev)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                    px: 1,
                    height: 40,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    minWidth: "fit-content",
                    whiteSpace: "nowrap",
                  }}
                >
                  <SortIcon />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
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
                      boxShadow: 1,
                      backgroundColor: "background.paper",
                    }}
                  >
                    <SortByData
                      handleSort={callBacks.onSort}
                      serviceData={serviceData}
                      selectedColumns={selectedColumns}
                      setSelectedColumns={setSelectedColumns}
                      customerGrid={gridMasterObj}
                      sortType={sortType}
                      setSortType={setSortType}
                      onClose={() => setShowSort(false)}
                    />
                  </Box>
                )}
              </Box>
            </ClickAwayListener>
          </Box>

          {/* Filter Button */}
          <Box
            sx={{
              position: "relative",
              display: "inline-block",
              flexShrink: 0,
            }}
          >
            <Box
              onClick={() => setShowFilter((p) => !p)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                px: 1,
                py: 0.5,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                height: 40,
                minWidth: "fit-content",
                whiteSpace: "nowrap",
              }}
            >
              <FilterListIcon />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Filters
              </Typography>
            </Box>
            {showFilter && (
              <Box
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  mt: 1,
                  zIndex: 10,
                  boxShadow: 3,
                  backgroundColor: "background.paper",
                }}
              >
                <FilterByData
                  onClose={() => setShowFilter(false)}
                  sortActionKey={gridMasterObj.sortActionKey}
                  serviceData={serviceData}
                  handleFilter={callBacks.onFilter}
                  customerGrid={gridMasterObj}
                  selectedEnums={selectedEnums}
                  setSelectedEnums={setSelectedEnums}
                  selectedRanges={selectedRanges}
                  setSelectedRanges={setSelectedRanges}
                />
              </Box>
            )}
          </Box>

          {/* Clear All Button - FIXED */}
          <Button
            variant="outlined"
            onClick={handleClearAll}
            sx={{
              height: 40,
              borderRadius: "999px",
              bgcolor: "#edf0f5",
              color: "#9c27b0",
              textTransform: "none",
              px: 2,
              border: "none",
              minWidth: "fit-content",
              flexShrink: 0,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
            startIcon={
              <Box
                sx={{
                  border: "2px solid #9c27b0",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                }}
              >
                <ClearIcon sx={{ fontSize: 12, color: "#9c27b0" }} />
              </Box>
            }
          >
            <Typography sx={{ display: { xs: "none", sm: "block" } }}>
              Clear All
            </Typography>
          </Button>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mr: 6 }}>
          {selectedRows.length > 0 && (
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
              <DeleteIcon />
            </IconButton>
          )}

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
            <ToggleButton value="list" sx={{ border: "none" }}>
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="grid" sx={{ border: "none" }}>
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Filter Status Chips */}
      {((selectedColumns?.length > 0 && sortType) ||
        selectedEnums?.some(
          (e: { values: string | any[] }) => e.values?.length
        ) ||
        selectedRanges?.some((r) => r.from || r.to)) && (
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {/* Sort chips */}
          {selectedColumns?.length > 0 && sortType && (
            <>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mr: 1 }}
              >
                Sorted by
              </Typography>
              <Chip
                label={selectedColumns.join(", ")}
                size="small"
                sx={{
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                  "& .MuiChip-label": {
                    fontSize: "0.875rem",
                    color: "#333",
                  },
                }}
              />
              <Chip
                label={sortType.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                  "& .MuiChip-label": {
                    fontSize: "0.875rem",
                    color: "#333",
                  },
                }}
              />
            </>
          )}

          {/* Filter chips */}
          {(selectedEnums?.some(
            (e: { values: string | any[] }) => e.values?.length
          ) ||
            selectedRanges?.some((r) => r.from || r.to)) && (
            <Typography variant="body2" sx={{ color: "text.secondary", mr: 1 }}>
              Filtered by
            </Typography>
          )}

          {selectedEnums?.map(
            (enumFilter: any, index: any) =>
              enumFilter.values?.length > 0 && (
                <Chip
                  key={`enum-${index}`}
                  label={`${capitalize(
                    enumFilter.fieldCode
                  )}: ${enumFilter.values.map(capitalize).join(", ")}`}
                  size="small"
                  sx={{
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #ddd",
                    "& .MuiChip-label": {
                      fontSize: "0.875rem",
                      color: "#333",
                    },
                  }}
                />
              )
          )}

          {selectedRanges?.map(
            (rangeFilter, index) =>
              (rangeFilter.from || rangeFilter.to) && (
                <Chip
                  key={`range-${index}`}
                  label={`${capitalize(rangeFilter.field)}: ${formatValue(
                    rangeFilter.from
                  )} – ${formatValue(rangeFilter.to)}`}
                  size="small"
                  sx={{
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #ddd",
                    "& .MuiChip-label": {
                      fontSize: "0.875rem",
                      color: "#333",
                    },
                  }}
                />
              )
          )}
        </Box>
      )}

      {/* Table View */}
      {view === "list" && (
        <Paper
          sx={{ boxShadow: "none", width: "100%", mb: 3, overflow: "hidden" }}
        >
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#F8F9FD", borderBottom: "none" }}>
                <TableRow
                  sx={{
                    py: "2 !important",
                    whiteSpace: "nowrap",
                    border: "none",
                  }}
                >
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

                  {gridMasterObj.indexReqd && (
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                      >
                        S.No
                      </Typography>
                    </TableCell>
                  )}

                  {gridMasterObj.gridColumns
                    .filter((col) => col.displayable && col.code !== "ID")
                    .map((col) => (
                      <TableCell
                        key={col.code}
                        sx={{
                          borderBottom: "none",
                          py: 3,
                          position: "relative",
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          {col.searchReqd && !searchOpenCols[col.code] && (
                            <IconButton
                              size="small"
                              onClick={() => handleToggleSearch(col.code)}
                              sx={{ p: 0.5 }}
                            >
                              <Search fontSize="small" />
                            </IconButton>
                          )}

                          {col.sortable ? (
                            <TableSortLabel
                              active={orderBy === col.code}
                              direction={orderBy === col.code ? order : "asc"}
                              onClick={() => handleRequestSort(col.code)}
                              hideSortIcon={false}
                              sx={{
                                "& .MuiTableSortLabel-icon": {
                                  opacity: 1,
                                },
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="text.primary"
                              >
                                {col.title}
                              </Typography>
                            </TableSortLabel>
                          ) : (
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="text.primary"
                            >
                              {col.title}
                            </Typography>
                          )}
                        </Box>

                        {col.searchReqd && searchOpenCols[col.code] && (
                          <TextField
                            size="small"
                            autoFocus
                            placeholder={`Search ${col.title}`}
                            value={searchValues[col.code] || ""}
                            onChange={(e) =>
                              handleSearchChange(col.code, e.target.value)
                            }
                            onKeyDown={(e: any) => {
                              if (
                                e.key === "Enter" &&
                                callBacks.onColumnSearch
                              ) {
                                callBacks.onColumnSearch({
                                  column: col.code,
                                  searchText: e.target.value,
                                });
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Search fontSize="small" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleSearch(col.code)}
                                  >
                                    <Close fontSize="small" />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              position: "absolute",
                              top: "60%",
                              left: 0,
                              width: "200px",
                              zIndex: 10,
                              mt: 1,
                              bgcolor: "#fff",
                              boxShadow: 3,
                              borderRadius: 1,
                            }}
                          />
                        )}
                      </TableCell>
                    ))}

                  {gridMasterObj.actionReqd && (
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        fontWeight={600}
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
                  const key: keyof typeof row = gridMasterObj.actionKey;
                  const isSelected = selectedRows.includes(row[key]);

                  let actualIndex;
                  if (serverSidePagination && currentPage) {
                    actualIndex =
                      rowsPerPage * currentPage - rowsPerPage + index;
                  } else {
                    actualIndex = (page - 1) * rowsPerPage + index;
                  }

                  const targetKey = Object.keys(row).filter(
                    (each) => each === gridMasterObj.actionKey
                  );

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
                          onChange={() => handleSelectRow(row[key])}
                        />
                      </TableCell>

                      {gridMasterObj.indexReqd && (
                        <TableCell
                          sx={{ whiteSpace: "nowrap", overflow: "hidden" }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {String(actualIndex + 1).padStart(2, "0")}
                          </Typography>
                        </TableCell>
                      )}

                      {gridMasterObj.gridColumns
                        .filter((col) => col.displayable && col.code !== "ID")
                        .map((col) => (
                          <TableCell
                            key={col.code}
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "200px",
                            }}
                          >
                            {["name", "fullName"].includes(col.code) ? (
                              <Box display="flex" alignItems="center" gap={1}>
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
                                  sx={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
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
                        ))}

                      {gridMasterObj.actionReqd && (
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
                                  onHandleEdit(row[key], row);
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
                        (gridMasterObj.indexReqd ? 1 : 0) +
                        gridMasterObj.gridColumns.filter(
                          (col) => col.displayable && col.code !== "ID"
                        ).length +
                        (gridMasterObj.actionReqd ? 1 : 0) +
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
      )}

      {/* Grid View - Similar structure but in card format */}
      {view === "grid" && (
        <div className="container-fluid">
          <div className="row gx-4 gy-4">
            {paginatedData.map((row, index) => {
              const isSelected = selectedRows.includes(index);
              const actualIndex = (page - 1) * rowsPerPage + index;
              const targetKey = Object.keys(row).filter(
                (each) => each === gridMasterObj.actionKey
              );

              return (
                <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div
                    className="card border-2 h-100"
                    style={{ borderRadius: "8px" }}
                  >
                    <div className="card-body p-3 d-flex flex-column">
                      {/* Avatar + Title */}
                      {gridMasterObj.gridColumns
                        .filter(
                          (col) =>
                            col.displayable &&
                            ["name", "fullName"].includes(col.code)
                        )
                        .map((col) => (
                          <div key={col.code} className="text-center">
                            <Avatar
                              sx={{
                                width: 50,
                                height: 50,
                                backgroundColor: getRandomColor(),
                                fontWeight: "bold",
                                fontSize: "16px",
                                mx: "auto",
                                mb: 1,
                              }}
                            >
                              {generateInitials(row[col.code] || "N/A")}
                            </Avatar>
                            <h6
                              className="fw-bold mb-0"
                              style={{ fontSize: "16px" }}
                            >
                              {row[col.code] || "-"}
                            </h6>
                            <small className="text-muted">{col.title}</small>
                          </div>
                        ))}

                      {/* Show only 4 other fields */}
                      {gridMasterObj.gridColumns
                        .filter(
                          (col) =>
                            col.displayable &&
                            !["ID", "id", "name", "fullName"].includes(col.code)
                        )
                        .slice(0, 4)
                        .map((col) => (
                          <div key={col.code} className="mb-2">
                            <small
                              className="text-muted d-block"
                              style={{ fontSize: "12px" }}
                            >
                              {col.title}
                            </small>
                            <div
                              style={{
                                fontSize: "0.85rem",
                                color: "#141414",
                                fontWeight: 500,
                              }}
                            >
                              {row[col.code] || "-"}
                            </div>
                          </div>
                        ))}

                      {gridMasterObj.actionReqd && (
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center">
                            <Button
                              variant="contained"
                              onClick={() => {
                                if (targetKey[0]) {
                                  const key = targetKey[0];
                                  onHandleView(row[key]);
                                }
                              }}
                              sx={{
                                backgroundColor: "#9c27b0",
                                color: "var(--Colors-White, #FFF)",
                                textAlign: "right",
                                fontFamily: "Inter, sans-serif",
                                fontSize: "13px",
                                fontStyle: "normal",
                                fontWeight: 400,
                                lineHeight: "14px",
                                borderRadius: "4px",
                                paddingY: "7px",
                                paddingX: "10px",
                                whiteSpace: "nowrap",
                                boxShadow: "none",
                                textTransform: "none",
                                "&:hover": {
                                  backgroundColor: "#8e24aa",
                                  boxShadow: "none",
                                },
                              }}
                            >
                              Show More
                            </Button>

                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm p-2"
                                onClick={() => {
                                  if (targetKey[0]) {
                                    const key: keyof typeof row = targetKey[0];
                                    onHandleEdit(row[key], row);
                                  }
                                }}
                                title="Edit"
                              >
                                <EditIcon />
                              </button>

                              <button
                                className="btn btn-sm p-2"
                                onClick={() => {
                                  if (targetKey[0]) {
                                    const key = targetKey[0];
                                    ondeleteCell(row[key]);
                                  }
                                }}
                                title="Delete"
                              >
                                <DeleteIcon />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer with Pagination and Controls */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          p: 2,
          bgcolor: "background.paper",
        }}
      >
        {/* Left Section: Download Controls */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
            justifyContent: { xs: "center", sm: "flex-start" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {selectedRows.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Selected Rows {selectedRows.length}
            </Typography>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Download by
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                displayEmpty
                value={pendingFormat || exportFormat}
                onChange={handleExportFormatChange}
                sx={{ fontSize: "14px" }}
                renderValue={(selected) =>
                  !selected ? (
                    <Typography variant="body2" color="text.secondary">
                      Select Format
                    </Typography>
                  ) : selected === "xlsx" ? (
                    "Excel"
                  ) : (
                    "PDF"
                  )
                }
              >
                <MenuItem value="xlsx">Excel</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <CustomAlertDialog
            confirmOpen={confirmOpen}
            handleCancel={handleCancelDownload}
            handleConfirm={handleConfirmDownload}
            dialogTitle="Confirm Download"
            dialogContentText={
              <>
                Are you sure you want to download the data as{" "}
                <strong>{pendingFormat.toUpperCase()}</strong>?
              </>
            }
            cancelButtonText="Cancel"
            confirmButtonText="Download"
            cancelButtonIcon={<CancelIcon />}
            confirmButtonIcon={<DownloadIcon />}
          />
        </Box>

        {/* Right Section: Pagination and Rows per Page */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 2,
            justifyContent: { xs: "center", sm: "flex-end" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {/* Pagination */}
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" },
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Pagination
              count={serverPages || totalPages}
              page={currentPage || page}
              onChange={handlePaginationChange}
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
          </Box>

          {/* Rows Per Page */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              justifyContent: "flex-end",
              flexShrink: 0,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              Rows per page
            </Typography>
            <RowsPerPageSelector
              gridMaster={gridMasterObj}
              currentRowsPerPage={rowsPerPage}
              serviceData={serviceData}
              isServiceDataEmpty={isServiceDataEmpty}
              setRowsPerPage={(val) => setRowsPerPage(val)}
            />
          </Box>
        </Box>

        {/* Drawer for Edit Form */}
        {drawerData && (
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
              sx: { width: "450px" },
            }}
          >
            <DynamicForm gridMaster={gridMasterObj} drawerData={drawerData} />
          </Drawer>
        )}
      </Box>
    </Box>
  );
};

export default DataTable;
