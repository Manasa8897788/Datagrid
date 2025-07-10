import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
  Divider,
} from '@mui/material';
import { customerGrid } from '../data/data';



type SortByDataProps = {
  onClose?: () => void;
};

export default function SortByData({ onClose }: SortByDataProps)  {
     const containerRef = useRef<HTMLDivElement>(null); 
 const sortableColumns = customerGrid.gridColumns.filter((col) => col.sortable);

  const [selectedColumns, setSelectedColumns] = useState<typeof customerGrid.gridColumns>([]);  const [sortType, setSortType] = useState<'desc' | 'unsort'>('desc');

  const handleCheckboxChange = (column: typeof customerGrid.gridColumns[0]) => {
    setSelectedColumns((prev) =>
      prev.some((col) => col.code === column.code)
        ? prev.filter((col) => col.code !== column.code)
        : [...prev, column]
    );
  };

 
  const handleReset = () => {
    setSelectedColumns([]);
    setSortType('desc');
 if (onClose) {
      onClose(); 
    }  };

  const handleApply = () => {
    console.log('Selected Columns:', selectedColumns); 
    console.log('Sort Type:', sortType);
     if (onClose) {
      onClose(); 
    }
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
        width: 240,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 2,
        backgroundColor:"#fff"
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Sort By
      </Typography>

      <Typography variant="body2" fontWeight={500} mb={1}>
        Columns
      </Typography>

        {sortableColumns.map((column) => (
        <FormControlLabel
          key={column.code}
          control={
            <Checkbox
              checked={selectedColumns.some((col) => col.code === column.code)}
              onChange={() => handleCheckboxChange(column)}
            />
          }
          label={column.title}
          sx={{ display: 'block', ml: 1 }}
        />
      ))}
      <Divider sx={{ my: 2 }} />

      <Typography variant="body2" fontWeight={500} mb={1}>
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
