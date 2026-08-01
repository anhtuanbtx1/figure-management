"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";
import Link from "next/link";
import {
  Box,
  CardContent,
  Grid,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  CircularProgress,
  Stack,
} from "@mui/material";
import { IconSearch, IconFileAnalytics, IconArrowLeft } from "@tabler/icons-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const BCrumb = [
  { to: "/", title: "Trang chủ" },
  { to: "/apps/kanban", title: "Kanban Workspace" },
  { title: "Báo cáo Kanban" },
];

export default function KanbanReportsPage() {
  const theme = useTheme();
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // API /api/kanban/tasks fetches ALL tasks. We'll filter them on client side.
      const res = await fetch("/api/kanban/tasks?boardId=board-1");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTasks(data.data);
          applyFilter(data.data, startDate, endDate, statusFilter);
        }
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (
    dataToFilter: any[],
    start: string,
    end: string,
    status: string
  ) => {
    let result = dataToFilter;

    // Filter by date (check createdAt, updatedAt or startDate/endDate)
    // Here we consider a task in range if its update activity or creation is in range
    if (start && end) {
      const s = dayjs(start).startOf("day");
      const e = dayjs(end).endOf("day");

      result = result.filter((t) => {
        const tDate = t.updatedAt ? dayjs(t.updatedAt) : dayjs(t.createdAt);
        const stDate = t.startDate ? dayjs(t.startDate) : null;

        // If task has specific start date, use that, otherwise use its update date
        return (tDate.isValid() && tDate.isBetween(s, e, null, '[]')) ||
               (stDate && stDate.isValid() && stDate.isBetween(s, e, null, '[]'));
      });
    }

    // Filter by status (columnId)
    if (status !== "ALL") {
      result = result.filter((t) => t.columnId === status);
    }

    setFilteredTasks(result);
  };

  const handleSearch = () => {
    applyFilter(tasks, startDate, endDate, statusFilter);
  };

  // Calculate metrics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.columnId === "col-done").length;
  const inProgressTasks = filteredTasks.filter((t) => t.columnId === "col-progress").length;
  const pendingTasks = filteredTasks.filter((t) => t.columnId === "col-pending").length;

  const getStatusChip = (columnId: string) => {
    switch (columnId) {
      case "col-todo":
        return <Chip label="Cần làm" size="small" color="default" />;
      case "col-progress":
        return <Chip label="Đang thực hiện" size="small" color="primary" />;
      case "col-pending":
        return <Chip label="Chờ xử lý" size="small" color="warning" />;
      case "col-done":
        return <Chip label="Hoàn thành" size="small" color="success" />;
      default:
        return <Chip label="Không rõ" size="small" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Khẩn cấp": return "error.main";
      case "Cao": return "warning.main";
      case "Trung bình": return "info.main";
      case "Thấp": return "success.main";
      default: return "text.secondary";
    }
  };

  return (
    <PageContainer title="Báo cáo Kanban" description="Báo cáo công việc theo thời gian">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Breadcrumb title="BÁO CÁO KANBAN" items={BCrumb} />
        <Button
          component={Link}
          href="/apps/kanban"
          variant="outlined"
          color="primary"
          startIcon={<IconArrowLeft size={18} />}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
        >
          Quay lại Kanban
        </Button>
      </Box>

      {/* FILTER SECTION */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Từ ngày"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Đến ngày"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Trạng thái"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="col-todo">Cần làm</MenuItem>
              <MenuItem value="col-progress">Đang thực hiện</MenuItem>
              <MenuItem value="col-pending">Chờ xử lý</MenuItem>
              <MenuItem value="col-done">Hoàn thành</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<IconSearch />}
              onClick={handleSearch}
              sx={{ height: '53px' }}
            >
              Tìm kiếm
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* METRICS SECTION */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" color="textSecondary">Tổng cộng</Typography>
            <Typography variant="h3" fontWeight={700} color="primary.main">{totalTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" color="textSecondary">Đang làm</Typography>
            <Typography variant="h3" fontWeight={700} color="info.main">{inProgressTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" color="textSecondary">Chờ xử lý</Typography>
            <Typography variant="h3" fontWeight={700} color="warning.main">{pendingTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" color="textSecondary">Hoàn thành</Typography>
            <Typography variant="h3" fontWeight={700} color="success.main">{completedTasks}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* DATA TABLE SECTION */}
      <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <IconFileAnalytics size={20} />
          <Typography variant="h6">Chi tiết công việc</Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Tiêu đề</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Người phụ trách</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Mức ưu tiên</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Ngày tạo / Cập nhật</Typography></TableCell>
                    <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Trạng thái</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography color="textSecondary">Không tìm thấy công việc nào thỏa mãn điều kiện</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id} hover>
                        <TableCell>
                          <Typography variant="body1" fontWeight={500} sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {task.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {task.assignee ? (
                            <Typography variant="body2">{task.assignee}</Typography>
                          ) : (
                            <Typography variant="body2" color="textSecondary">Chưa phân công</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: getPriorityColor(task.priority), fontWeight: 600 }}>
                            {task.priority || "Trung bình"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {dayjs(task.updatedAt || task.createdAt).format("DD/MM/YYYY HH:mm")}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {getStatusChip(task.columnId)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Paper>
    </PageContainer>
  );
}
