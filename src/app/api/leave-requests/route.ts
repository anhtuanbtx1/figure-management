import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_URL = "https://biso24-gateway-api.biso24.net/v1/leaves";
const DEFAULT_AUTHORIZATION = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODBhODI3Nzc1N2QxNTRlMmZhN2FlYiIsIm9yZ0lkIjoiNjc0MDUzZTVmM2JkYWZkMjQyODI2YTdiIiwiaWF0IjoxNzczMzY0MjcwLCJleHAiOjE3NzQ1NzM4NzB9.B9XY6YhiLVSRyylU__1VmKey5gLREwdvyOuvAUUclKE";
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

interface ExternalLeaveRequestItem {
  _id?: string;
  id?: string;
  requestStatus?: string;
  createdAt?: string;
  employeeId?: {
    fullName?: string;
    staffCode?: string;
  };
  approvedBy?: {
    fullName?: string;
  };
  details?: {
    date?: string;
    toDate?: string;
    notes?: string;
    typeLeave?: {
      name?: string;
    };
  };
}

interface ExternalLeaveResponse {
  success?: boolean;
  message?: string;
  data?: {
    total?: number;
    limit?: number;
    page?: number;
    totalPages?: number;
    data?: ExternalLeaveRequestItem[];
    count?: {
      countLeave?: number;
      countTKRequest?: number;
      countTKEmployee?: number;
      countBusinessTrip?: number;
      countWSRegistration?: number;
      countPaycheckEmployee?: number;
    };
  };
}

function extractBearerToken(request: NextRequest) {
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
      return "Pending";
    case "REJECTED":
      return "Rejected";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status || "Unknown";
  }
}

function mapLeaveRequest(item: any) {
  const startDate = item.details?.date || item.fromDate;
  const endDate = item.details?.toDate || item.toDate;

  const typeName = item.details?.typeLeave?.name || item.leaveConfigurationId?.name || "Leave Request";
  const fullName = item.employeeId?.fullName || item.employeeDetails?.fullName || "-";
  const staffCode = item.employeeId?.staffCode || item.employeeDetails?.staffCode || "-";
  const reqStatus = item.requestStatus || item.status;

  let approvedByName = "-";
  if (Array.isArray(item.approvedBy)) {
    approvedByName = item.approvedBy.map((x: any) => x.fullName).join(", ") || "-";
  } else if (item.approvedBy) {
    approvedByName = item.approvedBy.fullName || "-";
  }

  return {
    id: item.id || item._id || crypto.randomUUID(),
    type: typeName,
    fullName: fullName,
    staffCode: staffCode,
    start_date: formatDate(startDate),
    end_date: formatDate(endDate),
    status: mapStatus(reqStatus),
    approved_by: approvedByName,
    notes: item.details?.notes || item.notes || "",
    created_at: item.createdAt || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request);

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "20")));
    const q = searchParams.get("q") || DEFAULT_QUERY;
    const staffCode = searchParams.get("staffCode");
    const planYear = searchParams.get("planYear");

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
      counts: payload.data?.count || null,
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
