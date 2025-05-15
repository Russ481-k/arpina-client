"use client";

import {
  Box,
  Container,
  Flex,
  Link,
  useBreakpointValue,
  Button,
  Icon,
  Drawer,
  Portal,
  VStack,
  CloseButton,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import Image from "next/image";
import { useRef, useState, useEffect, memo } from "react";
import NextLink from "next/link";
import { MenuItem } from "./MenuItem";
import { GiHamburgerMenu } from "react-icons/gi";
import { Menu } from "@/types/api";
import { usePathname } from "next/navigation";

interface HeaderProps {
  currentPage: string;
  menus?: Menu[];
  isPreview?: boolean;
}

// MenuItem을 메모이제이션하여 props가 변경되지 않으면 리렌더링되지 않도록 함
const MemoizedMenuItem = memo(MenuItem);

export const Header = memo(function Header({
  currentPage,
  menus = [],
  isPreview,
}: HeaderProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const isMainPage = pathname === "/";

  // 반응형 헤더 높이 설정
  const headerHeight = useBreakpointValue({
    base: "80px",
    lg: "108px",
  });

  // 현재 페이지가 메뉴 URL과 일치하는지 확인하는 함수
  const isMenuActive = (menuUrl: string | undefined) => {
    if (!menuUrl) return false;
    return pathname === menuUrl || pathname.startsWith(menuUrl + "/");
  };

  // 비지블이 false인 메뉴 필터링
  const visibleMenus = menus.filter((menu) => menu.visible !== false);

  // 마지막 메뉴 아이템에 isLastMenuItem 속성 추가
  const menusWithLastFlag = visibleMenus.map((menu, index) => ({
    ...menu,
    isLastMenuItem: index === visibleMenus.length - 1,
  }));

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setIsNavHovered(false);
        setIsMenuOpen(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleMouseEnter = () => {
    if (!isMobile && !isMenuOpen) {
      setIsNavHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isMenuOpen) {
      setIsNavHovered(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsNavHovered(!isMenuOpen);
  };

  const width = useBreakpointValue({ base: 150, lg: 209 });
  const height = useBreakpointValue({ base: 36, lg: 50 });

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
          isMainPage
            ? isMenuOpen
              ? "transparent"
              : "transparent"
            : isDark
            ? "rgba(26, 32, 44, 0.8)"
            : "rgba(255, 255, 255, 0.8)"
        }
        backdropFilter={isMainPage && isMenuOpen ? "blur(30px)" : "none"}
        transition="all 0.3s ease"
        ref={navRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="navigation"
        aria-label="Main navigation"
        height={isNavHovered || isMenuOpen ? "auto" : headerHeight}
        overflow="hidden"
        opacity={isMainPage ? (isMenuOpen ? 1 : 0) : 1}
        pointerEvents={isMainPage ? (isMenuOpen ? "auto" : "none") : "auto"}
        _before={
          isMainPage
            ? {
                content: '""',
                position: "absolute",
                top: "108px",
                left: 0,
                width: "100%",
                height: "2px",
                bg: "white",
                opacity: isMenuOpen ? 1 : 0,
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
          <Box position="relative">
            <Box
              position="absolute"
              left={0}
              top={{ base: "20px", lg: "30px" }}
              zIndex={1000}
            >
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
                      isMainPage && isMenuOpen
                        ? "/images/logo/logo_w.png"
                        : "/images/logo/logo.png"
                    }
                    width={width}
                    height={height}
                    alt="logo"
                  />
                </Box>
              </Link>
            </Box>

            <Box
              position="relative"
              display={{ base: "none", lg: "block" }}
              pl={250}
              pr={100}
            >
              <Box>
                <Flex
                  as="nav"
                  display={{ base: "none", md: "flex" }}
                  gap={1}
                  width="100%"
                  mx="auto"
                  justifyContent="space-between"
                >
                  {menusWithLastFlag?.map((menu, index) => (
                    <MemoizedMenuItem
                      key={index + menu.id}
                      menu={menu}
                      isNavHovered={isNavHovered || isMenuOpen}
                      isDark={isDark}
                      isRoot={true}
                      currentPage={currentPage}
                      isMainPage={isMainPage}
                    />
                  ))}
                </Flex>
              </Box>
            </Box>

            {/* <Box
              position="absolute"
              right={{ base: "35px", lg: "0" }}
              top={{ base: "20px", lg: "30px" }}
              zIndex={1000}
            >
              <Flex>
                <Button background="transparent" border="none">
                  <Icon size="lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="34"
                      height="34"
                      viewBox="0 0 34 34"
                      fill="none"
                    >
                      <path
                        d="M7.08333 25.4997H26.9167V15.6275C26.9167 10.1261 22.4768 5.66634 17 5.66634C11.5232 5.66634 7.08333 10.1261 7.08333 15.6275V25.4997ZM17 2.83301C24.0417 2.83301 29.75 8.56127 29.75 15.6275V28.333H4.25V15.6275C4.25 8.56127 9.95837 2.83301 17 2.83301ZM13.4583 29.7497H20.5417C20.5417 31.7057 18.956 33.2913 17 33.2913C15.044 33.2913 13.4583 31.7057 13.4583 29.7497Z"
                        fill={isMainPage && isMenuOpen ? "white" : "#007ACD"}
                      />
                    </svg>
                  </Icon>
                </Button>
              </Flex>
            </Box> */}
          </Box>
        </Container>
      </Box>
      {isMainPage && (
        <Box
          as="button"
          aria-label="Toggle Menu"
          display={{ base: "none", lg: "flex" }}
          alignItems="center"
          justifyContent="center"
          gap={2}
          position="absolute"
          right="100px"
          top="30px"
          color={isMenuOpen ? "transparent" : "white"}
          fontSize={30}
          transform={isMenuOpen ? "scale(1.1)" : "scale(1)"}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          onClick={toggleMenu}
          zIndex={1001}
        >
          MENU
          <Icon size="lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
            >
              <path
                d="M41.6667 36.4583C42.4692 36.4587 43.2409 36.7678 43.8217 37.3216C44.4025 37.8755 44.748 38.6315 44.7865 39.4331C44.8251 40.2347 44.5538 41.0204 44.0288 41.6275C43.5039 42.2345 42.7655 42.6163 41.9667 42.6937L41.6667 42.7083H8.33337C7.53084 42.7079 6.75922 42.3988 6.1784 41.8449C5.59759 41.2911 5.2521 40.5351 5.21353 39.7335C5.17496 38.9319 5.44627 38.1461 5.97124 37.5391C6.49621 36.9321 7.23458 36.5503 8.03337 36.4729L8.33337 36.4583H41.6667ZM41.6667 21.875C42.4955 21.875 43.2904 22.2042 43.8764 22.7903C44.4625 23.3763 44.7917 24.1712 44.7917 25C44.7917 25.8288 44.4625 26.6236 43.8764 27.2097C43.2904 27.7957 42.4955 28.125 41.6667 28.125H8.33337C7.50457 28.125 6.70972 27.7957 6.12367 27.2097C5.53761 26.6236 5.20837 25.8288 5.20837 25C5.20837 24.1712 5.53761 23.3763 6.12367 22.7903C6.70972 22.2042 7.50457 21.875 8.33337 21.875H41.6667ZM41.6667 7.29163C42.4955 7.29163 43.2904 7.62087 43.8764 8.20692C44.4625 8.79297 44.7917 9.58782 44.7917 10.4166C44.7917 11.2454 44.4625 12.0403 43.8764 12.6263C43.2904 13.2124 42.4955 13.5416 41.6667 13.5416H8.33337C7.50457 13.5416 6.70972 13.2124 6.12367 12.6263C5.53761 12.0403 5.20837 11.2454 5.20837 10.4166C5.20837 9.58782 5.53761 8.79297 6.12367 8.20692C6.70972 7.62087 7.50457 7.29163 8.33337 7.29163H41.6667Z"
                fill={isMenuOpen ? "#000" : "white"}
              />
            </svg>
          </Icon>
        </Box>
      )}

      {/* 모바일 메뉴 드로어 */}
      <Drawer.Root size="xs">
        <Drawer.Trigger asChild>
          <Button
            variant="outline"
            size="sm"
            display={{ base: "flex", lg: "none" }}
            position="absolute"
            right={isMainPage ? "34px" : "0"}
            top={isMainPage ? "34px" : "-60px"}
            background="transparent"
            border="none"
            zIndex={1000}
            _hover={{
              "& svg": {},
            }}
            _active={{}}
            transition="all 0.2s ease"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="34"
              height="34"
              viewBox="0 0 34 34"
              fill="none"
              style={{
                width: "34px",
                height: "34px",
              }}
            >
              <path
                d="M4.25 8.5H29.75V11.3333H4.25V8.5ZM4.25 15.5833H29.75V18.4167H4.25V15.5833ZM4.25 22.6667H29.75V25.5H4.25V22.6667Z"
                fill={
                  isDark
                    ? isMainPage
                      ? "white"
                      : "#0D344E"
                    : isMainPage
                    ? "white"
                    : "#0D344E"
                }
              />
            </svg>
          </Button>
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title flex="1">
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
                        src="/images/logo/logo.png"
                        width={168}
                        height={40}
                        alt="logo"
                      />
                    </Box>
                  </Link>
                </Drawer.Title>
                <Drawer.CloseTrigger asChild pos="initial">
                  <CloseButton />
                </Drawer.CloseTrigger>
              </Drawer.Header>
              <Drawer.Body>
                <VStack gap={6} align="stretch" mt={4}>
                  {menusWithLastFlag?.map((menu, index) => {
                    const isActive = isMenuActive(menu.url);
                    return (
                      <Box key={index + menu.id}>
                        <Link
                          as={NextLink}
                          href={menu.url || "#"}
                          display="block"
                          py={3}
                          fontSize="4xl"
                          fontWeight="semibold"
                          color={
                            isActive
                              ? isDark
                                ? "blue.200"
                                : "#373636"
                              : isDark
                              ? "gray.300"
                              : "#373636"
                          }
                          _hover={{
                            textDecoration: "none",
                            color: isDark ? "blue.200" : "#373636",
                          }}
                          _focus={{
                            boxShadow: "none",
                            color: isDark ? "blue.200" : "#373636",
                            outline: "none",
                            border: "none",
                          }}
                          _active={{
                            bg: "transparent",
                          }}
                          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          {menu.name}
                        </Link>

                        {menu.children && menu.children.length > 0 && (
                          <VStack gap={2} align="stretch" pl={4} mt={2}>
                            {menu.children.map((child) => {
                              const isChildActive = isMenuActive(child.url);
                              return (
                                <Link
                                  key={child.id}
                                  as={NextLink}
                                  href={child.url || "#"}
                                  display="block"
                                  py={2}
                                  fontSize={isChildActive ? "2xl" : "xl"}
                                  fontWeight={
                                    isChildActive ? "semibold" : "medium"
                                  }
                                  color={
                                    isChildActive
                                      ? isDark
                                        ? "blue.200"
                                        : "#4CCEC6"
                                      : isDark
                                      ? "gray.300"
                                      : "#ss"
                                  }
                                  _hover={{
                                    textDecoration: "none",
                                    color: isDark ? "blue.200" : "#4CCEC6",
                                  }}
                                  _focus={{
                                    boxShadow: "none",
                                    color: isDark ? "blue.200" : "#4CCEC6",
                                    outline: "none",
                                    border: "none",
                                  }}
                                  _active={{
                                    bg: "transparent",
                                  }}
                                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                  whiteSpace="nowrap"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                >
                                  {child.name}
                                </Link>
                              );
                            })}
                          </VStack>
                        )}

                        {index < menusWithLastFlag.length - 1 && (
                          <Box
                            as="hr"
                            my={4}
                            border="none"
                            borderTop="1px solid"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                          />
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
});
