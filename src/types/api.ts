import { AuthType, SkinType, YesNoType } from "./common";
import { File } from "@/app/cms/file/types"; // Ensure File type is imported
import {
  PaymentTransactionStatus,
  EnrollmentPaymentLifecycleStatus,
  EnrollmentApplicationStatus,
  EnrollmentCancellationProgressStatus,
  CancellationRequestRecordStatus,
  ApprovalStatus,
  LessonStatus,
} from "./statusTypes";

export type MenuType =
  | "LINK"
  | "FOLDER"
  | "BOARD"
  | "CONTENT"
  | "POPUP"
  | "PROGRAM";
export type DisplayPosition = "HEADER" | "FOOTER";

// 기본 타입 정의
export interface Menu {
  id: number;
  name: string;
  type: MenuType;
  url?: string;
  targetId?: number;
  displayPosition: DisplayPosition;
  visible: boolean;
  sortOrder: number;
  parentId: number | null;
  children?: Menu[];
  createdAt: string;
  updatedAt: string;
}

export interface Content {
  id: number;
  title: string;
  content: string;
  type: string;
  parentId?: number;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

/* // 이전 Attachment 인터페이스 - 주석 처리 또는 삭제 (다른 곳에서 사용하지 않는다면)
export interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string; 
  createdAt: string;
}
*/

// FileDto 인터페이스 (새로운 가이드 기반)
export interface FileDto {
  fileId: number;
  originName: string;
  mimeType: string;
  size: number; // bytes
  ext: string;
  // savedName: string; // 프론트엔드에서 직접 사용하지 않으므로 일단 제외 가능
  // publicYn?: string; // 필요시 추가
  // fileOrder?: number; // 필요시 추가
  // createdAt?: string; // 필요시 추가
  // updatedAt?: string; // 필요시 추가
}

export interface Post {
  no: number;
  nttId: number;
  bbsId: number;
  parentNttId: number | null;
  threadDepth: number;
  writer: string;
  title: string;
  content: string; // HTML 또는 JSON 문자열일 수 있음
  hasImageInContent: boolean;
  hasAttachment: boolean;
  noticeState: "Y" | "N" | "P";
  noticeStartDt: string;
  noticeEndDt: string;
  publishState: "Y" | "N" | "P";
  publishStartDt: string;
  publishEndDt: string | null;
  externalLink: string | null;
  hits: number;
  categories?: string[];
  attachments?: File[] | null; // 변경: File 객체 배열 사용
  thumbnailUrl?: string; // Optional thumbnail URL for press/card layouts
  createdAt: string;
  updatedAt: string;

  // Fields for QnA functionality, used by QnaBoardSkin
  status?: string; // e.g., "답변대기", "답변완료"
  answerContent?: string;
  answerCreatedAt?: string;
  answerUpdatedAt?: string;
  answerUserEmail?: string;
  answerUserNickname?: string;
}

export interface User {
  uuid: string;
  username: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API 요청 데이터 타입
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    tokenType: string;
    user: User;
    refreshToken: string;
  };
  errorCode: string | null;
  stackTrace: string | null;
}

export interface MenuData {
  name: string;
  type: MenuType;
  url?: string;
  targetId?: number;
  displayPosition: "HEADER" | "FOOTER";
  visible: boolean;
  sortOrder: number;
  parentId: number | null;
}

// Template related interfaces
export interface TemplateBlock {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  widget?: {
    type: string;
    config?: Record<string, unknown>;
  };
}

export interface TemplateVersion {
  versionId: number;
  templateId: number;
  versionNo: number;
  layout: TemplateBlock[];
  updater: string;
  updatedAt: string;
}

