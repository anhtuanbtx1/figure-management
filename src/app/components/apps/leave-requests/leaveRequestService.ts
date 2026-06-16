export interface LeaveRequestRow {
  id: string;
  type: string;
  fullName: string;
  staffCode: string;
  start_date: string;
  end_date: string;
  status: string;
  approved_by: string;
  notes: string;
  created_at: string | null;
}

export interface LeaveRequestCounts {
  countLeave?: number;
  countTKRequest?: number;
  countTKEmployee?: number;
  countBusinessTrip?: number;
  countWSRegistration?: number;
  countPaycheckEmployee?: number;
}

export interface LeaveRequestListResponse {
  success: boolean;
  message?: string;
  data: LeaveRequestRow[];
  counts: LeaveRequestCounts | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type RequestCategoryCode = "LEAVE" | "UPDATE_ATTENDANCE";

export const REQUEST_CATEGORY_CODES: RequestCategoryCode[] = ["LEAVE", "UPDATE_ATTENDANCE"];

export async function fetchLeaveRequests(
  page = 1,
  limit = 20,
  q = "leave",
  staffCode?: string,
  requestCategoryCode?: RequestCategoryCode
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    q,
  });

  if (staffCode) {
    params.append("staffCode", staffCode);
  }
  // LEAVE = nghỉ phép, UPDATE_ATTENDANCE = cập nhật công
  if (requestCategoryCode) {
    params.append("requestCategoryCode", requestCategoryCode);
  }

  const response = await fetch(`/api/leave-requests?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as LeaveRequestListResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to fetch leave requests");
  }

  return payload;
}
