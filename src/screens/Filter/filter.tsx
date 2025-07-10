import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
  Divider,
} from '@mui/material';
import { customerGrid } from '../data/data';

type SortByDataProps = {
    onClose?: () => void;
   handleFilter?: (key: any) => void;
  sortActionKey: any;
};

export default function FilterByData({  
    onClose,
  sortActionKey,
  handleFilter, }: SortByDataProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const filterableColumns = customerGrid.gridColumns.filter((col) => col.filterable);

  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortType, setSortType] = useState<'desc' | 'unsort'>('desc');

  const handleInputChange = (code: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [code]: value }));
  };

  const handleReset = () => {
    setFilterValues({});
    setSortType('desc');
    if (onClose) onClose();
  };

  const handleApply = () => {
    console.log('Filter Values:', filterValues);
    console.log('Sort Type:', sortType);
    if (onClose) onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (onClose) onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: 260,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 2,
        backgroundColor: "#fff"
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Filter By
      </Typography>

      <Typography variant="body2" fontWeight={500} mb={1}>
        Filterable Fields
      </Typography>

      {filterableColumns.map((column) => (
        <TextField
          key={column.code}
          label={column.title}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          value={filterValues[column.code] || ''}
          onChange={(e) => handleInputChange(column.code, e.target.value)}
        />
      ))}

      <Divider sx={{ my: 2 }} />

      {/* <Typography variant="body2" fontWeight={500} mb={1}>
        Sort Type
      </Typography>

      <RadioGroup
        value={sortType}
        onChange={(e) => setSortType(e.target.value as 'desc' | 'unsort')}
      >
        <FormControlLabel
          value="desc"
          control={<Radio sx={{ color: '#d63384' }} />}
          label="Desc"
        />
        <FormControlLabel
          value="unsort"
          control={<Radio />}
          label="Unsort"
        />
      </RadioGroup> */}

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
          sx={{ bgcolor: '#d63384', color: '#fff', '&:hover': { bgcolor: '#c02576' } }}
          onClick={handleApply}
          size="small"
        >
          Apply Now
        </Button>
      </Box>
    </Box>
  );
}
