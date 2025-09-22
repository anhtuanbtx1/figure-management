
"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Badge,
  Box,
  Stack,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import { format, isValid, parseISO } from "date-fns";
import Link from "next/link";
import { formatVndText } from "@/utils/currency";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import axios from "@/utils/axios";

const InvoiceDetail = () => {
  const [selectedInvoice, setSelectedInvoice]: any = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the invoiceNumber from the URL slug
  const pathName = usePathname();
  const invoiceSlug = pathName.split("/").pop();

  useEffect(() => {
    const loadInvoiceBySlug = async (slug: string) => {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Fetch from the list endpoint with a search query to find the invoice and its ID.
        // This is more robust than relying on a potentially incomplete context.
        const listRes = await axios.get("/api/invoices", {
          params: { search: slug, pageSize: 1 },
        });

        const invoiceFromList = listRes.data?.data?.[0];

        if (!invoiceFromList || !invoiceFromList.Id) {
          throw new Error(`Invoice with number "${slug}" not found.`);
        }

        const invoiceId = invoiceFromList.Id;

        // Step 2: Now that we have the ID, fetch the full header and items concurrently.
        const [headerRes, itemsRes] = await Promise.all([
          axios.get(`/api/invoices/${invoiceId}`),
          axios.get(`/api/invoices/${invoiceId}/items`),
        ]);

        const header = headerRes.data?.data;
        if (!header) {
          throw new Error(`Invoice header with ID ${invoiceId} not found.`);
        }

        const items = itemsRes.data?.data || [];

        // Step 3: Assemble the final invoice object for the UI.
        setSelectedInvoice({
          id: header.Id,
          invoiceNumber: header.InvoiceNumber,
          billFrom: header.BillFrom || "",
          billFromEmail: header.BillFromEmail || "",
          billFromAddress: header.BillFromAddress || "",
          billFromPhone: header.BillFromPhone || "",
          billFromFax: header.BillFromFax || "",
          billTo: header.BillTo || "",
          billToEmail: header.BillToEmail || "",
          billToAddress: header.BillToAddress || "",
          billToPhone: header.BillToPhone || "",
          billToFax: header.BillToFax || "",
          orderDate: header.OrderDate,
          status: header.Status || "Pending",
          totalCost: header.SubTotal ?? 0,
          vat: header.VAT ?? 0,
          grandTotal: header.GrandTotal ?? 0,
          orders: items.map((it: any) => ({
            itemName: it.ItemName,
            unitPrice: it.UnitPrice,
            units: it.Units,
            unitTotalPrice: it.UnitTotalPrice,
          })),
        });
      } catch (e: any) {
        console.error("Failed to load invoice details by slug", e);
        setError(
          e.response?.data?.message || e.message || "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    if (invoiceSlug) {
      loadInvoiceBySlug(invoiceSlug);
    } else {
      setError("No invoice number found in the URL.");
      setLoading(false);
    }
  }, [invoiceSlug]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!selectedInvoice) {
    return <div>No invoice selected or found.</div>;
  }

  const orderDate = selectedInvoice.orderDate
    ? isValid(parseISO(selectedInvoice.orderDate))
      ? format(parseISO(selectedInvoice.orderDate), "dd/MM/yyyy")
      : "Ngày không hợp lệ"
    : format(new Date(), "dd/MM/yyyy");

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Box sx={{
          textAlign: {
            xs: "center",
            sm: "left"
          }
        }}>
          {/* Display InvoiceNumber, which is more user-friendly */}
          <Typography variant="h5"># {selectedInvoice.invoiceNumber}</Typography>
          <Box mt={1}>
            <Chip
              size="small"
              color="secondary"
              variant="outlined"
              label={orderDate}
            ></Chip>
          </Box>
        </Box>

        <Logo />
        <Box textAlign="right">
          {selectedInvoice.status === "Shipped" ? (
            <Chip size="small" color="primary" label="Đã gửi" />
          ) : selectedInvoice.status === "Delivered" ? (
            <Chip size="small" color="success" label="Đã giao" />
          ) : selectedInvoice.status === "Pending" ? (
            <Chip size="small" color="warning" label="Đang chờ" />
          ) : selectedInvoice.status === "Cancelled" ? (
            <Chip size="small" color="error" label="Đã hủy" />
          ) : (
            ""
          )}
        </Box>
      </Stack>
      <Divider></Divider>

      <Grid container spacing={3} mt={2} mb={4}>
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined">
            <Box p={3} display="flex" flexDirection="column" gap="4px">
              <Typography variant="h6" mb={2}>
                Người bán :
              </Typography>
              <Typography variant="body1">
                {selectedInvoice.billFrom}
              </Typography>
              <Typography variant="body1">
                {selectedInvoice.billFromEmail}
              </Typography>
              <Typography variant="body1">
                {selectedInvoice.billFromAddress}
              </Typography>
              <Typography variant="body1">
                {selectedInvoice.billFromPhone}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined">
            <Box p={3} display="flex" flexDirection="column" gap="4px">
              <Typography variant="h6" mb={2}>
                Người mua :
              </Typography>
              <Typography variant="body1">{selectedInvoice.billTo}</Typography>
              <Typography variant="body1">
                {selectedInvoice.billToEmail}
              </Typography>
              <Typography variant="body1">
                {selectedInvoice.billToAddress}
              </Typography>
              <Typography variant="body1">
                {selectedInvoice.billToPhone}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="h6" fontSize="14px">
                    Tên sản phẩm
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" fontSize="14px">
                    Đơn giá
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" fontSize="14px">
                    Số lượng
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontSize="14px">
                    Thành tiền
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedInvoice.orders.map(
                (
                  order: {
                    itemName: string;
                    unitPrice: string;
                    units: number;
                    unitTotalPrice: string;
                  },
                  index: React.Key | null | undefined
                ) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body1">{order.itemName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">{formatVndText(order.unitPrice)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">{order.units}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1">
                        {formatVndText(order.unitTotalPrice)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Box p={3} bgcolor="primary.light" mt={3}>
        <Box display="flex" justifyContent="end" gap={3} mb={3}>
          <Typography variant="body1" fontWeight={600}>
            Tạm tính:
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {formatVndText(selectedInvoice.totalCost)}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="end" gap={3} mb={3}>
          <Typography variant="body1" fontWeight={600}>
            Thuế (VAT):
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {formatVndText(selectedInvoice.vat)}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="end" gap={3}>
          <Typography variant="body1" fontWeight={600}>
            Tổng cộng:
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {formatVndText(selectedInvoice.grandTotal)}
          </Typography>
        </Box>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        mt={3}
        justifyContent="end"
      >
        {/* The edit link should also use the invoiceNumber slug */}
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          href={`/apps/invoice/edit/${selectedInvoice.invoiceNumber}`}
        >
          Chỉnh sửa hóa đơn
        </Button>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          href="/apps/invoice/list"
        >
          Quay lại danh sách hóa đơn
        </Button>
      </Box>
    </>
  );
};

export default InvoiceDetail;
