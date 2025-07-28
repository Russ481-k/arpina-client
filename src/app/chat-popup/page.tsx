"use client";

import { Box, Spinner, Center } from "@chakra-ui/react";
import { Conversation } from "@/components/chat/Conversation";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { useAuthActions } from "@/stores/auth";

function ChatContent() {
  const searchParams = useSearchParams();
  const threadId = Number(searchParams.get("threadId")) || 1;
  const token = searchParams.get("token");
  const { syncAuthState } = useAuthActions();

  useEffect(() => {
    // URL에서 받은 토큰을 localStorage에 저장하고 인증 상태 동기화
    if (token) {
      localStorage.setItem("token", token);
      syncAuthState();
    }
  }, [token, syncAuthState]);

  return <Conversation selectedThreadId={threadId} />;
}

export default function ChatPopupPage() {
  return (
    <Box height="100vh" bg="white">
      <AuthInitializer />
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
