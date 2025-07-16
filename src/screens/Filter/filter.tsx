"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  Stack,
  TextField,
} from "@mui/material";
import type { GridMaster } from "../models/gridMaster";
import type { FilterCriteria } from "../models/searchCriteria";
import type { RangeCriteria } from "../models/rangeCriteria";
import { GenericFilterRequest } from "../models/genericFilterRequest";

type SortByDataProps = {
  onClose?: () => void;
  handleFilter?: (key: any) => void;
  sortActionKey: any;
  customerGrid?: GridMaster;
  selectedEnums: FilterCriteria[];
  setSelectedEnums: (val: any) => void;
  selectedRanges: RangeCriteria[];
  setSelectedRanges: (val: any) => void;
  serviceData: GenericFilterRequest;
};

export default function FilterByData({
  onClose,
  sortActionKey,
  customerGrid,
  handleFilter,
  selectedEnums,
  setSelectedEnums,
  selectedRanges,
  setSelectedRanges,
  serviceData,
}: SortByDataProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const gridColumns = customerGrid?.gridColumns ?? [];

  const filterableColumns = gridColumns.filter(
    (col) => col.filterable && col.displayable
  );

  // State to manage selected filter criteria

  const handleReset = () => {
    setSelectedEnums([]);
    setSelectedRanges([]);
    if (onClose) onClose();
  };

  const handleApply = () => {
    console.log("Selected Enums:", selectedEnums);
    console.log("Selected Ranges:", selectedRanges);

    if (sortActionKey && handleFilter) {
      // const value = {
      //   sortActionKeys: [], // You can modify this based on your needs
      //   selectedEnums: selectedEnums,
      //   selectedRanges: selectedRanges,
      // };
      // handleFilter(value);
      handleFilter(serviceData);
    }
    if (onClose) {
      onClose();
    }
  };

  // Handle radio button changes
  const handleRadioChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    column: any
  ) => {
    const value = event.target.value;

    setSelectedEnums((prev: any) => {
      // Remove existing entry for this field if it exists
      const filtered = prev.filter((item: any) => item.field !== column.title);

      // Add new entry with single value (radio allows only one selection)
      return [
        ...filtered,
        {
          field: column.title,
          values: [value],
          fieldCode: column.code,
          type: column.type,
        },
      ];
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    item: string,
    column: any
  ) => {
    const isChecked = event.target.checked;

    setSelectedEnums((prev: any) => {
      const existingIndex = prev.findIndex(
        (criteria: any) => criteria.field === column.title
      );

      if (existingIndex >= 0) {
        // Field already exists, update its values
        const existingCriteria = prev[existingIndex];
        let updatedValues;

        if (isChecked) {
          // Add value if not already present
          updatedValues = existingCriteria.values.includes(item)
            ? existingCriteria.values
            : [...existingCriteria.values, item];
        } else {
          // Remove value
          updatedValues = existingCriteria.values.filter(
            (val: any) => val !== item
          );
        }

        // If no values left, remove the entire criteria
        if (updatedValues.length === 0) {
          return prev.filter(
            (_: any, index: number) => index !== existingIndex
          );
        }

        // Update the criteria with new values
        const updatedCriteria = [...prev];
        updatedCriteria[existingIndex] = {
          ...existingCriteria,
          values: updatedValues,
        };
        return updatedCriteria;
      } else {
        // Field doesn't exist, create new entry if checked
        if (isChecked) {
          return [
            ...prev,
            {
              field: column.title,
              values: [item],
              fieldCode: column.code,
              type: column.type,
            },
          ];
        }
        return prev;
      }
    });
  };

  // Handle range input changes
  const handleRangeChange = (
    event: React.ChangeEvent<HTMLInputElement> | any,
    columnCode: string,
    columnTitle: string,
    columnType: string,
    rangeType: "from" | "to"
  ) => {
    const value = event.target.value;

    setSelectedRanges((prev: any) => {
      const existingIndex = prev.findIndex(
        (criteria: any) => criteria.field === columnTitle
      );

      if (existingIndex >= 0) {
        // Update existing range criteria
        const updatedCriteria = [...prev];
        updatedCriteria[existingIndex] = {
          ...updatedCriteria[existingIndex],
          [rangeType]: value,
        };
        return updatedCriteria;
      } else {
        const newCriteria: RangeCriteria = {
          field: columnTitle,
          from: rangeType === "from" ? value : "",
          to: rangeType === "to" ? value : "",
          type: columnType,
        };
        return [...prev, newCriteria];
      }
    });
  };

  // Helper function to get selected radio value for a column
  const getSelectedRadioValue = (columnTitle: string): string => {
    const criteria = selectedEnums.find((item) => item.field === columnTitle);
    return criteria && criteria.values.length > 0 ? criteria.values[0] : "";
  };

  // Helper function to check if checkbox is selected
  const isCheckboxSelected = (columnTitle: string, value: string): boolean => {
    const criteria = selectedEnums.find((item) => item.field === columnTitle);
    return criteria ? criteria.values.includes(value) : false;
  };

  // Helper function to get range values
  const getRangeValue = (
    columnTitle: string,
    rangeType: "from" | "to"
  ): string => {
    const criteria = selectedRanges.find((item) => item.field === columnTitle);
    return criteria ? criteria[rangeType] : "";
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

  if (gridColumns.length === 0) {
    return (
      <Box
        ref={containerRef}
        sx={{
          width: 260,
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          p: 2,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          No filterable data
        </Typography>
        <Button sx={{ mt: 2 }} variant="contained" onClick={onClose}>
          Close
        </Button>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: 260,
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 2,
        backgroundColor: "#fff",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Filter By
      </Typography>
      <Typography variant="body2" fontWeight={500} mb={1}>
        Filterable Fields
      </Typography>
      <Divider />

      {filterableColumns.map((column) => {
        return (
          <React.Fragment key={column.code}>
            {column.enumValues && column.formElementType === "radio" && (
              <>
                <Typography variant="body2" fontWeight={500} mb={1} mt={2}>
                  {column.title}
                </Typography>
                <RadioGroup
                  value={getSelectedRadioValue(column.title)}
                  onChange={(e) => handleRadioChange(e, column)}
                  sx={{ ml: 1 }}
                >
                  {column.enumValues.map((val) => (
                    <FormControlLabel
                      key={val}
                      value={val}
                      control={<Radio size="small" />}
                      label={val}
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontSize: "0.875rem",
                        },
                      }}
                    />
                  ))}
                </RadioGroup>
              </>
            )}

            {column.enumValues && column.formElementType === "checkbox" && (
              <>
                <Typography variant="body2" fontWeight={500} mb={1} mt={2}>
                  {column.title}
                </Typography>
                <Stack spacing={0.5} sx={{ ml: 1 }}>
                  {column.enumValues.map((item) => (
                    <FormControlLabel
                      key={item}
                      control={
                        <Checkbox
                          size="small"
                          checked={isCheckboxSelected(column.title, item)}
                          onChange={(e) =>
                            handleCheckboxChange(e, item, column)
                          }
                        />
                      }
                      label={item}
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontSize: "0.875rem",
                        },
                      }}
                    />
                  ))}
                </Stack>
              </>
            )}

            {column.formElementType === "range" && (
              <>
                <Typography variant="body2" fontWeight={500} mb={1} mt={2}>
                  {column.title}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
                  <TextField
                    label="From"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={getRangeValue(column.title, "from")}
                    onChange={(e) =>
                      handleRangeChange(
                        e,
                        column.code,
                        column.title,
                        column.type,
                        "from"
                      )
                    }
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                  <TextField
                    label="To"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={getRangeValue(column.title, "to")}
                    onChange={(e) =>
                      handleRangeChange(
                        e,
                        column.code,
                        column.title,
                        column.type,
                        "to"
                      )
                    }
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                </Box>
              </>
            )}
          </React.Fragment>
        );
      })}

      <Divider sx={{ my: 2 }} />

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

      {/* Debug info - remove in production */}
      {/* {process.env.NODE_ENV === "development" && (
        <Box mt={2} p={1} bgcolor="#f5f5f5" borderRadius={1}>
          <Typography variant="caption" display="block">
            Selected Filters:
          </Typography>
          <Typography
            variant="caption"
            display="block"
            sx={{ fontWeight: "bold" }}
          >
            Enums:
          </Typography>
          <pre style={{ fontSize: "10px", margin: 0, marginBottom: 8 }}>
            {JSON.stringify(selectedEnums, null, 2)}
          </pre>
          <Typography
            variant="caption"
            display="block"
            sx={{ fontWeight: "bold" }}
          >
            Ranges:
          </Typography>
          <pre style={{ fontSize: "10px", margin: 0 }}>
            {JSON.stringify(selectedRanges, null, 2)}
          </pre>
        </Box>
      )} */}
    </Box>
  );
}
