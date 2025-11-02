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
  const { updateInvoice } = useContext(InvoiceContext);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ open: false, message: '', severity: 'success' });
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editedInvoice, setEditedInvoice]: any = useState(null);
  const [originalOrders, setOriginalOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper functions for status translation
  const translateStatusToVietnamese = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Pending': 'Đang chờ',
      'Delivered': 'Đã giao',
      'Shipped': 'Đang giao'
    };
    return statusMap[status] || status;
  };

  const translateStatusToEnglish = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Đang chờ': 'Pending',
      'Đã giao': 'Delivered',
      'Đang giao': 'Shipped'
    };
    return statusMap[status] || status;
  };

  const pathName = usePathname();
  const router = useRouter();
  const invoiceId = pathName.split("/").pop();

  useEffect(() => {
    const fetchInvoice = async (id: string) => {
      if (!id || !/^\d+$/.test(id)) {
        setError(`ID hóa đơn không hợp lệ: "${id}"`);
        return;
      }
      
      setError(null);
      try {
        // Get header
        const headerRes = await axios.get(`/api/invoices/${id}`);
        const header = headerRes.data?.data;
        if (!header) {
          throw new Error(`Không tìm thấy hóa đơn với ID ${id}.`);
        }

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

        const mappedOrders = items.map((it: any) => ({
          itemId: it.Id,
          itemName: it.ItemName,
          unitPrice: it.UnitPrice,
          units: it.Units,
          unitTotalPrice: it.UnitTotalPrice,
        }));

        const mapped = {
          id: header?.Id,
          invoiceNumber: header?.InvoiceNumber || '',
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
          orders: mappedOrders,
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
        setOriginalOrders(JSON.parse(JSON.stringify(mappedOrders))); // Deep copy for reliable comparison
        setEditing(true);
      } catch (e: any) {
        console.error('Failed to load invoice detail', e);
        setError(e.message || 'Lỗi không xác định khi tải hóa đơn.');
      }
    };

    if (invoiceId) {
      fetchInvoice(invoiceId);
    } else {
      setError("Không tìm thấy ID hóa đơn trong URL.");
    }
  }, [invoiceId]);


  const handleSave = async () => {
    try {
      // Convert status back to English before saving
      const invoiceToSave = {
        ...editedInvoice,
        status: translateStatusToEnglish(editedInvoice.status)
      };

      // Compute diffs for items (adds/updates/deletes)
      const currentItems = editedInvoice.orders || [];

      const origMap = new Map(originalOrders.map((it: any) => [it.itemId, it]));
      const currMap = new Map(currentItems.filter((it: any) => it.itemId).map((it: any) => [it.itemId, it]));

      const updates: any[] = [];
      currMap.forEach((curr: any, id: any) => {
        const orig = origMap.get(id);
        if (orig && (orig.itemName !== curr.itemName || Number(orig.unitPrice) !== Number(curr.unitPrice) || Number(orig.units) !== Number(curr.units))) {
          updates.push({ 
            itemId: id, 
            itemName: curr.itemName, 
            unitPrice: Number(curr.unitPrice) || 0, 
            units: Number(curr.units) || 0 
          });
        }
      });

      const deletes: any[] = [];
      origMap.forEach((_orig: any, id: any) => {
        if (!currMap.has(id)) {
          deletes.push(id);
        }
      });
      
      const adds = currentItems.filter((it: any) => !it.itemId).map((it: any) => ({
        itemName: it.itemName,
        unitPrice: Number(it.unitPrice) || 0,
        units: Number(it.units) || 0,
      }));

      // Call batch API for items first
      if (adds.length > 0 || updates.length > 0 || deletes.length > 0) {
        await axios.post(`/api/invoices/${editedInvoice.id}/items/batch`, { adds, updates, deletes });
      }

      // Then update header (status, etc.)
      await updateInvoice(invoiceToSave);

      setSelectedInvoice({ ...invoiceToSave });
      setEditing(false); // Exit editing mode
      setNotification({ open: true, message: '✅ Đã lưu sản phẩm và hóa đơn thành công', severity: 'success' });

      // Navigate to the list page
      router.push("/apps/invoice/list");
    } catch (error) {
      console.error("Error updating invoice:", error);
       setNotification({ open: true, message: '❌ Lưu thất bại. Vui lòng thử lại.', severity: 'error' });
    }

    setTimeout(() => {
      setNotification((prev) => ({ ...prev, open: false }));
    }, 4500);
  };

  const handleCancel = () => {
    setEditedInvoice(JSON.parse(JSON.stringify(selectedInvoice))); // Restore original state on cancel
    setEditing(false);
  };

  const handleOrderChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedOrders = [...editedInvoice.orders];
    const orderToUpdate = { ...updatedOrders[index], [field]: value };
    
    // Recalculate unitTotalPrice for the changed item
    if (field === "unitPrice" || field === "units") {
      orderToUpdate.unitTotalPrice = (Number(orderToUpdate.unitPrice) || 0) * (Number(orderToUpdate.units) || 0);
    }
    updatedOrders[index] = orderToUpdate;

    // Update editedInvoice with updated orders and recalculate totals
    const totalCost = calculateTotalCost(updatedOrders);
    const vat = calculateVAT(updatedOrders);
    const grandTotal = calculateGrandTotal(totalCost, vat);

    setEditedInvoice({
      ...editedInvoice,
      orders: updatedOrders,
      totalCost,
      vat,
      grandTotal,
    });
  };

  const handleAddItem = () => {
    const newItem = {
      itemName: "",
      unitPrice: 0,
      units: 0,
      unitTotalPrice: 0,
    };
    const updatedOrders = [...editedInvoice.orders, newItem];
    setEditedInvoice({ ...editedInvoice, orders: updatedOrders });
  };

  const handleDeleteItem = (index: any) => {
    const updatedOrders = editedInvoice.orders.filter(
      (_: any, i: any) => i !== index
    );

    const totalCost = calculateTotalCost(updatedOrders);
    const vat = calculateVAT(updatedOrders);
    const grandTotal = calculateGrandTotal(totalCost, vat);

    setEditedInvoice({
      ...editedInvoice,
      orders: updatedOrders,
      totalCost,
      vat,
      grandTotal,
    });
  };

  const calculateTotalCost = (orders: any[]) => {
    return orders.reduce((total, order) => total + (Number(order.unitTotalPrice) || 0), 0);
  };

  const calculateVAT = (_orders: any[]) => {
    return 0; // default 0%
  };

  const calculateGrandTotal = (totalCost: number, vat: number) => {
    return totalCost + vat;
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!selectedInvoice || !editedInvoice) {
    return <div>Đang tải dữ liệu hóa đơn...</div>;
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
          <Typography variant="h5"># {editedInvoice.invoiceNumber}</Typography>
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
            <MenuItem value="Đang giao">Đang giao</MenuItem>
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
                <TableRow key={order.itemId || `new-${index}`}>
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
                      type="text"
                      value={formatNumberToVn(order.unitPrice)}
                      onChange={(e: any) =>
                        handleOrderChange(
                          index,
                          "unitPrice",
                          parseVnToNumber(e.target.value)
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
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">
                      {formatNumberToVn(order.unitTotalPrice)} VNĐ
                    </Typography>
                  </TableCell>
                  <TableCell>
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
        <Box p={2} textAlign="right">
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddItem}
            startIcon={<IconSquareRoundedPlus width={18} />}
          >
            Thêm sản phẩm
          </Button>
        </Box>
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
