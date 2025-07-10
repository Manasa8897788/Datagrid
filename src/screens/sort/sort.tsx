"use client";

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

type SortByDataProps = {
  onClose?: () => void;
  handleSort?: (key: any) => void;
  sortActionKey: any;
  customerGrid: GridMaster;
};

export default function SortByData({
  onClose,
  sortActionKey,
  handleSort,
  customerGrid,
}: SortByDataProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sortableColumns = customerGrid.gridColumns.filter(
    (col) => col.sortable
  );

  const [selectedColumns, setSelectedColumns] = useState<
    typeof customerGrid.gridColumns
  >([]);
  const [selectedEnums, setSelectedEnums] = useState<Record<string, string>>(
    {}
  );
  const [sortType, setSortType] = useState<"desc" | "unsort">("desc");

  const handleRadioChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    columnCode: string
  ) => {
    const value = event.target.value;
    setSelectedEnums((prev) => ({
      ...prev,
      [columnCode]: value,
    }));
  };

  const handleCheckboxChange = (
    column: (typeof customerGrid.gridColumns)[0]
  ) => {
    const isCurrentlySelected = selectedColumns.some(
      (col) => col.code === column.code
    );

    if (isCurrentlySelected) {
      // Remove column and its enum value
      setSelectedColumns((prev) =>
        prev.filter((col) => col.code !== column.code)
      );
      setSelectedEnums((prev) => {
        const newEnums = { ...prev };
        delete newEnums[column.code];
        return newEnums;
      });
    } else {
      // Add column
      setSelectedColumns((prev) => [...prev, column]);
    }
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

  const handleApply = () => {
    console.log("Selected Columns:", selectedColumns);
    console.log("sortActionKey", sortActionKey);
    console.log("selectedEnum", selectedEnums);

    if (sortActionKey) {
      const key: keyof (typeof selectedColumns)[0] = sortActionKey;
      const filteredKeys = selectedColumns.map((each) => each[key]);
      if (handleSort) {
        const value = {
          order: sortType,
          sortActionKeys: filteredKeys,
          selectedEnums: selectedEnums,
        };
        handleSort(value);
      }
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
          (col) => col.code === column.code
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
            {column.enumValues && isChecked && (
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
            )}
          </React.Fragment>
        );
      })}
      <Divider sx={{ my: 2 }} />
      <Typography variant="body2" fontWeight={500} mb={1}>
        Sort Type
      </Typography>
      <RadioGroup
        value={sortType}
        onChange={(e) => setSortType(e.target.value as "desc" | "unsort")}
      >
        <FormControlLabel
          value="desc"
          control={<Radio sx={{ color: "#d63384" }} />}
          label="Desc"
        />
        <FormControlLabel value="unsort" control={<Radio />} label="Unsort" />
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
