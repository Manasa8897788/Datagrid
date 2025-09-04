### chs-real-data-grid
A customizable React data grid built on Material UI, designed for real-world applications with controlled state, asynchronous workflows, and TypeScript support. It offers features like sorting, filtering, pagination, row selection, column search, and export helpers for XLSX/PDF .

#### Features
*   **Sorting** (global and per-column), **filtering**, **pagination**, and **row selection**.
*   **Column search**, clear sort/filter actions, and callback-driven interactions .
*   **Export helpers** for Excel (XLSX) and PDF.
*   Material UI theming and layout with Box, Typography.
*   TypeScript types for data and grid configuration.
*   Supports server-side pagination and actions.

#### Installation
Install peer dependencies and the grid package:
**Note**: Material UI packages are peer dependencies. Ensure compatible versions are installed.

```bash
npm install chs-real-data-grid
```
### Quick Start

* Define data types
* Provide data and grid config Prepare your data and create a GridMaster configuration object. You can use the provided customerGrid default object and define your callback functions.
* Render the component Wrap the DataTable component with a Material UI Box container, pass your data and gridMaster props, and the component will handle the rendering and user interactions via the specified callbacks.
### Usage Example
The DataTable component expects data (an array of your records) and a gridMaster configuration object. Here's how you might set up your Customers component using the provided default customerGrid object and callback functions:

