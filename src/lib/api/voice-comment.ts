import { privateApi, publicApi } from '@/lib/api/client';
import { VoiceComment } from '@/types/voice-comment';

// 댓글 목록 조회 (Read)
export const getVoiceComments = async (
  nttId: number
): Promise<VoiceComment[]> => {
  const { data } = await publicApi.get(`/cms/bbs/voice/read/${nttId}/comments`);
  return data;
};

// 댓글 생성 (Create)
export const createVoiceComment = async (
  nttId: number,
  content: string,
  displayWriter: string
): Promise<VoiceComment> => {
  const { data } = await privateApi.post(`/cms/bbs/voice/read/${nttId}/comments`, {
    content,
    displayWriter,
  });
  return data;
};

// 댓글 수정 (Update)
export const updateVoiceComment = async (
  nttId: number,
  commentId: number,
  content: string,
  displayWriter: string
): Promise<void> => {
  await privateApi.put(`/cms/bbs/voice/read/${nttId}/comments/${commentId}`, {
    content,
    displayWriter,
  });
};

// 댓글 삭제 (Delete)
export const deleteVoiceComment = async (
  nttId: number,
  commentId: number
): Promise<void> => {
  await privateApi.delete(`/cms/bbs/voice/read/${nttId}/comments/${commentId}`);
};