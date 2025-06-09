/**
 * 결제 및 환불과 관련된 모든 상태를 정의하는 통합 타입입니다.
 * 중복을 제거하고 명확성을 높이기 위해 기존의 PaymentTransactionStatus와
 * EnrollmentPaymentLifecycleStatus를 통합하고 재정리했습니다.
 */
export type PaymentStatus =
  | "PAID" // 결제 완료
  | "FAILED" // 결제 실패
  | "CANCELED" // 전액 환불 완료
  | "PARTIAL_REFUNDED"; // 부분 환불 완료

/**
 * UI에 표시될 수 있는 모든 결제/수강신청 관련 상태를 포함하는 확장된 타입입니다.
 * 여러 DTO에서 반환되는 다양한 상태 값을 처리하기 위해 사용됩니다.
 * (예: `Enrollment` 엔티티는 `REFUND_REQUESTED` 상태를 가질 수 있습니다.)
 */
export type UiDisplayStatus =
  | PaymentStatus
  | "REFUND_REQUESTED" // 환불 요청됨
  | "PAYMENT_PENDING"; // 결제 대기 (웹훅 수신 전 또는 미결제 상태)

/**
 * 관리자 CMS에서 사용하는 환불 요청 레코드의 상태입니다.
 */
export type CancellationRequestRecordStatus =
  | "REQUESTED" // 사용자가 취소 요청
  | "ADMIN_APPROVED" // 관리자가 승인
  | "ADMIN_DENIED" // 관리자가 반려
  | "USER_WITHDRAWN"; // 사용자가 요청 철회

/**
 * PG사(결제 대행사)를 통한 환불 처리 진행 상태입니다.
 */
export type EnrollmentCancellationProgressStatus =
  | "NONE" // 처리 대상 아님
  | "REQ" // 요청됨
  | "PENDING" // 처리 대기 (PG사)
  | "APPROVED" // 승인됨 (PG사)
  | "DENIED"; // 거부됨 (PG사)

/**
 * 수강 신청의 생명주기 상태입니다.
 * 참고: 이 타입은 결제 상태와는 별개로, 수강 신청 자체의 상태를 나타냅니다.
 *
 * @deprecated `PaymentStatus`로 통합되었으므로 더 이상 사용하지 않습니다.
 * `mypage/page.tsx` 또는 다른 곳에서 사용 중인 경우 `PaymentStatus`로 마이그레이션해야 합니다.
 */
export type EnrollmentPaymentLifecycleStatus =
  | "NOT_APPLICABLE"
  | "PAYMENT_PENDING"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "REFUND_REQUESTED"
  | "REFUND_PENDING_ADMIN_CANCEL";

/**
 * @deprecated `PaymentStatus`로 통합되었습니다.
 */
export type PaymentTransactionStatus =
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "PARTIAL_REFUNDED"
  | "REFUND_REQUESTED"
  | "REFUNDED"
  | "REFUND_DENIED"
  | "REFUND_FAILED";

// Status of the enrollment application itself, separate from payment.
export type EnrollmentApplicationStatus =
  | "APPLIED"  // 신청 완료 (결제상태와는 별개)
  | "CANCELED"; // 신청 취소 (결제상태와는 별개)

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