```bash
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material"; 
import DataTable from "chs-real-data-grid";
import { Customer } from "./models/customer"; 
import { GridMaster } from "./models/gridMaster";
import { dumpData, validateInput } from "./data/validateInput"; 
import { PageState } from "./models/pageState"; 
import { exportToExcel } from "./excelExport"; 
import { exportToPDF } from "./exportPdf";
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material"; // Typography is included in the source but not used in the final return
import DataTable from "chs-real-data-grid"; // Assuming 'DataTable' is the export from your package 
import { Customer } from "./models/customer";
import { GridMaster } from "./models/gridMaster";
import { dumpData, validateInput } from "./data/validateInput"; // Example data and input validation 
import { customerGrid as customerGridDefault } from "./screens/data/data"; // Your default grid config 
import { exportToExcel } from "./excelExport"; // Export helpers 
import { exportToPDF } from "./exportPdf"; // Export helpers 
import { PageState } from "./models/pageState"; // PageState enum 

const Customers: React.FC = () => {
    const [customData, setCustomData] = useState<Customer[]>(dumpData); // Initial data [15, 16]

    Callback implementations
    const getFilterdData = async (value: any) => {
        setCustomerGrid((prev) => ({
            ...prev,
            pageState: PageState.LOADING,
        }));
        // Example server-side call (commented out in source) 
        // try {
        //   const response: any = await dataService.filterCustomers(value);
        //   setCustomData(response?.content?.records || []);
        //   setCustomerGrid((prev) => ({
        //     ...prev,
        //     currentPage: value.pageNumber + 1,
        //     currentPageSize: value.pageSize || customerGrid.currentPageSize,
        //     totalPages: response?.content?.totalPages || 1,
        //     pageState: PageState.SUCCESS,
        //   }));
        // } catch (error) {
        //   setCustomData([]);
        //   setCustomerGrid((prev) => ({ ...prev, pageState: PageState.ERROR }));
        //   console.error("Error filterCustomers:", error);
        // }
    };

    const handleSelect = () => {
        console.log("handleSelect"); 
    };

    const handleDelete = (val: any) => {
        console.log("handle Delete", val); 
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

    const handleSearch = (value: any) => {
        console.log("handleSearch", value);
        getFilterdData(value);
    };

    const handleSort = (value: { column: keyof Customer; direction: "asc" | "desc" }) => {
        console.log("Sort Triggered:", value); // [18, 32]
        const { column, direction } = value;
        if (!column) {
            console.warn("No column provided for sorting");
            return;
        }
        const sortedData = [...customData].sort((a, b) => {
            const aValue = a[column];
            const bValue = b[column];
            if (aValue === undefined || bValue === undefined) return 0;
            if (typeof aValue === "string") {
                return direction === "asc"
                    ? aValue.localeCompare(bValue as string)
                    : (bValue as string).localeCompare(aValue);
            }
            if (typeof aValue === "number") {
                return direction === "asc"
                    ? (aValue as number) - (bValue as number)
                    : (bValue as number) - (aValue as number);
            }
            return 0;
        });
        console.log("Sorted Data:", sortedData);
        setCustomData(sortedData);
        setCustomerGrid((prev) => ({
            ...prev,
            sortBy: column,
            sortDirection: direction,
        }));
    }; [18, 19, 32, 33]

    const handleColumnSearch = async (value: { column: string; searchText: string }) => {
        const { column, searchText } = value;
        console.log("handleColumnSearch", value); 
        setCustomerGrid((prev) => ({
            ...prev,
            pageState: PageState.LOADING,
        }));
        // Example server-side call (commented out in source)
        // try {
        //   const response = await dataService.fetchCustomersByColumn(column, searchText);
        //   const records = response?.content;
        //   setCustomData(records);
        //   setCustomerGrid((prev) => ({
        //     ...prev,
        //     currentPage: 1,
        //     totalPages: response?.content?.totalPages || 1,
        //   }));
        // } catch (error) {
        //   setCustomData([]);
        //   setCustomerGrid((prev) => ({ ...prev, pageState: PageState.ERROR }));
        //   console.error("Error fetching customers by column search:", error);
        // }
    }; [19-21, 33]

    const handlePagination = async (value: any) => {
        const { page: pageNumber, rowsPerPage: pageSize, isFilter, filteredData } = value;
        console.log("handle Pagination", value); 
        const currentPage = pageNumber < 1 ? 1 : pageNumber;
        const offset = currentPage - 1;
        if (isFilter) {
            console.log("filteredData", filteredData);
            getFilterdData({
                ...filteredData,
                pageNumber: offset,
            });
            console.log("filter");
        } else {
            setCustomerGrid((prev) => ({
                ...prev,
                pageState: PageState.LOADING,
            }));
            // Example server-side call (commented out in source)
            // try {
            //   const response = await dataService.getCustomersPaginated(offset, pageSize);
            //   setCustomData(response?.content?.records || []);
            //   setCustomerGrid((prev) => ({
            //     ...prev,
            //     currentPage: currentPage,
            //     totalPages: response?.content?.totalPages || 1,
            //     pageState: PageState.SUCCESS,
            //   }));
            // } catch (error) {
            //   setCustomerGrid((prev) => ({ ...prev, pageState: PageState.ERROR }));
            //   setCustomData([]);
            //   console.error("Error fetching paginated customers:", error);
            // }
            console.log("paginated");
        }
    }; [21-24, 34, 35]

    const handleFilter = (value: any) => {
        console.log("handleFilter", value);
        // getFilterdData(value);
    };

    const handleClearAll = async () => {
        console.log("handleClearAll"); 
        // fetchData();
    };

    const handleClearSort = () => {
        console.log("handleClearSort"); 
    };

    const handleClearFilter = () => {
        console.log("handleClearFilter"); 
    };

    const handleColumnSort = () => {
        console.log("handleColumnSort"); 
    };

    const handleDownload = async (format: "xlsx" | "pdf") => {
        console.log("handleDownload", format); // [25, 35]
        // Example server-side call and export logic (commented out in source) 
        // try {
        //   const response = await dataService.getCustomerMasterList();
        //   const exportData = response?.content || [];
        //   const exportableColumns = customerGrid.gridColumns
        //     .filter((col) => col.displayable && col.code !== "ID")
        //     .map((col) => ({ title: col.title, code: col.code }));
        //   if (format === "xlsx") {
        //     exportToExcel(exportData, exportableColumns, "Customer_Master_Export");
        //   }
        //   if (format === "pdf") {
        //     exportToPDF(
        //       exportData,
        //       exportableColumns.map(({ code, title }) => ({ code, name: title })),
        //       "Customer_Master_Export"
        //     );
        //   }
        // } catch (error) {
        //   console.error("Error during export:", error);
        // }
    };

    // GridMaster state using default customerGrid configuration 
    const [customerGrid, setCustomerGrid] = useState<GridMaster>({
        ...validateInput, // Assuming validateInput provides some default grid config or overrides
        ...customerGridDefault,
        callBacks: {
            onSelect: handleSelect,
            onDelete: handleDelete,
            onSearch: handleSearch,
            onRowView: handleView,
            onRowEdit: handleEdit,
            onRowDelete: handleDeleteCell,
            onSort: handleSort,
            onClearSort: handleClearSort,
            onFilter: handleFilter,
            onClearFilter: handleClearFilter,
            onColumnSort: handleColumnSort,
            onDownload: handleDownload,
            onPagination: handlePagination,
            onClearAll: handleClearAll,
            onColumnSearch: handleColumnSearch,
        },
    });

    // Initial data fetching
    const fetchData = async () => {
        // Example server-side call (commented out in source) 
        // try {
        //   const response = await dataService.getCustomersPaginated(0, 10);
        //   setCustomData(response?.content?.records || []);
        //   setCustomerGrid((prev) => ({
        //     ...prev,
        //     currentPage: 1,
        //   }));
        // } catch (error) {
        //   console.error("Error fetching paginated customers:", error);
        // }
    };

    useEffect(() => {
        fetchData();
    }, []); 

    return (
        <Box
            sx={{
                width: "80%",
                height: "auto", // Can be "auto" or a fixed height [39]
                p: "2.5rem",
                borderRadius: "1.5rem",
                background: "#fff",
            }}
        >
            {/* The DataTable component would be rendered here, passing customData and customerGrid */}
            {/* The source only shows {customerGrid} directly, implying the actual DataTable component is omitted for brevity or passed as children implicitly */}
            {/* For a complete example, it should look like: */}
            {/* <DataTable data={customData} gridMaster={customerGrid} /> */}
            {customerGrid} {/* This part of the source might be a placeholder for brevity [14, 40] */}
        </Box>
    );
};

export default Customers;
```
### The customerGrid default object, used in the example above, is configured as follows:

