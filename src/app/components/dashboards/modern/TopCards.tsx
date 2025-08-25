'use client'
import Image from "next/image";
import React, { useEffect, useState } from 'react';
import { Box, CardContent, Grid, Typography, Tooltip } from "@mui/material";

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
    
    fetchToyTotal();
    fetchSalaryData();
  }, []);

  const topcards = [
    {
      icon: '/images/svgs/icon-user-male.svg',
      title: "Nhân viên",
      digits: "96",
      bgcolor: "primary",
    },
    {
      icon: '/images/svgs/icon-briefcase.svg',
      title: "Khách hàng",
      digits: "3,650",
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
      title: "Báo cáo",
      digits: "59",
      bgcolor: "info",
    },
  ];

  return (
    <Grid container spacing={3}>
      {topcards.map((topcard, i) => {
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


