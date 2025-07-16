import React, { useState } from "react";
import { Box, Typography, TextField, Autocomplete } from "@mui/material";
import { GridMaster } from "./models/gridMaster";

interface RowsPerPageSelectorProps {
  gridMaster: GridMaster;
  currentRowsPerPage: number;
  setRowsPerPage: (value: number) => void;
}

const RowsPerPageSelector: React.FC<RowsPerPageSelectorProps> = ({
  gridMaster,
  currentRowsPerPage,
  setRowsPerPage,
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

      const value = {
        page: 0,
        rowsPerPage: numericValue,
        isFilter: false,
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
