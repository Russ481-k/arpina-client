"use client";

import { Box, IconButton, Text } from "@chakra-ui/react";
import { IoChatbubblesOutline } from "react-icons/io5";
import { useRecoilValue } from "recoil";
import { authState } from "@/stores/auth";
import { openChatPopup } from "@/lib/chat-utils";

export function UserChatButton() {
  const { user } = useRecoilValue(authState);

  const handleChatClick = () => {
    openChatPopup({
      userName: user?.name || "방문자",
      userType: "USER",
    });
  };

  return (
    <Box
      position="fixed"
      bottom={{ base: 4, md: 8 }}
      right={{ base: 4, md: 8 }}
      zIndex={10}
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <IconButton
          aria-label="채팅 시작"
          onClick={handleChatClick}
          colorScheme="blue"
          size="lg"
          rounded="full"
          shadow="lg"
          _hover={{
            transform: "translateY(-2px)",
            shadow: "xl",
          }}
          transition="all 0.2s"
        >
          <IoChatbubblesOutline size={24} />
        </IconButton>
        <Text
          fontSize="sm"
          color="gray.600"
          bg="white"
          px={2}
          py={1}
          rounded="md"
          shadow="sm"
        >
          문의하기
        </Text>
      </Box>
    </Box>
  );
}
