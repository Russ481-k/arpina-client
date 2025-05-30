"use client";

import {
  Box,
  Container,
  Flex,
  Link,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import Image from "next/image";
import { useRef, useState, useEffect, memo } from "react";
import NextLink from "next/link";
import { Menu } from "@/types/api";
import { usePathname } from "next/navigation";
import DesktopNav from "../DesktopNav";
import UtilityIcons from "./UtilityIcons";
import MobileMenuDrawer from "./MobileMenuDrawer";
import SitemapDrawer from "./SitemapDrawer";

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
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [isNavHovered, setIsNavHovered] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const isMainPage = pathname === "/";

  const [isSitemapDrawerOpen, setIsSitemapDrawerOpen] = useState(false);

  const headerHeight = useBreakpointValue({
    base: "60px",
    lg: "70px",
  });

  const isMenuActive = (menuUrl: string | undefined) => {
    if (!menuUrl) return false;
    return pathname === menuUrl || pathname.startsWith(menuUrl + "/");
  };

  const visibleMenus = menus.filter((menu) => menu.visible !== false);
  const menusWithLastFlag = visibleMenus.map((menu, index) => ({
    ...menu,
    isLastMenuItem: index === visibleMenus.length - 1,
  }));

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setIsNavHovered(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleMouseEnter = () => {
    setIsNavHovered(true);
  };

  const handleMouseLeave = () => {
    setIsNavHovered(false);
  };

  const logoWidth = useBreakpointValue({ base: 120, lg: 160 }) || 120;
  const logoHeight = useBreakpointValue({ base: 22, lg: 30 }) || 22;

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
        zIndex={1000}
        bg={isDark ? "gray.800" : "white"}
        backgroundColor={
          isNavHovered
            ? isDark
              ? "rgba(26, 32, 44, 0.8)"
              : "rgba(255, 255, 255, 0.8)"
            : isDark
            ? "gray.800"
            : "white"
        }
        backdropFilter={isNavHovered ? "blur(30px)" : "none"}
        transition="all 0.3s ease"
        ref={navRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="navigation"
        aria-label="Main navigation"
        height={headerHeight}
        overflow="visible"
        opacity={1}
        pointerEvents={"auto"}
        _before={
          isNavHovered
            ? {
                content: '""',
                position: "absolute",
                top: "70px",
                left: 0,
                width: "100%",
                height: "2px",
                bg: isDark ? "gray.700" : "gray.200",
                opacity: 1,
                transition: "opacity 0.3s ease",
              }
            : {}
        }
      >
        <Container
          position="relative"
          py={0}
          px={{ base: 2, md: 4, lg: 8, xl: 0 }}
          transition="all 0.3s"
          m={0}
          w="100%"
          maxW="1600px"
          margin="0 auto"
        >
          <Flex position="relative" align="center" h={headerHeight}>
            <Box zIndex={1000}>
              <Link
                as={NextLink}
                href="/"
                _hover={{ textDecoration: "none", opacity: 0.8 }}
                display="flex"
                alignItems="center"
                transition="opacity 0.2s"
              >
                <Box>
                  <Image
                    src={
                      isNavHovered && isDark
                        ? "/images/logo/logo_w.png"
                        : "/images/logo/logo.png"
                    }
                    width={logoWidth}
                    height={logoHeight}
                    alt="logo"
                  />
                </Box>
              </Link>
            </Box>

            <DesktopNav
              menusWithLastFlag={menusWithLastFlag}
              isNavHovered={isNavHovered}
              isDark={isDark}
              currentPage={currentPage}
              isMainPage={isMainPage}
            />
            <UtilityIcons
              iconColor={iconColor}
              onSitemapOpen={() => setIsSitemapDrawerOpen(true)}
            />
          </Flex>
        </Container>
      </Box>
      <MobileMenuDrawer
        menusWithLastFlag={menusWithLastFlag}
        isMenuActive={isMenuActive}
        isDark={isDark}
        isPreview={isPreview}
        width={logoWidth}
        height={logoHeight}
      />
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
