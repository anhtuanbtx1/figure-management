import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { executeQuery } from "@/lib/database";

export const runtime = "nodejs";

interface EmployeeSalaryStatisticsRow {
  payrollPeriod: string;
  salary: number;
  employeeCode: string;
  employeeName: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeCode = (searchParams.get("employeeCode") || "").trim();

    if (!employeeCode) {
      return NextResponse.json(
        {
          success: true,
          message: "Nhập mã nhân viên để xem thống kê lương theo tháng.",
          data: [],
          summary: {
            employeeCode: "",
            employeeName: "",
            totalMonths: 0,
            totalSalary: 0,
            averageSalary: 0,
            latestSalary: 0,
            highestSalary: 0,
          },
        },
        { status: 200 }
      );
    }

    const rows = await executeQuery<EmployeeSalaryStatisticsRow>(
      `
        SELECT
          PayrollPeriod AS payrollPeriod,
          Salary AS salary,
          EmployeeCode AS employeeCode,
          EmployeeName AS employeeName
        FROM dbo.Payrolls
        WHERE EmployeeCode = @employeeCode
        ORDER BY PayrollPeriod ASC
      `,
      {
        employeeCode: { type: sql.NVarChar(50), value: employeeCode },
      }
    );

    const data = rows.map((row) => ({
      payrollPeriod: row.payrollPeriod,
      salary: Number(row.salary || 0),
      employeeCode: String(row.employeeCode || ""),
      employeeName: String(row.employeeName || ""),
    }));

    const totalSalary = data.reduce((sum, row) => sum + row.salary, 0);
    const totalMonths = data.length;
    const latestSalary = totalMonths > 0 ? data[totalMonths - 1].salary : 0;
    const highestSalary = totalMonths > 0 ? Math.max(...data.map((row) => row.salary)) : 0;
    const averageSalary = totalMonths > 0 ? totalSalary / totalMonths : 0;
    const employeeName = totalMonths > 0 ? data[0].employeeName : "";

    return NextResponse.json(
      {
        success: true,
        message: totalMonths > 0 ? "Lấy thống kê lương nhân viên thành công." : "Không tìm thấy dữ liệu lương cho mã nhân viên này.",
        data,
        summary: {
          employeeCode,
          employeeName,
          totalMonths,
          totalSalary,
          averageSalary,
          latestSalary,
          highestSalary,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Payroll statistics fetch failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Không thể lấy thống kê lương nhân viên.",
        data: [],
        summary: {
          employeeCode: "",
          employeeName: "",
          totalMonths: 0,
          totalSalary: 0,
          averageSalary: 0,
          latestSalary: 0,
          highestSalary: 0,
        },
      },
      { status: 500 }
    );
  }
}
