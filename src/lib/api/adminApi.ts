import { privateApi } from "./client"; // Assuming CMS uses the same authenticated client
import type {
  AdminLessonDto,
  CloneLessonRequestDto,
  LockerInventoryDto,
  LockerInventoryUpdateRequestDto,
  EnrollAdminResponseDto,
  AdminCancelEnrollmentRequestDto,
  UpdateDiscountStatusRequestDto,
  UserMemoDto,
  CancelRequestAdminDto,
  ApproveCancelRequestDto,
  DenyCancelRequestDto,
  PaymentAdminDto,
  ManualRefundRequestDto,
  CronLogDto,
  WebhookLogDto,
  // Assuming these are defined in @/types/api or a common place
  PaginationParams,
  PaginatedResponse,
} from "@/types/api";

const CMS_API_BASE = "/cms";

export const adminApi = {
  // Lesson Management
  getAdminLessons: async (
    params?: PaginationParams & {
      status?: string;
      year?: number;
      month?: number;
    }
  ): Promise<PaginatedResponse<AdminLessonDto>> => {
    const response = await privateApi.get<PaginatedResponse<AdminLessonDto>>(
      `${CMS_API_BASE}/lessons`,
      { params }
    );
    return response.data;
  },
  getAdminLessonById: async (lessonId: number): Promise<AdminLessonDto> => {
    const response = await privateApi.get<AdminLessonDto>(
      `${CMS_API_BASE}/lessons/${lessonId}`
    );
    return response.data;
  },
  createAdminLesson: async (data: AdminLessonDto): Promise<AdminLessonDto> => {
    const response = await privateApi.post<AdminLessonDto>(
      `${CMS_API_BASE}/lessons`,
      data
    );
    return response.data;
  },
  updateAdminLesson: async (
    lessonId: number,
    data: AdminLessonDto
  ): Promise<AdminLessonDto> => {
    const response = await privateApi.put<AdminLessonDto>(
      `${CMS_API_BASE}/lessons/${lessonId}`,
      data
    );
    return response.data;
  },
  deleteAdminLesson: async (lessonId: number): Promise<void> => {
    await privateApi.delete<void>(`${CMS_API_BASE}/lessons/${lessonId}`);
  },
  cloneAdminLesson: async (
    lessonId: number,
    data: CloneLessonRequestDto
  ): Promise<AdminLessonDto> => {
    const response = await privateApi.post<AdminLessonDto>(
      `${CMS_API_BASE}/lessons/${lessonId}/clone`,
      data
    );
    return response.data;
  },

  // Locker Inventory Management
  getLockerInventory: async (): Promise<LockerInventoryDto[]> => {
    const response = await privateApi.get<LockerInventoryDto[]>(
      `${CMS_API_BASE}/lockers/inventory`
    );
    return response.data;
  },
  updateLockerInventory: async (
    gender: "MALE" | "FEMALE",
    data: LockerInventoryUpdateRequestDto
  ): Promise<LockerInventoryDto> => {
    const response = await privateApi.put<LockerInventoryDto>(
      `${CMS_API_BASE}/lockers/inventory/${gender}`,
      data
    );
    return response.data;
  },

  // Enrollment Management
  getAdminEnrollments: async (
    params?: PaginationParams & {
      year?: number;
      month?: number;
      lessonId?: number;
      userId?: string;
      payStatus?: string;
    }
  ): Promise<PaginatedResponse<EnrollAdminResponseDto>> => {
    const response = await privateApi.get<
      PaginatedResponse<EnrollAdminResponseDto>
    >(`${CMS_API_BASE}/enrollments`, { params });
    return response.data;
  },
  getAdminEnrollmentById: async (
    enrollId: number
  ): Promise<EnrollAdminResponseDto> => {
    const response = await privateApi.get<EnrollAdminResponseDto>(
      `${CMS_API_BASE}/enrollments/${enrollId}`
    );
    return response.data;
  },
  adminCancelEnrollment: async (
    enrollId: number,
    data: AdminCancelEnrollmentRequestDto
  ): Promise<EnrollAdminResponseDto> => {
    const response = await privateApi.put<EnrollAdminResponseDto>(
      `${CMS_API_BASE}/enrollments/${enrollId}/admin-cancel`,
      data
    );
    return response.data;
  },
  updateEnrollmentDiscountStatus: async (
    enrollId: number,
    data: UpdateDiscountStatusRequestDto
  ): Promise<EnrollAdminResponseDto> => {
    const response = await privateApi.put<EnrollAdminResponseDto>(
      `${CMS_API_BASE}/enrollments/${enrollId}/discount-status`,
      data
    );
    return response.data;
  },

  // User Memo Management
  createUserMemo: async (
    userId: string,
    data: UserMemoDto
  ): Promise<UserMemoDto> => {
    const response = await privateApi.post<UserMemoDto>(
      `${CMS_API_BASE}/users/${userId}/memo`,
      data
    );
    return response.data;
  },
  getUserMemo: async (userId: string): Promise<UserMemoDto> => {
    const response = await privateApi.get<UserMemoDto>(
      `${CMS_API_BASE}/users/${userId}/memo`
    );
    return response.data;
  },

  // Cancel/Refund Management
  getAdminCancelRequests: async (
    params?: PaginationParams & { status?: string }
  ): Promise<PaginatedResponse<CancelRequestAdminDto>> => {
    const response = await privateApi.get<
      PaginatedResponse<CancelRequestAdminDto>
    >(`${CMS_API_BASE}/enrollments/cancel-requests`, { params });
    return response.data;
  },
  approveAdminCancelRequest: async (
    enrollId: number,
    data: ApproveCancelRequestDto
  ): Promise<EnrollAdminResponseDto> => {
    const response = await privateApi.post<EnrollAdminResponseDto>(
      `${CMS_API_BASE}/enrollments/${enrollId}/approve-cancel`,
      data
    );
    return response.data;
  },
  denyAdminCancelRequest: async (
    enrollId: number,
    data: DenyCancelRequestDto
  ): Promise<EnrollAdminResponseDto> => {
    const response = await privateApi.post<EnrollAdminResponseDto>(
      `${CMS_API_BASE}/enrollments/${enrollId}/deny-cancel`,
      data
    );
    return response.data;
  },

  // Payment Management
  getAdminPayments: async (
    params?: PaginationParams & {
      enrollId?: number;
      userId?: string;
      tid?: string;
      period?: string; // Should define what 'period' means, e.g., YYYY-MM or specific date range
      status?: string;
    }
  ): Promise<PaginatedResponse<PaymentAdminDto>> => {
    const response = await privateApi.get<PaginatedResponse<PaymentAdminDto>>(
      `${CMS_API_BASE}/payments`,
      { params }
    );
    return response.data;
  },
  manualAdminRefund: async (
    paymentId: number,
    data: ManualRefundRequestDto
  ): Promise<PaymentAdminDto> => {
    const response = await privateApi.post<PaymentAdminDto>(
      `${CMS_API_BASE}/payments/${paymentId}/manual-refund`,
      data
    );
    return response.data;
  },

  // System Logs
  getAdminCronLogs: async (
    params?: PaginationParams & { jobName?: string }
  ): Promise<PaginatedResponse<CronLogDto>> => {
    const response = await privateApi.get<PaginatedResponse<CronLogDto>>(
      `${CMS_API_BASE}/system/logs/cron`,
      { params }
    );
    return response.data;
  },
  getAdminWebhookLogs: async (
    params?: PaginationParams & { date?: string; tid?: string }
  ): Promise<PaginatedResponse<WebhookLogDto>> => {
    const response = await privateApi.get<PaginatedResponse<WebhookLogDto>>(
      `${CMS_API_BASE}/system/logs/webhook/kispg`,
      { params }
    );
    return response.data;
  },
};
