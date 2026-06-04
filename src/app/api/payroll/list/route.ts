import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { executeQuery, executeStoredProcedure } from "@/lib/database";

export const runtime = "nodejs";

interface PayrollListDbRow {
  id: number;
  code: string;
  name: string;
  salary: number;
  payrollPeriod: string;
  createdAt: string;
  updatedAt: string;
  totalCount?: number;
  totalSalary?: number;
}

interface PayrollGroupDbRow {
  payrollPeriod: string;
  year: number;
  month: number;
  employeeCount: number;
  totalSalary: number;
  latestCreatedAt: string;
  latestUpdatedAt: string;
  totalGroups?: number;
  totalEmployees?: number;
  grandTotalSalary?: number;
}

function normalizePayrollPeriodInput(value: string): string {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }

  return trimmed;
}

function getGroupKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 7);
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getGroupLabel(year: number, month: number) {
  return `Tháng ${String(month).padStart(2, "0")}/${year}`;
}

function buildWhereClause(params: {
  code: string;
  name: string;
  salaryKeyword: string;
  payrollPeriod: string;
}) {
  const whereParts = ["1 = 1"];
  const queryParams: Record<string, { type: any; value: any }> = {};

  if (params.code) {
    whereParts.push("EmployeeCode LIKE @code");
    queryParams.code = { type: sql.NVarChar(50), value: `%${params.code}%` };
  }

  if (params.name) {
    whereParts.push("EmployeeName LIKE @name");
    queryParams.name = { type: sql.NVarChar(255), value: `%${params.name}%` };
  }

  if (params.salaryKeyword) {
    whereParts.push("CONVERT(NVARCHAR(50), CONVERT(BIGINT, Salary)) LIKE @salaryKeyword");
    queryParams.salaryKeyword = { type: sql.NVarChar(50), value: `%${params.salaryKeyword}%` };
  }

  if (params.payrollPeriod) {
    whereParts.push("PayrollPeriod = @payrollPeriod");
    queryParams.payrollPeriod = { type: sql.Date, value: params.payrollPeriod };
  }

  return {
    whereClause: whereParts.join(" AND "),
    queryParams,
  };
}

async function fetchPayrollListByProcedure(params: {
  code: string;
  name: string;
  salaryKeyword: string;
  payrollPeriod: string;
  page: number;
  pageSize: number;
}) {
  return executeStoredProcedure<PayrollListDbRow>("sp_GetPayrollList", {
    Code: { type: sql.NVarChar(50), value: params.code || null },
    Name: { type: sql.NVarChar(255), value: params.name || null },
    SalaryKeyword: { type: sql.NVarChar(50), value: params.salaryKeyword || null },
    PayrollPeriod: { type: sql.Date, value: params.payrollPeriod || null },
    Page: { type: sql.Int, value: params.page },
    PageSize: { type: sql.Int, value: params.pageSize },
  });
}

async function fetchPayrollListByQuery(params: {
  code: string;
  name: string;
  salaryKeyword: string;
  payrollPeriod: string;
  page: number;
  pageSize: number;
}) {
  const { whereClause, queryParams } = buildWhereClause(params);
  queryParams.offset = { type: sql.Int, value: (params.page - 1) * params.pageSize };
  queryParams.pageSize = { type: sql.Int, value: params.pageSize };

  const rows = await executeQuery<PayrollListDbRow>(
    `
      WITH FilteredPayrolls AS (
        SELECT
          Id AS id,
          EmployeeCode AS code,
          EmployeeName AS name,
          Salary AS salary,
          PayrollPeriod AS payrollPeriod,
          CreatedAt AS createdAt,
          UpdatedAt AS updatedAt
        FROM dbo.Payrolls
        WHERE ${whereClause}
      )
      SELECT
        id,
        code,
        name,
        salary,
        payrollPeriod,
        createdAt,
        updatedAt,
        COUNT(*) OVER() AS totalCount,
        ISNULL(SUM(salary) OVER(), 0) AS totalSalary
      FROM FilteredPayrolls
      ORDER BY payrollPeriod DESC, code ASC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `,
    queryParams
  );

  return rows;
}

