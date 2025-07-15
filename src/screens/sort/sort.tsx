import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
  Divider,
} from "@mui/material";
import type { GridMaster } from "../models/gridMaster";
import { GridColumns } from "../models/gridColums";

type SortByDataProps = {
  onClose?: () => void;
  handleSort?: (key: any) => void;
  customerGrid: GridMaster;
  selectedColumns: any;
  setSelectedColumns: (columns: any) => void;
  sortType: any;
  setSortType: (val: any) => void;
};

export default function SortByData({
  onClose,
  handleSort,
  customerGrid,
  selectedColumns,
  setSelectedColumns,
  setSortType,
  sortType,
}: SortByDataProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sortableColumns = customerGrid.gridColumns.filter(
    (col) => col.sortable && col.displayable
  );

  // const [selectedColumns, setSelectedColumns] = useState<
  //   typeof customerGrid.gridColumns
  // >([]);
  const [selectedEnums, setSelectedEnums] = useState<Record<string, string>>(
    {}
  );

  console.log(selectedColumns, selectedColumns);

  const handleCheckboxChange = (
    column: (typeof customerGrid.gridColumns)[0]
  ) => {
    const isCurrentlySelected = selectedColumns.some(
      (col: any) => col.code === column.code
    );

    if (isCurrentlySelected) {
      setSelectedColumns((prev: any) =>
        prev.filter((col: any) => col.code !== column.code)
      );
      setSelectedEnums((prev) => {
        const newEnums = { ...prev };
        delete newEnums[column.code];
        return newEnums;
      });
    } else {
      setSelectedColumns((prev: any) => [...prev, column]);
    }
  };

  const handleApply = () => {
    const sortActionKey = customerGrid.sortActionKey;

    if (sortType === "desc") {
      const key: keyof (typeof selectedColumns)[0] = sortActionKey;
      const filteredKeys = selectedColumns.map((each: any) => each[key]);
      if (handleSort) {
        handleSort({ order: "desc", sortActionKeys: filteredKeys });
      }
      onClose?.();
      return;
    }

    if (sortActionKey) {
      const key: keyof (typeof selectedColumns)[0] = sortActionKey;
      const filteredKeys = selectedColumns.map((each: any) => each[key]);

      if (handleSort) {
        handleSort({
          order: sortType,
          sortActionKeys: filteredKeys,
        });
      }
    }

    onClose?.();
  };

  const handleReset = () => {
    setSelectedColumns([]);
    setSelectedEnums({});
    setSortType("desc");
    const value = {
      order: "desc",
      sortActionKeys: [],
      selectedEnums: {},
    };
    if (handleSort) {
      handleSort(value);
    }
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (onClose) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: 240,
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 2,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Sort By
      </Typography>
      <Typography variant="body2" fontWeight={500} mb={1}>
        Columns
      </Typography>
      {sortableColumns.map((column) => {
        const isChecked = selectedColumns.some(
          (col: any) => col.code === column.code
        );
        return (
          <React.Fragment key={column.code}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(column)}
                />
              }
              label={column.title}
              sx={{ display: "block", ml: 1 }}
            />
            {/* {column.enumValues && isChecked && (
              <RadioGroup
                value={selectedEnums[column.code] || ""}
                onChange={(e) => handleRadioChange(e, column.code)}
                row
                sx={{ ml: 3 }}
              >
                {column.enumValues.map((val) => (
                  <FormControlLabel
                    key={val}
                    value={val}
                    control={<Radio />}
                    label={val}
                  />
                ))}
              </RadioGroup>
            )} */}
          </React.Fragment>
        );
      })}
      <Divider sx={{ my: 2 }} />
      <Typography variant="body2" fontWeight={500} mb={1}>
        Sort Type
      </Typography>
      <RadioGroup
        value={sortType}
        onChange={(e) => setSortType(e.target.value as "asc" | "desc")}
      >
        <FormControlLabel value="desc" control={<Radio />} label="Desc" />
        <FormControlLabel value="asc" control={<Radio />} label="Asc" />
      </RadioGroup>
      <Box mt={2} display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleReset}
          size="small"
        >
          Reset
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#d63384",
            color: "#fff",
            "&:hover": { bgcolor: "#c02576" },
          }}
          onClick={handleApply}
          size="small"
        >
          Apply Now
        </Button>
      </Box>
    </Box>
  );
}
