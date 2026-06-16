import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_URL = "https://iam.biso24.org/v1/requests";
const DEFAULT_AUTHORIZATION = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODBhODI3Nzc1N2QxNTRlMmZhN2FlYiIsIm9yZ0lkIjoiNjc0MDUzZTVmM2JkYWZkMjQyODI2YTdiIiwiaWF0IjoxNzc2MDYyODg2LCJleHAiOjE3NzcyNzI0ODZ9.8fxOlKHYoqJeim13bdei-HFb1wnY3ia08huxWERQoJ8";
const DEFAULT_ACCEPT = "application/json, text/plain, */*";
const DEFAULT_ACCEPT_LANGUAGE = "vi,en-US;q=0.9,en;q=0.8";
const DEFAULT_DOMAIN = "gtel-ots.biso24.net";
const DEFAULT_ORIGIN = "https://gtel-ots.biso24.net";
const DEFAULT_PRIORITY = "u=1, i";
const DEFAULT_REFERER = "https://gtel-ots.biso24.net/";
const DEFAULT_SEC_CH_UA = '"Not:A-Brand";v="99", "Microsoft Edge";v="145", "Chromium";v="145"';
const DEFAULT_SEC_CH_UA_MOBILE = "?0";
const DEFAULT_SEC_CH_UA_PLATFORM = '"Windows"';
const DEFAULT_SEC_FETCH_DEST = "empty";
const DEFAULT_SEC_FETCH_MODE = "cors";
const DEFAULT_SEC_FETCH_SITE = "same-site";
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0";
const DEFAULT_QUERY = "leave";

interface EmployeeDetail {
  employeeId?: string;
  avatar?: string | null;
  staffCode?: string;
  fullName?: string;
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  positionName?: string;
  gender?: string | null;
}

interface ApprovalStepApprover {
  employeeId?: string;
  staffCode?: string;
  fullName?: string;
  avatar?: string;
  companyEmail?: string;
  departmentName?: string;
  positionName?: string;
  _id?: string;
  id?: string;
}

interface ApprovalStep {
  stepIndex?: number;
  stepId?: string;
  stepTitle?: string;
  approvalConfig?: string | null;
  approvers?: ApprovalStepApprover[];
  status?: string;
  approvedDate?: string;
  approvedBy?: ApprovalStepApprover | null;
  _id?: string;
  id?: string;
}

interface WorkShiftItem {
  workShiftItemId?: string;
  name?: string;
  code?: string;
}

interface RequestData {
  workingDate?: string;
  workShiftItem?: WorkShiftItem;
  timeIn?: string;
  timeOut?: string;
}

interface ExternalLeaveRequestItem {
  _id?: string;
  id?: string;
  orgIds?: string[];
  requestCategoryId?: string;
  requestCategoryCode?: string;
  registrationDate?: string;
  employeeId?: string;
  employeeDetail?: EmployeeDetail;
  approvalSteps?: ApprovalStep[];
  requestData?: RequestData;
  notes?: string;
  files?: unknown[];
  createdBy?: EmployeeDetail;
  status?: string;
  priority?: number;
  approvedBy?: ApprovalStepApprover | null;
  approvalForNextStep?: ApprovalStepApprover | null;
  modifiedBy?: EmployeeDetail;
  _destroy?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ExternalLeaveResponse {
  success?: boolean;
  statusCode?: string;
  message?: string;
  data?: {
    total?: number;
    limit?: number;
    page?: number;
    totalPages?: number;
    data?: ExternalLeaveRequestItem[];
  };
}

async function extractBearerToken(request: NextRequest) {
  const headerToken = request.headers.get("authorization");
  if (headerToken?.trim()) {
    return headerToken.startsWith("Bearer ") ? headerToken : `Bearer ${headerToken}`;
  }

  const cookieCandidates = [
    request.cookies.get("accessToken")?.value,
    request.cookies.get("token")?.value,
    request.cookies.get("authToken")?.value,
    request.cookies.get("jwt")?.value,
    request.cookies.get("Authorization")?.value,
  ].filter(Boolean) as string[];

  const cookieToken = cookieCandidates.find(Boolean);
  if (cookieToken) {
    return cookieToken.startsWith("Bearer ") ? cookieToken : `Bearer ${cookieToken}`;
  }

  // Auto fetch token
  try {
    const loginRes = await fetch("https://iam.biso24.org/v1/auth/login", {
      method: "POST",
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "vi,en-US;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "domain": "gtel-ots.biso24.net",
        "origin": "https://gtel-ots.biso24.net",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "referer": "https://gtel-ots.biso24.net/",
        "sec-ch-ua": "\"Google Chrome\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
      },
      body: JSON.stringify({ "email": "tuan.cna@ots.vn", "password": "AnhTuan@123", "orgId": null })
    });

    if (loginRes.ok) {
      const loginData = await loginRes.json();
      const fetchedToken = loginData?.data?.token;
      if (fetchedToken) {
        return `Bearer ${fetchedToken}`;
      }
    }
  } catch (err) {
    console.error("Auto login failed:", err);
  }

  return DEFAULT_AUTHORIZATION;
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDuration(start?: string, end?: string) {
  if (!start || !end) return "-";

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "-";
  }

