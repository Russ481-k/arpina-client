"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { Content } from "../types";
import { Menu } from "@/types/api";

interface ContentPreviewProps {
  content: Content | null;
  menus?: Menu[];
}

export function ContentPreview({ content }: ContentPreviewProps) {
  const colors = useColors();

  if (!content || !content.url) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="full"
        gap={4}
        color={colors.text.primary}
      >
        <Text fontSize="lg" fontWeight="medium" textAlign="center">
          미리보기를 표시할 컨텐츠를 선택하세요.
        </Text>
      </Flex>
    );
  }

  return (
    <Box h="full" w="full" pos="relative">
      <iframe
        src={content.url}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="Content Preview"
      />
    </Box>
  );
}