async function fetchPayrollGroupsByQuery(params: {
  code: string;
  name: string;
  salaryKeyword: string;
  payrollPeriod: string;
  page: number;
  pageSize: number;
}) {
  const { whereClause, queryParams } = buildWhereClause(params);
  queryParams.offset = { type: sql.Int, value: (params.page - 1) * params.pageSize };
  queryParams.pageSize = { type: sql.Int, value: params.pageSize };

  return executeQuery<PayrollGroupDbRow>(
    `
      WITH FilteredPayrolls AS (
        SELECT
          Salary,
          PayrollPeriod,
          CreatedAt,
          UpdatedAt
        FROM dbo.Payrolls
        WHERE ${whereClause}
      ),
      GroupedPayrolls AS (
        SELECT
          DATEFROMPARTS(YEAR(PayrollPeriod), MONTH(PayrollPeriod), 1) AS payrollPeriod,
          YEAR(PayrollPeriod) AS [year],
          MONTH(PayrollPeriod) AS [month],
          COUNT(*) AS employeeCount,
          ISNULL(SUM(Salary), 0) AS totalSalary,
          MAX(CreatedAt) AS latestCreatedAt,
          MAX(UpdatedAt) AS latestUpdatedAt
        FROM FilteredPayrolls
        GROUP BY YEAR(PayrollPeriod), MONTH(PayrollPeriod)
      )
      SELECT
        payrollPeriod,
        [year],
        [month],
        employeeCount,
        totalSalary,
        latestCreatedAt,
        latestUpdatedAt,
        COUNT(*) OVER() AS totalGroups,
        ISNULL(SUM(employeeCount) OVER(), 0) AS totalEmployees,
        ISNULL(SUM(totalSalary) OVER(), 0) AS grandTotalSalary
      FROM GroupedPayrolls
      ORDER BY [year] DESC, [month] DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `,
    queryParams
  );
}

async function getDetailsResponse(params: {
  code: string;
  name: string;
  salaryKeyword: string;
  payrollPeriod: string;
  page: number;
  pageSize: number;
}) {
  let rows: PayrollListDbRow[] = [];

  try {
    rows = await fetchPayrollListByProcedure(params);
  } catch (procedureError) {
    console.warn("⚠️ Payroll list stored procedure failed, falling back to direct query:", procedureError);
    rows = await fetchPayrollListByQuery(params);
  }

  const data = rows.map((row) => ({
    id: Number(row.id),
    code: String(row.code || ""),
    name: String(row.name || ""),
    salary: Number(row.salary || 0),
    payrollPeriod: row.payrollPeriod,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  const firstRow = rows[0];
  const totalRows = Number(firstRow?.totalCount || 0);
  const totalSalary = Number(firstRow?.totalSalary || 0);

  return NextResponse.json(
    {
      success: true,
      message: "Lấy chi tiết bảng lương thành công.",
      data,
      summary: {
        mode: "details",
        totalRows,
        totalSalary,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: totalRows > 0 ? Math.ceil(totalRows / params.pageSize) : 0,
      },
    },
    { status: 200 }
  );
}

async function getGroupsResponse(params: {
  code: string;
  name: string;
  salaryKeyword: string;
  payrollPeriod: string;
  page: number;
  pageSize: number;
}) {
  const rows = await fetchPayrollGroupsByQuery(params);

  const data = rows.map((row) => ({
    key: getGroupKey(row.payrollPeriod),
    payrollPeriod: row.payrollPeriod,
    year: Number(row.year || 0),
    month: Number(row.month || 0),
    label: getGroupLabel(Number(row.year || 0), Number(row.month || 0)),
    employeeCount: Number(row.employeeCount || 0),
    totalSalary: Number(row.totalSalary || 0),
    latestCreatedAt: row.latestCreatedAt,
    latestUpdatedAt: row.latestUpdatedAt,
  }));

  const firstRow = rows[0];
  const totalGroups = Number(firstRow?.totalGroups || 0);
  const totalEmployees = Number(firstRow?.totalEmployees || 0);
  const totalSalary = Number(firstRow?.grandTotalSalary || 0);

  return NextResponse.json(
    {
      success: true,
      message: "Lấy nhóm bảng lương thành công.",
      data,
      summary: {
        mode: "groups",
        totalGroups,
        totalEmployees,
        totalSalary,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: totalGroups > 0 ? Math.ceil(totalGroups / params.pageSize) : 0,
      },
    },
    { status: 200 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get("mode") || "groups").trim().toLowerCase();
    const code = (searchParams.get("code") || "").trim();
    const name = (searchParams.get("name") || "").trim();
    const salaryKeyword = (searchParams.get("salary") || "").replace(/[^\d]/g, "");
    const payrollPeriod = normalizePayrollPeriodInput(searchParams.get("payrollPeriod") || "");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.max(1, Number(searchParams.get("pageSize") || 10));
    const params = { code, name, salaryKeyword, payrollPeriod, page, pageSize };

    if (mode === "details") {
      return getDetailsResponse(params);
    }

    return getGroupsResponse(params);
  } catch (error: any) {
    console.error("❌ Payroll list fetch failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Không thể lấy danh sách bảng lương.",
        data: [],
        summary: {
          mode: "groups",
          totalGroups: 0,
          totalEmployees: 0,
          totalSalary: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        },
      },
      { status: 500 }
    );
  }
}
