"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TextField,
  Button,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
  Grid,
  Stack,
  InputAdornment,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  IconSearch,
  IconListDetails,
  IconShoppingBag,
  IconTruck,
  IconSortAscending,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { formatVndText } from "@/utils/currency";
import AddLaundryOrderModal from "@/app/(DashboardLayout)/apps/laundry-orders/components/AddLaundryOrderModal";
import ModernNotification from '@/app/components/shared/ModernNotification';
import { createLaundryNotification, type NotificationConfig } from '@/app/(DashboardLayout)/apps/laundry-orders/utils/notifications';

interface LaundryOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  totalCost: number;
  status: string;
}

function LaundryOrderList() {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [laundryOrders, setLaundryOrders] = useState<LaundryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneFilter, setPhoneFilter] = useState("");
  const [dateFrom, setDateFrom] = useState(getTodayDate());
  const [dateTo, setDateTo] = useState(getTodayDate());
  const [notification, setNotification] = useState<NotificationConfig>({
    open: false,
    message: '',
    severity: 'info',
  });

  const tabItem = ["All", "Pending", "Processing", "Completed"];

  // Load orders from API
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const statusParam = activeTab !== "All" ? `&status=${activeTab}` : "";
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "";
      const phoneParam = phoneFilter ? `&phoneNumber=${encodeURIComponent(phoneFilter)}` : "";
      const dateFromParam = dateFrom ? `&dateFrom=${dateFrom}` : "";
      const dateToParam = dateTo ? `&dateTo=${dateTo}` : "";
      
      const response = await fetch(`/api/laundry-orders?page=1&pageSize=100${statusParam}${searchParam}${phoneParam}${dateFromParam}${dateToParam}`);
      const result = await response.json();
      
      if (result.success) {
        setLaundryOrders(result.data);
        console.log('✅ Đã tải', result.data.length, 'đơn hàng');
      } else {
        console.error('❌ Lỗi tải đơn hàng:', result.message);
        setLaundryOrders([]);
      }
    } catch (error) {
      console.error('❌ Lỗi kết nối API:', error);
      setLaundryOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load orders when activeTab changes
  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, phoneFilter, dateFrom, dateTo]);

  const handleModalSuccess = () => {
    loadOrders(); // Reload orders after successful creation
  };

  // Status menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const openStatusMenu = Boolean(anchorEl);

  // Edit total cost
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editingTotalCost, setEditingTotalCost] = useState<string>("");

  const handleStatusMenuClick = (event: React.MouseEvent<HTMLElement>, orderId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleStatusMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderId(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrderId) return;

    try {
      const response = await fetch('/api/laundry-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrderId,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Đã cập nhật trạng thái');
        loadOrders(); // Reload orders
        handleStatusMenuClose();
      } else {
        console.error('❌ Lỗi cập nhật trạng thái:', result.message);
        setNotification(createLaundryNotification.error.statusUpdateFailed(result.message));
      }
    } catch (error) {
      console.error('❌ Lỗi kết nối API:', error);
      setNotification(createLaundryNotification.error.statusUpdateFailed());
    }
  };

  const handleEditTotalCost = (orderId: number, currentCost: number) => {
    setEditingOrderId(orderId);
    setEditingTotalCost(currentCost.toString());
  };

  const handleSaveTotalCost = async (orderId: number) => {
    const newCost = parseFloat(editingTotalCost.replace(/[^0-9]/g, ''));
    
    if (isNaN(newCost) || newCost < 0) {
      setNotification(createLaundryNotification.warning.invalidAmount());
      return;
    }

    try {
      const response = await fetch('/api/laundry-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          totalCost: newCost,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Đã cập nhật tổng chi phí');
        loadOrders(); // Reload orders
        setEditingOrderId(null);
        setEditingTotalCost("");
      } else {
        console.error('❌ Lỗi cập nhật tổng chi phí:', result.message);
        setNotification(createLaundryNotification.error.updateFailed(result.message));
      }
    } catch (error) {
      console.error('❌ Lỗi kết nối API:', error);
      setNotification(createLaundryNotification.error.updateFailed());
    }
  };

  const handleCancelEditCost = () => {
    setEditingOrderId(null);
    setEditingTotalCost("");
  };

  const formatCurrencyInput = (value: string) => {
    const number = value.replace(/\D/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(number));
  };

  // Map English status to Vietnamese label
  const statusToVN = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Chờ xử lý';
      case 'Processing':
        return 'Đang xử lý';
      case 'Completed':
        return 'Hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status || '';
    }
  };

  // Filter orders based on status
  const filteredOrders = laundryOrders.filter((order) => {
    const matchesStatus = activeTab === "All" || order.status === activeTab;
    const matchesSearch = searchTerm === "" ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phoneNumber.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Calculate the counts for different statuses
  const Pending = laundryOrders.filter((t) => t.status === "Pending").length;
  const Processing = laundryOrders.filter((t) => t.status === "Processing").length;
  const Completed = laundryOrders.filter((t) => t.status === "Completed").length;

  // Handle status filter change
  const handleClick = (status: string) => {
    setActiveTab(status);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <Box bgcolor="primary.light" p={3} onClick={() => handleClick("All")} sx={{ cursor: "pointer" }}>
            <Stack direction="row" gap={2} alignItems="center">
              <Box
                width={38}
                height={38}
                bgcolor="primary.main"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  color="primary.contrastText"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconListDetails width={22} />
                </Typography>
              </Box>
              <Box>
                <Typography>Tổng</Typography>
                <Typography fontWeight={500}>
                  {laundryOrders.length} Đơn hàng
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Box bgcolor="warning.light" p={3} onClick={() => handleClick("Pending")} sx={{ cursor: "pointer" }}>
            <Stack direction="row" gap={2} alignItems="center">
              <Box
                width={38}
                height={38}
                bgcolor="warning.main"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  color="primary.contrastText"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconSortAscending width={22} />
                </Typography>
              </Box>
              <Box>
                <Typography>Chờ xử lý</Typography>
                <Typography fontWeight={500}>{Pending} Đơn hàng</Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Box bgcolor="secondary.light" p={3} onClick={() => handleClick("Processing")} sx={{ cursor: "pointer" }}>
            <Stack direction="row" gap={2} alignItems="center">
              <Box
                width={38}
                height={38}
                bgcolor="secondary.main"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  color="primary.contrastText"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconShoppingBag width={22} />
                </Typography>
              </Box>
              <Box>
                <Typography>Đang xử lý</Typography>
                <Typography fontWeight={500}>{Processing} Đơn hàng</Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Box bgcolor="success.light" p={3} onClick={() => handleClick("Completed")} sx={{ cursor: "pointer" }}>
            <Stack direction="row" gap={2} alignItems="center">
              <Box
                width={38}
                height={38}
                bgcolor="success.main"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  color="primary.contrastText"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconTruck width={22} />
                </Typography>
              </Box>
              <Box>
                <Typography>Hoàn thành</Typography>
                <Typography fontWeight={500}>{Completed} Đơn hàng</Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* Status Filter */}
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Lọc theo trạng thái
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            label="Tất cả"
            variant={activeTab === 'All' ? 'filled' : 'outlined'}
            color={activeTab === 'All' ? 'primary' : 'default'}
            onClick={() => handleClick('All')}
            sx={{ cursor: 'pointer' }}
          />
          <Chip
            label="Chờ xử lý"
            variant={activeTab === 'Pending' ? 'filled' : 'outlined'}
            color={activeTab === 'Pending' ? 'warning' : 'default'}
            onClick={() => handleClick('Pending')}
            sx={{ cursor: 'pointer' }}
          />
          <Chip
            label="Đang xử lý"
            variant={activeTab === 'Processing' ? 'filled' : 'outlined'}
            color={activeTab === 'Processing' ? 'info' : 'default'}
            onClick={() => handleClick('Processing')}
            sx={{ cursor: 'pointer' }}
          />
          <Chip
            label="Hoàn thành"
            variant={activeTab === 'Completed' ? 'filled' : 'outlined'}
            color={activeTab === 'Completed' ? 'success' : 'default'}
            onClick={() => handleClick('Completed')}
            sx={{ cursor: 'pointer' }}
          />
        </Stack>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {/* General Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Tìm theo tên, số đơn hàng"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconSearch size={"16"} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Phone Number Filter */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Lọc theo SĐT"
              value={phoneFilter}
              onChange={(e: any) => setPhoneFilter(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconSearch size={"16"} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Date From */}
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Từ ngày"
              value={dateFrom}
              onChange={(e: any) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Date To */}
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Đến ngày"
              value={dateTo}
              onChange={(e: any) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Create Button */}
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => setIsModalOpen(true)}
              sx={{ height: '40px' }}
            >
              Tạo mới
            </Button>
          </Grid>
        </Grid>

        {/* Clear Filters Button */}
        {(phoneFilter || dateFrom || dateTo) && (
          <Box sx={{ mt: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setPhoneFilter("");
                setDateFrom("");
                setDateTo("");
              }}
            >
              Xóa bộ lọc
            </Button>
          </Box>
        )}
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto", mt: 3 }}>
          <Table sx={{ whiteSpace: { xs: "nowrap", md: "unset" } }}>
            <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" fontSize="14px">
                  Số đơn hàng
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontSize="14px">
                  Khách hàng
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontSize="14px">
                  Số điện thoại
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontSize="14px">
                  Tổng chi phí
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontSize="14px">
                  Trạng thái
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" fontSize="14px">
                  Thao tác
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Typography variant="h6" fontSize="14px">
                    {order.orderNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" fontSize="14px">
                    {order.customerName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography fontSize="14px">{order.phoneNumber}</Typography>
                </TableCell>
                <TableCell>
                  {editingOrderId === order.id ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <TextField
                        size="small"
                        value={formatCurrencyInput(editingTotalCost)}
                        onChange={(e) => setEditingTotalCost(e.target.value)}
                        placeholder="Nhập số tiền"
                        sx={{ width: '140px' }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveTotalCost(order.id);
                          } else if (e.key === 'Escape') {
                            handleCancelEditCost();
                          }
                        }}
                      />
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleSaveTotalCost(order.id)}
                      >
                        <IconCheck size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={handleCancelEditCost}
                      >
                        <IconX size={18} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={1}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleEditTotalCost(order.id, order.totalCost)}
                    >
                      <Typography fontSize="14px">{formatVndText(order.totalCost)}</Typography>
                      <IconEdit size={14} color="#999" />
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {order.status === "Pending" ? (
                    <Chip
                      color="warning"
                      label={statusToVN(order.status)}
                      size="small"
                    />
                  ) : order.status === "Processing" ? (
                    <Chip
                      color="primary"
                      label={statusToVN(order.status)}
                      size="small"
                    />
                  ) : order.status === "Completed" ? (
                    <Chip
                      color="success"
                      label={statusToVN(order.status)}
                      size="small"
                    />
                  ) : order.status === "Cancelled" ? (
                    <Chip
                      color="error"
                      label={statusToVN(order.status)}
                      size="small"
                    />
                  ) : (
                    ""
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => handleStatusMenuClick(e, order.id)}
                    title="Đổi trạng thái"
                  >
                    <IconEdit size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      )}

      {/* Add Order Modal */}
      <AddLaundryOrderModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Status Change Menu */}
      <Menu
        anchorEl={anchorEl}
        open={openStatusMenu}
        onClose={handleStatusMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('Pending')}>
          <Chip color="warning" label="Chờ xử lý" size="small" sx={{ mr: 1 }} />
          Chờ xử lý
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('Processing')}>
          <Chip color="primary" label="Đang xử lý" size="small" sx={{ mr: 1 }} />
          Đang xử lý
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('Completed')}>
          <Chip color="success" label="Hoàn thành" size="small" sx={{ mr: 1 }} />
          Hoàn thành
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('Cancelled')}>
          <Chip color="error" label="Đã hủy" size="small" sx={{ mr: 1 }} />
          Đã hủy
        </MenuItem>
      </Menu>

      {/* Notification */}
      <ModernNotification
        notification={notification}
        onClose={() => setNotification({ open: false, message: '', severity: 'info' })}
      />
    </Box>
  );
}
export default LaundryOrderList;
