"use client";

import "@/styles/globals.css";
import { Box } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const colors = useColors();

  return (
    <Box
      as="main"
      bg={colors.bg}
      flex="1"
      position="relative"
      minH="100vh"
      mx="auto"
    >
      {children}
    </Box>
  );
}
