"use client";

import { Box } from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { getScrollbarStyle } from "@/styles/scrollbar";
import { useUserStyles } from "@/styles/theme";
import Layout from "@/components/layout/view/Layout";
import { useColorMode } from "@/components/ui/color-mode";
import { useMenu } from "@/lib/hooks/useMenu";
import { sortMenus } from "@/lib/api/menu";
import { useMemo } from "react";
import { STYLES } from "@/styles/theme-tokens";
import type { Styles } from "@/styles/theme";
import { useRouter } from "next/navigation";

export default function Home() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { menus } = useMenu();
  const router = useRouter();
  const treeMenus = useMemo(() => {
    try {
      // API 응답이 성공했는지 확인
      if (!menus?.success) {
        console.error("Menu API call was not successful");
        return [];
      }

      // data 배열이 존재하는지 확인
      const menuData = menus.data;
      if (!menuData || !Array.isArray(menuData)) {
        console.error("Menu data is not an array:", menuData);
        return [];
      }

      // 메뉴 데이터를 정렬해서 반환
      return sortMenus(menuData);
    } catch (error) {
      console.error("Error processing menu data:", error);
      return [];
    }
  }, [menus]);
  router.push("/signup");
  const styles = useUserStyles(STYLES as Styles);
  return (
    <Layout menus={treeMenus} currentPage="홈">
      <Global styles={getScrollbarStyle(isDark)} />
      <Box as="main" id="mainContent" fontFamily={styles.fonts.body}>
        <Box h="100vh" bg="blue.500"></Box>
      </Box>
    </Layout>
  );
}