```bash

import { DataType } from "../models/dataType";
import { GridMaster } from "../models/gridMaster";
import { PageState } from "../models/pageState";

// Callback functions (as defined in customerGrid configuration, separate from the detailed component implementations)
const handleSelect = (row: any) => { console.log("Selected row:", row); };
const handleDelete = (row: any) => { console.log("Deleted row:", row); };
const handleRowView = (key: any) => { console.log("Viewing row with key:", key); };
const handleRowEdit = (key: any) => { console.log("Editing row with key:", key); };
const handleRowDelete = (key: any) => { console.log("Deleting row with key:", key); };
const handleSort = (key: any) => { console.log("Sorting by key:", key); };
const handleSearch = (key: any) => { console.log("Searching with key:", key); };
const handleClearSort = (key: any) => { console.log("Clear sort for key:", key); };
const handleFilter = (key: any) => { console.log("Filtering by key:", key); };
const handleClearFilter = (key: any) => { console.log("Clear filter for key:", key); };
const handleColumnSort = (key: any) => { console.log("Column sort by key:", key); };
const handleDownload = (key: any) => { console.log("Download for key:", key); };
const handlePagination = async (value: any) => { /* Detailed async logic here */ }; // [31, 41]



export const customerGrid: GridMaster = {
    id: 1,
    targetObject: "customer",
    title: "Customer List",
    filterReqd: true,
    searchReqd: true,
    sortReqd: true,
    paginationReqd: true,
    primaryColour: "#1E90FF",
    secondaryColour: "#F0F8FF",
    actionReqd: true,
    actionCheckboxReqd: true,
    actionEditReqd: true,
    actionViewReqd: true,
    actionDeleteReqd: true,
    actionAddReqd: true,
    indexReqd: true,
    dynamicLoad: true,
    recordsPerPage: 10,
    actionKey: "firstName",
    sortActionKey: "code",
    gridPagination: {
        reqd: true,
        pageCount: 10,
        recordPerPage: [5, 42, 43],
        dynamicLoad: true,
    },
    gridColumns: [
        { id: 2, code: "firstName", title: "First Name", sortable: true, searchReqd: true, filterable: true, displayable: true, formElementType: "text", type: DataType.STRING },
        { id: 3, code: "middleName", title: "Middle Name", sortable: false, searchReqd: false, filterable: false, displayable: true, formElementType: "image", type: DataType.STRING },
        { id: 4, code: "lastName", title: "Last Name", sortable: true, searchReqd: true, filterable: false, displayable: true, formElementType: "text", type: DataType.STRING },
        { id: 5, code: "username", title: "Username", sortable: true, searchReqd: true, filterable: false, displayable: true, formElementType: "text", type: DataType.STRING },
        { id: 6, code: "gender", title: "Gender", sortable: false, searchReqd: false, filterable: true, displayable: true, enumValues: ["MALE", "FEMALE"], formElementType: "radio", type: DataType.STRING },
        { id: 7, code: "dob", title: "Date of Birth", sortable: false, searchReqd: false, filterable: false, displayable: true, formElementType: "range", type: DataType.INTEGER },
        { id: 8, code: "anniversary", title: "Anniversary", sortable: false, searchReqd: false, filterable: false, displayable: false, formElementType: "text", type: DataType.INTEGER },
        { id: 9, code: "mobileNumber", title: "Mobile Number", sortable: false, searchReqd: true, filterable: false, displayable: true, formElementType: "phone", type: DataType.STRING },
        { id: 10, code: "emailId", title: "Email ID", sortable: false, searchReqd: true, filterable: false, displayable: true, formElementType: "email", type: DataType.STRING },
        { id: 11, code: "referredBy", title: "Referred By", sortable: true, searchReqd: false, filterable: false, displayable: false, formElementType: "text", type: DataType.LONG },
        { id: 12, code: "prefLang", title: "Preferred Lang.", sortable: false, searchReqd: true, filterable: true, displayable: true, enumValues: ["Telugu", "English"], formElementType: "checkbox", type: DataType.STRING },
        { id: 13, code: "registeredOn", title: "Registered On", sortable: true, searchReqd: false, filterable: true, displayable: true, formElementType: "range", type: DataType.DATE_AND_TIME },
        { id: 14, code: "currency", title: "Currency", sortable: true, searchReqd: false, filterable: true, displayable: false, enumValues: ["SUCCESS", "FAILED", "PENDING"], formElementType: "radio", type: DataType.STRING },
    ],
    callBacks: {
        onSelect: handleSelect,
        onDelete: handleDelete,
        onSearch: handleSearch,
        onRowView: handleRowView,
        onRowEdit: handleRowEdit,
        onRowDelete: handleRowDelete,
        onSort: handleSort,
        onClearSort: handleClearSort,
        onFilter: handleFilter,
        onClearFilter: handleClearFilter,
        onColumnSort: handleColumnSort,
        onDownload: handleDownload,
        onPagination: handlePagination,
    },
    serverSide: true,
    serverSidePagination: true,
    pageState: PageState.IDLE,
    gridActions: {
        ep_data: { uri: "/customer/get", method: "GET" },
        ep_update: { uri: "/customer/update", method: "PUT" },
        ep_delete: { uri: "/customer/delete", method: "DELETE" },
        ep_toggle: { uri: "/customer/status", method: "PUT" },
    },
};

```
### Props
-  **data**: An array of row objects matching the consumer's model (e.g., Customer[]).
-  **gridMaster**: The grid configuration object, containing columns, paging, sorting, filter state, UI options, and callback handlers.
-  **children**: Optional ReactNode for advanced composition; can pass grid state for debugging or developer tools.

