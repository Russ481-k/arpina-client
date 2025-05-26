import { api, publicApi } from "./client";
import {
  LessonDTO,
  LockerDTO,
  EnrollRequestDto,
  EnrollResponseDto,
  EnrollDTO,
  CancelRequestDto,
  PaymentRequestDto,
  RenewalDTO,
  RenewalRequestDto,
} from "@/types/swimming";
import { PaginationParams, PaginatedResponse } from "@/types/api";
import { privateApiMethods, publicApiMethods } from "./client";
import {
  EnrollLessonRequestDto,
  EnrollInitiationResponseDto,
  PaymentPageDetailsDto,
  KISPGInitParamsDto,
  PaymentConfirmRequestDto,
  PaymentConfirmResponseDto,
  MypageRenewalRequestDto,
  LessonDto,
} from "@/types/api";
import { withAuthRedirect } from "./withAuthRedirect";

// React Query 키 정의
export const swimmingKeys = {
  all: ["swimming"] as const,
  lessons: () => [...swimmingKeys.all, "lessons"] as const,
  lesson: (id: number) => [...swimmingKeys.lessons(), id] as const,
  lessonsByPeriod: (startDate: string, endDate: string) =>
    [...swimmingKeys.lessons(), "period", startDate, endDate] as const,
  lockers: (gender?: string) =>
    [...swimmingKeys.all, "lockers", gender] as const,
  locker: (id: number) => [...swimmingKeys.lockers(), id] as const,
  enrolls: () => [...swimmingKeys.all, "enrolls"] as const,
  myEnrolls: () => [...swimmingKeys.enrolls(), "my"] as const,
  myEnrollsByStatus: (status: string) =>
    [...swimmingKeys.myEnrolls(), status] as const,
  enroll: (id: number) => [...swimmingKeys.enrolls(), id] as const,
  renewal: () => [...swimmingKeys.all, "renewal"] as const,
};

// 백엔드 응답 타입
interface BackendLessonDTO {
  lessonId: number;
  title: string;
  displayName: string;
  startDate: string;
  endDate: string;
  days: string;
  timePrefix: string;
  timeSlot: string;
  capacity: number;
  remaining: number;
  price: number;
  status: string; // Assumed to be frontend-friendly like "접수중"
  instructorName: string;
  locationName: string;
  registrationStartDateTime: string;
  registrationEndDateTime: string;
}

// Helper to format datetime strings "YYYY-MM-DD HH:mm:ss" to "YYYY.MM.DD HH:mm"
const formatDisplayDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return "정보 없음";
  try {
    const [date, time] = dateTimeString.split(" ");
    if (!date || !time) return dateTimeString;
    const dateParts = date.split("-");
    const timeParts = time.split(":");
    if (dateParts.length !== 3 || timeParts.length < 2) return dateTimeString;

    return `${dateParts.join(".")} ${timeParts[0]}:${timeParts[1]}`;
  } catch (error) {
    console.error("Error formatting dateTimeString:", dateTimeString, error);
    return dateTimeString; // Fallback to original string on error
  }
};

// 백엔드 응답을 프론트엔드 형식으로 변환하는 함수
const mapLessonData = (backendLesson: BackendLessonDTO): LessonDTO => {
  // The backend 'status' field (e.g., "접수중") is now assumed to be directly usable by LessonCard.
  // The old statusMap can be removed if backend statuses are always frontend-friendly.
  // For now, we map directly. If specific transformations are needed, statusMap can be reintroduced.

  return {
    id: backendLesson.lessonId,
    title: backendLesson.title,
    name: backendLesson.displayName, // Using displayName from backend
    startDate: formatDate(backendLesson.startDate), // Uses existing YY년MM월DD일 format
    endDate: formatDate(backendLesson.endDate), // Uses existing YY년MM월DD일 format
    timeSlot: backendLesson.timeSlot,
    timePrefix: backendLesson.timePrefix,
    days: backendLesson.days,
    capacity: backendLesson.capacity,
    remaining: backendLesson.remaining, // Directly use 'remaining' from API (available spots)
    price: backendLesson.price,
    status: backendLesson.status, // Directly using backend status
    reservationId: `${formatDisplayDateTime(
      backendLesson.registrationStartDateTime
    )}부터`,
    receiptId: `${formatDisplayDateTime(
      backendLesson.registrationEndDateTime
    )}까지`,
    instructor: backendLesson.instructorName,
    location: backendLesson.locationName,
  };
};

