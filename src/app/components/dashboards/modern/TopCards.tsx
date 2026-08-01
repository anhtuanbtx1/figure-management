'use client'
import Image from "next/image";
import React, { useEffect, useState } from 'react';
import { Box, CardContent, Grid, Typography, Tooltip } from "@mui/material";
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

const formatNumber = (n: number) => n.toLocaleString('vi-VN');
const formatVND = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)} triệu VNĐ`;
  }
  return `${formatNumber(amount)} VNĐ`;
};

const TopCards = () => {
  const [toyTotal, setToyTotal] = useState<number | null>(null);
  const [salaryData, setSalaryData] = useState<{
    totalSalary: number;
    monthsWithSalary: number;
  } | null>(null);
  const [toysTotalValue, setToysTotalValue] = useState<number | null>(null);
  const [weeklyTasks, setWeeklyTasks] = useState<{ completed: number, total: number } | null>(null);

  useEffect(() => {
    // Fetch total toys from dedicated endpoint
    const fetchToyTotal = async () => {
      try {
        const res = await fetch('/api/toys/count');
        if (!res.ok) return;
        const data = await res.json();
        const total: number | undefined = data?.total;
        if (typeof total === 'number') setToyTotal(total);
      } catch (e) {
        console.error('Failed to fetch toy total', e);
      }
    };

    // Fetch salary data from wallet API
    const fetchSalaryData = async () => {
      try {
        const res = await fetch('/api/wallet/salary-stats?months=12');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.data) {
          setSalaryData({
            totalSalary: data.data.yearToDate.totalSalary,
            monthsWithSalary: data.data.yearToDate.monthsWithSalary
          });
        }
      } catch (e) {
        console.error('Failed to fetch salary data', e);
      }
    };

    // Fetch toys total value from new API
    const fetchToysTotalValue = async () => {
      try {
        const res = await fetch('/api/toys/total-value');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.data) {
          setToysTotalValue(data.data.totalValue);
        }
      } catch (e) {
        console.error('Failed to fetch toys total value', e);
      }
    };

    // Fetch kanban tasks and calculate weekly completed vs total
    const fetchWeeklyTasks = async () => {
      try {
        const res = await fetch('/api/kanban/tasks?boardId=board-1');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const startOfWeek = dayjs().startOf('isoWeek');
          const endOfWeek = dayjs().endOf('isoWeek');

          let completed = 0;
          let total = 0;

          data.data.forEach((t: any) => {
            // Include tasks that are updated this week or scheduled for this week
            const sDate = t.startDate ? dayjs(t.startDate) : null;
            const eDate = t.endDate ? dayjs(t.endDate) : null;
            const uDate = dayjs(t.updatedAt);

            const isInWeek =
              (sDate && sDate.isAfter(startOfWeek) && sDate.isBefore(endOfWeek)) ||
              (eDate && eDate.isAfter(startOfWeek) && eDate.isBefore(endOfWeek)) ||
              (uDate.isAfter(startOfWeek) && uDate.isBefore(endOfWeek));

            if (isInWeek) {
              total++;
              if (t.columnId === 'col-done') {
                completed++;
              }
            }
          });

          setWeeklyTasks({ completed, total });
        }
      } catch (e) {
        console.error('Failed to fetch weekly tasks', e);
      }
    };

    fetchToyTotal();
    fetchSalaryData();
    fetchToysTotalValue();
    fetchWeeklyTasks();
  }, []);

  const topcards = [
    {
      icon: '/images/svgs/icon-user-male.svg',
      title: "Nhân viên",
      digits: "96",
      bgcolor: "primary",
    },
    {
      icon: '/images/svgs/icon-tasks.svg',
      title: "Task trong tuần",
      digits: weeklyTasks !== null ? `${weeklyTasks.completed}/${weeklyTasks.total}` : '—',
      bgcolor: "warning",
    },
    {
      icon: '/images/svgs/icon-mailbox.svg',
      title: "Dự án",
      digits: "356",
      bgcolor: "secondary",
    },
    // Replaced Events with Toys summary
    {
      icon: '/images/svgs/icon-favorites.svg',
      title: "Tổng đồ chơi",
      digits: toyTotal !== null ? formatNumber(toyTotal) : '—',
      bgcolor: "error",
    },
    {
      icon: '/images/svgs/icon-speech-bubble.svg',
      title: "Bảng lương",
      digits: salaryData !== null 
        ? formatVND(salaryData.totalSalary) 
        : '—',
      bgcolor: "success",
    },
    {
      icon: '/images/svgs/icon-connect.svg',
      title: "Tổng giá trị đồ chơi",
      digits: toysTotalValue !== null ? formatVND(toysTotalValue) : '—',
      bgcolor: "info",
    },
  ];

  return (
    <Grid container spacing={3}>
      {topcards.map((topcard, i) => {
        // Special rendering for weekly tasks card with ratio and tooltip
        if (topcard.title === "Task trong tuần" && weeklyTasks !== null) {
          const startOfWeek = dayjs().startOf('isoWeek');
          const endOfWeek = dayjs().endOf('isoWeek');
          return (
            <Grid item xs={12} sm={4} lg={2} key={i}>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="body2">Tuần hiện tại: {startOfWeek.format('DD/MM')} - {endOfWeek.format('DD/MM')}</Typography>
                    <Typography variant="body2">Đã hoàn thành: {weeklyTasks.completed} nhiệm vụ</Typography>
                    <Typography variant="body2">Tổng số task trong tuần: {weeklyTasks.total} nhiệm vụ</Typography>
                    <Typography variant="body2">Tỷ lệ hoàn thành: {weeklyTasks.total > 0 ? Math.round((weeklyTasks.completed / weeklyTasks.total) * 100) : 0}%</Typography>
                  </Box>
                }
                arrow
                placement="top"
              >
                <Box bgcolor={topcard.bgcolor + ".light"} textAlign="center" sx={{ cursor: 'pointer' }}>
                  <CardContent>
                    <Image src={topcard.icon} alt={"topcard.icon"} width="50" height="50" />
                    <Typography
                      color={topcard.bgcolor + ".main"}
                      mt={1}
                      variant="subtitle1"
                      fontWeight={600}
                    >
                      {topcard.title}
                    </Typography>
                    <Typography
                      color={topcard.bgcolor + ".main"}
                      variant="h4"
                      fontWeight={600}
                    >
                      {topcard.digits}
                    </Typography>
                  </CardContent>
                </Box>
              </Tooltip>
            </Grid>
          );
        }

        // Special rendering for salary card with tooltip
        if (topcard.title === "Bảng lương" && salaryData !== null) {
          return (
            <Grid item xs={12} sm={4} lg={2} key={i}>
              <Tooltip 
                title={
                  <Box>
                    <Typography variant="body2">Tổng lương năm {new Date().getFullYear()}</Typography>
                    <Typography variant="body2">Số tháng có lương: {salaryData.monthsWithSalary} tháng</Typography>
                    <Typography variant="body2">Trung bình: {formatVND(salaryData.totalSalary / salaryData.monthsWithSalary)}/tháng</Typography>
                  </Box>
                }
                arrow
                placement="top"
              >
                <Box bgcolor={topcard.bgcolor + ".light"} textAlign="center" sx={{ cursor: 'pointer' }}>
                  <CardContent>
                    <Image src={topcard.icon} alt={"topcard.icon"} width="50" height="50" />
                    <Typography
                      color={topcard.bgcolor + ".main"}
                      mt={1}
                      variant="subtitle1"
                      fontWeight={600}
                    >
                      {topcard.title}
                    </Typography>
                    <Typography
                      color={topcard.bgcolor + ".main"}
                      variant="h4"
                      fontWeight={600}
                    >
                      {topcard.digits}
                    </Typography>
                  </CardContent>
                </Box>
              </Tooltip>
            </Grid>
          );
        }
        
        // Default rendering for other cards
        return (
          <Grid item xs={12} sm={4} lg={2} key={i}>
            <Box bgcolor={topcard.bgcolor + ".light"} textAlign="center">
              <CardContent>
                <Image src={topcard.icon} alt={"topcard.icon"} width="50" height="50" />
                <Typography
                  color={topcard.bgcolor + ".main"}
                  mt={1}
                  variant="subtitle1"
                  fontWeight={600}
                >
                  {topcard.title}
                </Typography>
                <Typography
                  color={topcard.bgcolor + ".main"}
                  variant="h4"
                  fontWeight={600}
                >
                  {topcard.digits}
                </Typography>
              </CardContent>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default TopCards;


