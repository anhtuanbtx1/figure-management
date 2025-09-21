"use client";
import React, { useState, useContext, useEffect } from "react";
import { InvoiceContext } from "@/app/context/InvoiceContext";
import {
  Alert,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Stack,
  Divider,
  Grid,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { format, isValid } from "date-fns";
import {
  IconPlus,
  IconSquareRoundedPlus,
  IconTrash,
} from "@tabler/icons-react";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "@/app/components/forms/theme-elements/CustomSelect";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import { formatNumberToVn, parseVnToNumber } from "@/utils/currency";

const CreateInvoice = () => {
  const { addInvoice, invoices } = useContext(InvoiceContext);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: 0,
    invoiceNumber: "",
    billFrom: "",
    billTo: "",
    totalCost: 0,
    status: "Đang chờ",
    billFromAddress: "",
    billToAddress: "",
    orders: [{ itemName: "", unitPrice: "", units: "", unitTotalPrice: 0 }],
    vat: 0,
    grandTotal: 0,
    subtotal: 0,
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (invoices.length > 0) {
      const lastId = invoices[0].id; // Get id from the first invoice (newest)
      setFormData((prevData: any) => ({
        ...prevData,
        id: lastId + 1,
      }));
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        id: 1,
      }));
    }
  }, [invoices]);

  const calculateTotals = (orders: any[]) => {
    let subtotal = 0;

    orders.forEach((order) => {
      const unitPrice = parseFloat(String(order.unitPrice).toString().replace(/,/g, '.')) || 0;
      const units = parseInt(order.units) || 0;
      const totalCost = unitPrice * units;

      subtotal += totalCost;
      order.unitTotalPrice = totalCost;
    });

    const vat = 0; // default 0%
    const grandTotal = subtotal + vat;

    return { subtotal, vat, grandTotal };
  };

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newFormData = { ...prevData, [name]: value };
      const totals = calculateTotals(newFormData.orders);
      return {
        ...newFormData,
        ...totals,
      };
    });
  };

  const handleOrderChange = (index: number, field: string, value: string) => {
    setFormData((prevData) => {
      const updatedOrders = [...prevData.orders];
      updatedOrders[index] = {
        ...updatedOrders[index],
        [field]: value,
      };
      const totals = calculateTotals(updatedOrders);
      return {
        ...prevData,
        orders: updatedOrders,
        ...totals,
      };
    });
  };

  const handleAddItem = () => {
    setFormData((prevData) => {
      const updatedOrders = [
        ...prevData.orders,
        { itemName: "", unitPrice: "", units: "", unitTotalPrice: 0 },
      ];
      const totals = calculateTotals(updatedOrders);
      return {
        ...prevData,
        orders: updatedOrders,
        ...totals,
      };
    });
  };

  const handleDeleteItem = (index: number) => {
    setFormData((prevData) => {
      const updatedOrders = prevData.orders.filter((_, i) => i !== index);
      const totals = calculateTotals(updatedOrders);
      return {
        ...prevData,
        orders: updatedOrders,
        ...totals,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addInvoice(formData);
      setFormData({
        id: 0,
        invoiceNumber: "",
        billFrom: "",
        billTo: "",
        totalCost: 0,
        status: "Đang chờ",
        billFromAddress: "",
        billToAddress: "",
        orders: [{ itemName: "", unitPrice: "", units: "", unitTotalPrice: 0 }],
        vat: 0,
        grandTotal: 0,
        subtotal: 0,
        date: new Date().toISOString().split("T")[0],
      });
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      router.push("/apps/invoice/list");
    } catch (error) {
      console.error("Error adding invoice:", error);
    }
  };

  const parsedDate = isValid(new Date(formData.date))
    ? new Date(formData.date)
    : new Date();
  const formattedOrderDate = format(parsedDate, "dd/MM/yyyy");

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Box>
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 2, md: 4 }}
            justifyContent="space-between"
            mb={3}
          >
            <Typography variant="h5"># {formData.id}</Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  router.push("/apps/invoice/list");
                }}
              >
                Hủy bỏ
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Tạo hóa đơn
              </Button>
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
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled
              >
                <MenuItem value="Đang chờ">Đang chờ</MenuItem>
                <MenuItem value="Đã gửi">Đã gửi</MenuItem>
                <MenuItem value="Đã giao">Đã giao</MenuItem>
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
              <CustomFormLabel htmlFor="bill-from">Người bán</CustomFormLabel>
              <CustomTextField
                id="bill-from"
                name="billFrom"
                value={formData.billFrom}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomFormLabel
                htmlFor="bill-to"
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
                name="billTo"
                value={formData.billTo}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomFormLabel
                htmlFor="From Address"
                sx={{
                  mt: 0,
                }}
              >
                Địa chỉ người bán
              </CustomFormLabel>
              <CustomTextField
                name="billFromAddress"
                value={formData.billFromAddress}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomFormLabel
                htmlFor="Bill To Address"
                sx={{
                  mt: 0,
                }}
              >
                Địa chỉ người mua
              </CustomFormLabel>
              <CustomTextField
                name="billToAddress"
                value={formData.billToAddress}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>
          {/* Orders Table */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Chi tiết sản phẩm:</Typography>
            <Button
              onClick={handleAddItem}
              variant="contained"
              color="primary"
              startIcon={<IconPlus width={18} />}
            >
              Thêm sản phẩm
            </Button>
          </Stack>

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
                    <TableCell></TableCell>
                    <TableCell>
                      <Typography variant="h6" fontSize="14px">
                        Thao tác
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.orders.map((order, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <CustomTextField
                          type="text"
                          value={order.itemName}
                          placeholder="Tên sản phẩm"
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
                          placeholder="Đơn giá"
                          onChange={(e: any) => {
                            const val = e.target.value;
                            handleOrderChange(index, "unitPrice", val);
                          }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          type="number"
                          value={order.units}
                          placeholder="Số lượng"
                          onChange={(e: any) => {
                            const val = e.target.value;
                            handleOrderChange(index, "units", val);
                          }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {order.unitTotalPrice.toLocaleString('vi-VN')} VNĐ
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <Tooltip title="Thêm sản phẩm">
                          <IconButton onClick={handleAddItem} color="primary">
                            <IconSquareRoundedPlus width={22} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa sản phẩm">
                          <IconButton
                            onClick={() => handleDeleteItem(index)}
                            color="error"
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

          {/* Totals */}
          <Box p={3} bgcolor="primary.light" mt={3}>
            <Box display="flex" justifyContent="end" gap={3} mb={3}>
              <Typography variant="body1" fontWeight={600}>
                Tạm tính:
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formData.subtotal.toLocaleString('vi-VN')} VNĐ
              </Typography>
            </Box>
            <Box display="flex" justifyContent="end" gap={3} mb={3}>
              <Typography variant="body1" fontWeight={600}>
                Thuế (VAT):
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formData.vat.toLocaleString('vi-VN')} VNĐ
              </Typography>
            </Box>
            <Box display="flex" justifyContent="end" gap={3}>
              <Typography variant="body1" fontWeight={600}>
                Tổng cộng:
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formData.grandTotal.toLocaleString('vi-VN')} VNĐ
              </Typography>
            </Box>
          </Box>

          {showAlert && (
            <Alert
              severity="success"
              sx={{ position: "fixed", top: 16, right: 16 }}
            >
              Hóa đơn đã được tạo thành công.
            </Alert>
          )}
        </Box>
      </form>
    </>
  );
};

export default CreateInvoice;
