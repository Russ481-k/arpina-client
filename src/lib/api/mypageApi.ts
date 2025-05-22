import { privateApi } from "./client";
import {
  MypageEnrollDto,
  MypagePaymentDto,
  MypageRenewalRequestDto,
} from "@/types/api";
import { withAuthRedirect } from "./withAuthRedirect";

// --- Common Query String Parameters (for reference, used in function signatures) ---
// interface PageParams {
//   page?: number; // 1-based
//   size?: number; // rows per page
//   sort?: string; // '+field' ASC / '-field' DESC
// }

// --- 4. Schemas (DTOs) ---

// 4.1 ProfileDto
export interface ProfileDto {
  name: string;
  userId: string;
  phone: string;
  address: string;
  email: string;
  carNo: string;
}

// 4.2 PasswordChangeDto
export interface PasswordChangeDto {
  currentPw: string;
  newPw: string;
}

// For POST /password/temp
export interface TemporaryPasswordRequestDto {
  userId: string;
}

// For GET /enroll QS
export interface GetEnrollmentsParams {
  status?: "UNPAID" | "PAID" | "PAYMENT_TIMEOUT" | "CANCELED_UNPAID" | string;
  page?: number;
  size?: number;
  sort?: string;
}

// For PATCH /enroll/{id}/cancel
export interface CancelEnrollmentRequestDto {
  reason: string;
}

// For GET /payment QS
export interface GetPaymentsParams {
  page?: number;
  size?: number;
  sort?: string;
}

interface ApiError extends Error {
  status?: number;
  isNoDataAuthError?: boolean;
}

// --- API Base URL ---
const MYPAGE_API_BASE_URL = "/mypage";

// --- API Object ---
export const mypageApi = {
  // 3.1 회원정보 (Profile)
  getProfile: withAuthRedirect(async (): Promise<ProfileDto> => {
    const response = await privateApi.get<ProfileDto>(
      `${MYPAGE_API_BASE_URL}/profile`
    );
    const profile = response.data;

    if (!profile || !profile.userId || !profile.name) {
      const noDataError = new Error(
        "User profile data not available or essential fields are missing."
      ) as ApiError;
      noDataError.status = 401;
      noDataError.isNoDataAuthError = true;
      throw noDataError;
    }

    return profile;
  }),
  updateProfile: async (
    data: Partial<ProfileDto>,
    currentPassword?: string
  ): Promise<ProfileDto> => {
    const payload = currentPassword ? { ...data, currentPassword } : data;
    const response = await privateApi.patch<ProfileDto>(
      `${MYPAGE_API_BASE_URL}/profile`,
      payload
    );
    const updatedProfile = response.data;
    if (!updatedProfile || !updatedProfile.userId) {
      throw new Error("Invalid structure for updated profile data.");
    }
    return updatedProfile;
  },

  // 3.2 비밀번호 (Pass & Temp)
  changePassword: async (data: PasswordChangeDto): Promise<void> => {
    await privateApi.patch<void>(`${MYPAGE_API_BASE_URL}/password`, data);
  },
  requestTemporaryPassword: async (
    data: TemporaryPasswordRequestDto
  ): Promise<void> => {
    await privateApi.post<void>(`${MYPAGE_API_BASE_URL}/password/temp`, data);
  },

  // 3.3 수영장 신청 & 결제 (Enroll)
  getEnrollments: async (
    params?: GetEnrollmentsParams
  ): Promise<MypageEnrollDto[]> => {
    const response = await privateApi.get<MypageEnrollDto[]>(
      `${MYPAGE_API_BASE_URL}/enroll`,
      { params }
    );
    const enrollments = response.data;
    if (!Array.isArray(enrollments)) {
      throw new Error("Invalid structure for enrollments data.");
    }
    return enrollments;
  },
  getEnrollmentById: async (id: number): Promise<MypageEnrollDto> => {
    const response = await privateApi.get<MypageEnrollDto>(
      `${MYPAGE_API_BASE_URL}/enroll/${id}`
    );
    const enrollment = response.data;
    if (!enrollment || typeof enrollment.enrollId !== "number") {
      throw new Error("Invalid structure for enrollment data.");
    }
    return enrollment;
  },

  /**
   * @deprecated The checkout flow is now handled by the KISPG payment page.
   * See swimmingPaymentService.enrollLesson and the /payment/process page.
   */
  checkoutEnrollment: async (): Promise<never> => {
    console.warn("mypageApi.checkoutEnrollment is deprecated.");
    return Promise.reject(
      new Error(
        "mypageApi.checkoutEnrollment is deprecated and should not be called."
      )
    );
  },

  /**
   * @deprecated Payment is now handled by the KISPG payment page flow.
   */
  payEnrollment: async (): Promise<never> => {
    console.warn("mypageApi.payEnrollment is deprecated.");
    return Promise.reject(
      new Error(
        "mypageApi.payEnrollment is deprecated and should not be called."
      )
    );
  },

  cancelEnrollment: async (
    id: number,
    data: CancelEnrollmentRequestDto
  ): Promise<void> => {
    await privateApi.patch<void>(
      `${MYPAGE_API_BASE_URL}/enroll/${id}/cancel`,
      data
    );
  },

  /**
   * @deprecated Renewal is now handled by swimmingPaymentService.renewalLesson to align with KISPG flow.
   * That service returns EnrollInitiationResponseDto.
   */
  renewEnrollment: async (data: MypageRenewalRequestDto): Promise<never> => {
    console.warn(
      "mypageApi.renewEnrollment is deprecated. Use swimmingPaymentService.renewalLesson instead."
    );
    return Promise.reject(
      new Error(
        "mypageApi.renewEnrollment is deprecated and should not be called."
      )
    );
  },

  // 3.4 결제 내역 (Payment)
  getPayments: async (
    params?: GetPaymentsParams
  ): Promise<MypagePaymentDto[]> => {
    const response = await privateApi.get<MypagePaymentDto[]>(
      `${MYPAGE_API_BASE_URL}/payment`,
      { params }
    );
    const payments = response.data;
    if (!Array.isArray(payments)) {
      throw new Error("Invalid structure for payments data.");
    }
    return payments;
  },
  requestPaymentCancel: async (
    paymentId: number,
    reason?: string
  ): Promise<void> => {
    const payload = reason ? { reason } : {};
    await privateApi.post<void>(
      `${MYPAGE_API_BASE_URL}/payment/${paymentId}/cancel`,
      payload
    );
  },
};

// Note: The spec mentions a response wrapper: { status, data, message }.
// The current client.ts setup with privateApi.get, .post, etc., directly returns the `data` part.
// So the Promise<DtoType> is appropriate here. If the wrapper was to be handled client-side for each call,
// the return types would need to be adjusted, e.g., Promise<ApiResponse<DtoType>> where ApiResponse includes status, data, message.
