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
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  ClickAwayListener,
  TableSortLabel,
  Drawer,
  SelectChangeEvent,
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
import SortByData from "./sort/sort";
import { exportToExcel } from "./excelExport";
import { exportToPDF } from "./exportPdf";
import FilterByData from "./Filter/filter";
import CustomAlertDialog from "./utils/customAlert";
import CancelIcon from "@mui/icons-material/Cancel";
import DynamicForm from "./dynamicForms";
import RowsPerPageSelector from "./RowsPerPageSelector";
import { FilterCriteria } from "./models/searchCriteria";
import { RangeCriteria } from "./models/rangeCriteria";
import { GenericFilterRequest } from "./models/genericFilterRequest";
import ClearIcon from '@mui/icons-material/Clear';

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
  } = gridMaster || children;
  const [selectedEnums, setSelectedEnums] = useState<FilterCriteria[] | any>(
    []
  );
  const [selectedRanges, setSelectedRanges] = useState<RangeCriteria[]>([]);
  const [serviceData, setServiceData] = useState<GenericFilterRequest>(
    {} as GenericFilterRequest
  );
  const searchableFields = getSearchableFields(gridMasterObj.gridColumns);
  const [exportFormat, setExportFormat] = useState("");
  const [pendingFormat, setPendingFormat] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<any>(null);
  const [sortType, setSortType] = useState<"asc" | "desc">("asc");
  const [isOnSearchClicked, setIsOnSearchClicked] = useState<boolean>(false);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    setOrder(newOrder);
    setOrderBy(property);

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[property] ?? "";
      const bVal = b[property] ?? "";
      return newOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    setFilteredData(sorted);
  };

  const isServiceDataEmpty = (value: GenericFilterRequest): boolean => {
    const isEmptyArray = (arr?: any[] | null): boolean => {
      return !arr || arr.length === 0;
    };

    const isEmptyString = (str?: string | null): boolean => {
      return !str || str.trim() === "";
    };

    return (
      (isEmptyString(value.searchKey) &&
        isEmptyArray(value.searchableColumns)) ||
      isEmptyArray(value.filters) ||
      isEmptyArray(value.ranges) ||
      (isEmptyArray(value.sortColumns) && isEmptyString(value.sortDirection))
    );
  };

  // console.log("PPcurrentPage", currentPage, serverPages);

  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    gridMasterObj.gridPagination?.recordPerPage?.[0] || 100
  );
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [view, setView] = useState("list");
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<any>([]);
  // const [sortType, setSortType] = useState<"asc" | "desc" | "unsort">("asc");

  const triggerRef = useRef<HTMLDivElement>(null);

  // console.log("%%serviceData", serviceData);

  const searchableColumns = gridMasterObj.gridColumns
    .filter((col) => col.searchReqd && col.displayable)
    .map((each) => each.code);

  useEffect(() => {
    setServiceData({
      searchKey: searchText ?? null,
      searchableColumns: searchText ? searchableColumns : null,

      filters:
        selectedEnums.length > 0
          ? selectedEnums.map((each: any) => ({
              field: each.fieldCode,
              values: each.values,
              type: each.type,
            }))
          : null,

      // [
      //   {
      //     field: "gender",
      //     values: ["MALE"],
      //     type: "STRING",
      //   },
      //   // {
      //   //   "field": "currency",
      //   //   "values": ["INR", null],
      //   //   "type": "STRING"
      //   // }
      // ],

      ranges: selectedRanges.length > 0 ? selectedRanges : null,

      // [
      //   {
      //     "field": "dob",
      //     "from": "1990-01-01",
      //     "to": "2005-12-31",
      //     "type": "DATE"
      //   },
      //   {
      //     field: "registeredOn",
      //     from: "2025-01-01T00:00:00",
      //     to: "2025-12-31T00:00:00",
      //     type: "DATE_AND_TIME",
      //   },
      // ],

      sortColumns: selectedColumns.length > 0 ? selectedColumns : null, // ["registeredOn"],
      sortDirection:
        selectedColumns.length > 0 ? sortType.toLocaleUpperCase() : null, // "DESC",

      pageNumber: page - 1,
      pageSize: rowsPerPage,
    });

    if (isOnSearchClicked && callBacks.onSearch) {
      setIsOnSearchClicked(false);
      callBacks.onSearch({
        searchKey: searchText ?? null,
        searchableColumns: searchText ? searchableColumns : null,

        pageNumber: page - 1,
        pageSize: rowsPerPage,
      });
      setServiceData({
        searchKey: searchText ?? null,
        searchableColumns: searchText ? searchableColumns : null,

        pageNumber: page - 1,
        pageSize: rowsPerPage,
      });
    }
  }, [
    searchText,
    selectedEnums,
    selectedRanges,
    selectedColumns,
    sortType,
    rowsPerPage,
    page,
    isOnSearchClicked,
  ]);

  const handleToggle = () => {
    setShowSort((prev) => !prev);
  };

  useEffect(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    const lowerText = searchText.trim().toLowerCase();

    if (gridMasterObj.serverSide) {
      setFilteredData(data);
    } else {
      if (!lowerText) {
        setFilteredData(data);
      } else {
        const filtered = data.filter((row) =>
          searchableFields.some((field) =>
            String(row[field] ?? "")
              .toLowerCase()
              .includes(lowerText)
          )
        );
        setFilteredData(filtered);
      }
    }

    setPage(1);
  }, [searchText, data]);
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
  useEffect(() => {
    const sortMsg = getSortMessage(selectedColumns, sortType);
    const filterMsg = getFilterMessage(selectedEnums, selectedRanges);
    const combined = [sortMsg, filterMsg].filter(Boolean).join(" • ");
    if (onStatusMessageChange) {
      onStatusMessageChange(combined);
    }
  }, [selectedColumns, sortType, selectedEnums, selectedRanges]);



  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const onHandleDelete = () => {
    if (callBacks.onDelete && selectedRows.length > 0) {
      callBacks.onDelete(selectedRows);
      // handleDelete(selectedRows);
    }
    // console.log("delete clicked");
  };
  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
    if (callBacks.onPagination) {
      const value = {
        page: newPage,
        rowsPerPage: rowsPerPage,
        filteredData: { ...serviceData, pageNumber: newPage },
        isFilter: isServiceDataEmpty(serviceData),
      };
      callBacks.onPagination(value);
    }
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    if (callBacks.onPagination) {
      // callBacks.onPagination(0, newRowsPerPage);
    }
  };

  const ondeleteCell = (key: any) => {
    // console.log("delete", key);
    if (callBacks.onRowDelete) {
      callBacks.onRowDelete(key);
    }
  };

  const onHandleView = (key: any) => {
    // console.log("view", key);
    if (callBacks.onRowView) {
      callBacks.onRowView(key);
    }
  };
  const onHandleEdit = (key: any, data: any) => {
    // console.log("edit ", key);
    if (callBacks.onRowEdit) {
      setDrawerOpen(true);
      // console.log("drawerData", data);
      // console.log("gridColumns", gridMasterObj.gridColumns);
      setDrawerData(data);
      callBacks.onRowEdit(key);
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
    setPendingFormat(format);
    setConfirmOpen(true); // show confirmation dialog
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

  return (
    <Box sx={{ p: 1 }}>
      {/* Header (commented out as per original) */}
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
          flexWrap: "wrap",
          gap: 2,
        }}
      >
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
            {/* Data Grid Table Sample */}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 2,
            flexWrap: "wrap",
            width: { xs: "100%", md: "auto" },
          }}
        >
          {/* Search */}
          {gridMasterObj.searchReqd && (
            <TextField
              placeholder="Search"
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchText(e.target.value);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (
                  e.key === "Enter" &&
                  searchText.trim().length >= 3 &&
                  callBacks.onSearch
                ) {
                  console.log("Enter pressed", serviceData);
                  setIsOnSearchClicked(true);
                  // callBacks.onSearch({
                  //   searchKey: searchText,
                  //   searchableColumns: searchText ? searchableColumns : null,
                  //   pageNumber: page - 1,
                  //   pageSize: rowsPerPage,
                  // });
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
                  {/* <SortIcon
                    sx={{ fontSize: 20, color: gridMaster.primaryColour }}
                  /> */}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.32625 12.2885C9.18442 12.2885 9.06575 12.2406 8.97025 12.1448C8.87475 12.0489 8.827 11.9302 8.827 11.7885V4.902L6.06725 7.6615C5.98008 7.75517 5.87117 7.802 5.7405 7.802C5.60967 7.802 5.48908 7.75017 5.37875 7.6465C5.26858 7.5335 5.2135 7.41317 5.2135 7.2855C5.2135 7.158 5.26858 7.03908 5.37875 6.92875L8.74225 3.5655C8.82942 3.47817 8.91942 3.41692 9.01225 3.38175C9.10492 3.34642 9.20425 3.32875 9.31025 3.32875C9.41625 3.32875 9.51858 3.34667 9.61725 3.3825C9.71608 3.41833 9.80775 3.47933 9.89225 3.5655L13.2808 6.95375C13.3783 7.05125 13.4293 7.16283 13.4338 7.2885C13.4383 7.41417 13.3853 7.5335 13.275 7.6465C13.1647 7.75017 13.0468 7.80292 12.9213 7.80475C12.7956 7.80675 12.6776 7.75258 12.5673 7.64225L9.827 4.902V11.8077C9.827 11.9439 9.779 12.0581 9.683 12.1503C9.587 12.2424 9.46808 12.2885 9.32625 12.2885ZM14.6898 20.652C14.5838 20.652 14.4814 20.6341 14.3828 20.5982C14.2839 20.5624 14.1923 20.5015 14.1078 20.4155L10.7193 17.027C10.6218 16.9295 10.5708 16.8179 10.5663 16.6923C10.5618 16.5666 10.6147 16.4473 10.725 16.3343C10.8353 16.2306 10.9533 16.1778 11.0788 16.176C11.2044 16.174 11.3224 16.2282 11.4328 16.3385L14.173 19.0788V12.173C14.173 12.0368 14.221 11.9227 14.317 11.8305C14.413 11.7383 14.5319 11.6923 14.6738 11.6923C14.8156 11.6923 14.9343 11.7402 15.0298 11.836C15.1253 11.9318 15.173 12.0506 15.173 12.1923V19.0788L17.9328 16.3193C18.0199 16.2256 18.1288 16.1788 18.2595 16.1788C18.3903 16.1788 18.5109 16.2306 18.6213 16.3343C18.7314 16.4473 18.7865 16.5676 18.7865 16.6953C18.7865 16.8228 18.7314 16.9417 18.6213 17.052L15.2578 20.4155C15.1706 20.5027 15.0806 20.5638 14.9878 20.599C14.8951 20.6343 14.7958 20.652 14.6898 20.652Z"
                      fill="#141414"
                    />
                  </svg>
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

          <Box sx={{ position: "relative", display: "inline-block" }}>
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
                height: 30,
              }}
            >
              {/* <FilterListIcon sx={{ fontSize: 20, color: "#666" }} /> */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.5577 19.0577C16.7339 19.0577 16.0376 18.7733 15.4688 18.2045C14.8999 17.6357 14.6155 16.9393 14.6155 16.1155C14.6155 15.2915 14.8999 14.5951 15.4688 14.0262C16.0376 13.4574 16.7339 13.173 17.5577 13.173C18.3816 13.173 19.0779 13.4574 19.6467 14.0262C20.2156 14.5951 20.5 15.2915 20.5 16.1155C20.5 16.9393 20.2156 17.6357 19.6467 18.2045C19.0779 18.7733 18.3816 19.0577 17.5577 19.0577ZM17.5557 18.0577C18.0916 18.0577 18.5496 17.8683 18.9298 17.4895C19.3099 17.1107 19.5 16.6532 19.5 16.1172C19.5 15.5814 19.3106 15.1234 18.9318 14.7432C18.5529 14.3631 18.0956 14.173 17.5598 14.173C17.0238 14.173 16.5657 14.3624 16.1855 14.7412C15.8055 15.1201 15.6155 15.5775 15.6155 16.1135C15.6155 16.6493 15.8049 17.1073 16.1837 17.4875C16.5626 17.8677 17.0199 18.0577 17.5557 18.0577ZM11.7308 16.6155H5.5C5.35833 16.6155 5.23958 16.5675 5.14375 16.4715C5.04792 16.3755 5 16.2566 5 16.1147C5 15.9729 5.04792 15.8542 5.14375 15.7587C5.23958 15.6632 5.35833 15.6155 5.5 15.6155H11.7308C11.8724 15.6155 11.9912 15.6634 12.087 15.7592C12.1828 15.8552 12.2308 15.9742 12.2308 16.116C12.2308 16.2578 12.1828 16.3765 12.087 16.472C11.9912 16.5677 11.8724 16.6155 11.7308 16.6155ZM6.44225 10.827C5.61842 10.827 4.92208 10.5426 4.35325 9.97375C3.78442 9.40491 3.5 8.7085 3.5 7.8845C3.5 7.06066 3.78442 6.36433 4.35325 5.7955C4.92208 5.22666 5.61842 4.94225 6.44225 4.94225C7.26608 4.94225 7.96242 5.22666 8.53125 5.7955C9.10008 6.36433 9.3845 7.06066 9.3845 7.8845C9.3845 8.7085 9.10008 9.40491 8.53125 9.97375C7.96242 10.5426 7.26608 10.827 6.44225 10.827ZM6.44025 9.827C6.97625 9.827 7.43433 9.63758 7.8145 9.25874C8.1945 8.87991 8.3845 8.4225 8.3845 7.8865C8.3845 7.35066 8.19508 6.89266 7.81625 6.5125C7.43742 6.13233 6.98008 5.94225 6.44425 5.94225C5.90842 5.94225 5.45042 6.13166 5.07025 6.5105C4.69008 6.88933 4.5 7.34675 4.5 7.88275C4.5 8.41858 4.68942 8.87658 5.06825 9.25675C5.44708 9.63691 5.90442 9.827 6.44025 9.827ZM18.5 8.3845H12.2692C12.1276 8.3845 12.0088 8.33658 11.913 8.24075C11.8172 8.14475 11.7692 8.02583 11.7692 7.884C11.7692 7.74216 11.8172 7.6235 11.913 7.528C12.0088 7.43233 12.1276 7.3845 12.2692 7.3845H18.5C18.6417 7.3845 18.7604 7.4325 18.8562 7.5285C18.9521 7.6245 19 7.74341 19 7.88524C19 8.02708 18.9521 8.14575 18.8562 8.24125C18.7604 8.33675 18.6417 8.3845 18.5 8.3845Z"
                  fill="#141414"
                />
              </svg>
              <Typography variant="body2" color="text.secondary">
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
           <Button
            variant="outlined"
            onClick={() => {
              setServiceData({} as GenericFilterRequest);
              setSelectedEnums([]);
              setSelectedRanges([]);
              setSearchText("");
              setSelectedColumns([]);
              setSortType("asc");
              
              callBacks.onClearAll?.({});
            }}
            sx={{
              borderRadius: "999px",
              bgcolor: "#edf0f5",
              color: "#9c27b0", 
              textTransform: "none",
              px: 2,
              py: 1,
              border: "none",
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
                  width: 24,
                  height: 24,
                }}
              >
                <ClearIcon fontSize="small" sx={{ color: "#9c27b0" }} />
              </Box>
            }
          >
            Clear All
          </Button>
        </Box>

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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.5 17.8845C19.6417 17.8845 19.7604 17.8366 19.8563 17.7408C19.9521 17.6448 20 17.5258 20 17.384C20 17.2422 19.9521 17.1235 19.8563 17.028C19.7604 16.9323 19.6417 16.8845 19.5 16.8845H8.15375C8.01208 16.8845 7.89333 16.9325 7.7975 17.0285C7.70167 17.1245 7.65375 17.2434 7.65375 17.3853C7.65375 17.5271 7.70167 17.6458 7.7975 17.7413C7.89333 17.8368 8.01208 17.8845 8.15375 17.8845H19.5ZM19.5 12.5C19.6417 12.5 19.7604 12.452 19.8563 12.356C19.9521 12.26 20 12.1411 20 11.9993C20 11.8574 19.9521 11.7388 19.8563 11.6433C19.7604 11.5478 19.6417 11.5 19.5 11.5H8.15375C8.01208 11.5 7.89333 11.548 7.7975 11.644C7.70167 11.74 7.65375 11.8589 7.65375 12.0008C7.65375 12.1426 7.70167 12.2613 7.7975 12.3568C7.89333 12.4523 8.01208 12.5 8.15375 12.5H19.5ZM19.5 7.1155C19.6417 7.1155 19.7604 7.0675 19.8563 6.9715C19.9521 6.8755 20 6.75658 20 6.61475C20 6.47292 19.9521 6.35425 19.8563 6.25875C19.7604 6.16325 19.6417 6.1155 19.5 6.1155H8.15375C8.01208 6.1155 7.89333 6.16342 7.7975 6.25925C7.70167 6.35525 7.65375 6.47417 7.65375 6.616C7.65375 6.75783 7.70167 6.8765 7.7975 6.972C7.89333 7.06767 8.01208 7.1155 8.15375 7.1155H19.5Z"
                  fill="#101010"
                />
                <circle cx="4.6155" cy="17.4037" r="0.6155" fill="#101010" />
                <circle cx="4.6155" cy="12" r="0.6155" fill="#101010" />
                <circle cx="4.6155" cy="6.6345" r="0.6155" fill="#101010" />
              </svg>
            </ToggleButton>

            <ToggleButton value="grid" sx={{ border: "none" }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 11C4.732 11 4.49833 10.9003 4.299 10.701C4.09967 10.5017 4 10.268 4 10V5C4 4.732 4.09967 4.49833 4.299 4.299C4.49833 4.09967 4.732 4 5 4H10C10.268 4 10.5017 4.09967 10.701 4.299C10.9003 4.49833 11 4.732 11 5V10C11 10.268 10.9003 10.5017 10.701 10.701C10.5017 10.9003 10.268 11 10 11H5ZM5 20C4.732 20 4.49833 19.9003 4.299 19.701C4.09967 19.5017 4 19.268 4 19V14C4 13.732 4.09967 13.4983 4.299 13.299C4.49833 13.0997 4.732 13 5 13H10C10.268 13 10.5017 13.0997 10.701 13.299C10.9003 13.4983 11 13.732 11 14V19C11 19.268 10.9003 19.5017 10.701 19.701C10.5017 19.9003 10.268 20 10 20H5ZM14 11C13.732 11 13.4983 10.9003 13.299 10.701C13.0997 10.5017 13 10.268 13 10V5C13 4.732 13.0997 4.49833 13.299 4.299C13.4983 4.09967 13.732 4 14 4H19C19.268 4 19.5017 4.09967 19.701 4.299C19.9003 4.49833 20 4.732 20 5V10C20 10.268 19.9003 10.5017 19.701 10.701C19.5017 10.9003 19.268 11 19 11H14ZM14 20C13.732 20 13.4983 19.9003 13.299 19.701C13.0997 19.5017 13 19.268 13 19V14C13 13.732 13.0997 13.4983 13.299 13.299C13.4983 13.0997 13.732 13 14 13H19C19.268 13 19.5017 13.0997 19.701 13.299C19.9003 13.4983 20 13.732 20 14V19C20 19.268 19.9003 19.5017 19.701 19.701C19.5017 19.9003 19.268 20 19 20H14Z"
                  fill="#101010"
                />
              </svg>
            </ToggleButton>
          </ToggleButtonGroup>
          
        </Box>

       
      </Box>
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
                        sx={{ borderBottom: "none", py: 3 }}
                      >
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

                  const targetKey = Object.keys(row).filter((each) => {
                    return each === gridMasterObj.actionKey ? each : null;
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
                          onChange={() => handleSelectRow(row[key])}
                        />
                      </TableCell>

                      {gridMasterObj.indexReqd && (
                        <TableCell
                          sx={{ whiteSpace: "nowrap", overflow: "hidden" }}
                        >
                          {" "}
                          {serverSidePagination && (
                            <Typography variant="body2" color="text.secondary">
                              {String(actualIndex + 1).padStart(2, "0")}
                            </Typography>
                          )}
                          {!serverSidePagination && (
                            <Typography variant="body2" color="text.secondary">
                              {String(actualIndex + 1).padStart(2, "0")}
                            </Typography>
                          )}
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
                                  onHandleEdit(row[key], row);
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
                    className="card shadow-sm border-1 h-100"
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="card-body p-4 d-flex flex-column">
                      {/* Avatar + Title */}
                      {gridMasterObj.gridColumns
                        .filter(
                          (col) =>
                            col.displayable &&
                            ["name", "fullName"].includes(col.code)
                        )
                        .map((col) => (
                          <div key={col.code} className="text-center mb-3">
                            <div
                              className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto mb-2"
                              style={{
                                width: 50,
                                height: 50,
                                backgroundColor: "#9c27b0",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              {generateInitials(row[col.code] || "N/A")}
                            </div>
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
                          <div key={col.code} className="mb-3">
                            <small
                              className="text-muted d-block mb-1"
                              style={{ fontSize: "12px" }}
                            >
                              {col.title}
                            </small>
                            <div style={{ fontSize: "14px", color: "#333" }}>
                              {row[col.code] || "-"}
                            </div>
                          </div>
                        ))}

                      {gridMasterObj.actionReqd && (
                        <div className="mt-auto pt-3">
                          <div className="d-flex justify-content-between align-items-center">
                            {/* Show More */}
                            <button
                              className="btn text-white fw-medium px-3 py-2"
                              style={{
                                backgroundColor: "#9c27b0",
                                borderRadius: "8px",
                                fontSize: "14px",
                                border: "none",
                                whiteSpace: "nowrap",
                              }}
                              onClick={() => {
                                if (targetKey[0]) {
                                  const key = targetKey[0];
                                  onHandleView(row[key]);
                                }
                              }}
                            >
                              Show More
                            </button>

                            {/* Icons */}
                            <div className="d-flex gap-1">
                              {/* Edit */}
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
                              </button>

                              {/* Delete */}
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

      {/* {paginatedData.length === 0 && (
        <Box sx={{ width: "100%", textAlign: "center", py: 5 }}>
          <Typography variant="body2" color="text.secondary">
            No records found
          </Typography>
        </Box>
      )} */}

      {/* Footer with pagination and controls */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 3, sm: 2 },
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Left section - Download controls */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 1.5, sm: 2 },
            flexWrap: "wrap",
            order: { xs: 2, sm: 1 },
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

            <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 150 } }}>
              <Select
                displayEmpty
                value={pendingFormat || exportFormat}
                onChange={handleExportFormatChange}
                sx={{ fontSize: "14px" }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography variant="body2" color="text.secondary">
                        Select Format
                      </Typography>
                    );
                  }
                  return selected === "xlsx" ? "Excel" : "PDF";
                }}
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
            cancelButtonText=" Cancel"
            confirmButtonText=" Download"
            cancelButtonIcon={<CancelIcon />}
            confirmButtonIcon={<DownloadIcon />}
          />
        </Box>

        {/* Right section - Pagination and rows per page */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 2, sm: 2 },
            order: { xs: 1, sm: 2 },
          }}
        >
          {/* Pagination */}
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" },
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

          {/* Rows per page */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              justifyContent: { xs: "center", sm: "flex-end" },
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
