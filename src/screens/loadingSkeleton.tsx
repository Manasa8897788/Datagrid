import React from "react";
import {
  Box,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Skeleton,
  Stack,
} from "@mui/material";

const LoadingState: React.FC = () => {
  return (
    <Stack spacing={4} sx={{ py: 3 }}>
      {/* Header Area */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Skeleton variant="rectangular" height={32} width={192} />
        <Box display="flex" gap={2}>
          <Skeleton
            className="d-md-none d-lg-block"
            variant="rectangular"
            height={40}
            width={256}
          />
          <Skeleton
            className="d-md-none d-lg-block"
            variant="rectangular"
            height={40}
            width={192}
          />
        </Box>
      </Box>

      {/* Table Card */}
      <Card sx={{ boxShadow: "none" }}>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 48 }}>
                  <Skeleton variant="circular" width={16} height={16} />
                </TableCell>
                {/* Render first 4 column headers */}
                {Array.from({ length: 4 }).map((_, index) => (
                  <TableCell key={index}>
                    <Skeleton variant="text" width={96} height={30} />
                  </TableCell>
                ))}
                <TableCell>
                  <Skeleton variant="text" width={128} height={30} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell>
                    <Skeleton variant="circular" width={16} height={16} />
                  </TableCell>
                  {Array.from({ length: 4 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton variant="text" width={256} height={20} />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default LoadingState;
