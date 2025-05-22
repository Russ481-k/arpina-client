import { privateApiMethods } from "./client";
import {
  LessonDto,
  LockerInventoryDto,
  LockerInventoryUpdateDto,
  EnrollAdminResponseDto,
  CancelRequestDto,
  PaymentAdminDto,
  SummaryDto,
  PaginationParams,
  PaginatedResponse,
  ApiResponse, // Assuming a generic response wrapper might be used by admin APIs
} from "@/types/api";

const ADMIN_API_BASE_URL = "/api/v1/admin";

export const adminApi = {
  // --- Lesson Management ---
  getAdminLessons: (
    params?: PaginationParams & { status?: string }
  ): Promise<PaginatedResponse<LessonDto>> => {
    return privateApiMethods.get<PaginatedResponse<LessonDto>>(
      `${ADMIN_API_BASE_URL}/swimming/lessons`,
      { params }
    );
  },

  getAdminLessonById: (lessonId: number): Promise<LessonDto> => {
    return privateApiMethods.get<LessonDto>(
      `${ADMIN_API_BASE_URL}/swimming/lessons/${lessonId}`
    );
  },

  createAdminLesson: (
    data: LessonDto
  ): Promise<ApiResponse<{ id: number }>> => {
    // Assuming response gives new ID
    return privateApiMethods.post<ApiResponse<{ id: number }>, LessonDto>(
      `${ADMIN_API_BASE_URL}/swimming/lesson`,
      data
    );
  },

  updateAdminLesson: (
    lessonId: number,
    data: LessonDto
  ): Promise<ApiResponse<null>> => {
    // Assuming 200 OK with no specific body for update
    return privateApiMethods.put<ApiResponse<null>, LessonDto>(
      `${ADMIN_API_BASE_URL}/swimming/lesson/${lessonId}`,
      data
    );
  },

  cloneAdminLesson: (
    lessonId: number,
    month: string // e.g., "2025-08"
  ): Promise<ApiResponse<{ newLessonId: number }>> => {
    return privateApiMethods.post<
      ApiResponse<{ newLessonId: number }>,
      { month: string }
    >(`${ADMIN_API_BASE_URL}/swimming/lesson/${lessonId}/clone`, { month });
  },

  // --- Locker Inventory ---
  getLockerInventory: (): Promise<LockerInventoryDto[]> => {
    return privateApiMethods.get<LockerInventoryDto[]>(
      `${ADMIN_API_BASE_URL}/swimming/lockers/inventory`
    );
  },

  updateLockerInventory: (
    gender: "MALE" | "FEMALE",
    data: LockerInventoryUpdateDto
  ): Promise<ApiResponse<null>> => {
    return privateApiMethods.put<ApiResponse<null>, LockerInventoryUpdateDto>(
      `${ADMIN_API_BASE_URL}/swimming/lockers/inventory/${gender}`,
      data
    );
  },

  // --- Enroll Management ---
  getAdminEnrollments: (
    params?: PaginationParams & { status?: string; lessonId?: number }
  ): Promise<PaginatedResponse<EnrollAdminResponseDto>> => {
    return privateApiMethods.get<PaginatedResponse<EnrollAdminResponseDto>>(
      `${ADMIN_API_BASE_URL}/swimming/enrolls`,
      { params }
    );
  },

  // --- Cancellation Management ---
  getAdminCancelRequests: (
    params?: PaginationParams & { status?: string } // status=PENDING typically
  ): Promise<PaginatedResponse<CancelRequestDto>> => {
    return privateApiMethods.get<PaginatedResponse<CancelRequestDto>>(
      `${ADMIN_API_BASE_URL}/swimming/enrolls/cancel-requests`,
      { params }
    );
  },

  approveAdminCancelRequest: (
    enrollId: number,
    adminComment?: string
  ): Promise<ApiResponse<null>> => {
    return privateApiMethods.post<ApiResponse<null>, { adminComment?: string }>(
      `${ADMIN_API_BASE_URL}/swimming/enrolls/${enrollId}/approve-cancel`,
      { adminComment }
    );
  },

  denyAdminCancelRequest: (
    enrollId: number,
    comment: string
  ): Promise<ApiResponse<null>> => {
    return privateApiMethods.post<ApiResponse<null>, { comment: string }>(
      `${ADMIN_API_BASE_URL}/swimming/enrolls/${enrollId}/deny-cancel`,
      { comment }
    );
  },

  // --- Payment Management ---
  getAdminPayments: (
    params?: PaginationParams & {
      period?: string;
      status?: string;
      pg_tid?: string;
    }
  ): Promise<PaymentAdminDto[]> => {
    // Doc says List<PaymentAdminDto>, not Paginated
    return privateApiMethods.get<PaymentAdminDto[]>(
      `${ADMIN_API_BASE_URL}/payment`,
      { params }
    );
  },

  manualAdminRefund: (
    paymentId: number,
    data: { amount: number; reason: string; tid?: string } // tid might be KISPG's for external tracking
  ): Promise<ApiResponse<null>> => {
    return privateApiMethods.post<
      ApiResponse<null>,
      { amount: number; reason: string; tid?: string }
    >(`${ADMIN_API_BASE_URL}/payment/${paymentId}/manual-refund`, data);
  },

  // --- Stats ---
  getAdminStatsSummary: (month?: string): Promise<SummaryDto> => {
    return privateApiMethods.get<SummaryDto>(
      `${ADMIN_API_BASE_URL}/stats/summary`,
      { params: { month } }
    );
  },

  // --- System Logs ---
  getAdminCronLogs: (
    jobName?: string,
    params?: PaginationParams // Assuming logs might be paginated
  ): Promise<PaginatedResponse<any>> => {
    // DTO for cron log item not specified, using any
    return privateApiMethods.get<PaginatedResponse<any>>(
      `${ADMIN_API_BASE_URL}/system/cron-log`,
      { params: { jobName, ...params } }
    );
  },

  getAdminWebhookLogs: (
    date?: string,
    tid?: string,
    params?: PaginationParams // Assuming logs might be paginated
  ): Promise<PaginatedResponse<any>> => {
    // DTO for webhook log item not specified, using any
    return privateApiMethods.get<PaginatedResponse<any>>(
      `${ADMIN_API_BASE_URL}/system/webhook-log/kispg`,
      { params: { date, tid, ...params } }
    );
  },
};
