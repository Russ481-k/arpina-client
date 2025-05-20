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
    // privateApi.get<T>는 AxiosResponse<T>["data"]를 반환하므로, T는 ProfileDto이거나
    // ProfileDto를 포함하는 래퍼 객체일 수 있습니다.
    const responseData: any = await privateApi.get<any>(
      `${MYPAGE_API_BASE_URL}/profile`
    );

    // console.log("getProfile - responseData from privateApi.get:", responseData); // 디버깅 로그

    if (responseData && typeof responseData === "object") {
      // 경우 1: responseData 자체가 ProfileDto인 경우 (주요 필드 존재 여부로 확인)
      if (
        "userId" in responseData &&
        "name" in responseData &&
        "phone" in responseData
      ) {
        return responseData as ProfileDto;
      }
      // 경우 2: responseData가 { data: ProfileDto, ... } 형태의 래퍼 객체인 경우
      if (
        responseData.data &&
        typeof responseData.data === "object" &&
        responseData.data !== null &&
        "userId" in responseData.data &&
        "name" in responseData.data &&
        "phone" in responseData.data
      ) {
        return responseData.data as ProfileDto;
      }
    }

    // 위의 두 경우에 해당하지 않으면, 예상치 못한 구조이거나 필수 데이터가 누락된 것입니다.
    console.error(
      "Failed to parse profile data from API or missing essential fields. Received:",
      responseData
    );
    // 이 경우, 사용자에게 오류를 알리거나, 안전한 기본값을 반환하거나, 에러를 throw해야 합니다.
    // 개발 중에는 에러를 throw하여 문제를 빠르게 인지하는 것이 좋습니다.
    throw new Error(
      "Invalid or unexpected profile data structure received from API."
    );
    // 또는, 빈 ProfileDto 객체를 반환하여 UI가 깨지지 않도록 할 수도 있습니다.
    // return { name: "", userId: "", phone: "", address: "", email: "", carNo: "" } as ProfileDto;
  },
  updateProfile: async (
    data: Partial<ProfileDto>,
    currentPassword?: string
  ): Promise<ProfileDto> => {
    // 비밀번호 인증이 필요한 경우
    const payload = currentPassword
      ? { ...data, currentPassword } // 백엔드에서 currentPassword로 인증 처리
      : data;

    // Assuming response is the updated ProfileDto
    const response = await privateApi.patch<ProfileDto>(
      `${MYPAGE_API_BASE_URL}/profile`,
      payload
    );
    return response.data;
  },

  // 3.2 비밀번호 (Pass & Temp)
  changePassword: async (data: PasswordChangeDto): Promise<void> => {
    // Spec says 200, implies void or a simple success message
    await privateApi.patch<void>(`${MYPAGE_API_BASE_URL}/password`, data);
  },
  requestTemporaryPassword: async (
    data: TemporaryPasswordRequestDto
  ): Promise<void> => {
    // Spec says "Sent", implies void
    await privateApi.post<void>(`${MYPAGE_API_BASE_URL}/password/temp`, data);
  },

  // 3.3 수영장 신청 & 결제 (Enroll)
  getEnrollments: async (
    params?: GetEnrollmentsParams
  ): Promise<EnrollDto[]> => {
    // Spec: List<EnrollDto>
    const response = await privateApi.get<EnrollDto[]>(
      `${MYPAGE_API_BASE_URL}/enroll`,
      {
        params,
      }
    );
    return response.data;
  },
  getEnrollmentById: async (id: number): Promise<EnrollDto> => {
    const response = await privateApi.get<EnrollDto>(
      `${MYPAGE_API_BASE_URL}/enroll/${id}`
    );
    return response.data;
  },
  checkoutEnrollment: async (id: number): Promise<CheckoutDto> => {
    const response = await privateApi.post<CheckoutDto>(
      `${MYPAGE_API_BASE_URL}/enroll/${id}/checkout`
    );
    return response.data;
  },
  payEnrollment: async (id: number, data: PayRequestDto): Promise<void> => {
    // Spec says 200 / Error
    await privateApi.post<void>(
      `${MYPAGE_API_BASE_URL}/enroll/${id}/pay`,
      data
    );
  },
  cancelEnrollment: async (
    id: number,
    data: CancelEnrollmentRequestDto
  ): Promise<void> => {
    // Spec says "Requested"
    await privateApi.patch<void>(
      `${MYPAGE_API_BASE_URL}/enroll/${id}/cancel`,
      data
    );
  },
  renewEnrollment: async (data: RenewalRequestDto): Promise<EnrollDto> => {
    // Spec says "Created", assuming returns created/updated EnrollDto
    const response = await privateApi.post<EnrollDto>(
      `${MYPAGE_API_BASE_URL}/renewal`,
      data
    );
    return response.data;
  },

  // 3.4 결제 내역 (Payment)
  getPayments: async (params?: GetPaymentsParams): Promise<PaymentDto[]> => {
    // Spec: List<PaymentDto>
    const response = await privateApi.get<PaymentDto[]>(
      `${MYPAGE_API_BASE_URL}/payment`,
      {
        params,
      }
    );
    return response.data;
  },
  requestPaymentCancel: async (paymentId: number): Promise<void> => {
    // Spec says "Requested"
    // The spec URL is /payment/{id}/cancel, which implies it's a POST, but often cancel can be PATCH or DELETE too.
    // Sticking to POST as per example cURL and lack of other indicators.
    await privateApi.post<void>(
      `${MYPAGE_API_BASE_URL}/payment/${paymentId}/cancel`
    );
  },
};

// Note: The spec mentions a response wrapper: { status, data, message }.
// The current client.ts setup with privateApi.get, .post, etc., directly returns the `data` part.
// So the Promise<DtoType> is appropriate here. If the wrapper was to be handled client-side for each call,
// the return types would need to be adjusted, e.g., Promise<ApiResponse<DtoType>> where ApiResponse includes status, data, message.
