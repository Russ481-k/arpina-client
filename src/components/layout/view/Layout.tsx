"use client";

import { Box } from "@chakra-ui/react";
import { Header } from "./Header/Header";
import { Footer } from "@/components/layout/view/Footer";
import { memo } from "react";
import { useColors } from "@/styles/theme";
import { Menu } from "@/types/api";
import { Global } from "@emotion/react";
import { getScrollbarStyle } from "@/styles/scrollbar";
import { useColorMode } from "@/components/ui/color-mode";
import { motion, Variants } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  isPreview?: boolean;
  menus?: Menu[];
}

// Header를 메모이제이션하여 props가 변경되지 않으면 리렌더링되지 않도록 함
const MemoizedHeader = memo(Header);

// Footer를 메모이제이션
const MemoizedFooter = memo(Footer);

const headerVariants: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Layout({
  children,
  currentPage = "홈",
  isPreview,
  menus,
}: LayoutProps) {
  const colors = useColors();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Box bg={colors.bg} minHeight="80vh" fontFamily="'Inter', sans-serif">
      <Global styles={[getScrollbarStyle(isDark)]} />
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          width: "100%",
        }}
      >
        <MemoizedHeader
          currentPage={currentPage}
          menus={menus}
          isPreview={isPreview}
        />
      </motion.div>
      <Box as="main" mx="auto" position="relative" w="full" mt="70px">
        {children}
      </Box>
      {/* <MemoizedFooter /> */}
    </Box>
  );
}
