import { AuthType, SkinType, YesNoType } from "./common";
import { File } from "@/app/cms/file/types"; // Ensure File type is imported

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
 * DTO for POST /api/v1/swimming/enroll
 * Request body when a user initiates a lesson enrollment.
 */
export interface EnrollLessonRequestDto {
  lessonId: number;
  wantsLocker: boolean;
  membershipType: string;
}

/**
 * DTO for POST /api/v1/swimming/enroll
 * Response after successfully initiating a lesson enrollment.
 * Provides information needed to proceed to the KISPG payment page.
 */
export interface EnrollInitiationResponseDto {
  enrollId: number;
  lessonId: number;
  paymentPageUrl: string;
  paymentExpiresAt: string;
}

/**
 * DTO for GET /api/v1/payment/details/{enrollId}
 * Contains details needed for the KISPG payment page.
 */
export interface PaymentPageDetailsDto {
  enrollId: number;
  lessonTitle: string;
  lessonPrice: number;
  userGender: "MALE" | "FEMALE" | "OTHER";
  lockerOptions?: {
    lockerAvailableForUserGender: boolean;
    availableCountForUserGender: number;
    lockerFee: number;
  };
  amountToPay: number;
  paymentDeadline: string;
}

/**
 * DTO for GET /api/v1/payment/kispg-init-params/{enrollId}
 * Contains parameters required to initialize the KISPG payment gateway/widget.
 */
export interface KISPGInitParamsDto {
  mid?: string;
  moid?: string;
  itemName?: string;
  amount?: number;
  buyerName?: string;
  buyerTel?: string;
  buyerEmail?: string;
  returnUrl?: string;
  notifyUrl?: string;
  requestHash?: string;
  [key: string]: any;
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
    title: string;
    period: string;
    time: string;
    price: number;
  };
  status:
    | "UNPAID"
    | "PAID"
    | "PAYMENT_TIMEOUT"
    | "CANCELED_UNPAID"
    | "PARTIALLY_REFUNDED"
    | string;
  applicationDate: string;
  paymentExpireDt: string | null;
  usesLocker: boolean;
  isRenewal: boolean;
  cancelStatus: "NONE" | "REQ" | "APPROVED" | "DENIED" | string;
  cancelReason: string | null;
  renewalWindow?: {
    open: string;
    close: string;
  };
  canAttemptPayment: boolean;
  paymentPageUrl: string | null;
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
 * Based on user.md PaymentDto.
 */
export interface MypagePaymentDto {
  paymentId: number;
  enrollId: number;
  tid: string | null;
  paid_amt: number;
  refunded_amt: number;
  paidAt: string | null;
  refund_dt: string | null;
  status:
    | "SUCCESS"
    | "CANCELED"
    | "PARTIAL_REFUNDED"
    | "REFUND_REQUESTED"
    | "FAILED"
    | string;
}

// --- Admin DTOs (swim-admin.md) ---

// LockerInventoryDto for GET /admin/swimming/lockers/inventory
export interface LockerInventoryDto {
  gender: "MALE" | "FEMALE";
  total_quantity: number;
  used_quantity: number;
  // created_at, updated_at etc. can be added if needed by admin UI
}

// LockerInventoryUpdateDto for PUT /admin/swimming/lockers/inventory/{gender}
export interface LockerInventoryUpdateDto {
  total_quantity: number;
}

// EnrollAdminResponseDto for GET /admin/swimming/enrolls
export interface EnrollAdminResponseDto {
  enrollId: number;
  userId: string; // Assuming user's UUID or username
  userName: string;
  status: "APPLIED" | "CANCELED" | string; // Main enrollment status
  // payStatus from enroll table: UNPAID, PAID, PARTIALLY_REFUNDED, PAYMENT_TIMEOUT, CANCELED_UNPAID
  payStatus:
    | "UNPAID"
    | "PAID"
    | "PARTIALLY_REFUNDED"
    | "PAYMENT_TIMEOUT"
    | "CANCELED_UNPAID"
    | string;
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
  tid: string; // KISPG TID
  paid_amt: number;
  refunded_amt: number;
  // status maps to payment.status
  status: "PAID" | "CANCELED" | "PARTIALLY_REFUNDED" | "FAILED" | string; // "PAID" here usually means original successful payment
  paid_at: string | null; // ISO DateTime
  last_refund_dt?: string | null; // ISO DateTime of the last refund transaction
  pgProvider: "KISPG" | string;
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
  status: "OPEN" | "CLOSED" | "ONGOING" | "COMPLETED"; // from swim-admin.md
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
