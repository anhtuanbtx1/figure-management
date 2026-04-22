"use client";

import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconCheck,
  IconDatabase,
  IconEye,
  IconFileDescription,
  IconKey,
  IconUpload,
} from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import PayrollService, {
  PayrollImportRow,
} from "@/app/(DashboardLayout)/apps/payroll/services/payrollService";

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount);
};

const PayrollImportForm = () => {
  const theme = useTheme();
  const router = useRouter();
  const [excelPassword, setExcelPassword] = useState("");
  const [payrollPeriod, setPayrollPeriod] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [inspectionMessage, setInspectionMessage] = useState("");
  const [importRows, setImportRows] = useState<PayrollImportRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [previewReady, setPreviewReady] = useState(false);
  const [confirmNotice, setConfirmNotice] = useState("");
  const [isSavedToDatabase, setIsSavedToDatabase] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    setSelectedFile(acceptedFiles[0] ?? null);
    setPreviewReady(false);
    setIsSavedToDatabase(false);
    setImportRows([]);
    setTotalRows(0);
    setTotalSalary(0);
    setSuccessMessage("");
    setErrorMessage("");
    setInspectionMessage("");
    setConfirmNotice("");
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
  });

  const canPreview = useMemo(() => {
    return Boolean(selectedFile && !isSubmitting && !isConfirming);
  }, [selectedFile, isSubmitting, isConfirming]);

  const canConfirm = useMemo(() => {
    return Boolean(previewReady && importRows.length > 0 && !isConfirming && !isSubmitting);
  }, [previewReady, importRows.length, isConfirming, isSubmitting]);

  const handlePreview = async () => {
    if (!selectedFile) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setInspectionMessage("");
    setConfirmNotice("");
    setIsSavedToDatabase(false);

    try {
      const result = await PayrollService.importPayrollFile(selectedFile, excelPassword);
      setImportRows(result.rows);
      setTotalRows(result.totalRows);
      setTotalSalary(result.totalSalary);
      setSuccessMessage(result.message);
      setPreviewReady(true);
    } catch (error: any) {
      setImportRows([]);
      setTotalRows(0);
      setTotalSalary(0);
      setPreviewReady(false);
      setIsSavedToDatabase(false);

      if (error?.inspection && Array.isArray(error.inspection)) {
        const formattedInspection = error.inspection
          .map((sheet: any) => {
            const headers = Array.isArray(sheet.headers) && sheet.headers.length > 0
              ? sheet.headers.join(" | ")
              : "(không tìm thấy header rõ ràng)";
            return `${sheet.sheetName}: ${headers}`;
          })
          .join("\n");
        setInspectionMessage(formattedInspection);
      }

      setErrorMessage(
        error?.message ||
          "Đọc preview thất bại. Hãy kiểm tra file đã được VBA generate đúng cột Code, Name, Salary."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmToDatabase = async () => {
    if (!payrollPeriod) {
      setErrorMessage("Vui lòng chọn kỳ lương trước khi lưu database.");
      return;
    }

    setIsConfirming(true);
    setConfirmNotice("");
    setErrorMessage("");

    try {
      const result = await PayrollService.confirmPayrollImport(importRows, payrollPeriod);
      setConfirmNotice(`${result.message} Hệ thống sẽ chuyển sang trang danh sách bảng lương.`);
      setTotalRows(result.savedRows);
      setTotalSalary(result.totalSalary);
      setIsSavedToDatabase(true);

      window.setTimeout(() => {
        router.push("/apps/payroll/list");
        router.refresh();
      }, 1000);
    } catch (error: any) {
      setIsSavedToDatabase(false);
      setErrorMessage(error?.message || "Lưu bảng lương vào database thất bại.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          borderRadius: 3,
          px: { xs: 2.5, md: 4 },
          py: { xs: 3, md: 4 },
          color: "common.white",
          background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 58%, #38bdf8 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: "auto -80px -90px auto",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
          }}
        />
        <Stack spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            icon={<IconCheck size={16} />}
            label="Import file kết quả từ VBA"
            sx={{
              width: "fit-content",
              bgcolor: "rgba(255,255,255,0.16)",
              color: "common.white",
              borderRadius: 2,
              "& .MuiChip-icon": { color: "common.white" },
            }}
          />
          <Typography variant="h4" fontWeight={700}>
            Preview bảng lương trước khi lưu vào database
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 760, opacity: 0.9 }}>
            Chạy macro VBA để tạo file kết quả, upload file đó lên hệ thống, xem preview dữ liệu,
            rồi mới bấm xác nhận thêm vào kho dữ liệu.
          </Typography>
        </Stack>
      </Box>

      <Alert severity="info" variant="outlined">
        File import nên là file Excel <strong>đã generate từ VBA</strong>, tốt nhất có sheet tên như
        <strong> DanhSachLuongImport</strong> hoặc ít nhất chứa các cột <strong>Code</strong>,
        <strong> Name</strong>, <strong>Salary</strong>.
      </Alert>

      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
      {confirmNotice ? <Alert severity={isSavedToDatabase ? "success" : "warning"}>{confirmNotice}</Alert> : null}

      {errorMessage ? (
        <Alert severity="error">
          <div>{errorMessage}</div>
          {inspectionMessage ? (
            <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
              {inspectionMessage}
            </pre>
          ) : null}
        </Alert>
      ) : null}

      <Box
        {...getRootProps()}
        sx={{
          border: `1px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
          backgroundColor: isDragActive ? "primary.light" : "grey.50",
          borderRadius: 3,
          px: { xs: 2, md: 4 },
          py: { xs: 4, md: 6 },
          textAlign: "center",
          transition: "all .2s ease",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: "20px",
              display: "grid",
              placeItems: "center",
              bgcolor: isDragActive ? "primary.main" : "primary.light",
              color: isDragActive ? "common.white" : "primary.main",
            }}
          >
            <IconFileDescription size={32} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} mb={1}>
              {isDragActive ? "Thả file Excel vào đây" : "Kéo thả file Excel đã generate hoặc chọn file"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hỗ trợ file kết quả từ VBA, có thể có hoặc không có mật khẩu workbook.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<IconUpload size={18} />}
            onClick={open}
            disabled={isSubmitting || isConfirming}
          >
            Chọn file Excel
          </Button>
        </Stack>
      </Box>

      {selectedFile ? (
        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            px: 2.5,
            py: 2,
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                File đã chọn
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedFile.name}
              </Typography>
            </Box>
            <Chip color="primary" label={formatBytes(selectedFile.size)} />
          </Stack>
        </Box>
      ) : null}

      <Divider />

      <Stack spacing={2}>
        <Stack spacing={1.25}>
          <Typography variant="h6" fontWeight={700}>
            Kỳ lương
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chọn tháng lương sẽ dùng để lưu dữ liệu vào bảng dbo.Payrolls.
          </Typography>
          <CustomTextField
            fullWidth
            placeholder="Ví dụ: 2026-04"
            value={payrollPeriod}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPayrollPeriod(event.target.value)}
          />
        </Stack>

        <Stack spacing={1.25}>
          <Typography variant="h6" fontWeight={700}>
            Mật khẩu file Excel (nếu có)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nếu file Excel kết quả đang được bảo vệ bằng mật khẩu workbook, nhập vào đây. Nếu không có,
            bạn có thể để trống.
          </Typography>
          <CustomTextField
            fullWidth
            type="password"
            variant="outlined"
            placeholder="Để trống nếu file không có mật khẩu"
            value={excelPassword}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setExcelPassword(event.target.value)}
            InputProps={{
              startAdornment: <IconKey size={18} style={{ marginRight: 10, color: theme.palette.text.secondary }} />,
            }}
          />
        </Stack>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <Chip label="Bước 1: Chạy VBA tạo danh sách" variant="outlined" />
          <Chip label="Bước 2: Xem preview dữ liệu" variant="outlined" />
          <Chip label="Bước 3: Đồng ý lưu DB" variant="outlined" />
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="outlined"
            color="primary"
            disabled={!canPreview}
            onClick={handlePreview}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <IconEye size={18} />}
            sx={{ minWidth: 180 }}
          >
            {isSubmitting ? "Đang đọc preview..." : "Xem preview"}
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={!canConfirm}
            onClick={handleConfirmToDatabase}
            startIcon={isConfirming ? <CircularProgress size={18} color="inherit" /> : <IconDatabase size={18} />}
            sx={{ minWidth: 250 }}
          >
            {isConfirming ? "Đang lưu database..." : "Đồng ý thêm vào database"}
          </Button>
        </Stack>
      </Stack>

      {previewReady && importRows.length > 0 ? (
        <Stack spacing={2}>
          <Divider />
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Chip color="primary" label={`Số dòng hợp lệ: ${totalRows}`} />
            <Chip color="success" label={`Tổng lương: ${formatCurrency(totalSalary)}`} />
            <Chip color={isSavedToDatabase ? "success" : "warning"} label={`Trạng thái: ${isSavedToDatabase ? "Đã lưu database" : "Chưa lưu database"}`} />
          </Stack>
          <TableContainer
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Salary</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importRows.slice(0, 20).map((row) => (
                  <TableRow key={row.code} hover>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatCurrency(row.salary)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {importRows.length > 20 ? (
            <Typography variant="body2" color="text.secondary">
              Đang hiển thị 20 dòng đầu tiên trong tổng số {importRows.length} dòng preview hợp lệ.
            </Typography>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
};

export default PayrollImportForm;