// 날짜 형식 변환 (YYYY-MM-DD -> YY년MM월DD일)
const formatDate = (dateString: string): string => {
  try {
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;

    const year = parts[0].substring(2); // 2025 -> 25
    const month = parts[1];
    const day = parts[2];

    return `${year}년${month}월${day}일`;
  } catch (error) {
    return dateString;
  }
};

// 강습 목록 조회 (페이징)
export const getLessons = async (
  params: PaginationParams
): Promise<PaginatedResponse<LessonDTO>> => {
  const response = await publicApi.get("/swimming/lessons", { params });

  // 백엔드 응답 데이터 매핑
  const mappedData = {
    ...response.data,
    data: {
      ...response.data.data,
      content: response.data.data.content.map(mapLessonData),
    },
  };

  return mappedData;
};

// 특정 강습 상세 조회
export const getLesson = async (lessonId: number): Promise<LessonDTO> => {
  const response = await api.get(`/swimming/lessons/${lessonId}`);
  return response.data.data;
};

// 특정 기간 강습 목록 조회
export const getLessonsByPeriod = async (
  startDate: string,
  endDate: string
): Promise<LessonDTO[]> => {
  const response = await api.get("/swimming/lessons/period", {
    params: { startDate, endDate },
  });
  return response.data.data;
};

// 사용 가능한 사물함 목록 조회
export const getLockers = async (gender?: string): Promise<LockerDTO[]> => {
  const response = await api.get("/swimming/lockers", {
    params: { gender },
  });
  return response.data.data;
};

// 특정 사물함 상세 조회
export const getLocker = async (lockerId: number): Promise<LockerDTO> => {
  const response = await api.get(`/swimming/lockers/${lockerId}`);
  return response.data.data;
};

// 수업 신청 및 결제
export const enrollLesson = async (
  enrollRequest: EnrollRequestDto
): Promise<EnrollResponseDto> => {
  const response = await api.post("/swimming/enroll", enrollRequest);
  return response.data.data;
};

// 신청 취소
export const cancelEnroll = async (
  enrollId: number,
  cancelRequest: CancelRequestDto
): Promise<EnrollResponseDto> => {
  const response = await api.post(
    `/swimming/enroll/${enrollId}/cancel`,
    cancelRequest
  );
  return response.data.data;
};

// 내 신청 내역 조회
export const getMyEnrolls = async (): Promise<EnrollDTO[]> => {
  const response = await api.get("/swimming/my-enrolls");
  return response.data.data;
};

// 상태별 신청 내역 조회 (페이징)
export const getMyEnrollsByStatus = async (
  status: string,
  params: PaginationParams
): Promise<PaginatedResponse<EnrollDTO>> => {
  const response = await api.get("/swimming/my-enrolls/status", {
    params: { status, ...params },
  });
  return response.data;
};

// 특정 신청 상세 조회
export const getEnroll = async (enrollId: number): Promise<EnrollDTO> => {
  const response = await api.get(`/swimming/enrolls/${enrollId}`);
  return response.data.data;
};

// 결제 처리
export const payEnroll = async (
  paymentRequest: PaymentRequestDto
): Promise<void> => {
  await api.post("/swimming/pay", paymentRequest);
};

// 재등록 안내 조회
export const getRenewalInfo = async (): Promise<RenewalDTO[]> => {
  const response = await api.get("/swimming/renewal");
  return response.data.data;
};

// 재등록 처리
export const processRenewal = async (
  renewalRequest: RenewalRequestDto
): Promise<void> => {
  await api.post("/swimming/renewal", renewalRequest);
};

// Base paths from markdown documents
const SWIMMING_BASE_PATH = "/swimming";
const PAYMENT_BASE_PATH = "/payment";
const MYPAGE_BASE_PATH = "/mypage"; // For renewal

/**
 * Service functions for swimming lesson listing, enrollment, and KISPG payment flow.
 */