#### Callbacks
These functions are triggered by user interactions within the grid and allow you to implement custom logic for data manipulation and state updates. The customerGrid default object demonstrates how to assign these.

# Grid Event Callbacks

This section explains the different callbacks/events available in the grid.

## Row Actions

- **onSelect**: Triggered on row select/deselect.
- **onRowView**: Triggered on a single row “view” action.
- **onRowEdit**: Triggered on a single row “edit” action.
- **onRowDelete**: Triggered on a single row “delete” action.
- **onDelete**: Triggered for bulk delete actions.

## Search and Filter

- **onSearch**: Triggered for global search/filter submit; implement server or local filtering here.
- **onColumnSearch**: Triggered for per-column search; receives `{ column, searchText }`.
- **onFilter**: Triggered when filter UI is applied.
- **onClearFilter**: Clears current filter state.

## Sorting

- **onSort**: Triggered for global sort; receives `{ column, direction }`.
- **onColumnSort**: Triggered when sorting is invoked from a header context.
- **onClearSort**: Clears current sort state.

## Pagination

- **onPagination**: Triggered on page change; receives `{ page, rowsPerPage, isFilter, filteredData }`.

## Other Actions

- **onClearAll**: Clears all grid state.
- **onDownload**: Triggered for export; receives `"xlsx"` or `"pdf"`.

