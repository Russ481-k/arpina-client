"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  Box,
  Flex,
  Text,
  Icon,
  Input,
  Button,
  Badge,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { LuSend } from "react-icons/lu";
import { useChatMessages } from "@/hooks/useChat";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ChatMessageDto, SendMessageRequest } from "@/types/api/chat";
import { AxiosError } from "axios";

interface ConversationProps {
  selectedThreadId: number | null;
}

const MessageInput = memo(
  ({
    value,
    onChange,
    onSend,
    isConnected,
  }: {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    isConnected: boolean;
  }) => {
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    };

    return (
      <Flex p={4} borderTopWidth="1px">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          mr={2}
        />
        <Button
          onClick={onSend}
          colorScheme="blue"
          disabled={!isConnected || !value.trim()}
        >
          <Icon as={LuSend} />
        </Button>
      </Flex>
    );
  }
);

MessageInput.displayName = "MessageInput";

const ConnectionStatus = memo(({ isConnected }: { isConnected: boolean }) => (
  <Box p={2} borderBottomWidth="1px" bg="gray.50">
    <Badge colorScheme={isConnected ? "green" : "red"}>
      {isConnected ? "연결됨" : "연결 중..."}
    </Badge>
  </Box>
));

ConnectionStatus.displayName = "ConnectionStatus";

const MessageList = memo(({ messages }: { messages: ChatMessageDto[] }) =>
  messages.map((message: ChatMessageDto) => (
    <Flex
      key={message.id}
      justify={message.senderType === "ADMIN" ? "flex-end" : "flex-start"}
    >
      <Box
        maxW="70%"
        bg={message.senderType === "ADMIN" ? "blue.500" : "gray.100"}
        color={message.senderType === "ADMIN" ? "white" : "black"}
        px={4}
        py={2}
        borderRadius="lg"
      >
        <Text fontSize="sm" fontWeight="bold" mb={1}>
          {message.senderName}
        </Text>
        <Text>{message.content}</Text>
      </Box>
    </Flex>
  ))
);

MessageList.displayName = "MessageList";

export const Conversation = ({ selectedThreadId }: ConversationProps) => {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadIdNumber = selectedThreadId || 0; // 기본값 설정
  const {
    messages = [],
    isLoading,
    error,
    sendMessage,
  } = useChatMessages(threadIdNumber || undefined);

  // WebSocket 연결
  const { isConnected, sendMessage: sendWebSocketMessage } = useWebSocket({
    threadId: threadIdNumber || undefined,
    onMessageReceived: useCallback(
      (message: ChatMessageDto) => {
        console.log("WebSocket message received:", message);
        if (message.threadId === threadIdNumber) {
          sendMessage({
            threadId: threadIdNumber,
            content: message.content,
            senderType: "USER",
            senderName: message.senderName,
            messageType: "TEXT",
          });
        }
      },
      [threadIdNumber, sendMessage]
    ),
  });

  // 새 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !threadIdNumber || !isConnected) return;

    const messageRequest: SendMessageRequest = {
      threadId: threadIdNumber,
      content: messageInput.trim(),
      senderType: "ADMIN",
      senderName: "상담원",
      messageType: "TEXT",
    };

    // 메시지 전송
    sendMessage(messageRequest);

    // WebSocket을 통해 메시지 전송
    sendWebSocketMessage({
      ...messageRequest,
      id: Date.now(), // 임시 ID
      createdAt: new Date().toISOString(),
    });

    setMessageInput("");
  }, [
    messageInput,
    threadIdNumber,
    isConnected,
    sendMessage,
    sendWebSocketMessage,
  ]);

  const handleInputChange = useCallback((value: string) => {
    setMessageInput(value);
  }, []);

  return (
    <Flex direction="column" height="100%">
      <ConnectionStatus isConnected={isConnected} />

      <Flex direction="column" flex="1" p={4} overflowY="auto" gap={4}>
        {isLoading ? (
          <Center flex="1">
            <Spinner size="lg" color="blue.500" />
          </Center>
        ) : error ? (
          <Text textAlign="center" color="red.500">
            {(error as AxiosError)?.response?.status !== 404
              ? "메시지를 불러오는데 실패했습니다."
              : "아직 메시지가 없습니다."}
          </Text>
        ) : messages.length === 0 ? (
          <Text textAlign="center" color="gray.500">
            아직 메시지가 없습니다.
          </Text>
        ) : (
          <MessageList messages={messages} />
        )}
        <div ref={messagesEndRef} />
      </Flex>

      <MessageInput
        value={messageInput}
        onChange={handleInputChange}
        onSend={handleSendMessage}
        isConnected={isConnected}
      />
    </Flex>
  );
};
