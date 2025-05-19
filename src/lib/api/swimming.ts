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
  RenewalRequestDto
} from "@/types/swimming";
import { PaginationParams, PaginatedResponse } from "@/types/api";

// React Query 키 정의
export const swimmingKeys = {
  all: ["swimming"] as const,
  lessons: () => [...swimmingKeys.all, "lessons"] as const,
  lesson: (id: number) => [...swimmingKeys.lessons(), id] as const,
  lessonsByPeriod: (startDate: string, endDate: string) => 
    [...swimmingKeys.lessons(), "period", startDate, endDate] as const,
  lockers: (gender?: string) => [...swimmingKeys.all, "lockers", gender] as const,
  locker: (id: number) => [...swimmingKeys.lockers(), id] as const,
  enrolls: () => [...swimmingKeys.all, "enrolls"] as const,
  myEnrolls: () => [...swimmingKeys.enrolls(), "my"] as const,
  myEnrollsByStatus: (status: string) => [...swimmingKeys.myEnrolls(), status] as const,
  enroll: (id: number) => [...swimmingKeys.enrolls(), id] as const,
  renewal: () => [...swimmingKeys.all, "renewal"] as const,
};

// 백엔드 응답 타입
interface BackendLessonDTO {
  lessonId: number;
  title: string;
  startDate: string;
  endDate: string;
  capacity: number;
  maleLockerCap: number;
  femaleLockerCap: number;
  price: number;
  status: string; // 'OPEN', 'CLOSED', 'ONGOING', 'COMPLETED' 등
}

// 백엔드 응답을 프론트엔드 형식으로 변환하는 함수
const mapLessonData = (backendLesson: BackendLessonDTO): LessonDTO => {
  // 상태 매핑
  const statusMap: Record<string, string> = {
    'OPEN': '접수중',
    'CLOSED': '접수마감',
    'ONGOING': '수강중',
    'COMPLETED': '수강종료'
  };

  return {
    id: backendLesson.lessonId,
    title: backendLesson.title,
    name: "힐링수영반", // 기본값 설정 또는 백엔드에서 제공되면 업데이트
    startDate: formatDate(backendLesson.startDate),
    endDate: formatDate(backendLesson.endDate),
    timeSlot: "06:00~06:50", // 기본값 설정 또는 백엔드에서 제공되면 업데이트
    timePrefix: "오전", // 기본값 설정 또는 백엔드에서 제공되면 업데이트
    days: "(월,화,수,목,금)", // 기본값 설정 또는 백엔드에서 제공되면 업데이트
    capacity: backendLesson.capacity,
    remaining: 10, // 기본값 설정 또는 백엔드에서 제공되면 업데이트
    price: backendLesson.price,
    status: statusMap[backendLesson.status] || backendLesson.status,
    reservationId: "2025.04.17 13:00:00부터", // 기본값 설정 또는 백엔드에서 제공되면 업데이트
    receiptId: "2025.04.20 18:00:00까지", // 기본값 설정 또는 백엔드에서 제공되면 업데이트
    instructor: "성인(온라인)", // 기본값 설정 또는 백엔드에서 제공되면 업데이트
    location: "아르피나 수영장" // 기본값 설정 또는 백엔드에서 제공되면 업데이트
  };
};

// 날짜 형식 변환 (YYYY-MM-DD -> YY년MM월DD일)
const formatDate = (dateString: string): string => {
  try {
    const parts = dateString.split('-');
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
export const getLessons = async (params: PaginationParams): Promise<PaginatedResponse<LessonDTO>> => {
  const response = await publicApi.get("/swimming/lessons", { params });
  
  // 백엔드 응답 데이터 매핑
  const mappedData = {
    ...response.data,
    data: {
      ...response.data.data,
      content: response.data.data.content.map(mapLessonData)
    }
  };
  
  return mappedData;
};

// 특정 강습 상세 조회
export const getLesson = async (lessonId: number): Promise<LessonDTO> => {
  const response = await api.get(`/swimming/lessons/${lessonId}`);
  return response.data.data;
};

// 특정 기간 강습 목록 조회
export const getLessonsByPeriod = async (startDate: string, endDate: string): Promise<LessonDTO[]> => {
  const response = await api.get("/swimming/lessons/period", { 
    params: { startDate, endDate } 
  });
  return response.data.data;
};

// 사용 가능한 사물함 목록 조회
export const getLockers = async (gender?: string): Promise<LockerDTO[]> => {
  const response = await api.get("/swimming/lockers", { 
    params: { gender } 
  });
  return response.data.data;
};

// 특정 사물함 상세 조회
export const getLocker = async (lockerId: number): Promise<LockerDTO> => {
  const response = await api.get(`/swimming/lockers/${lockerId}`);
  return response.data.data;
};

// 수업 신청 및 결제
export const enrollLesson = async (enrollRequest: EnrollRequestDto): Promise<EnrollResponseDto> => {
  const response = await api.post("/swimming/enroll", enrollRequest);
  return response.data.data;
};

// 신청 취소
export const cancelEnroll = async (enrollId: number, cancelRequest: CancelRequestDto): Promise<EnrollResponseDto> => {
  const response = await api.post(`/swimming/enroll/${enrollId}/cancel`, cancelRequest);
  return response.data.data;
};

// 내 신청 내역 조회
export const getMyEnrolls = async (): Promise<EnrollDTO[]> => {
  const response = await api.get("/swimming/my-enrolls");
  return response.data.data;
};

// 상태별 신청 내역 조회 (페이징)
export const getMyEnrollsByStatus = async (status: string, params: PaginationParams): Promise<PaginatedResponse<EnrollDTO>> => {
  const response = await api.get("/swimming/my-enrolls/status", { 
    params: { status, ...params } 
  });
  return response.data;
};

// 특정 신청 상세 조회
export const getEnroll = async (enrollId: number): Promise<EnrollDTO> => {
  const response = await api.get(`/swimming/enrolls/${enrollId}`);
  return response.data.data;
};

// 결제 처리
export const payEnroll = async (paymentRequest: PaymentRequestDto): Promise<void> => {
  await api.post("/swimming/pay", paymentRequest);
};

// 재등록 안내 조회
export const getRenewalInfo = async (): Promise<RenewalDTO[]> => {
  const response = await api.get("/swimming/renewal");
  return response.data.data;
};

// 재등록 처리
export const processRenewal = async (renewalRequest: RenewalRequestDto): Promise<void> => {
  await api.post("/swimming/renewal", renewalRequest);
}; 