"use client";

import { Box } from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { getScrollbarStyle } from "@/styles/scrollbar";
import { useUserStyles } from "@/styles/theme";
import { MovieSection } from "@/components/sections/MovieSection";
import { EnterpriseSection } from "@/components/sections/EnterpriseSection";
import Layout from "@/components/layout/view/Layout";
import { useColorMode } from "@/components/ui/color-mode";
import { useMenu } from "@/lib/hooks/useMenu";
import { sortMenus } from "@/lib/api/menu";
import { useMemo } from "react";
import { STYLES } from "@/styles/theme-tokens";
import type { Styles } from "@/styles/theme";

export default function Home() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { menus } = useMenu();

  const treeMenus = useMemo(() => {
    try {
      const responseData = menus;
      if (!responseData) return [];

      // API 응답이 배열인 경우
      if (Array.isArray(responseData)) {
        return sortMenus(responseData);
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
  }, [menus]);
  const styles = useUserStyles(STYLES as Styles);

  return (
    <Layout menus={treeMenus} currentPage="홈">
      <Global styles={getScrollbarStyle(isDark)} />
      <Box as="main" id="mainContent" fontFamily={styles.fonts.body}>
        <MovieSection />
        <EnterpriseSection />
      </Box>
    </Layout>
  );
}
