import { api } from './index';
import {ChatMessageDto, SendMessageRequest, ApiResponse } from '@/types/api/chat';

// API 기본 URL은 index.ts에서 설정하므로 여기서는 제거
export const chatApi = {
  // 메시지 관련
  getMessages: (threadId: number) =>
    api.get<ApiResponse<ChatMessageDto[]>>(`/chat/threads/${threadId}/messages`),

  sendMessage: (data: SendMessageRequest) =>
    api.post<ApiResponse<ChatMessageDto>>('/chat/messages', data),

  // 읽음 처리
  markAsRead: (threadId: number, messageId: number) =>
    api.put<ApiResponse<void>>(`/chat/threads/${threadId}/messages/${messageId}/read`),

  // 파일 업로드 (현재는 제외)
  // uploadFile: (threadId: number, file: File) => {
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   return api.post<ApiResponse<{ fileName: string; fileUrl: string }>>(
  //     `/chat/threads/${threadId}/files`,
  //     formData,
  //     {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     }
  //   );
  // },
};

// axios 인터셉터 설정
export const setupChatApi = (cmsCode: string, userToken?: string) => {
  // 요청 인터셉터
  api.interceptors.request.use((config) => {
    // CMS 코드를 헤더에 추가
    config.headers['X-CMS-Code'] = cmsCode;
    
    // 인증 토큰이 있다면 추가
    if (userToken) {
      config.headers['Authorization'] = `Bearer ${userToken}`;
    }
    
    return config;
  });

  // 응답 인터셉터
  api.interceptors.response.use(
    (response) => {
      // API 응답 구조 변환
      return {
        ...response,
        data: {
          success: true,
          data: response.data,
        },
      };
    },
    (error) => {
      // 에러 응답 구조 변환
      return Promise.reject({
        ...error,
        response: {
          ...error.response,
          data: {
            success: false,
            error: error.response?.data?.message || '알 수 없는 오류가 발생했습니다.',
          },
        },
      });
    }
  );
}; 