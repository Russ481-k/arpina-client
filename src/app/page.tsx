"use client";

import { Global } from "@emotion/react";
import { getScrollbarStyle } from "@/styles/scrollbar";
import Layout from "@/components/layout/view/Layout";
import { useColorMode } from "@/components/ui/color-mode";
import { useMenu } from "@/lib/hooks/useMenu";
import { sortMenus } from "@/lib/api/menu";
import { useEffect, useMemo } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { PopupManager } from "@/components/common/PopupManager";
import MainSection from "@/components/main/MainSection";
import { useRouter } from "next/navigation";

export default function Home() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { menus } = useMenu();

  const treeMenus = useMemo(() => {
    try {
      if (!menus?.success) {
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

  const router = useRouter();
  useEffect(() => {
    router.push("/");
  }, []);

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

      <MainSection />
    </Layout>
  );
}