export interface Template {
  id: number;
  templateName: string;
  type: "MAIN" | "SUB";
  description: string | null;
  published: boolean;
  versions?: TemplateVersion[];
  layout?: TemplateBlock[];
  displayPosition: "HEADER" | "FOOTER";
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateData {
  templateName: string;
  templateType: string;
  description: string | null;
  layout: TemplateBlock[];
  published?: boolean;
}

export interface TemplateListParams {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
  type?: string;
  status?: string;
}

export interface TemplateListResponse {
  data: {
    content: Template[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface ContentData {
  title: string;
  content: string;
  type: string;
  parentId?: number;
  sortOrder: number;
  isVisible: boolean;
}

export interface UserData {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  groupId: string;
}

export interface VerifyTokenResponse {
  success: boolean;
  message: string | null;
  data: {
    valid: boolean;
    uuid: string;
    username: string;
    authorities: {
      authority: string;
    }[];
  };
  errorCode: string | null;
  stackTrace: string | null;
}

export interface TemplateSaveDto {
  templateName: string;
  templateType: string;
  description: string | null;
  layout: TemplateBlock[];
  published?: boolean;
}

export interface Company {
  companyId?: number;
  companyName: string;
  tagline?: string;
  residentYear: number;
  logoFileId?: number;
  homepageUrl?: string;
  summaryHtml?: string;
  ceoName?: string;
  foundedDate?: string;
  industry?: string;
  location?: string;
  displayYn: boolean;
  sortOrder?: number;
  extra?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyQueryParams {
  year?: number;
  category?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  displayYn?: boolean;
}

export interface CompanyListResponse {
  status: number;
  data: Company[];
  pagination: {
    page: number;
    size: number;
    total: number;
  };
}

export interface CompanyResponse {
  status: number;
  data: Company;
}

export interface PostData {
  no: number;
  bbsId: number;
  title: string;
  content: string;
  writer: string;
  publishStartDt: string;
  noticeState: "Y" | "N" | "P";
  noticeStartDt: string;
  noticeEndDt: string;
  publishState: "Y" | "N" | "P";
  publishEndDt: string | null;
  externalLink: string | null;
  parentNttId: number | null;
  categories?: string[];
  nttId: number;
  threadDepth: number;
  hits: number;
}

export interface BoardMaster {
  menuId: number;
  bbsId: number;
  bbsName: string;
  skinType: SkinType;
  readAuth: AuthType;
  writeAuth: AuthType;
  adminAuth: AuthType;
  displayYn: YesNoType;
  noticeYn: YesNoType;
  publishYn: YesNoType;
  attachmentYn: YesNoType;
  attachmentLimit: string;
  attachmentSize: string;
  sortOrder: "A" | "D";
  createdAt: string;
  updatedAt: string;
}

export interface BoardMasterApiResponse {
  success: boolean;
  message: string;
  data: {
    content: Array<BoardMaster>;
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: {
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      pageNumber: number;
      pageSize: number;
      paged: boolean;
    };
    size: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    totalElements: number;
    totalPages: number;
  };
  errorCode: string | null;
  stackTrace: string | null;
}

// 페이지네이션 파라미터
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  [key: string]: any; // 추가 파라미터를 위한 인덱스 시그니처
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  data: {
    content: T[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
  code: number;
  message: string;
  success: boolean;
}

// --- Swimming & Payment Related DTOs ---

/**
 * DTO for POST /api/v1/payment/prepare-kispg-payment
 * Request body when a user initiates a lesson enrollment.
 */
export interface EnrollLessonRequestDto {
  lessonId: number;
  usesLocker: boolean;
  membershipType: string;
}

/**
 * DTO for POST /api/v1/payment/prepare-kispg-payment
 * Response after successfully initiating a lesson enrollment and payment preparation.
 * Contains KISPG payment initialization parameters.
 */
export interface EnrollInitiationResponseDto {
  mid: string;
  moid: string; // Merchant Order ID (temp_enrollId_timestamp)
  amt: string; // Amount as string
  itemName: string; // Goods name (lesson title)
  buyerName: string; // Buyer name
  buyerTel: string; // Buyer phone
  buyerEmail: string; // Buyer email
  returnUrl: string; // Return URL after payment
  notifyUrl: string; // Webhook URL
  ediDate: string; // Transaction datetime (yyyyMMddHHmmss)
  requestHash: string; // Security hash (encData)
  mbsReserved1: string; // Contains enrollId info (temp_enrollId)
  mbsUsrId: string; // Merchant user ID
  userIp: string; // User IP address
  goodsSplAmt: string; // Supply amount
  goodsVat: string; // VAT amount
}

/**
 * DTO for GET /api/v1/payment/kispg-init-params/{enrollId}
 * Response containing KISPG payment initialization parameters
 */
export interface KISPGPaymentInitResponseDto {
  mid: string;
  moid: string; // Merchant Order ID (enroll_12345_timestamp)
  amt: string; // Amount as string
  itemName: string; // Goods name (lesson title)
  buyerName: string; // Buyer name
  buyerTel: string; // Buyer phone
  buyerEmail: string; // Buyer email
  returnUrl: string; // Return URL after payment
  notifyUrl: string; // Webhook URL
  ediDate: string; // Transaction datetime (yyyyMMddHHmmss)
  requestHash: string; // Security hash (encData)

  // Optional KISPG parameters
  userIp?: string; // User IP address
  mbsUsrId?: string; // Merchant user ID
  mbsIp?: string; // Merchant server IP
  goodsSplAmt?: string; // Supply amount
  goodsVat?: string; // VAT amount
  goodsSvsAmt?: string; // Service amount
}

/**
 * DTO for POST /api/v1/payment/confirm/{enrollId}
 * Request body sent from the frontend after KISPG payment process returns to the client.
 */
export interface PaymentConfirmRequestDto {
  pgToken: string;
  wantsLocker: boolean;
}

/**
 * DTO for POST /api/v1/payment/confirm/{enrollId}
 * Response after frontend confirms payment post-KISPG interaction.
 */
export interface PaymentConfirmResponseDto {
  status:
    | "PAYMENT_SUCCESSFUL"
    | "PAYMENT_PROCESSING"
    | "PAYMENT_FAILED"
    | string;
  message?: string;
  enrollId?: number;
}

// --- DTOs for Mypage (based on user.md) ---

/**
 * DTO for Mypage enrollments (GET /mypage/enroll)
 * Based on user.md EnrollDto.
 */
export interface MypageEnrollDto {
  enrollId: number;
  lesson: {
    lessonId: number;
    title: string;
    name: string;
    period: string;
    startDate: string;
    endDate: string;
    time: string | null;
    days: string;
    timePrefix: string;
    timeSlot: string;
    capacity: number;
    remaining: number;
    price: number;
    status: string; // Assuming this is lesson's general status like OPEN/CLOSED, not LessonStatus type from statusTypes.ts yet.
    instructor: string;
    location: string;
    reservationId: string;
    receiptId: string;
  };
  status: EnrollmentPaymentLifecycleStatus | string; // Allow string for potential backend values not yet in enum
  applicationDate: string;
  paymentExpireDt: string | null;
  usesLocker: boolean;
  isRenewal: boolean;
  cancelStatus: EnrollmentCancellationProgressStatus | string; // Allow string
  cancelReason: string | null;
  renewalWindow?: {
    open: string;
    close: string;
  };
  canAttemptPayment: boolean;
  paymentPageUrl: string | null;
  membershipType: string;
}

/**
 * DTO for Mypage renewal request (POST /mypage/renewal)
 * Based on user.md RenewalRequestDto.
 */
export interface MypageRenewalRequestDto {
  lessonId: number;
  carryLocker: boolean;
}

/**
 * DTO for Mypage payment history (GET /mypage/payment)
 * Based on actual API response structure.
 */
export interface MypagePaymentDto {
  paymentId: number;
  enrollId: number;
  tid?: string | null; // Optional - KISPG Transaction ID
  amount: number; // Main payment amount (matches API field name)
  refundedAmount?: number; // Optional - total refunded amount if any
  paidAt: string | null;
  refundedAt?: string | null; // Optional - refund date if any
  status: PaymentTransactionStatus | string; // Allow string

  // Lesson details
  lessonTitle: string; // 강습 제목
  lessonStartDate: string; // 강습 시작일 (YYYY-MM-DD)
  lessonEndDate: string; // 강습 종료일 (YYYY-MM-DD)
  lessonTime: string; // 강습 시간 (예: "(월,화,수,목,금) 오전 06:00~06:50")
  instructorName: string; // 강사명
  locationName: string; // 장소명

  // Payment breakdown
  lessonPrice: number; // 강습비
  lockerFee: number; // 사물함비
  usesLocker: boolean; // 사물함 사용 여부

  // Discount information
  discountType: string | null; // 할인 유형
  discountPercentage: number; // 할인율 (0-100)
  finalAmount: number; // 최종 결제 금액

  // Membership
  membershipType: string; // 회원 유형 (예: "GENERAL")
}

// --- Admin DTOs (swim-admin.md) ---

// LockerInventoryDto for GET /admin/swimming/lockers/inventory
export interface LockerInventoryDto {
  gender: "MALE" | "FEMALE";
  totalQuantity: number;
  usedQuantity: number;
  availableQuantity: number;
  // created_at, updated_at etc. can be added if needed by admin UI
}

// LockerInventoryUpdateDto for PUT /admin/swimming/lockers/inventory/{gender}
export interface LockerInventoryUpdateRequestDto {
  totalQuantity: number;
}

// EnrollAdminResponseDto for GET /admin/swimming/enrolls
export interface EnrollAdminResponseDto {
  enrollId: number;
  userId: string; // Assuming user's UUID or username
  userName: string;
  status: EnrollmentApplicationStatus | string; // Main enrollment status // Allow string
  // payStatus from enroll table: UNPAID, PAID, PARTIALLY_REFUNDED, PAYMENT_TIMEOUT, CANCELED_UNPAID
  payStatus: EnrollmentPaymentLifecycleStatus | string; // Allow string
  usesLocker: boolean;
  userGender?: "MALE" | "FEMALE" | "OTHER"; // From user profile
  createdAt: string; // ISO DateTime
  expireDt?: string | null; // Payment expiration from enroll.expire_dt
  lessonTitle: string;
  lessonId: number;
  payment_tid?: string | null; // KISPG TID from payment table
  paid_amt?: number | null; // Initial paid amount from payment table
  refunded_amt?: number | null; // Total refunded amount from payment table
  remain_days_at_cancel?: number | null; // Calculated for audit
  userPhone: string | null; // User phone number from user table
  userLoginId: string | null; // User login ID from user table
  membershipType?: string; // Added field for discount/membership type
}

// CancelRequestDto for GET /admin/swimming/enrolls/cancel-requests
export interface CancelRequestDto {
  requestId: number; // ID of the cancel_request record itself
  enrollId: number;
  userId: string;
  userName: string;
  lessonTitle: string;
  paid_amt: number; // Initial KISPG payment amount for this enrollment
  calculated_refund_amt: number; // System-calculated potential refund
  requested_at: string; // ISO DateTime
  reason: string;
  kispg_tid?: string | null; // KISPG TID for reference
}

// PaymentAdminDto for GET /admin/payment
export interface PaymentAdminDto {
  paymentId: number;
  enrollId: number;
  userId: string;
  userName: string;
  userPhone: string;
  lessonTitle: string;
  tid: string; // KISPG TID
  paidAmt: number; // Corrected to camelCase from paid_amt
  refundedAmt: number | null; // Corrected to camelCase from refunded_amt
  status: PaymentTransactionStatus;
  paidAt: string | null; // Corrected to camelCase from paid_at
  lastRefundDt?: string | null; // API sends lastRefundDt, ensure DTO matches (or map if different)
  pgProvider: string | null;
  payMethod?: string;
  pgResultCode?: string;
}

// SummaryDto for GET /admin/stats/summary (example)
export interface SummaryDto {
  totalRevenue: number;
  newEnrollmentsToday: number;
  activeLockers: number;
  pendingCancellations: number;
  paymentTimeoutsToday: number;
  // ... other relevant stats
}

// Generic API Response (if not already defined elsewhere)
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string | null;
  stackTrace?: string | null; // Should be disabled in production
}

// Matches LessonDto in swim-admin.md and general structure in swim-user.md
export interface LessonDto {
  lessonId: number;
  title: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  capacity: number;
  price: number;
  status: LessonStatus | string; // from swim-admin.md // Allow string
  // male_locker_cap and female_locker_cap are REMOVED as per swim-admin.md and swim-user.md
  // Additional fields from user-facing LessonCard.tsx, if needed for display
  timeSlot?: string; // e.g., "06:00~06:50"
  timePrefix?: string; // e.g., "오전"
  days?: string; // e.g., "(월,화,수,목,금)"
  remaining?: number; // Calculated or from API
  reservationId?: string; // e.g., "2025.04.17 13:00:00부터"
  receiptId?: string; // e.g., "2025.04.20 18:00:00까지"
  instructor?: string;
  location?: string;
  // For payment page access slot calculation (as per lesson-enrollment-capacity.md)
  // These might be added if LessonDto is directly used, or calculated separately.
  currentPaidCount?: number;
  currentUnpaidActiveCount?: number;
  availablePaymentSlots?: number; // Calculated: capacity - paidCount - unpaidActiveCount
}

// User-facing locker availability (swim-user.md)
export interface LockerAvailabilityDto {
  gender: "MALE" | "FEMALE";
  totalQuantity: number;
  usedQuantity: number;
  availableQuantity: number;
}

export interface AdminLessonDto {
  // <--- Make sure 'export' keyword is present
  lessonId?: number;
  title: string;
  instructorName?: string;
  lessonTime?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  registrationEndDateTime?: string; // YYYY-MM-DD -- ADDED FIELD
  capacity: number;
  price: number;
  status: LessonStatus | string; // Allow string
}

// Added based on adminApi.ts and linter errors
export interface CloneLessonRequestDto {
  newStartDate: string; // YYYY-MM-DD
  newEndDate: string; // YYYY-MM-DD
  // Any other fields that need to be different for the cloned lesson
  // e.g., title, price, capacity, if they can be overridden during cloning
  title?: string;
  price?: number;
  capacity?: number;
  status?: "OPEN" | "CLOSED"; // Typically a new lesson would be OPEN or CLOSED
}

export interface AdminCancelEnrollmentRequestDto {
  reason: string; // Reason for admin cancellation
  // any other relevant fields, e.g., if it affects refund calculation differently
}

export interface TemporaryEnrollmentRequestDto {
  lessonId: number;
  userName: string;
  userPhone?: string; // Optional if backend allows
  usesLocker: boolean;
  memo?: string; // Optional
}

export interface UpdateDiscountStatusRequestDto {
  status: ApprovalStatus; // Changed from "APPROVED" | "DENIED"
  adminComment?: string;
}

export interface UserMemoDto {
  memoId?: number; // Optional, present if updating/fetching existing
  userId: string;
  memoText: string;
  createdAt?: string; // ISO DateTime string
  updatedAt?: string; // ISO DateTime string
  adminId?: string; // ID of admin who wrote/updated memo
}

// Represents the structure of an object within the 'paymentInfo' field of the API response
interface CancelRequestPaymentInfo {
  tid: string | null; // Was kispg_tid
  paidAmt: number; // Was paid_amt in CancelRequestAdminDto, now part of paymentInfo
  lessonPaidAmt: number;
  lockerPaidAmt: number;
}

// Represents the structure of an object within the 'calculatedRefundDetails' field of the API response
interface CancelRequestCalculatedRefundDetails {
  systemCalculatedUsedDays: number;
  manualUsedDays: number | null;
  effectiveUsedDays: number; // Assuming this is part of the details
  lessonUsageAmount?: number;
  // lockerUsageAmount?: number; // Removed as locker fee is non-refundable and not part of refund calculation display
  finalRefundAmount?: number;
}

export interface CancelRequestAdminDto {
  // Reflects an item from API: /api/v1/cms/enrollments/cancel-requests
  requestId: number; // Assumed based on frontend usage for 'id'
  enrollId: number;
  userName: string;
  userLoginId?: string; // Kept as optional, ensure backend provides if used
  userPhone?: string; // Kept as optional, ensure backend provides if used
  lessonTitle: string;
  // payStatus is NOT included by this API endpoint
  paymentInfo: CancelRequestPaymentInfo;
  calculatedRefundAmtByNewPolicy?: number; // The top-level refund amount from snippet
  calculatedRefundDetails: CancelRequestCalculatedRefundDetails;
  requestedAt: string; // API uses 'requestedAt'
  userReason: string; // API uses 'userReason' for the reason provided by the user
  adminComment?: string; // API uses 'adminComment'
  status: CancellationRequestRecordStatus | string; // Assumed based on frontend usage & API query params // Allow string
  paymentStatus: EnrollmentPaymentLifecycleStatus | "REFUNDED" | string; // Allow string. "REFUNDED" added based on analysis.
  lessonStartDate?: string; // Kept as optional, ensure backend provides if used for display/logic
  usesLocker?: boolean; // Kept as optional, ensure backend provides if used
  cancellationProcessingStatus?: EnrollmentCancellationProgressStatus | string; // Added new field // Allow string
  // Fields like paid_amt, calculated_refund_amt, kispg_tid, reason are now mapped from nested objects or renamed.
}

export interface ApproveCancelRequestDto {
  manualUsedDays?: number; // Optional, if admin adjusts used days
  adminComment?: string;
  // KISPG refund parameters might be needed here if refund is triggered by this call
}

export interface DenyCancelRequestDto {
  adminComment?: string;
}

export interface ManualRefundRequestDto {
  refundAmount: number;
  reason: string;
  // Potentially other details required for KISPG manual refund logging
}

export interface CronLogDto {
  logId: number;
  jobName: string;
  status: "SUCCESS" | "FAILED" | "RUNNING"; // This seems specific enough, not using ApprovalStatus
  startTime: string; // ISO DateTime string
  endTime?: string | null; // ISO DateTime string
  duration?: number | null; // in seconds
  message?: string | null;
}

export interface WebhookLogDto {
  logId: number;
  tid: string;
  sourceIp: string;
  requestBody: string; // Could be stringified JSON
  responseStatus: number; // HTTP status code our server responded with
  processedAt: string; // ISO DateTime string
  errorMessage?: string | null;
}

// --- KISPG Payment Integration DTOs ---

/**
 * DTO for POST /api/v1/payment/kispg/callback
 * Callback data from KISPG payment gateway
 */
export interface KISPGPaymentCallbackDto {
  resultCd: string; // Result code "0000" for success
  resultMsg: string; // Result message
  payMethod: string; // Payment method
  tid: string; // KISPG Transaction ID
  amt: string; // Amount
  mbsReserved: string; // Merchant reserved field (enrollId)
  [key: string]: any;
}

// Payment verification API types (from backend documentation)
export interface PaymentVerificationRequestDto {
  moid: string; // Merchant Order ID from KISPG response
}

export interface PaymentVerificationResponseDto {
  success: boolean;
  message: string;
  data?: {
    enrollId: number;
    status: "PAYMENT_SUCCESSFUL" | "PAYMENT_FAILED" | "PAYMENT_PROCESSING";
    lesson: {
      lessonId: number;
      title: string;
      startDate: string;
      endDate: string;
      time: string;
      instructor: string;
      location: string;
    };
    usesLocker: boolean;
    paymentInfo: {
      tid: string;
      amount: number;
      paidAt: string;
    };
  };
}

// --- KISPG Payment Result Interface ---

/**
 * Complete KISPG payment result parameters
 * Based on KISPG API documentation
 */
export interface KISPGPaymentResultDto {
  // 기본 결제 정보
  resultCd: string; // 결과코드
  resultMsg: string; // 결과메시지
  payMethod: string; // 지불수단
  tid: string; // 거래번호
  appDtm: string; // 결제일시
  appNo: string; // 승인번호
  ordNo: string; // 주문번호
  goodsName: string; // 결제 상품명
  amt: string; // 거래금액
  ordNm: string; // 결제자 이름

  // 카드/은행 정보
  fnNm?: string; // 카드사명, 은행명
  cancelYN?: string; // 취소여부
  appCardCd?: string; // 발급사코드
  acqCardCd?: string; // 매입사코드
  quota?: string; // 카드 할부기간
  nointFlg?: string; // 분담무이자구분
  usePointAmt?: string; // 사용 포인트 양
  cardType?: string; // 카드타입 (0:신용, 1:체크)
  authType?: string; // 인증타입
  cardNo?: string; // 마스킹 카드번호

  // 현금영수증 정보
  cashCrctFlg?: string; // 현금영수증 사용여부
  crctType?: string; // 현금영수증타입
  crctNo?: string; // 현금영수증번호

  // 가상계좌 정보
  vacntNo?: string; // 가상계좌 번호
  lmtDay?: string; // 입금기한

  // 휴대폰 결제 정보
  socHpNo?: string; // 휴대폰번호

  // 간편결제 정보
  easyPayCd?: string; // 간편결제 코드
  easyPayNm?: string; // 간편결제사명

  // 할인 정보
  discountType?: string; // 할인구분
  discountAmt?: string; // 할인금액

  // 수수료 정보
  mbsFeeType?: string; // 가맹점수수료구분
  mbsFeeAmt?: string; // 가맹점수수료금액

  // 가맹점 예약 필드
  mbsReserved?: string; // 가맹점예약필드

  // 추가 필드들 (KISPG에서 추가로 전달할 수 있는 필드들)
  [key: string]: any;
}

/**
 * DTO for POST /api/v1/payment/approve-and-create-enrollment
 * Request body sent from frontend after KISPG payment completion
 */
export interface PaymentApprovalRequestDto {
  tid: string; // KISPG에서 반환된 TID
  moid: string; // temp moid (e.g., temp_12_335ba429_1748790445804)
  amt: string; // 결제 금액

  // 🆕 전체 KISPG 결제 결과 정보 (백엔드에서 필요에 따라 저장)
  kispgPaymentResult?: KISPGPaymentResultDto;
}

/**
 * DTO for POST /api/v1/payment/approve-and-create-enrollment
 * Response after successful payment approval and enrollment creation
 */
export interface PaymentApprovalResponseDto {
  success: boolean;
  message: string;
  data?: {
    enrollId: number;
    status: "PAYMENT_SUCCESSFUL" | "PAYMENT_FAILED" | "PAYMENT_PROCESSING";
    lesson: {
      lessonId: number;
      title: string;
      startDate: string;
      endDate: string;
      time: string;
      instructor: string;
      location: string;
    };
    usesLocker: boolean;
    paymentInfo: {
      tid: string;
      amount: number;
      paidAt: string;
    };
  };
}

// --- Status Enum-like Types (Moved from PaymentHistoryTab) ---
// export type PaymentStatusType = // Original definition REMOVED
//   | "PAID"
//   | "FAILED"
//   | "CANCELED"
//   | "PARTIAL_REFUNDED"
//   | "REFUND_REQUESTED";

// export type RefundStatusType = // Original definition REMOVED
//   | "REFUND_REQUESTED" // 환불 요청됨
//   | "REFUND_PROCESSING" // 환불 처리 중
//   | "REFUND_COMPLETED" // 환불 완료
//   | "REFUND_REJECTED"; // 환불 거절

// Interface for the actual data structure within PaginatedResponse.data
// This matches the 'Page<T>' interface previously in PaymentHistoryTab.tsx
export interface PaginatedData<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number; // May or may not be present depending on backend
    paged: boolean; // May or may not be present
    unpaged: boolean; // May or may not be present
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page number (0-indexed)
  sort: { // This sort is for the whole page, pageable.sort is for individual items
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number; // Number of elements in the current page
  empty: boolean;
}

// Redefine PaginatedResponse to use PaginatedData for its 'data' field
// if the existing PaginatedResponse (L377) doesn't exactly match this structure for its 'data' field.
// For now, we assume the existing PaginatedResponse.data is compatible with PaginatedData<T>.
// If PaginatedResponse is { success, message, data: PaginatedData<T> }, that's fine.

// --- Admin Payment and Refund Data Types (Based on PaymentHistoryTab) ---
export interface AdminPaymentData {
  paymentId: number;
  enrollId: number;
  lessonId?: number; // Keep as optional, might be added via enrichment later or from enroll data
  tid: string;
  userName: string; // Now directly from PaymentAdminDto
  userPhone?: string; // Keep as optional, might be added via enrichment later
  userId: string; // Now directly from PaymentAdminDto
  lessonTitle: string; // Now directly from PaymentAdminDto
  initialAmount: number; // Calculated: paid_amt + (refunded_amt || 0)
  paidAmount: number; // From paid_amt
  discountAmount?: number; // Keep as optional, for potential future use or other data sources
  refundedAmount: number | null; // Matches PaymentAdminDto.refunded_amt
  paymentMethod: string; // From PaymentAdminDto.payMethod
  paymentGateway?: string | null; // From PaymentAdminDto.pgProvider
  status: PaymentTransactionStatus;
  paidAt: string; // ISO DateTime string (assuming non-null from API for successful payments)
  lastRefundAt?: string; // ISO DateTime string
  orderNo?: string; // Keep as optional
  memberType?: string; // Keep as optional
  lockerFee?: number; // Keep as optional
  pgResultCode?: string; // Added from PaymentAdminDto
}
