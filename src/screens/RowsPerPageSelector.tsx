import React, { useState } from "react";
import { Box, Typography, TextField, Autocomplete } from "@mui/material";
import { GridMaster } from "./models/gridMaster";

interface RowsPerPageSelectorProps {
  gridMaster: GridMaster;
  currentRowsPerPage: number;
  setRowsPerPage: (value: number) => void;
  serviceData: any;
  isServiceDataEmpty: (value: any) => void;
}

const RowsPerPageSelector: React.FC<RowsPerPageSelectorProps> = ({
  gridMaster,
  currentRowsPerPage,
  setRowsPerPage,
  serviceData,
  isServiceDataEmpty,
}) => {
  const [inputValue, setInputValue] = useState(currentRowsPerPage.toString());

  const pageOptions = gridMaster?.gridPagination?.recordPerPage || [
    5, 10, 25, 50, 100,
  ];

  const handleInputChange = (
    event: React.SyntheticEvent,
    newInputValue: string
  ) => {
    setInputValue(newInputValue);
    const numericValue = Number(newInputValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      setRowsPerPage(numericValue);

      // const value = {
      //   page: 1,
      //   rowsPerPage: numericValue,
      //   filteredData: { ...serviceData, pageNumber: 1 },
      //   isFilter: isServiceDataEmpty(serviceData),
      // };

      // gridMaster?.callBacks?.onPagination?.(value);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      const value = {
        page: 1,
        pageSize: serviceData?.pageSize,
        filteredData: { ...serviceData, pageNumber: 1 },
        isFilter: isServiceDataEmpty(serviceData),
      };
      gridMaster?.callBacks?.onPagination?.(value);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Autocomplete
        freeSolo
        options={pageOptions.map((opt) => opt.toString())}
        value={currentRowsPerPage.toString()}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        size="small"
        sx={{ minWidth: 100 }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            size="small"
            inputProps={{
              ...params.inputProps,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
          />
        )}
      />
    </Box>
  );
};

export default RowsPerPageSelector;
