"use client";

import "@/styles/globals.css";
import { Box } from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { getScrollbarStyle } from "@/styles/scrollbar";
import { Global } from "@emotion/react";
import { FloatingButtons } from "@/components/layout/FloatingButtons";
import Layout from "@/components/layout/view/Layout";
import { useColors } from "@/styles/theme";
import { menuApi, menuKeys, sortMenus } from "@/lib/api/menu";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "@/types/menu";

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const colors = useColors();

  // 메뉴 목록 가져오기
  const { data: menuResponse, isLoading: isMenusLoading } = useQuery({
    queryKey: menuKeys.list(""),
    queryFn: async () => {
      const response = await menuApi.getPublicMenus();
      return response;
    },
  });

  const menus = useMemo(() => {
    try {
      if (!menuResponse) {
        return [];
      }

      // API response structure: { success, message, data, errorCode, stackTrace }
      // Get the menu array from the data property
      const menuData = menuResponse.data.data;

      if (!menuData || !Array.isArray(menuData)) {
        console.warn("Menu data is not an array:", menuData);
        return [];
      }

      // Process the flat menu array into a hierarchical structure
      return sortMenus(menuData);
    } catch (error) {
      console.error("Error processing menu data:", error);
      return [];
    }
  }, [menuResponse]);

  return (
    <Layout menus={menus}>
      <Box
        as="main"
        bg={colors.bg}
        flex="1"
        position="relative"
        mx="auto"
      >
        <Global styles={[getScrollbarStyle(isDark)]} />
        {children}
        <FloatingButtons />
      </Box>
    </Layout>
  );
}
