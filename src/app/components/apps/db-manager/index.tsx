"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Skeleton,
  Divider,
  Badge,
  alpha,
} from "@mui/material";
import {
  IconDatabase,
  IconTable,
  IconSearch,
  IconRefresh,
  IconColumns,
  IconList,
  IconChevronRight,
  IconInfoCircle,
  IconCopy,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useTheme } from "@mui/material/styles";

interface TableInfo {
  schema: string;
  name: string;
  type: string;
  columnCount: number;
  rowCount: number | null;
}

interface ColumnInfo {
  name: string;
  dataType: string;
  maxLength: number | null;
  nullable: string;
  defaultValue: string | null;
  position: number;
}

interface TableDataResponse {
  success: boolean;
  message?: string;
  columns: ColumnInfo[];
  data: Record<string, unknown>[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

type TabValue = "data" | "columns";

function getTypeColor(dataType: string): "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info" {
  const t = dataType.toLowerCase();
  if (t.includes("int") || t.includes("decimal") || t.includes("float") || t.includes("numeric") || t.includes("money")) return "primary";
  if (t.includes("char") || t.includes("text") || t.includes("nvarchar") || t.includes("nchar")) return "success";
  if (t.includes("date") || t.includes("time")) return "warning";
  if (t.includes("bit") || t.includes("bool")) return "secondary";
  if (t.includes("uniqueidentifier") || t.includes("xml") || t.includes("json")) return "info";
  return "default";
}

export default function DatabaseManager() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Tables list
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [filteredTables, setFilteredTables] = useState<TableInfo[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Selected table
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("data");

  // Table data
  const [tableData, setTableData] = useState<TableDataResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  // Fetch tables list
  const fetchTables = useCallback(async () => {
    setTablesLoading(true);
    setTablesError(null);
    try {
      const res = await fetch("/api/db-manager/tables");
      const json = await res.json();
      if (json.success) {
        setTables(json.data);
        setFilteredTables(json.data);
      } else {
        setTablesError(json.message || "Failed to load tables");
      }
    } catch (err) {
      setTablesError(err instanceof Error ? err.message : "Network error");
    } finally {
      setTablesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Filter tables
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFilteredTables(tables);
    } else {
      setFilteredTables(
        tables.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.schema.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, tables]);

  // Fetch table data
  const fetchTableData = useCallback(
    async (table: TableInfo, p: number, ps: number) => {
      setDataLoading(true);
      setDataError(null);
      try {
        const params = new URLSearchParams({
          table: table.name,
          schema: table.schema,
          page: String(p + 1),
          pageSize: String(ps),
        });
        const res = await fetch(`/api/db-manager/table-data?${params}`);
        const json = await res.json();
        if (json.success) {
          setTableData(json);
        } else {
          setDataError(json.message || "Failed to load data");
          setTableData(null);
        }
      } catch (err) {
        setDataError(err instanceof Error ? err.message : "Network error");
        setTableData(null);
      } finally {
        setDataLoading(false);
      }
    },
    []
  );

  const handleSelectTable = (table: TableInfo) => {
    setSelectedTable(table);
    setPage(0);
    setPageSize(50);
    setActiveTab("data");
    setTableData(null);
    fetchTableData(table, 0, 50);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
    if (selectedTable) fetchTableData(selectedTable, newPage, pageSize);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ps = parseInt(e.target.value, 10);
    setPageSize(ps);
    setPage(0);
    if (selectedTable) fetchTableData(selectedTable, 0, ps);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const sidebarBg = isDark
    ? alpha(theme.palette.background.paper, 0.6)
    : alpha(theme.palette.grey[50], 0.9);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        height: "calc(100vh - 200px)",
        minHeight: 600,
      }}
    >
      {/* ── LEFT SIDEBAR: Table List ── */}
      <Paper
        elevation={0}
        sx={{
          width: 300,
          minWidth: 260,
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: sidebarBg,
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <IconDatabase size={20} />
            <Typography variant="subtitle1" fontWeight={700}>
              Database Tables
            </Typography>
            <Box sx={{ ml: "auto" }}>
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  onClick={fetchTables}
                  disabled={tablesLoading}
                  sx={{ color: "white" }}
                >
                  <IconRefresh
                    size={16}
                    style={{
                      animation: tablesLoading ? "spin 1s linear infinite" : undefined,
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            {tables.length} tables found
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={16} />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
          />
        </Box>

        {/* List */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {tablesLoading ? (
            <Box sx={{ p: 2 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} height={48} sx={{ mb: 0.5, borderRadius: 1 }} />
              ))}
            </Box>
          ) : tablesError ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" icon={<IconAlertCircle size={16} />} sx={{ fontSize: 12 }}>
                {tablesError}
              </Alert>
            </Box>
          ) : filteredTables.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No tables found
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {filteredTables.map((table, idx) => {
                const isSelected =
                  selectedTable?.name === table.name &&
                  selectedTable?.schema === table.schema;
                return (
                  <React.Fragment key={`${table.schema}.${table.name}`}>
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => handleSelectTable(table)}
                      sx={{
                        py: 1,
                        px: 2,
                        transition: "all 0.15s",
                        "&.Mui-selected": {
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          borderRight: `3px solid ${theme.palette.primary.main}`,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.18),
                          },
                        },
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.06),
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <IconTable
                          size={16}
                          color={
                            isSelected
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary
                          }
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            fontWeight={isSelected ? 600 : 400}
                            noWrap
                            sx={{ fontSize: 13 }}
                          >
                            {table.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {table.schema} ·{" "}
                            {table.rowCount !== null
                              ? `${table.rowCount.toLocaleString()} rows`
                              : "VIEW"}
                          </Typography>
                        }
                      />
                      {isSelected && (
                        <IconChevronRight
                          size={14}
                          color={theme.palette.primary.main}
                        />
                      )}
                    </ListItemButton>
                    {idx < filteredTables.length - 1 && (
                      <Divider sx={{ opacity: 0.4 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>
      </Paper>

      {/* ── RIGHT PANEL: Table Detail ── */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {!selectedTable ? (
          /* Empty state */
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              color: "text.secondary",
              p: 4,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconDatabase size={36} color={theme.palette.primary.main} />
            </Box>
            <Typography variant="h6" color="text.secondary">
              Select a table to explore
            </Typography>
            <Typography variant="body2" color="text.disabled" textAlign="center">
              Click on any table in the list to view its structure and data
            </Typography>
          </Box>
        ) : (
          <>
            {/* Table Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                background: isDark
                  ? alpha(theme.palette.background.paper, 0.8)
                  : alpha(theme.palette.grey[50], 0.8),
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <IconTable size={20} color={theme.palette.primary.main} />
                <Typography variant="h6" fontWeight={700}>
                  {selectedTable.name}
                </Typography>
                <Chip
                  label={selectedTable.schema}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 20, fontSize: 11 }}
                />
                <Chip
                  label={selectedTable.type === "VIEW" ? "View" : "Table"}
                  size="small"
                  color={selectedTable.type === "VIEW" ? "secondary" : "default"}
                  sx={{ height: 20, fontSize: 11 }}
                />
                <Box sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center" }}>
                  {tableData && (
                    <Typography variant="caption" color="text.secondary">
                      {tableData.pagination.total.toLocaleString()} rows ·{" "}
                      {tableData.columns.length} columns
                    </Typography>
                  )}
                  <Tooltip title="Copy full table name">
                    <IconButton
                      size="small"
                      onClick={() =>
                        copyToClipboard(
                          `[${selectedTable.schema}].[${selectedTable.name}]`
                        )
                      }
                    >
                      <IconCopy size={15} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Refresh">
                    <IconButton
                      size="small"
                      onClick={() =>
                        fetchTableData(selectedTable, page, pageSize)
                      }
                      disabled={dataLoading}
                    >
                      <IconRefresh size={15} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{ px: 2, minHeight: 42 }}
              >
                <Tab
                  value="data"
                  label="Data"
                  icon={<IconList size={14} />}
                  iconPosition="start"
                  sx={{ minHeight: 42, fontSize: 13, textTransform: "none" }}
                />
                <Tab
                  value="columns"
                  label={
                    <Badge
                      badgeContent={tableData?.columns.length || 0}
                      color="primary"
                      sx={{ "& .MuiBadge-badge": { fontSize: 10 } }}
                    >
                      Columns
                    </Badge>
                  }
                  icon={<IconColumns size={14} />}
                  iconPosition="start"
                  sx={{ minHeight: 42, fontSize: 13, textTransform: "none" }}
                />
              </Tabs>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflow: "auto", position: "relative" }}>
              {dataLoading && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    zIndex: 10,
                    backdropFilter: "blur(2px)",
                  }}
                >
                  <CircularProgress size={36} />
                </Box>
              )}

              {dataError && (
                <Box sx={{ p: 2 }}>
                  <Alert severity="error">{dataError}</Alert>
                </Box>
              )}

              {/* DATA TAB */}
              {activeTab === "data" && tableData && !dataError && (
                <TableContainer sx={{ maxHeight: "100%" }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        {tableData.columns.map((col) => (
                          <TableCell
                            key={col.name}
                            sx={{
                              fontWeight: 700,
                              fontSize: 12,
                              whiteSpace: "nowrap",
                              bgcolor: isDark
                                ? alpha(theme.palette.background.default, 0.9)
                                : alpha(theme.palette.grey[100], 0.95),
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              {col.name}
                              <Chip
                                label={col.dataType}
                                size="small"
                                color={getTypeColor(col.dataType)}
                                sx={{ height: 16, fontSize: 9, ml: 0.5 }}
                              />
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.data.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={tableData.columns.length}
                            align="center"
                            sx={{ py: 4, color: "text.secondary" }}
                          >
                            No data in this table
                          </TableCell>
                        </TableRow>
                      ) : (
                        tableData.data.map((row, ri) => (
                          <TableRow
                            key={ri}
                            hover
                            sx={{
                              "&:nth-of-type(even)": {
                                bgcolor: alpha(theme.palette.action.hover, 0.03),
                              },
                            }}
                          >
                            {tableData.columns.map((col) => {
                              const val = row[col.name];
                              const display =
                                val === null || val === undefined
                                  ? null
                                  : val instanceof Date
                                  ? new Date(val as Date).toLocaleString("vi-VN")
                                  : String(val);
                              return (
                                <TableCell
                                  key={col.name}
                                  sx={{
                                    fontSize: 12,
                                    maxWidth: 250,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    color:
                                      val === null
                                        ? "text.disabled"
                                        : "text.primary",
                                  }}
                                >
                                  {val === null ? (
                                    <Typography
                                      variant="caption"
                                      sx={{ fontStyle: "italic", color: "text.disabled" }}
                                    >
                                      NULL
                                    </Typography>
                                  ) : (
                                    <Tooltip title={display || ""} placement="top">
                                      <span>{display}</span>
                                    </Tooltip>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* COLUMNS TAB */}
              {activeTab === "columns" && tableData && !dataError && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {["#", "Column Name", "Data Type", "Max Length", "Nullable", "Default"].map((h) => (
                          <TableCell
                            key={h}
                            sx={{
                              fontWeight: 700,
                              fontSize: 12,
                              bgcolor: isDark
                                ? alpha(theme.palette.background.default, 0.9)
                                : alpha(theme.palette.grey[100], 0.95),
                            }}
                          >
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.columns.map((col) => (
                        <TableRow key={col.name} hover>
                          <TableCell sx={{ fontSize: 11, color: "text.secondary", width: 40 }}>
                            {col.position}
                          </TableCell>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
                            {col.name}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={col.dataType}
                              size="small"
                              color={getTypeColor(col.dataType)}
                              variant="outlined"
                              sx={{ fontSize: 11, height: 20 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>
                            {col.maxLength === -1
                              ? "MAX"
                              : col.maxLength !== null
                              ? col.maxLength
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={col.nullable === "YES" ? "NULL" : "NOT NULL"}
                              size="small"
                              color={col.nullable === "YES" ? "warning" : "success"}
                              sx={{ fontSize: 10, height: 18 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: 11, color: "text.secondary", fontFamily: "monospace" }}>
                            {col.defaultValue || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            {/* Pagination (only in data tab) */}
            {activeTab === "data" && tableData && (
              <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                <TablePagination
                  component="div"
                  count={tableData.pagination.total}
                  page={page}
                  rowsPerPage={pageSize}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handlePageSizeChange}
                  rowsPerPageOptions={[25, 50, 100]}
                  labelRowsPerPage="Rows:"
                  sx={{ "& .MuiTablePagination-toolbar": { minHeight: 44 } }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}
