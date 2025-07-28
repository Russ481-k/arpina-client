"use client";

import { Box } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { RootLayoutClient } from "@/components/layout/RootLayoutClient";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { FloatingButtons } from "@/components/layout/FloatingButtons";
import { getToken } from "@/lib/auth-utils";

export function CMSLayoutClient({ children }: { children: React.ReactNode }) {
  const colors = useColors();

  return (
    <AuthGuard allowedRoles={["ADMIN", "SYSTEM_ADMIN"]} redirectTo="/cms/login">
      <Box
        minH="100vh"
        bg={colors.bg}
        color={colors.text.primary}
        transition="background-color 0.2s"
      >
        <RootLayoutClient>{children}</RootLayoutClient>
        <FloatingButtons />
      </Box>
    </AuthGuard>
  );
}

export function openChatPopup(threadId: string, userName: string) {
  const width = 500;
  const height = 600;
  const left = window.screen.width - width - 20;
  const top = window.screen.height - height - 100;

  // 현재 토큰 가져오기
  const token = getToken();
  if (!token) {
    console.error("No token available");
    return;
  }

  // 팝업 창 열기
  const popup = window.open(
    `/chat-popup?threadId=${threadId}&userName=${userName}&token=${token}`,
    `chatWindow_${threadId}`,
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,menubar=no`
  );

  // 팝업 창이 차단되었는지 확인
  if (!popup || popup.closed || typeof popup.closed === "undefined") {
    alert("팝업 창이 차단되었습니다. 팝업 차단을 해제해주세요.");
  }
}
