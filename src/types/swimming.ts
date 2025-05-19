// 수영장 강습 관련 타입 정의

// 강습 DTO
export interface LessonDTO {
  id: number;
  title: string;
  name: string;
  startDate: string;
  endDate: string;
  timeSlot: string;
  timePrefix: string;
  days: string;
  capacity: number;
  remaining: number;
  price: number;
  status: string; // 접수중, 접수마감, 수강중, 수강종료
  reservationId: string; // 접수 시작 정보
  receiptId: string; // 접수 마감 정보
  instructor: string;
  location: string;
}

// 사물함 DTO
export interface LockerDTO {
  id: number;
  lockerNumber: string;
  zone: string;
  gender: 'M' | 'F';
  isActive: boolean;
}

// 강습 신청 요청 DTO
export interface EnrollRequestDto {
  lessonId: number;
  lockerId?: number; // 선택적 사물함 ID
}

// 강습 신청 응답 DTO
export interface EnrollResponseDto {
  enrollId: number;
  lessonId: number;
  lockerId?: number;
  status: string;
  payStatus: string;
  expireDt: string;
  userName: string;
  lessonTitle: string;
  lessonTimeSlot: string;
  lessonDays: string;
  price: number;
  lockerPrice?: number;
  totalPrice: number;
}

// 강습 신청 취소 요청 DTO
export interface CancelRequestDto {
  reason: string;
}

// 강습 신청 취소 응답 DTO = EnrollResponseDto

// 강습 신청 목록 DTO
export interface EnrollDTO {
  enrollId: number;
  lessonId: number;
  lockerId?: number;
  status: string;
  payStatus: string; // UNPAID, PAID, CANCELED_UNPAID
  expireDt: string;
  userName: string;
  lessonTitle: string;
  lessonTimeSlot: string;
  lessonDays: string;
  price: number;
  lockerPrice?: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  remainingMinutes?: number; // 프론트엔드에서 계산
}

// 결제 요청 DTO
export interface PaymentRequestDto {
  enrollId: number;
  pgToken: string;
}

// 재등록 DTO
export interface RenewalDTO {
  previousEnrollId: number;
  previousLessonId: number;
  previousLessonTitle: string;
  previousLockerInfo?: {
    lockerId: number;
    lockerNumber: string;
  };
  suggestedLessonId: number;
  suggestedLessonTitle: string;
  suggestedLessonTimeSlot: string;
  suggestedLessonDays: string;
  suggestedLessonStartDate: string;
  suggestedLessonEndDate: string;
  suggestedLessonPrice: number;
}

// 재등록 요청 DTO
export interface RenewalRequestDto {
  lessonId: number;
  carryLocker: boolean;
} 