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
  const { data: menuResponse, isLoading: isMenusLoading } = useQuery<Menu[]>({
    queryKey: menuKeys.list(""),
    queryFn: async () => {
      const response = await menuApi.getPublicMenus();
      // Convert targetId to string if needed
      return response.data.map((menu: any) => ({
        ...menu,
        targetId:
          menu.targetId !== undefined && menu.targetId !== null
            ? String(menu.targetId)
            : undefined,
      }));
    },
  });

  const menus = useMemo(() => {
    try {
      const responseData = menuResponse;
      if (!responseData) return [];

      // API 응답이 배열인 경우
      if (Array.isArray(responseData)) {
        // Convert targetId to number for sortMenus
        return sortMenus(
          responseData.map((menu: any) => ({
            ...menu,
            targetId:
              menu.targetId !== undefined &&
              menu.targetId !== null &&
              menu.targetId !== ""
                ? Number(menu.targetId)
                : undefined,
          }))
        );
      }

      // API 응답이 객체인 경우 data 필드를 확인
      const menuData = responseData;
      if (!menuData) return [];

      // menuData가 배열인지 확인
      return Array.isArray(menuData) ? sortMenus(menuData) : [menuData];
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
        minH="100vh"
        mx="auto"
      >
        <Global styles={[getScrollbarStyle(isDark)]} />
        {children}
        <FloatingButtons />
      </Box>
    </Layout>
  );
}
