import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { executeStoredProcedure } from "@/lib/database";

export const runtime = "nodejs";

interface ConfirmPayrollRow {
  code: string;
  name: string;
  salary: number;
}

function normalizePayrollPeriod(value: string): string {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }

  return trimmed;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payrollPeriodRaw = String(body?.payrollPeriod || "");
    const rows = Array.isArray(body?.rows) ? (body.rows as ConfirmPayrollRow[]) : [];

    if (!payrollPeriodRaw) {
      return NextResponse.json(
        { success: false, message: "Vui lòng chọn kỳ lương trước khi lưu database." },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Không có dữ liệu payroll để lưu vào database." },
        { status: 400 }
      );
    }

    const payrollPeriod = normalizePayrollPeriod(payrollPeriodRaw);
    const validDate = new Date(payrollPeriod);

    if (Number.isNaN(validDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Kỳ lương không đúng định dạng hợp lệ." },
        { status: 400 }
      );
    }

    const sanitizedRows = rows
      .map((row) => ({
        code: String(row?.code || "").trim(),
        name: String(row?.name || "").trim(),
        salary: Number(row?.salary || 0),
      }))
      .filter((row) => row.code && row.name);

    if (sanitizedRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Danh sách payroll không có dòng hợp lệ để lưu." },
        { status: 400 }
      );
    }

    const result = await executeStoredProcedure<{
      savedRows: number;
      totalSalary: number;
      payrollPeriod: string;
    }>("sp_SavePayrollImport", {
      PayrollPeriod: { type: sql.Date, value: payrollPeriod },
      RowsJson: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(sanitizedRows) },
    });

    const summary = result[0] || {
      savedRows: sanitizedRows.length,
      totalSalary: sanitizedRows.reduce((sum, row) => sum + row.salary, 0),
      payrollPeriod,
    };

    return NextResponse.json(
      {
        success: true,
        message: `Đã lưu thành công ${summary.savedRows} dòng bảng lương vào database.`,
        summary: {
          savedRows: Number(summary.savedRows || 0),
          totalSalary: Number(summary.totalSalary || 0),
          payrollPeriod: summary.payrollPeriod || payrollPeriod,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Payroll confirm failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Không thể lưu payroll vào database.",
      },
      { status: 500 }
    );
  }
}
