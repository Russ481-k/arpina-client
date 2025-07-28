"use client";

import { Box, Spinner, Center } from "@chakra-ui/react";
import { Conversation } from "@/components/chat/Conversation";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { chatApi } from "@/lib/api/chat";

function ChatContent() {
  const searchParams = useSearchParams();
  const threadId = Number(searchParams.get("threadId")) || 1;
  const token = searchParams.get("token");
  const userName = searchParams.get("userName") || "상담원";

  useEffect(() => {
    // URL에서 받은 토큰을 localStorage에 저장
    if (token) {
      localStorage.setItem("token", token);
    }

    // 채팅방 입장 시 초기 정보 전송
    const initializeChat = async () => {
      try {
        await chatApi.initializeChat({
          threadId,
          userName,
          userType: "ADMIN",
        });
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      }
    };

    initializeChat();
  }, [token, threadId, userName]);

  return <Conversation selectedThreadId={threadId} />;
}

export default function ChatPopupPage() {
  return (
    <Box height="100vh" bg="white">
      <Suspense
        fallback={
          <Center height="100%">
            <Spinner size="xl" color="blue.500" />
          </Center>
        }
      >
        <ChatContent />
      </Suspense>
    </Box>
  );
}
