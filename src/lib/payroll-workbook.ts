import officeCrypto from "officecrypto-tool";
import * as XLSX from "xlsx";

export interface PayrollSummaryRow {
  code: string;
  name: string;
  salary: number;
}

export interface WorkbookSheetPreview {
  sheetName: string;
  headers: string[];
  previewRows: string[][];
}

export class PayrollWorkbookInspectionError extends Error {
  inspection: WorkbookSheetPreview[];

  constructor(message: string, inspection: WorkbookSheetPreview[]) {
    super(message);
    this.name = "PayrollWorkbookInspectionError";
    this.inspection = inspection;
  }
}

const sheetNameCandidates = [
  "DanhSachLuongImport",
  "DanhSachLuongHienTai",
  "DanhSachLuong",
  "PayrollImport",
  "Payroll",
];

const codeKeys = ["code", "ma", "mã"];
const nameKeys = ["name", "ten", "tên"];
const salaryKeys = ["salary", "luong", "lương"];

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function normalizeCode(value: unknown): string {
  const raw = String(value ?? "").trim().replace(/^'+/, "");
  if (!raw) return "";
  return raw.padStart(3, "0");
}

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value ?? "")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function findValue(record: Record<string, unknown>, candidates: string[]): unknown {
  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = normalizeHeader(key);
    if (candidates.includes(normalizedKey)) {
      return value;
    }
  }

  return undefined;
}

function dedupeRows(rows: PayrollSummaryRow[]): PayrollSummaryRow[] {
  const map = new Map<string, PayrollSummaryRow>();

  rows.forEach((row) => {
    if (!row.code || !row.name) {
      return;
    }

    map.set(row.code, row);
  });

  return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
}

async function openWorkbook(fileBuffer: Buffer, password?: string): Promise<XLSX.WorkBook> {
  try {
    return XLSX.read(fileBuffer, {
      type: "buffer",
      cellStyles: true,
      password: password?.trim() || undefined,
    });
  } catch (sheetJsError) {
    try {
      const decrypted = await officeCrypto.decrypt(fileBuffer, {
        password: password?.trim() || "",
      });

      const decryptedBuffer = Buffer.isBuffer(decrypted) ? decrypted : Buffer.from(decrypted);
      return XLSX.read(decryptedBuffer, {
        type: "buffer",
        cellStyles: true,
      });
    } catch (decryptError) {
      const message = decryptError instanceof Error ? decryptError.message : String(decryptError);

      if (/password|decrypt|encrypt|crypt/i.test(message)) {
        throw new Error("Không thể mở file Excel. Vui lòng kiểm tra đúng mật khẩu của workbook.");
      }

      const sheetJsMessage = sheetJsError instanceof Error ? sheetJsError.message : String(sheetJsError);
      throw new Error(sheetJsMessage || "Không thể đọc file Excel được bảo vệ.");
    }
  }
}

function inspectWorkbookStructure(workbook: XLSX.WorkBook): WorkbookSheetPreview[] {
  return workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return {
        sheetName,
        headers: [],
        previewRows: [],
      };
    }

    const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(worksheet, {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    });

    const firstNonEmptyRow = matrix.find((row) => row.some((cell) => String(cell ?? "").trim() !== "")) || [];
    const previewRows = matrix
      .slice(0, 5)
      .map((row) => row.slice(0, 8).map((cell) => String(cell ?? "").trim()));

    return {
      sheetName,
      headers: firstNonEmptyRow.slice(0, 12).map((cell) => String(cell ?? "").trim()),
      previewRows,
    };
  });
}

function pickWorksheet(workbook: XLSX.WorkBook): XLSX.WorkSheet | null {
  for (const sheetName of sheetNameCandidates) {
    const foundName = workbook.SheetNames.find(
      (name) => normalizeHeader(name) === normalizeHeader(sheetName)
    );
    if (foundName && workbook.Sheets[foundName]) {
      return workbook.Sheets[foundName];
    }
  }

  return workbook.SheetNames
    .map((sheetName) => workbook.Sheets[sheetName])
    .find((worksheet) => Boolean(worksheet)) || null;
}

export function extractPayrollSummaryRows(workbook: XLSX.WorkBook): PayrollSummaryRow[] {
  const worksheet = pickWorksheet(workbook);
  if (!worksheet) {
    return [];
  }

  const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
    raw: false,
  });

  const rows = jsonRows
    .map((row) => {
      const code = normalizeCode(findValue(row, codeKeys));
      const name = String(findValue(row, nameKeys) ?? "").trim();
      const salary = toNumber(findValue(row, salaryKeys));

      return { code, name, salary };
    })
    .filter((row) => row.code && row.name);

  return dedupeRows(rows);
}

export async function parsePayrollWorkbook(fileBuffer: Buffer, password?: string) {
  const workbook = await openWorkbook(fileBuffer, password);
  const rows = extractPayrollSummaryRows(workbook);

  if (rows.length === 0) {
    throw new PayrollWorkbookInspectionError(
      "Không tìm thấy dữ liệu import hợp lệ. Hãy upload file Excel đã được VBA generate với các cột Code, Name, Salary.",
      inspectWorkbookStructure(workbook)
    );
  }

  return {
    rows,
    inspection: inspectWorkbookStructure(workbook),
  };
}
