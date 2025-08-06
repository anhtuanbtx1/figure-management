"use client";
import React, { useContext, useState, useEffect } from "react";
import { InvoiceContext } from "@/app/context/InvoiceContext/index";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/app/components/shared/PaginationControls";
import {
  Table,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Badge,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
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
  FormControlLabel,
} from "@mui/material";
import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  IconEdit,
  IconEye,
  IconListDetails,
  IconSearch,
  IconShoppingBag,
  IconSortAscending,
  IconTrash,
  IconTruck,
} from "@tabler/icons-react";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import CustomSwitch from "@/app/components/forms/theme-elements/CustomSwitch";

function InvoiceList() {
  const { invoices, deleteInvoice } = useContext(InvoiceContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedProducts, setSelectedProducts] = useState<any>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dense, setDense] = useState(false);

  const tabItem = ["All", "Shipped", "Delivered", "Pending"];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter function for search and status
  const filterInvoices = (invoice: any, searchTerm: string) => {
    const matchesSearch = searchTerm === "" ||
      invoice.billFrom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.billTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toString().includes(searchTerm);

    const matchesStatus = activeTab === "All" || invoice.status === activeTab;

    return matchesSearch && matchesStatus;
  };

  // Get filtered invoices based on current tab
  const getFilteredInvoices = () => {
    if (activeTab === "All") {
      return invoices;
    }
    return invoices.filter((invoice: any) => invoice.status === activeTab);
  };

  const filteredInvoices = getFilteredInvoices();

  // Pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    paginatedData,
    startIndex,
    endIndex,
    setCurrentPage,
    setItemsPerPage,
    canGoNext,
    canGoPrevious
  } = usePagination({
    data: filteredInvoices,
    defaultItemsPerPage: 10,
    searchTerm,
    filterFn: (invoice, search) => {
      return search === "" ||
        invoice.billFrom.toLowerCase().includes(search.toLowerCase()) ||
        invoice.billTo.toLowerCase().includes(search.toLowerCase()) ||
        invoice.id.toString().includes(search);
    }
  });


  // Handle status filter change
  const handleClick = (status: string) => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % tabItem.length);
    setActiveTab(status);
  };

  // Handle dense padding toggle
  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };



  // Use paginated data from the hook
  const displayedInvoices = paginatedData;

  // Check if all items on current page are selected
  const isCurrentPageFullySelected = displayedInvoices.length > 0 &&
    displayedInvoices.every((invoice: { id: any }) => selectedProducts.includes(invoice.id));

  // Update selectAll state based on current page selection
  useEffect(() => {
    setSelectAll(isCurrentPageFullySelected);
  }, [isCurrentPageFullySelected]);



  // Calculate the counts for different statuses
  const Shipped = invoices.filter(
    (t: { status: string }) => t.status === "Shipped"
  ).length;
  const Delivered = invoices.filter(
    (t: { status: string }) => t.status === "Delivered"
  ).length;
  const Pending = invoices.filter(
    (t: { status: string }) => t.status === "Pending"
  ).length;

  // Toggle all checkboxes (only for current page)
  const toggleSelectAll = () => {
    const currentPageIds = displayedInvoices.map((invoice: { id: any }) => invoice.id);

    if (isCurrentPageFullySelected) {
      // Deselect all items on current page
      setSelectedProducts(selectedProducts.filter((id: any) => !currentPageIds.includes(id)));
    } else {
      // Select all items on current page
      const newSelected = [...selectedProducts];
      currentPageIds.forEach((id: any) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedProducts(newSelected);
    }
  };

  // Toggle individual product selection
  const toggleSelectProduct = (productId: any) => {
    const index = selectedProducts.indexOf(productId);
    if (index === -1) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(
        selectedProducts.filter((id: any) => id !== productId)
      );
    }
  };

  // Handle opening delete confirmation dialog
  const handleDelete = () => {
    setOpenDeleteDialog(true);
  };

  // Handle confirming deletion of selected products
  const handleConfirmDelete = async () => {
    for (const productId of selectedProducts) {
      await deleteInvoice(productId);
    }
    setSelectedProducts([]);
    setSelectAll(false);
    setOpenDeleteDialog(false);
  };

  // Handle closing delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3} >
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
                  {invoices.length} Hóa đơn
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Box bgcolor="secondary.light" p={3} onClick={() => handleClick("Shipped")} sx={{ cursor: "pointer" }}>
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
                <Typography>Đang giao hàng</Typography>
                <Typography fontWeight={500}>{Shipped} Hóa đơn
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Box bgcolor="success.light" p={3} onClick={() => handleClick("Delivered")} sx={{ cursor: "pointer" }}>
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
                <Typography>Đã giao hàng</Typography>
                <Typography fontWeight={500}>{Delivered} Hóa đơn</Typography>
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
                <Typography>Chưa giải quyết</Typography>
                <Typography fontWeight={500}>{Pending} Hóa đơn</Typography>
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
            label="Đã giao"
            variant={activeTab === 'Shipped' ? 'filled' : 'outlined'}
            color={activeTab === 'Shipped' ? 'info' : 'default'}
            onClick={() => handleClick('Shipped')}
            sx={{ cursor: 'pointer' }}
          />
          <Chip
            label="Đã hoàn thành"
            variant={activeTab === 'Delivered' ? 'filled' : 'outlined'}
            color={activeTab === 'Delivered' ? 'success' : 'default'}
            onClick={() => handleClick('Delivered')}
            sx={{ cursor: 'pointer' }}
          />
          <Chip
            label="Chưa giải quyết"
            variant={activeTab === 'Pending' ? 'filled' : 'outlined'}
            color={activeTab === 'Pending' ? 'warning' : 'default'}
            onClick={() => handleClick('Pending')}
            sx={{ cursor: 'pointer' }}
          />
        </Stack>
      </Box>

      <Stack
        mt={3}
        justifyContent="space-between"
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 2, md: 4 }}
      >
        <TextField
          id="search"
          type="text"
          size="small"
          variant="outlined"
          placeholder="Search"
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
        <Box display="flex" gap={1}>
          {selectAll && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              startIcon={<IconTrash width={18} />}
            >
              Delete All
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            component={Link}
            href="/apps/invoice/create"
          >
            New Invoice
          </Button>
        </Box>
      </Stack>

      <Box sx={{ overflowX: "auto" }}>
        <Table
          sx={{ whiteSpace: { xs: "nowrap", md: "unset" } }}
          size={dense ? 'small' : 'medium'}
        >
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <CustomCheckbox
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontSize="14px">
                  Id
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontSize="14px">
                  Bill From
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontSize="14px">
                  Bill To
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
            {displayedInvoices.map(
              (invoice: {
                id: any;
                billFrom: any;
                billTo: any;
                totalCost: any;
                status: any;
              }) => (
                <TableRow key={invoice.id}>
                  <TableCell padding="checkbox">
                    <CustomCheckbox
                      checked={selectedProducts.includes(invoice.id)}
                      onChange={() => toggleSelectProduct(invoice.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" fontSize="14px">
                      {invoice.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" fontSize="14px">
                      {invoice.billFrom}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="14px">{invoice.billTo}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="14px">{invoice.totalCost}</Typography>
                  </TableCell>
                  <TableCell>
                    {invoice.status === "Shipped" ? (
                      <Chip
                        color="primary"
                        label={invoice.status}
                        size="small"
                      />
                    ) : invoice.status === "Delivered" ? (
                      <Chip
                        color="success"
                        label={invoice.status}
                        size="small"
                      />
                    ) : invoice.status === "Pending" ? (
                      <Chip
                        color="warning"
                        label={invoice.status}
                        size="small"
                      />
                    ) : (
                      ""
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Invoice">
                      <IconButton
                        color="success"
                        component={Link}
                        href={`/apps/invoice/edit/${invoice.billFrom}`}
                      >
                        <IconEdit width={22} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Invoice">
                      <IconButton
                        color="primary"
                        component={Link}
                        href={`/apps/invoice/detail/${invoice.billFrom}`}
                      >
                        <IconEye width={22} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Invoice">
                      <IconButton
                        color="error"
                        onClick={() => {
                          setSelectedProducts([invoice.id]);
                          handleDelete();
                        }}
                      >
                        <IconTrash width={22} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        itemsPerPageOptions={[5, 10, 25, 50]}
        showItemsPerPageSelector={true}
        showPageInfo={true}
      />

      {/* Dense Padding Toggle */}
      <Box sx={{ mt: 2, ml: 2 }}>
        <FormControlLabel
          control={<CustomSwitch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
      </Box>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete selected invoices?
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCloseDeleteDialog}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="outlined"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box >
  );
}
export default InvoiceList;
