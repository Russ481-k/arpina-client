"use client";

import { Box, Heading } from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { getScrollbarStyle } from "@/styles/scrollbar";
import Layout from "@/components/layout/view/Layout";
import { useColorMode } from "@/components/ui/color-mode";
import { useMenu } from "@/lib/hooks/useMenu";
import { sortMenus } from "@/lib/api/menu";
import { useMemo } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { PopupManager } from "@/components/common/PopupManager";
import { HeroSection } from "@/components/main/HeroSection";
import { MarqueeSection } from "@/components/main/MarqueeSection";
import { NoticeSection } from "@/components/main/NoticeSection";
import { ApplySection } from "@/components/main/ApplySection";
import { EstimateSection } from "@/components/main/EstimateSection";

export default function Home() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { menus } = useMenu();

  const treeMenus = useMemo(() => {
    try {
      if (!menus?.success) {
        console.error("Menu API call was not successful");
        return [];
      }

      const menuData = menus.data;
      if (!menuData || !Array.isArray(menuData)) {
        console.error("Menu data is not an array:", menuData);
        return [];
      }

      return sortMenus(menuData);
    } catch (error) {
      console.error("Error processing menu data:", error);
      return [];
    }
  }, [menus]);

  return (
    <Layout menus={treeMenus} currentPage="홈">
      <Global styles={getScrollbarStyle(isDark)} />
      <PopupManager />
      <Global
        styles={{
          "@font-face": {
            fontFamily: "Tenada",
            src: "url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2210-2@1.0/Tenada.woff2') format('woff2')",
            fontWeight: "normal",
            fontStyle: "normal",
          },
        }}
      />
      <Box
        as="main"
        id="mainContent"
        pt={100}
        fontFamily="'Paperlogy', sans-serif"
        lineHeight="1"
      >
        <Heading
          as="h3"
          mb={6}
          fontSize="40px"
          fontWeight="bold"
          color={"#444445"}
          lineHeight={"1"}
          fontFamily="'Paperlogy', sans-serif"
          w={"100%"}
          maxW={"1600px"}
          mx="auto"
          my={0}
        >
          당신의 새로운 여정이 시작 되는곳
        </Heading>
        <HeroSection />
        <MarqueeSection />
        <NoticeSection />
        <ApplySection />
        <EstimateSection />
      </Box>
    </Layout>
  );
}
