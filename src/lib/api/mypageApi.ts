import { privateApi } from "./client";

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
  userId: string; // Assuming this is the userId, spec says "...".
}

// 4.3 EnrollDto
export interface EnrollDto {
  enrollId: number;
  lesson: {
    title: string;
    period: string;
    time: string;
    price: number;
  };
  status: "UNPAID" | "PAID" | "CANCELED" | "CANCELED_UNPAID"; // From DDL, spec is more brief
  expireDt: string; // ISO DateTime string
  locker: {
    id: number;
    zone: string;
    carryOver: boolean;
  } | null; // Locker can be null
  renewalWindow: {
    open: string; // ISO DateTime string
    close: string; // ISO DateTime string
  } | null; // Renewal window can be null
}

// For GET /enroll QS
export interface GetEnrollmentsParams {
  status?: "UNPAID" | "PAID" | "CANCELED" | "CANCELED_UNPAID" | string; // Allow string for flexibility if backend supports more
  page?: number;
  size?: number;
  sort?: string;
}

// 4.4 CheckoutDto (Response from /enroll/{id}/checkout)
export interface CheckoutDto {
  merchantUid: string;
  amount: number;
  lessonTitle: string;
  userName: string;
  pgProvider: string;
}

// For POST /enroll/{id}/pay
export interface PayRequestDto {
  pgToken: string;
}

// For PATCH /enroll/{id}/cancel
export interface CancelEnrollmentRequestDto {
  reason: string;
}

// 4.5 RenewalRequestDto
export interface RenewalRequestDto {
  lessonId: number;
  carryLocker: boolean;
}

// 4.6 PaymentDto
export interface PaymentDto {
  paymentId: number;
  enrollId: number;
  amount: number;
  paidAt: string; // ISO DateTime string
  status: "SUCCESS" | "CANCELED" | "PARTIAL" | "REFUND_REQUESTED";
}

// For GET /payment QS
export interface GetPaymentsParams {
  page?: number;
  size?: number;
  sort?: string;
}

// --- API Base URL ---
const MYPAGE_API_BASE_URL = "/mypage";

// --- API Object ---
export const mypageApi = {
  // 3.1 회원정보 (Profile)
  getProfile: async (): Promise<ProfileDto> => {
    return privateApi.get<ProfileDto>(`${MYPAGE_API_BASE_URL}/profile`);
  },
  updateProfile: async (data: Partial<ProfileDto>): Promise<ProfileDto> => {
    // Assuming response is the updated ProfileDto
    return privateApi.patch<ProfileDto>(`${MYPAGE_API_BASE_URL}/profile`, data);
  },

  // 3.2 비밀번호 (Pass & Temp)
  changePassword: async (data: PasswordChangeDto): Promise<void> => {
    // Spec says 200, implies void or a simple success message
    return privateApi.patch<void>(`${MYPAGE_API_BASE_URL}/password`, data);
  },
  requestTemporaryPassword: async (
    data: TemporaryPasswordRequestDto
  ): Promise<void> => {
    // Spec says "Sent", implies void
    return privateApi.post<void>(`${MYPAGE_API_BASE_URL}/password/temp`, data);
  },

  // 3.3 수영장 신청 & 결제 (Enroll)
  getEnrollments: async (
    params?: GetEnrollmentsParams
  ): Promise<EnrollDto[]> => {
    // Spec: List<EnrollDto>
    return privateApi.get<EnrollDto[]>(`${MYPAGE_API_BASE_URL}/enroll`, {
      params,
    });
  },
  getEnrollmentById: async (id: number): Promise<EnrollDto> => {
    return privateApi.get<EnrollDto>(`${MYPAGE_API_BASE_URL}/enroll/${id}`);
  },
  checkoutEnrollment: async (id: number): Promise<CheckoutDto> => {
    return privateApi.post<CheckoutDto>(
      `${MYPAGE_API_BASE_URL}/enroll/${id}/checkout`
    );
  },
  payEnrollment: async (id: number, data: PayRequestDto): Promise<void> => {
    // Spec says 200 / Error
    return privateApi.post<void>(
      `${MYPAGE_API_BASE_URL}/enroll/${id}/pay`,
      data
    );
  },
  cancelEnrollment: async (
    id: number,
    data: CancelEnrollmentRequestDto
  ): Promise<void> => {
    // Spec says "Requested"
    return privateApi.patch<void>(
      `${MYPAGE_API_BASE_URL}/enroll/${id}/cancel`,
      data
    );
  },
  renewEnrollment: async (data: RenewalRequestDto): Promise<EnrollDto> => {
    // Spec says "Created", assuming returns created/updated EnrollDto
    return privateApi.post<EnrollDto>(`${MYPAGE_API_BASE_URL}/renewal`, data);
  },

  // 3.4 결제 내역 (Payment)
  getPayments: async (params?: GetPaymentsParams): Promise<PaymentDto[]> => {
    // Spec: List<PaymentDto>
    return privateApi.get<PaymentDto[]>(`${MYPAGE_API_BASE_URL}/payment`, {
      params,
    });
  },
  requestPaymentCancel: async (paymentId: number): Promise<void> => {
    // Spec says "Requested"
    // The spec URL is /payment/{id}/cancel, which implies it's a POST, but often cancel can be PATCH or DELETE too.
    // Sticking to POST as per example cURL and lack of other indicators.
    return privateApi.post<void>(
      `${MYPAGE_API_BASE_URL}/payment/${paymentId}/cancel`
    );
  },
};

// Note: The spec mentions a response wrapper: { status, data, message }.
// The current client.ts setup with privateApi.get, .post, etc., directly returns the `data` part.
// So the Promise<DtoType> is appropriate here. If the wrapper was to be handled client-side for each call,
// the return types would need to be adjusted, e.g., Promise<ApiResponse<DtoType>> where ApiResponse includes status, data, message.
