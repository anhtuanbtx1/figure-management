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
import { IconSquareRoundedPlus, IconTrash, IconArrowLeft } from "@tabler/icons-react";
import { formatNumberToVn, parseVnToNumber } from "@/utils/currency";
import axios from "@/utils/axios";
import ModernNotification from "@/app/components/shared/ModernNotification";

const EditInvoicePage = () => {
  const { invoices, updateInvoice } = useContext(InvoiceContext);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ open: false, message: '', severity: 'success' });
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
    const fetchInvoice = async (id: string) => {
      try {
        // Get header
        const headerRes = await axios.get(`/api/invoices/${id}`);
        const header = headerRes.data?.data;
        // Get items
        const itemsRes = await axios.get(`/api/invoices/${id}/items`);
        const items = itemsRes.data?.data || [];

        // Recalculate totals from items to ensure consistency
        const subTotalCalc = items.reduce((sum: number, it: any) => {
          const unitTotal = Number((it.UnitTotalPrice ?? (Number(it.UnitPrice) * Number(it.Units))) ?? 0);
          return sum + unitTotal;
        }, 0);
        const vatCalc = 0; // default 0%
        const grandTotalCalc = subTotalCalc + vatCalc;

        const mapped = {
          id: header?.Id,
          billFrom: header?.BillFrom || '',
          billFromEmail: header?.BillFromEmail || '',
          billFromAddress: header?.BillFromAddress || '',
          billFromPhone: header?.BillFromPhone || 0,
          billFromFax: header?.BillFromFax || 0,
          billTo: header?.BillTo || '',
          billToEmail: header?.BillToEmail || '',
          billToAddress: header?.BillToAddress || '',
          billToPhone: header?.BillToPhone || 0,
          billToFax: header?.BillToFax || 0,
          orders: items.map((it: any) => ({
            itemId: it.Id,
            itemName: it.ItemName,
            unitPrice: it.UnitPrice,
            units: it.Units,
            unitTotalPrice: it.UnitTotalPrice,
          })),
          orderDate: header?.OrderDate ? new Date(header.OrderDate) : new Date(),
          totalCost: subTotalCalc,
          vat: vatCalc,
          grandTotal: grandTotalCalc,
          status: translateStatusToVietnamese(header?.Status || 'Pending'),
          completed: header?.Status === 'Delivered',
          isSelected: false,
        };

        setSelectedInvoice(mapped);
        setEditedInvoice(mapped);
        setEditing(true);
      } catch (e) {
        console.error('Failed to load invoice detail', e);
      }
    };

    if (invoices.length > 0) {
      // Prefer match by id from URL; fallback to first
      const idFromUrl = getTitle;
      const id = idFromUrl || invoices[0]?.id;
      if (id) fetchInvoice(String(id));
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

      // Compute diffs for items (adds/updates/deletes)
      // Assume selectedInvoice.orders holds original items with optional itemId
      const originalItems = (selectedInvoice.orders || []).map((it: any) => ({
        itemId: it.id || it.ItemId || it.itemId,
        itemName: it.itemName,
        unitPrice: it.unitPrice,
        units: it.units,
      }));
      const currentItems = (editedInvoice.orders || []).map((it: any) => ({
        itemId: it.id || it.itemId,
        itemName: it.itemName,
        unitPrice: it.unitPrice,
        units: it.units,
      }));

      const origMap = new Map(originalItems.filter((x:any)=>x.itemId).map((x:any)=>[x.itemId, x]));
      const currMap = new Map(currentItems.filter((x:any)=>x.itemId).map((x:any)=>[x.itemId, x]));

      const updates: any[] = [];
      currMap.forEach((curr: any, id: any) => {
        const orig = origMap.get(id);
        if (orig && (orig.itemName !== curr.itemName || Number(orig.unitPrice) !== Number(curr.unitPrice) || Number(orig.units) !== Number(curr.units))) {
          updates.push({ itemId: id, itemName: curr.itemName, unitPrice: Number(curr.unitPrice)||0, units: Number(curr.units)||0 });
        }
      });

      const deletes: any[] = [];
      origMap.forEach((_orig: any, id: any) => {
        if (!currMap.has(id)) {
          deletes.push(id);
        }
      });

      const adds: any[] = [];
      for (const curr of currentItems) {
        if (!curr.itemId) {
          adds.push({ itemName: curr.itemName, unitPrice: Number(curr.unitPrice)||0, units: Number(curr.units)||0 });
        }
      }

      // Call batch API for items first
      await axios.post(`/api/invoices/${editedInvoice.id}/items/batch`, { adds, updates, deletes });

      // Then update header (status, etc.)
      await updateInvoice(invoiceToSave);

      setSelectedInvoice({ ...invoiceToSave });
      setEditing(false); // Exit editing mode
      setNotification({ open: true, message: '✅ Đã lưu sản phẩm và hóa đơn thành công', severity: 'success' });

      // Navigate to the list page
      router.push("/apps/invoice/list");
    } catch (error) {
      console.error("Error updating invoice:", error);
    }

    setTimeout(() => {
      setNotification((prev) => ({ ...prev, open: false }));
    }, 4500);
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

  const calculateVAT = (_orders: any[]) => {
    return 0; // default 0%
  };

  const calculateGrandTotal = (totalCost: number, vat: number) => {
    return totalCost + vat;
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
        <Box display="flex" alignItems="center" gap={1}>
          <Button variant="text" startIcon={<IconArrowLeft />} onClick={() => router.push('/apps/invoice/list')}>
            Quay lại
          </Button>
          <Typography variant="h5"># {editedInvoice.id}</Typography>
        </Box>
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
            {formatNumberToVn(editedInvoice.totalCost)} VNĐ
          </Typography>
        </Box>
        <Box display="flex" justifyContent="end" gap={3} mb={3}>
          <Typography variant="body1" fontWeight={600}>
            Thuế (VAT):
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {formatNumberToVn(editedInvoice.vat)} VNĐ
          </Typography>
        </Box>
        <Box display="flex" justifyContent="end" gap={3}>
          <Typography variant="body1" fontWeight={600}>
            Tổng cộng:
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {formatNumberToVn(editedInvoice.grandTotal)} VNĐ
          </Typography>
        </Box>
      </Box>

      <ModernNotification
        notification={notification}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default EditInvoicePage;
