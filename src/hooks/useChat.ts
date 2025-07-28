import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse, AxiosError } from 'axios';
import { chatApi } from '@/lib/api/chat';
import { ChatMessageDto, SendMessageRequest, ApiResponse } from '@/types/api/chat';

export const useChatMessages = (threadId?: number) => {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery<ChatMessageDto[], AxiosError>({
    queryKey: ['chat', 'messages', threadId],
    queryFn: async () => {
      try {
        const res = await chatApi.getMessages(threadId!);
        return res.data.data || [];
      } catch (error) {
        // 404 에러는 메시지가 없는 것으로 처리
        if ((error as AxiosError).response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: threadId !== undefined,
  });

  const sendMessageMutation = useMutation<
    ChatMessageDto,
    Error,
    SendMessageRequest
  >({
    mutationFn: (data) => chatApi.sendMessage(data).then(res => res.data.data),
    onSuccess: (newMessage) => {
      queryClient.setQueryData<ChatMessageDto[]>(
        ['chat', 'messages', threadId],
        (old) => old ? [...old, newMessage] : [newMessage]
      );
    },
  });

  const markAsReadMutation = useMutation<
    void,
    Error,
    { messageId: number }
  >({
    mutationFn: ({ messageId }) => chatApi.markAsRead(threadId!, messageId).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', threadId],
      });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    sendMessage: sendMessageMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
  };
}; 