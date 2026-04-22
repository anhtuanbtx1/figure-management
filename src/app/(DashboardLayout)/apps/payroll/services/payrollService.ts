import axios from "@/utils/axios";

export interface PayrollImportRow {
  code: string;
  name: string;
  salary: number;
}

export interface PayrollImportResult {
  message: string;
  rows: PayrollImportRow[];
  totalRows: number;
  totalSalary: number;
}

export interface PayrollConfirmResult {
  message: string;
  savedRows: number;
  totalSalary: number;
  payrollPeriod: string;
}

export interface PayrollListRow {
  id: number;
  code: string;
  name: string;
  salary: number;
  payrollPeriod: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollListResult {
  message: string;
  rows: PayrollListRow[];
  totalRows: number;
  totalSalary: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EmployeeSalaryStatisticsItem {
  payrollPeriod: string;
  salary: number;
  employeeCode: string;
  employeeName: string;
}

export interface EmployeeSalaryStatisticsResult {
  message: string;
  items: EmployeeSalaryStatisticsItem[];
  employeeCode: string;
  employeeName: string;
  totalMonths: number;
  totalSalary: number;
  averageSalary: number;
  latestSalary: number;
  highestSalary: number;
}

const PayrollService = {
  async importPayrollFile(file: File, excelPassword: string): Promise<PayrollImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("excelPassword", excelPassword);

    const response = await axios.post("/api/payroll/import", formData);

    return {
      message: response.data.message,
      rows: response.data.data || [],
      totalRows: response.data.summary?.totalRows || 0,
      totalSalary: response.data.summary?.totalSalary || 0,
    };
  },

  async confirmPayrollImport(rows: PayrollImportRow[], payrollPeriod: string): Promise<PayrollConfirmResult> {
    const response = await axios.post("/api/payroll/import/confirm", {
      rows,
      payrollPeriod,
    });

    return {
      message: response.data.message,
      savedRows: response.data.summary?.savedRows || 0,
      totalSalary: response.data.summary?.totalSalary || 0,
      payrollPeriod: response.data.summary?.payrollPeriod || payrollPeriod,
    };
  },

  async getPayrollList(filters?: {
    code?: string;
    name?: string;
    salary?: string;
    payrollPeriod?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PayrollListResult> {
    const response = await axios.get("/api/payroll/list", {
      params: {
        code: filters?.code || "",
        name: filters?.name || "",
        salary: filters?.salary || "",
        payrollPeriod: filters?.payrollPeriod || "",
        page: filters?.page || 1,
        pageSize: filters?.pageSize || 10,
      },
    });

    return {
      message: response.data.message,
      rows: response.data.data || [],
      totalRows: response.data.summary?.totalRows || 0,
      totalSalary: response.data.summary?.totalSalary || 0,
      page: response.data.summary?.page || 1,
      pageSize: response.data.summary?.pageSize || 10,
      totalPages: response.data.summary?.totalPages || 0,
    };
  },

  async getEmployeeSalaryStatistics(employeeCode: string): Promise<EmployeeSalaryStatisticsResult> {
    const response = await axios.get("/api/payroll/statistics", {
      params: {
        employeeCode,
      },
    });

    return {
      message: response.data.message,
      items: response.data.data || [],
      employeeCode: response.data.summary?.employeeCode || employeeCode,
      employeeName: response.data.summary?.employeeName || "",
      totalMonths: response.data.summary?.totalMonths || 0,
      totalSalary: response.data.summary?.totalSalary || 0,
      averageSalary: response.data.summary?.averageSalary || 0,
      latestSalary: response.data.summary?.latestSalary || 0,
      highestSalary: response.data.summary?.highestSalary || 0,
    };
  },
};

export default PayrollService;