# Grid Types

This section explains the main types used in the grid.

## Customer

- **Customer**: The consumer's record shape; must at least include a unique `id`.

## GridMaster

- **GridMaster**: Configuration object for the grid.
  - `gridColumns`: Columns configuration.
  - `paging`: Paging info, including:
    - `currentPage`
    - `currentPageSize`
    - `totalPages`
  - `sortBy`: Column used for sorting.
  - `sortDirection`: Direction of sorting.
  - `pageState`: Current state of the UI (see `PageState` enum).
  - `callBacks`: Event callbacks like `onSelect`, `onDelete`, etc.

## PageState

- **PageState**: Enum defining UI states:
  - `LOADING`
  - `SUCCESS`
  - `ERROR`
# Grid Component Documentation

## Column Configuration

The `gridColumns` array within `GridMaster` defines each column's properties. Typical fields include:

- **code**: `string` (field key in data)
- **title**: `string` (header label)
- **displayable**: `boolean` (controls visibility/export)
- **width, align, sortable, filterable, searchable**: optional flags
- **renderCell**: optional custom renderer
- **formElementType**: e.g., `"text"`, `"radio"`, `"range"`
- **type**: e.g., `DataType.STRING`, `DataType.INTEGER`, `DataType.DATE_AND_TIME`
- **enumValues**: for columns with predefined options, e.g., `"MALE"`, `"FEMALE"` for gender

## Export Helpers

The package provides functions to facilitate data export:

- `exportToExcel(data, columns, fileName)`: Exports selected columns to XLSX.
- `exportToPDF(data, columns, fileName)`: Exports selected columns to PDF.  

**Tip**: Map `displayable` columns and exclude internal fields before export.

## Styling and Theming

- The component uses **MUI theming**. Wrap your app with `ThemeProvider` and `createTheme` to customize palette, typography, and shape.
- Layout is responsive via `Box` props; adjust container width/height based on your use case.

## Best Practices

- Keep data **immutable**: Create new arrays on sort/filter to avoid stale renders.
- **Server-side operations**: For large datasets, use server-side pagination and filtering. Wire network calls inside `onSearch`/`onPagination` and set `pageState` to control loaders and errors.
- **Stable columns**: Keep columns stable to avoid re-mounting cells; memoize renderers where needed.

## Error Handling

- Use `pageState` to show loading spinners and error banners in the UI.
- In callbacks, wrap asynchronous calls with `try/catch` blocks and set grid state accordingly to handle errors gracefully.

## Accessibility

- Keyboard navigation and focus management rely on MUI/X grid behavior; ensure row `id` is stable and unique.
- Provide clear header names and adequate contrast via your theme.

## Versioning and Peer Requirements

- React 18+
- Material UI v5 (`@mui/material`, `@emotion/react`, `@emotion/styled`)
- `@mui/x-data-grid` for base grid primitives and features
- Icons via `@mui/icons-material`

## Contributing

- Open issues with minimal reproductions.
- For new features, propose an API sketch before submitting a Pull Request (PR).
- Run type checks and linting before submitting.

## License

ISC



