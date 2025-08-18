"use client";
import React, { useContext, useState, useEffect } from "react";
import { InvoiceContext } from "@/app/context/InvoiceContext/index";
import { usePathname, useRouter } from "next/navigation";
import {
  Button,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  IconButton,
  Tooltip,
  Box,
  Stack,
  Divider,
  Grid,
} from "@mui/material";
import { format, isValid } from "date-fns";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "@/app/components/forms/theme-elements/CustomSelect";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import { IconSquareRoundedPlus, IconTrash } from "@tabler/icons-react";

const EditInvoicePage = () => {
  const { invoices, updateInvoice } = useContext(InvoiceContext);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editedInvoice, setEditedInvoice]: any = useState(null);

  // Helper functions for status translation
  const translateStatusToVietnamese = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Pending': 'Đang chờ',
      'Delivered': 'Đã giao',
      'Shipped': 'Đã gửi'
    };
    return statusMap[status] || status;
  };

  const translateStatusToEnglish = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Đang chờ': 'Pending',
      'Đã giao': 'Delivered',
      'Đã gửi': 'Shipped'
    };
    return statusMap[status] || status;
  };

  const pathName = usePathname();
  const getTitle = pathName.split("/").pop();

  useEffect(() => {
    if (invoices.length > 0) {
      // If there's a specific item to edit, use it
      if (getTitle) {
        const invoice = invoices.find(
          (inv: { billFrom: string }) => inv.billFrom === getTitle
        );
        if (invoice) {
          setSelectedInvoice(invoice);
          setEditedInvoice({
            ...invoice,
            status: translateStatusToVietnamese(invoice.status)
          });
          setEditing(true);
        } else {
          // If specific item not found, fallback to default
          setSelectedInvoice(invoices[0]);
          setEditedInvoice({
            ...invoices[0],
            status: translateStatusToVietnamese(invoices[0].status)
          });
          setEditing(true);
        }
      } else {
        // No specific item, default to the first invoice
        setSelectedInvoice(invoices[0]);
        setEditedInvoice({
          ...invoices[0],
          status: translateStatusToVietnamese(invoices[0].status)
        });
        setEditing(true);
      }
    }
  }, [getTitle, invoices]);

  const router = useRouter();

  const handleSave = async () => {
    try {
      // Convert status back to English before saving
      const invoiceToSave = {
        ...editedInvoice,
        status: translateStatusToEnglish(editedInvoice.status)
      };
      await updateInvoice(invoiceToSave);
      setSelectedInvoice({ ...invoiceToSave });
      setEditing(false); // Exit editing mode
      setShowAlert(true);

      // Navigate to the list page
      router.push("/apps/invoice/list");
    } catch (error) {
      console.error("Error updating invoice:", error);
    }

    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleOrderChange = (
    index: string | number | any,
    field: string,
    value: string | number
  ) => {
    const updatedOrders = [...editedInvoice.orders];
    updatedOrders[index][field] = value;

    // Calculate unitTotalPrice for the changed item
    if (field === "unitPrice" || field === "units") {
      updatedOrders[index].unitTotalPrice =
        updatedOrders[index].unitPrice * updatedOrders[index].units;
    }

    // Update editedInvoice with updated orders and recalculate totals
    const updatedInvoice = {
      ...editedInvoice,
      orders: updatedOrders,
      totalCost: calculateTotalCost(updatedOrders),
      vat: calculateVAT(updatedOrders),
      grandTotal: calculateGrandTotal(
        calculateTotalCost(updatedOrders),
        calculateVAT(updatedOrders)
      ),
    };

    setEditedInvoice(updatedInvoice);
  };

  const handleAddItem = () => {
    const newItem = {
      itemName: "",
      unitPrice: 0,
      units: 0,
      unitTotalPrice: 0,
      vat: 0,
    };
    const updatedOrders = [...editedInvoice.orders, newItem];

    // Update editedInvoice with updated orders and recalculate totals
    const updatedInvoice = {
      ...editedInvoice,
      orders: updatedOrders,
      totalCost: calculateTotalCost(updatedOrders),
      vat: calculateVAT(updatedOrders),
      grandTotal: calculateGrandTotal(
        calculateTotalCost(updatedOrders),
        calculateVAT(updatedOrders)
      ),
    };
    setEditedInvoice(updatedInvoice);
  };

  const handleDeleteItem = (index: any) => {
    const updatedOrders = editedInvoice.orders.filter(
      (_: any, i: any) => i !== index
    );

    const updatedInvoice = {
      ...editedInvoice,
      orders: updatedOrders,
      totalCost: calculateTotalCost(updatedOrders),
      vat: calculateVAT(updatedOrders),
      grandTotal: calculateGrandTotal(
        calculateTotalCost(updatedOrders),
        calculateVAT(updatedOrders)
      ),
    };
    setEditedInvoice(updatedInvoice);
  };

  const calculateTotalCost = (orders: any[]) => {
    return orders.reduce((total, order) => total + order.unitTotalPrice, 0);
  };

  const calculateVAT = (orders: any[]) => {
    return orders.reduce((totalVAT, order) => totalVAT + order.units, 0);
  };

  const calculateGrandTotal = (totalCost: number, vat: number) => {
    return (totalCost += (totalCost * vat) / 100);
  };

  if (!selectedInvoice) {
    return <div>Vui lòng chọn một hóa đơn.</div>;
  }

  const orderDate = selectedInvoice.orderDate;
  const parsedDate = isValid(new Date(orderDate))
    ? new Date(orderDate)
    : new Date();
  const formattedOrderDate = format(parsedDate, "dd/MM/yyyy");

  return (
    <Box>
      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 2, md: 4 }}
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5"># {editedInvoice.id}</Typography>
        <Box display="flex" gap={1}>
          {editing ? (
            <>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Lưu
              </Button>
              <Button variant="outlined" color="error" onClick={handleCancel}>
                Hủy bỏ
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="info"
              onClick={() => setEditing(true)}
            >
              Chỉnh sửa hóa đơn
            </Button>
          )}
        </Box>
      </Stack>
      <Divider></Divider>

      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 2, md: 4 }}
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <CustomFormLabel htmlFor="demo-simple-select">
            Trạng thái đơn hàng
          </CustomFormLabel>
          <CustomSelect
            value={editedInvoice.status}
            onChange={(e: any) =>
              setEditedInvoice({ ...editedInvoice, status: e.target.value })
            }
          >
            <MenuItem value="Đang chờ">Đang chờ</MenuItem>
            <MenuItem value="Đã giao">Đã giao</MenuItem>
            <MenuItem value="Đã gửi">Đã gửi</MenuItem>
          </CustomSelect>
        </Box>
        <Box textAlign="right">
          <CustomFormLabel htmlFor="demo-simple-select">
            Ngày đặt hàng
          </CustomFormLabel>
          <Typography variant="body1"> {formattedOrderDate}</Typography>
        </Box>
      </Stack>
      <Divider></Divider>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6}>
          <CustomFormLabel>Người bán</CustomFormLabel>
          <CustomTextField
            value={editedInvoice.billFrom}
            onChange={(e: any) =>
              setEditedInvoice({ ...editedInvoice, billFrom: e.target.value })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomFormLabel
            sx={{
              mt: {
                xs: 0,
                sm: 3,
              },
            }}
          >
            Người mua
          </CustomFormLabel>
          <CustomTextField
            value={editedInvoice.billTo}
            onChange={(e: any) =>
              setEditedInvoice({ ...editedInvoice, billTo: e.target.value })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomFormLabel
            sx={{
              mt: 0,
            }}
          >
            Địa chỉ người bán
          </CustomFormLabel>
          <CustomTextField
            value={editedInvoice.billFromAddress}
            onChange={(e: any) =>
              setEditedInvoice({
                ...editedInvoice,
                billFromAddress: e.target.value,
              })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomFormLabel
            sx={{
              mt: 0,
            }}
          >
            Địa chỉ người mua
          </CustomFormLabel>
          <CustomTextField
            value={editedInvoice.billToAddress}
            onChange={(e: any) =>
              setEditedInvoice({
                ...editedInvoice,
                billToAddress: e.target.value,
              })
            }
            fullWidth
          />
        </Grid>
      </Grid>

      <Paper variant="outlined">
        <TableContainer sx={{ whiteSpace: { xs: "nowrap", md: "unset" } }}>
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
                <TableCell>
                  <Typography variant="h6" fontSize="14px">
                    Thành tiền
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" fontSize="14px">
                    Thao tác
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {editedInvoice.orders.map((order: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <CustomTextField
                      type="text"
                      value={order.itemName}
                      onChange={(e: any) =>
                        handleOrderChange(index, "itemName", e.target.value)
                      }
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      type="number"
                      value={order.unitPrice}
                      onChange={(e: any) =>
                        handleOrderChange(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value)
                        )
                      }
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      type="number"
                      value={order.units}
                      onChange={(e: any) =>
                        handleOrderChange(
                          index,
                          "units",
                          parseInt(e.target.value)
                        )
                      }
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">
                      {order.unitTotalPrice.toLocaleString('vi-VN')} VNĐ
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Thêm sản phẩm">
                      <IconButton onClick={handleAddItem} color="primary">
                        <IconSquareRoundedPlus width={22} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa sản phẩm">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteItem(index)}
                      >
                        <IconTrash width={22} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
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
            {editedInvoice.totalCost.toLocaleString('vi-VN')} VNĐ
          </Typography>
        </Box>
        <Box display="flex" justifyContent="end" gap={3} mb={3}>
          <Typography variant="body1" fontWeight={600}>
            VAT (10%):
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {editedInvoice.vat.toLocaleString('vi-VN')} VNĐ
          </Typography>
        </Box>
        <Box display="flex" justifyContent="end" gap={3}>
          <Typography variant="body1" fontWeight={600}>
            Tổng cộng:
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {editedInvoice.grandTotal.toLocaleString('vi-VN')} VNĐ
          </Typography>
        </Box>
      </Box>

      {showAlert && (
        <Alert
          severity="success"
          sx={{ position: "fixed", top: 16, right: 16 }}
        >
          Dữ liệu hóa đơn đã được cập nhật thành công.
        </Alert>
      )}
    </Box>
  );
};

export default EditInvoicePage;
