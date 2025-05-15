"use client";

import { Box } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { RootLayoutClient } from "@/components/layout/RootLayoutClient";

function CMSLayoutContent({ children }: { children: React.ReactNode }) {
  const colors = useColors();

  return (
    <Box
      minH="100vh"
      bg={colors.bg}
      color={colors.text.primary}
      transition="background-color 0.2s"
    >
      <RootLayoutClient>{children}</RootLayoutClient>
    </Box>
  );
}

export function CMSLayoutClient({ children }: { children: React.ReactNode }) {
  return <CMSLayoutContent>{children}</CMSLayoutContent>;
}
