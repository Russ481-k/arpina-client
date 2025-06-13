"use client";

import React from "react";
import { Box, Text, Image, Center } from "@chakra-ui/react";
import type { Popup } from "@/types/api";
import { useColorModeValue } from "@/components/ui/color-mode";

interface PopupPreviewProps {
  popup: Popup | null;
}

export const PopupPreview = React.memo(function PopupPreview({
  popup,
}: PopupPreviewProps) {
  const containerBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.500", "gray.400");

  if (!popup) {
    return (
      <Center h="full" bg={containerBg} borderRadius="md">
        <Text color={textColor}>목록에서 팝업을 선택하여 미리보세요.</Text>
      </Center>
    );
  }

  return (
    <Box p={4} bg={containerBg} h="full" borderRadius="md">
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        미리보기: {popup.title}
      </Text>
      <Center h="calc(100% - 40px)">
        <Box
          w="full"
          h="full"
          p={4}
          bg="white"
          border="1px solid #ddd"
          boxShadow="lg"
          overflow="auto"
        >
          <Box
            width="100%"
            height="100%"
            dangerouslySetInnerHTML={{ __html: popup.content_value }}
          />
        </Box>
      </Center>
    </Box>
  );
});
