import * as React from 'react';
import { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Box, TextField } from '@mui/material';

const columns: GridColDef[] = [
    { field: 'id', headerName: 'S.no', width: 70 },
    { field: 'firstName', headerName: 'First name', width: 130 },
    { field: 'lastName', headerName: 'Last name', width: 130 },
    {
        field: 'age',
        headerName: 'Age',
        type: 'number',
        width: 90,
    },
    {
        field: 'fullName',
        headerName: 'Full name',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 160,
        valueGetter: (_value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
    },
];

const originalRows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
    { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
    { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
    { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
    { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
    { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

const paginationModel = { page: 0, pageSize: 5 };

export default function DataTable() {
    const [searchText, setSearchText] = useState(''); 
    const [filteredRows, setFilteredRows] = useState(originalRows);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchText(value);

        const filtered = originalRows.filter((row) => {
            const fullName = `${row.firstName ?? ''} ${row.lastName ?? ''}`.toLowerCase();
            return (
                row.firstName?.toLowerCase().includes(value.toLowerCase()) ||
                row.lastName?.toLowerCase().includes(value.toLowerCase()) ||
                fullName.includes(value.toLowerCase()) ||
                String(row.age ?? '').includes(value)
            );
        });

        setFilteredRows(filtered);
    };

    return (
        <Box sx={{ width: '80%', mt: 5 }}>
            <TextField
                label="Search"
                variant="outlined"
                value={searchText}
                onChange={handleSearch}
                sx={{ mb: 2, width: 300 }}
            />

            <Paper sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    initialState={{ pagination: { paginationModel } }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-columnHeader': {
                            '& .MuiDataGrid-iconButtonContainer': {
                                visibility: 'visible',
                            },
                            '& .MuiDataGrid-sortIcon': {
                                opacity: 1,
                            },
                        },
                    }}
                />

            </Paper>
        </Box>
    );
}