  const diffMs = Math.max(endDate.getTime() - startDate.getTime(), 0);
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return `${diffDays} Day${diffDays > 1 ? "s" : ""}`;
}

function mapStatus(status?: string) {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "WAITING":
    case "WAITING_FOR_APPROVAL":
    case "PROCESSING":
      return "Pending";
    case "REJECTED":
      return "Rejected";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status || "Unknown";
  }
}

function mapLeaveRequest(item: ExternalLeaveRequestItem) {
  // Ngày làm việc từ requestData, fallback về registrationDate
  const workingDate = item.requestData?.workingDate || item.registrationDate;

  // Loại đơn: tên ca hoặc requestCategoryCode
  const typeName =
    item.requestData?.workShiftItem?.name ||
    item.requestCategoryCode ||
    "Leave Request";

  // Thông tin nhân viên từ employeeDetail
  const fullName = item.employeeDetail?.fullName || "-";
  const staffCode = item.employeeDetail?.staffCode || "-";
  const departmentName = item.employeeDetail?.departmentName || "-";
  const positionName = item.employeeDetail?.positionName || "-";

  // Trạng thái
  const reqStatus = item.status;

  // Người duyệt: ưu tiên approvedBy root, sau đó tìm trong approvalSteps đã APPROVED
  let approvedByName = "-";
  if (item.approvedBy?.fullName) {
    approvedByName = item.approvedBy.fullName;
  } else if (Array.isArray(item.approvalSteps)) {
    const approvedSteps = item.approvalSteps
      .filter((s) => s.status === "APPROVED" || s.status === "SENT")
      .map((s) => s.approvedBy?.fullName)
      .filter(Boolean);
    if (approvedSteps.length > 0) {
      approvedByName = approvedSteps.join(", ");
    }
  }

  // Người sẽ duyệt tiếp theo
  const nextApprover = item.approvalForNextStep?.fullName || null;

  return {
    id: item.id || item._id || crypto.randomUUID(),
    type: typeName,
    fullName,
    staffCode,
    departmentName,
    positionName,
    start_date: formatDate(workingDate),
    end_date: formatDate(workingDate), // đơn chỉ có 1 ngày
    time_in: item.requestData?.timeIn || null,
    time_out: item.requestData?.timeOut || null,
    status: mapStatus(reqStatus),
    approved_by: approvedByName,
    next_approver: nextApprover,
    notes: item.notes || "",
    created_at: item.createdAt || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = await extractBearerToken(request);

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "20")));
    const q = searchParams.get("q") || DEFAULT_QUERY;
    const staffCode = searchParams.get("staffCode");
    const planYear = searchParams.get("planYear");
    const requestCategoryCode = searchParams.get("requestCategoryCode");

    const externalParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (q && q !== "leave") {
      externalParams.append("q", q);
    }
    if (staffCode) {
      externalParams.append("staffCode", staffCode);
    }
    if (planYear) {
      externalParams.append("planYear", planYear);
    }
    // Truyền requestCategoryCode: LEAVE (nghỉ phép), UPDATE_ATTENDANCE (cập nhật công)
    if (requestCategoryCode) {
      externalParams.append("requestCategoryCode", requestCategoryCode);
    }

    const externalResponse = await fetch(`${EXTERNAL_API_URL}?${externalParams.toString()}`, {
      method: "GET",
      headers: {
        accept: DEFAULT_ACCEPT,
        "accept-language": DEFAULT_ACCEPT_LANGUAGE,
        authorization: token,
        domain: DEFAULT_DOMAIN,
        origin: DEFAULT_ORIGIN,
        priority: DEFAULT_PRIORITY,
        referer: DEFAULT_REFERER,
        "sec-ch-ua": DEFAULT_SEC_CH_UA,
        "sec-ch-ua-mobile": DEFAULT_SEC_CH_UA_MOBILE,
        "sec-ch-ua-platform": DEFAULT_SEC_CH_UA_PLATFORM,
        "sec-fetch-dest": DEFAULT_SEC_FETCH_DEST,
        "sec-fetch-mode": DEFAULT_SEC_FETCH_MODE,
        "sec-fetch-site": DEFAULT_SEC_FETCH_SITE,
        "user-agent": DEFAULT_USER_AGENT,
      },
      cache: "no-store",
    });

    const payload = (await externalResponse.json()) as ExternalLeaveResponse;

    if (!externalResponse.ok || !payload?.success) {
      return NextResponse.json(
        {
          success: false,
          message: payload?.message || "Failed to fetch leave requests",
          data: [],
          pagination: {
            page,
            pageSize: limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: page > 1,
          },
        },
        { status: externalResponse.status || 502 }
      );
    }

    const rawData = payload.data?.data || [];
    const total = payload.data?.total || 0;
    const totalPages = payload.data?.totalPages || 0;
    const currentPage = payload.data?.page || page;
    const currentLimit = payload.data?.limit || limit;

    return NextResponse.json({
      success: true,
      message: payload.message || "OK",
      data: rawData.map(mapLeaveRequest),
      pagination: {
        page: currentPage,
        pageSize: currentLimit,
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch leave requests",
        data: [],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      { status: 500 }
    );
  }
}
