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

function normalizePayrollPeriodInput(value: string): string {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }

  return trimmed;
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
  const whereParts = ["1 = 1"];
  const queryParams: Record<string, { type: any; value: any }> = {
    offset: { type: sql.Int, value: (params.page - 1) * params.pageSize },
    pageSize: { type: sql.Int, value: params.pageSize },
  };

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

  const whereClause = whereParts.join(" AND ");

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (searchParams.get("code") || "").trim();
    const name = (searchParams.get("name") || "").trim();
    const salaryKeyword = (searchParams.get("salary") || "").replace(/[^\d]/g, "");
    const payrollPeriod = normalizePayrollPeriodInput(searchParams.get("payrollPeriod") || "");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.max(1, Number(searchParams.get("pageSize") || 10));

    let rows: PayrollListDbRow[] = [];

    try {
      rows = await fetchPayrollListByProcedure({
        code,
        name,
        salaryKeyword,
        payrollPeriod,
        page,
        pageSize,
      });
    } catch (procedureError) {
      console.warn("⚠️ Payroll list stored procedure failed, falling back to direct query:", procedureError);
      rows = await fetchPayrollListByQuery({
        code,
        name,
        salaryKeyword,
        payrollPeriod,
        page,
        pageSize,
      });
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
        message: "Lấy danh sách bảng lương thành công.",
        data,
        summary: {
          totalRows,
          totalSalary,
          page,
          pageSize,
          totalPages: totalRows > 0 ? Math.ceil(totalRows / pageSize) : 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Payroll list fetch failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Không thể lấy danh sách bảng lương.",
        data: [],
        summary: {
          totalRows: 0,
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
