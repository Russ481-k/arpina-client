
// 채팅 메시지
export interface ChatMessageDto {
  id?: number;
  threadId: number;
  content: string;
  senderType: 'USER' | 'ADMIN';
  senderName: string;
  messageType: 'TEXT' | 'FILE';
  fileName?: string;
  fileUrl?: string;
  isRead?: boolean;
  readAt?: string;
  createdAt?: string;
}

// 메시지 전송 요청
export interface SendMessageRequest {
  threadId: number;
  content: string;
  senderType: 'USER' | 'ADMIN';
  senderName: string;
  messageType: 'TEXT' | 'FILE';
  fileName?: string;
  fileUrl?: string;
}

// 채팅 초기화 요청
export interface InitializeChatRequest {
  threadId: number;
  userName: string;
  userType: 'USER' | 'ADMIN';
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
} 