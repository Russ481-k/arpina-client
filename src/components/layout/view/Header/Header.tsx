"use client";

import {
  Box,
  Container,
  Flex,
  Link,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import Image from "next/image";
import { useRef, useState, useEffect, memo } from "react";
import NextLink from "next/link";
import { Menu } from "@/types/api";
import { usePathname } from "next/navigation";
import DesktopNav from "../DesktopNav";
import { UtilityIcons } from "./UtilityIcons";
import SitemapDrawer from "./SitemapDrawer";

const newMenuItems: Menu[] = [
  {
    id: 1,
    name: "센터안내",
    url: "/center-info",
    children: [],
    sortOrder: 1,
    visible: true,
    type: "LINK",
    displayPosition: "HEADER",
    parentId: null,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 2,
    name: "상담안내",
    url: "/counseling-info",
    children: [],
    sortOrder: 2,
    visible: true,
    type: "LINK",
    displayPosition: "HEADER",
    parentId: null,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 3,
    name: "자가진단",
    url: "/self-diagnosis",
    children: [],
    sortOrder: 3,
    visible: true,
    type: "LINK",
    displayPosition: "HEADER",
    parentId: null,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 4,
    name: "성고충상담",
    url: "/sexual-grievance",
    children: [],
    sortOrder: 4,
    visible: true,
    type: "LINK",
    displayPosition: "HEADER",
    parentId: null,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 5,
    name: "게시판",
    url: "/board",
    children: [],
    sortOrder: 5,
    visible: true,
    type: "LINK",
    displayPosition: "HEADER",
    parentId: null,
    createdAt: "",
    updatedAt: "",
  },
];

const buildVisibleMenuTree = (menus: Menu[]): Menu[] => {
  if (!menus) {
    return [];
  }

  const filterAndSortRecursive = (nodes: Menu[]): Menu[] => {
    return nodes
      .map((node) => {
        const newNode = { ...node };
        if (node.children && node.children.length > 0) {
          newNode.children = filterAndSortRecursive(node.children);
        } else {
          newNode.children = [];
        }
        return newNode;
      })
      .filter((node) => node.visible !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  return filterAndSortRecursive(menus);
};

interface HeaderProps {
  currentPage: string;
  menus?: Menu[];
  isPreview?: boolean;
}

export const Header = memo(function Header({
  currentPage,
  menus = [],
  isPreview,
}: HeaderProps) {
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSitemapDrawerOpen, setIsSitemapDrawerOpen] = useState(false);
  const [lastHoveredMenuId, setLastHoveredMenuId] = useState<number | null>(
    null
  );

  const { colorMode } = useColorMode();
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const isDark = colorMode === "dark";
  const isMainPage = pathname === "/";
  const colors = useColors();

  const headerHeight = useBreakpointValue({
    base: "60px",
    lg: "70px",
  });

  const isMenuActive = (menuUrl: string | undefined) => {
    if (!menuUrl) return false;
    return pathname === menuUrl || pathname.startsWith(menuUrl + "/");
  };

  const visibleMenus = buildVisibleMenuTree(newMenuItems); // Use new menu items
  const menusWithLastFlag = visibleMenus.map((menu, index) => ({
    ...menu,
    isLastMenuItem: index === visibleMenus.length - 1,
  }));

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setIsNavHovered(false);
        setLastHoveredMenuId(null);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // 외부 클릭 시 헤더 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsNavHovered(false);
        setLastHoveredMenuId(null);
      }
    };

    if (isNavHovered) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNavHovered]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleMenuHover = (menuId: number) => {
    // 이전 타이머가 있다면 클리어
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setLastHoveredMenuId(menuId);
    setIsNavHovered(true);
  };

  const handleMenuLeave = () => {
    // 메뉴 아이템에서 나갈 때 약간의 지연 후 닫기
    closeTimerRef.current = setTimeout(() => {
      setIsNavHovered(false);
      setLastHoveredMenuId(null);
      closeTimerRef.current = null;
    }, 150);
  };

  const logoWidth = useBreakpointValue({ base: 28, lg: 32 }) || 32;
  const logoHeight = useBreakpointValue({ base: 28, lg: 32 }) || 32;

  const iconColor = isNavHovered
    ? isDark
      ? "white"
      : "black"
    : isDark
    ? "white"
    : "#0D344E";

  return (
    <>
      <Box
        as="header"
        position="fixed"
        top={isPreview ? 50 : 0}
        left={0}
        right={0}
        zIndex={10}
        bg={
          isNavHovered
            ? isDark
              ? "rgba(26, 32, 44, 0.95)"
              : "rgba(255, 255, 255, 0.95)"
            : isDark
            ? "gray.800"
            : "white"
        }
        transition="all 0.3s ease"
        ref={navRef}
        role="navigation"
        aria-label="Main navigation"
        height={headerHeight}
        overflow="visible"
        opacity={1}
        pointerEvents={"auto"}
        w="100%"
        // _after={{
        //   content: '""',
        //   position: "absolute",
        //   bottom: "0",
        //   left: "0",
        //   width: "100%",
        //   height: "1px",
        //   bg: isMainPage ? "#0D344E" : isDark ? "blue.200" : "black",
        //   transition: "all 0.3s ease",
        //   opacity: isNavHovered && lastHoveredMenuId ? "1" : "0",
        //   transformOrigin: "left",
        // }}
      >
        <Container
          position="relative"
          p={0}
          transition="all 0.3s"
          m="0 4rem"
          maxW="92vw"
          height="100%"
        >
          <Flex position="relative" direction="column" height="100%">
            <Flex
              position="relative"
              align="center"
              justify="space-between"
              minH={headerHeight}
            >
              <Flex zIndex={1000} align="center" h={headerHeight}>
                <Link
                  as={NextLink}
                  href="/"
                  display="flex"
                  alignItems="center"
                  transition="opacity 0.2s"
                >
                  <VStack gap={0} align="flex-start">
                    <Image
                      src="/images/logo/logo.png"
                      alt="logo"
                      width={logoWidth}
                      height={logoHeight}
                    />
                  </VStack>
                </Link>
              </Flex>
              <Flex align="center" gap={2} w="45%">
                <DesktopNav
                  menusWithLastFlag={menusWithLastFlag}
                  isNavHovered={isNavHovered}
                  isDark={isDark}
                  currentPage={currentPage}
                  isMainPage={isMainPage}
                  lastHoveredMenuId={lastHoveredMenuId}
                  onMenuHover={handleMenuHover}
                  onMenuLeave={handleMenuLeave}
                />
                <UtilityIcons
                  menus={menus}
                  iconColor={iconColor}
                  onSitemapOpen={() => setIsSitemapDrawerOpen(true)}
                />
              </Flex>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* 통합된 확장 영역 */}
      {/* <Box
        position="fixed"
        top={(isPreview ? 50 : 0) + parseInt(headerHeight || "70")}
        left={0}
        right={0}
        zIndex={2}
        height="160px"
        transform={isNavHovered ? "translateY(0)" : "translateY(-20px)"}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        opacity={isNavHovered ? 1 : 0}
        visibility={isNavHovered ? "visible" : "hidden"}
        bg={isDark ? "rgba(26, 32, 44, 0.95)" : "rgba(255, 255, 255, 0.95)"}
        bgImage="url('/images/header/header_bg.png')"
        bgSize="cover"
        bgRepeat="no-repeat"
        backgroundPosition="center"
        backdropFilter="blur(30px)"
        pointerEvents={isNavHovered ? "auto" : "none"}
        overflow="hidden"
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
      /> */}
      <SitemapDrawer
        isOpen={isSitemapDrawerOpen}
        onClose={() => setIsSitemapDrawerOpen(false)}
        menusWithLastFlag={menusWithLastFlag}
        isMenuActive={isMenuActive}
        isDark={isDark}
        width={logoWidth}
        height={logoHeight}
      />
    </>
  );
});
