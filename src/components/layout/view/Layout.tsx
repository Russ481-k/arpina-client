"use client";

import { Box } from "@chakra-ui/react";
import { Header } from "./Header";
import { Footer } from "@/components/layout/view/Footer";
import { memo, Suspense } from "react";
import { useColors } from "@/styles/theme";
import { Menu } from "@/types/api";

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

// 로딩 컴포넌트
const LoadingFallback = () => (
  <Box
    position="fixed"
    top={0}
    left={0}
    right={0}
    bottom={0}
    bg="white"
    zIndex={9999}
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <Box
      width="40px"
      height="40px"
      border="4px solid"
      borderColor="blue.500"
      borderTopColor="transparent"
      borderRadius="full"
      animation="spin 1s linear infinite"
    />
  </Box>
);

export default function Layout({
  children,
  currentPage = "홈",
  isPreview,
  menus,
}: LayoutProps) {
  const colors = useColors();
  return (
    <Box bg={colors.bg} minHeight="100vh" fontFamily="SCoreDream, sans-serif">
      <MemoizedHeader
        currentPage={currentPage}
        menus={menus}
        isPreview={isPreview}
      />
      <Box>
        <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
      </Box>
      <MemoizedFooter />
    </Box>
  );
}
