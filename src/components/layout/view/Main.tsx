"use client";

import { Box } from "@chakra-ui/react";
import { Menu } from "@/types/api";
import { memo } from "react";

import Layout from "./Layout";
import { MovieSection } from "@/components/sections/MovieSection";
import { EnterpriseSection } from "@/components/sections/EnterpriseSection";
import { useUserStyles } from "@/styles/theme";
import { STYLES } from "@/styles/theme-tokens";
import { Styles } from "@/styles/theme";

interface MainProps {
  menus: Menu[];
  isPreview?: boolean;
}

export const Main = memo(({ menus, isPreview = false }: MainProps) => {
  const styles = useUserStyles(STYLES as Styles);
  return (
    <Layout currentPage="홈" isPreview={isPreview} menus={menus}>
      <Box as="main" id="mainContent" fontFamily={styles.fonts.body}>
        <MovieSection />
        <EnterpriseSection />
      </Box>
    </Layout>
  );
});

Main.displayName = "Main";

export default Main;
