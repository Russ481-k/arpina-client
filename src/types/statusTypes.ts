export type PaymentTransactionStatus =
  | "PAID"                // 결제 성공
  | "FAILED"              // 결제 실패
  | "CANCELED"            // 결제 취소 (PG사 또는 시스템에 의해 완료 전 취소)
  | "PARTIAL_REFUNDED"    // 부분 환불된 원 결제 (결제 자체는 성공했었음)
  | "REFUND_REQUESTED";   // 환불 요청됨 (이 결제건에 대해 사용자가 환불 요청)

// Status related to an enrollment's payment aspect and lifecycle
export type EnrollmentPaymentLifecycleStatus =
  | "UNPAID"                     // 미결제 (결제 대기)
  | "PAID"                       // 결제 완료 (수강 확정)
  | "PAYMENT_TIMEOUT"            // 결제 시간 초과 (신청 자동 취소)
  | "CANCELED_UNPAID"            // 미결제 취소 (사용자/관리자에 의해 결제 전 수동 취소)
  | "PARTIALLY_REFUNDED"         // 부분 환불 완료 (수강은 여전히 유효하거나 일부만 유효)
  | "REFUNDED"                   // 전체 환불 완료 (수강 취소됨)
  | "REFUND_PENDING_ADMIN_CANCEL"; // 환불 대기(관리자취소) - 관리자가 등록을 취소했고 환불처리 예정

// Status of the enrollment application itself, separate from payment.
export type EnrollmentApplicationStatus =
  | "APPLIED"  // 신청 완료 (결제상태와는 별개)
  | "CANCELED"; // 신청 취소 (결제상태와는 별개)


// Status of an enrollment's cancellation process/request from a user or admin perspective
export type EnrollmentCancellationProgressStatus =
  | "NONE"     // 취소 절차 없음 (취소 요청된 적 없음)
  | "REQ"      // 취소 요청 (사용자 또는 시스템에 의해 요청된 상태)
  | "PENDING"  // 취소 처리 대기 (관리자 검토/승인 대기)
  | "APPROVED" // 취소 승인 (환불 등 후속 처리 필요할 수 있음)
  | "DENIED";  // 취소 요청 반려

// Status of a specific cancellation request record in the database (e.g., cancel_requests table)
export type CancellationRequestRecordStatus =
  | "REQUESTED" // 사용자 취소 요청
  | "ADMIN_APPROVED" // 관리자 승인 (환불 처리 완료)
  | "ADMIN_DENIED" // 관리자 거절
  | "USER_WITHDRAWN"; // 사용자 요청 철회

// Status for discount applications or similar approval processes
export type ApprovalStatus =
  | "PENDING"  // 승인 대기
  | "APPROVED" // 승인됨
  | "DENIED";  // 거절됨

// Lesson Status (from swim-admin.md and AdminLessonDto)
export type LessonStatus =
  | "OPEN"      // 접수 가능 (강습 오픈 상태)
  | "CLOSED"    // 접수 마감 (수동 또는 자동 마감)
  | "ONGOING"   // 진행 중 (강습 기간 중)
  | "COMPLETED"; // 종료됨 (강습 기간 완료) 