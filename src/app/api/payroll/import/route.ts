import { NextRequest, NextResponse } from "next/server";
import { parsePayrollWorkbook, PayrollWorkbookInspectionError } from "@/lib/payroll-workbook";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const excelPassword = String(formData.get("excelPassword") || "");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Vui lòng chọn file Excel cần import." },
        { status: 400 }
      );
    }

    const fileExtension = file.name.toLowerCase();
    if (!fileExtension.endsWith(".xls") && !fileExtension.endsWith(".xlsx")) {
      return NextResponse.json(
        { success: false, message: "Chỉ hỗ trợ file Excel định dạng .xls hoặc .xlsx." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const { rows } = await parsePayrollWorkbook(Buffer.from(arrayBuffer), excelPassword);

    return NextResponse.json(
      {
        success: true,
        message: `Đã đọc thành công ${rows.length} dòng dữ liệu lương từ file generate bởi VBA.`,
        data: rows,
        summary: {
          totalRows: rows.length,
          totalSalary: rows.reduce((sum, row) => sum + row.salary, 0),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Payroll import failed:", error);

    if (error instanceof PayrollWorkbookInspectionError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          inspection: error.inspection,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Không thể xử lý file Excel. Hãy kiểm tra file đã generate đúng cột Code, Name, Salary hay chưa.",
      },
      { status: 500 }
    );
  }
}
