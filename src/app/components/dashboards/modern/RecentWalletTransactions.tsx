"use client";
import React, { useEffect, useState } from "react";
import DashboardCard from "../../shared/DashboardCard";
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineOppositeContentClasses,
} from "@mui/lab";
import { Box, Chip, CircularProgress, Typography } from "@mui/material";
import WalletService from "@/app/(DashboardLayout)/apps/wallet/services/walletService";
import { WalletTransaction } from "@/types/apps/wallet";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";

const getDotColor = (type?: string):
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "inherit" => {
  switch (type) {
    case "Thu nhập":
      return "success";
    case "Chi tiêu":
      return "error";
    case "Chuyển khoản":
      return "info";
    default:
      return "primary";
  }
};

const RecentWalletTransactions: React.FC = () => {
  const [items, setItems] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch the latest 6 transactions, newest first
        const filters = {
          search: "",
          type: "",
          categoryId: "",
          status: "",
          dateFrom: "",
          dateTo: "",
        } as any;
        const result = await WalletService.fetchTransactions(
          filters,
          1,
          6,
          "TransactionDate",
          "desc"
        );
        if (!mounted) return;
        setItems(result.transactions || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Không thể tải giao dịch gần đây");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DashboardCard title="Giao dịch gần đây">
      <>
        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={22} />
          </Box>
        ) : error ? (
          <Box px={2} py={1}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        ) : items.length === 0 ? (
          <Box px={2} py={1}>
            <Typography color="textSecondary" variant="body2">
              Chưa có giao dịch nào.
            </Typography>
          </Box>
        ) : (
          <Timeline
            className="theme-timeline"
            sx={{
              p: 0,
              mb: "-40px",
              [`& .${timelineOppositeContentClasses.root}`]: {
                flex: 0.5,
                paddingLeft: 0,
              },
            }}
          >
            {items.map((t, idx) => {
              const when = new Date(t.transactionDate || t.createdAt);
              const timeStr = when.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
              const dotColor = getDotColor(t.type);
              const amountPrefix = t.type === "Chi tiêu" ? "-" : "+";
              return (
                <TimelineItem key={t.id || idx}>
                  <TimelineOppositeContent>{timeStr}</TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={dotColor} variant="outlined" />
                    {idx !== items.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body2">
                      {t.type === "Thu nhập" && "Nhận thu nhập: "}
                      {t.type === "Chi tiêu" && "Chi tiêu: "}
                      {t.type === "Chuyển khoản" && "Chuyển khoản: "}
                      <Typography component="span" fontWeight={600}>
                        {t.description}
                      </Typography>{" "}
                      <Typography component="span" color="textSecondary">
                        ({t.categoryName || t.categoryType || "Khác"})
                      </Typography>
                    </Typography>
                    <Box mt={0.5} display="flex" gap={1} alignItems="center">
                      <Typography variant="subtitle2" fontWeight={700}>
                        {amountPrefix}
                        {formatCurrency(t.amount)}
                      </Typography>
                      {t.status && (
                        <Chip
                          size="small"
                          label={t.status}
                          color={t.status === "Hoàn thành" ? "success" : "warning"}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </>
    </DashboardCard>
  );
};

export default RecentWalletTransactions;

