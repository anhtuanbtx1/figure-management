"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TextField,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
  Grid,
  InputAdornment,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  IconSearch,
  IconPhone,
  IconShoppingBag,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { formatVndText } from "@/utils/currency";

interface LaundryCustomer {
  id: number;
  fullName: string;
  phoneNumber: string;
  notes: string | null;
  totalOrders: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function LaundryCustomerList() {
  const [customers, setCustomers] = useState<LaundryCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Load customers from API
  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/laundry-customers/all`);
      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data);
        console.log('✅ Đã tải', result.data.length, 'khách hàng');
      } else {
        console.error('❌ Lỗi tải khách hàng:', result.message);
        setCustomers([]);
      }
    } catch (error) {
      console.error('❌ Lỗi kết nối API:', error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      customer.fullName.toLowerCase().includes(search) ||
      customer.phoneNumber.includes(search) ||
      (customer.notes && customer.notes.toLowerCase().includes(search))
    );
  });

  // Calculate statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.totalOrders > 0).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Box bgcolor="primary.light" p={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                width={38}
                height={38}
                bgcolor="primary.main"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography color="primary.contrastText">
                  <IconPhone width={22} />
                </Typography>
              </Box>
              <Box>
                <Typography>Tổng khách hàng</Typography>
                <Typography fontWeight={500}>{totalCustomers} khách</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box bgcolor="success.light" p={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                width={38}
                height={38}
                bgcolor="success.main"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography color="primary.contrastText">
                  <IconShoppingBag width={22} />
                </Typography>
              </Box>
              <Box>
                <Typography>Khách có đơn hàng</Typography>
                <Typography fontWeight={500}>{activeCustomers} khách</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box bgcolor="warning.light" p={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                width={38}
                height={38}
                bgcolor="warning.main"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography color="primary.contrastText">
                  <IconCurrencyDollar width={22} />
                </Typography>
              </Box>
              <Box>
                <Typography>Tổng doanh thu</Typography>
                <Typography fontWeight={500}>{formatVndText(totalRevenue)}</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Tìm kiếm theo tên, số điện thoại, ghi chú"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconSearch size={"16"} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ whiteSpace: { xs: "nowrap", md: "unset" } }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="h6" fontSize="14px">
                    Tên khách hàng
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" fontSize="14px">
                    Số điện thoại
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6" fontSize="14px">
                    Số đơn hàng
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontSize="14px">
                    Tổng chi tiêu
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" fontSize="14px">
                    Ghi chú
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" py={3}>
                      {searchTerm ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Typography variant="h6" fontSize="14px">
                        {customer.fullName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize="14px">
                        {customer.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {customer.totalOrders > 0 ? (
                        <Chip
                          label={customer.totalOrders}
                          color="primary"
                          size="small"
                        />
                      ) : (
                        <Typography fontSize="14px" color="text.secondary">
                          0
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontSize="14px" fontWeight={customer.totalSpent > 0 ? 600 : 400}>
                        {formatVndText(customer.totalSpent)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize="14px" color="text.secondary">
                        {customer.notes || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
export default LaundryCustomerList;