export const swimmingPaymentService = {
  /**
   * Fetches publicly available swimming lessons.
   * Corresponds to GET /api/v1/swimming/lessons
   */
  getPublicLessons: (
    params?: PaginationParams
  ): Promise<PaginatedResponse<LessonDto>> => {
    return publicApiMethods.get<PaginatedResponse<LessonDto>>(
      `${SWIMMING_BASE_PATH}/lessons`,
      { params }
    );
  },

  /**
   * Initiates a lesson enrollment.
   * Corresponds to POST /api/v1/swimming/enroll
   */
  enrollLesson: withAuthRedirect(
    (data: EnrollLessonRequestDto): Promise<EnrollInitiationResponseDto> => {
      return privateApiMethods.post<
        EnrollInitiationResponseDto,
        EnrollLessonRequestDto
      >(`${SWIMMING_BASE_PATH}/enroll`, data);
    }
  ),

  /**
   * Fetches details for the KISPG payment page.
   * Corresponds to GET /api/v1/payment/details/{enrollId}
   */
  getPaymentPageDetails: withAuthRedirect(
    (enrollId: number): Promise<PaymentPageDetailsDto> => {
      return privateApiMethods.get<PaymentPageDetailsDto>(
        `${PAYMENT_BASE_PATH}/details/${enrollId}`
      );
    }
  ),

  /**
   * Fetches initialization parameters for KISPG payment.
   * Corresponds to GET /api/v1/payment/kispg-init-params/{enrollId}
   * (Path from Docs/cms/kispg-payment-integration.md, though Docs/cms/payment-page-integration.md also references it)
   */
  getKISPGInitParams: withAuthRedirect(
    (enrollId: number): Promise<KISPGInitParamsDto> => {
      // The path might be /api/v1/payment/kispg/init-params/{enrollId} or /api/v1/payment/kispg-init-params/{enrollId}
      // Using the one from payment-page-integration.md which is /api/v1/payment/kispg-init-params/{enrollId}
      // Docs/cms/swim-overview.md and Docs/cms/swim-user.md also point to similar /payment/kispg-init-params/{enrollId}
      return privateApiMethods.get<KISPGInitParamsDto>(
        `${PAYMENT_BASE_PATH}/kispg-init-params/${enrollId}`
      );
    }
  ),

  /**
   * Confirms payment after KISPG interaction.
   * Corresponds to POST /api/v1/payment/confirm/{enrollId}
   */
  confirmPayment: withAuthRedirect(
    (
      enrollId: number,
      data: PaymentConfirmRequestDto
    ): Promise<PaymentConfirmResponseDto> => {
      return privateApiMethods.post<
        PaymentConfirmResponseDto,
        PaymentConfirmRequestDto
      >(`${PAYMENT_BASE_PATH}/confirm/${enrollId}`, data);
    }
  ),

  /**
   * Processes a lesson renewal request.
   * Corresponds to POST /api/v1/mypage/renewal (as per swim-overview.md)
   */
  renewalLesson: withAuthRedirect(
    (data: MypageRenewalRequestDto): Promise<EnrollInitiationResponseDto> => {
      return privateApiMethods.post<
        EnrollInitiationResponseDto,
        MypageRenewalRequestDto
      >(`${MYPAGE_BASE_PATH}/renewal`, data);
    }
  ),

  /**
   * Cancels an enrollment.
   * Corresponds to POST /api/v1/swimming/enroll/{enrollId}/cancel (from swim-user.md)
   * Note: user.md shows PATCH /mypage/enroll/{id}/cancel. Sticking to swimming specific path for now.
   * If this is purely a mypage function, it might belong in mypageApi.ts.
   * For now, keeping a swimming related cancel here.
   */
  cancelUserEnrollment: withAuthRedirect(
    (enrollId: number, data?: { reason?: string }): Promise<void> => {
      // Assuming EnrollResponseDto might not be returned or needed for simple cancel
      return privateApiMethods.post<void, { reason?: string }>(
        `${SWIMMING_BASE_PATH}/enroll/${enrollId}/cancel`,
        data
      );
    }
  ),
};

// Ensure client.ts exports publicApiMethods similar to privateApiMethods
// e.g.,
// export const publicApiMethods = {
//   get: <R = unknown>(url: string, config?: AxiosRequestConfig): Promise<R> =>
//     publicApi.get<DefaultResponse<R>>(url, config).then((res) => res.data.data).catch(handleApiError),
//   // ... other methods if needed for public access
// };
