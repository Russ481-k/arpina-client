"use client";

import {
  Box,
  Link,
  Drawer,
  Portal,
  VStack,
  CloseButton,
  IconButton,
  Button,
  Separator,
  Flex,
} from "@chakra-ui/react";
import Image from "next/image";
import { memo, useState, useCallback } from "react";
import NextLink from "next/link";
import { Menu } from "@/types/api";
import { Grid3X3Icon, LogOutIcon, User2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRecoilValue } from "recoil";
import { authState, useAuthActions } from "@/stores/auth";

interface MobileMenuDrawerProps {
  menusWithLastFlag: (Menu & { isLastMenuItem?: boolean })[];
  isMenuActive: (menuUrl: string | undefined) => boolean;
  isDark: boolean;
  isPreview?: boolean;
  width: number;
  height: number;
}

export const MobileMenuDrawer = memo(
  ({
    menusWithLastFlag,
    isMenuActive,
    isDark,
    isPreview,
    width,
    height,
  }: MobileMenuDrawerProps) => {
    const router = useRouter();
    const { isAuthenticated } = useRecoilValue(authState);
    const { logout } = useAuthActions();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // To manually control drawer closing

    const handleNavigate = useCallback(
      (path: string) => {
        router.push(path);
        setIsDrawerOpen(false); // Close drawer after navigation
      },
      [router]
    );

    const handleLogout = useCallback(async () => {
      try {
        await logout();
        setIsDrawerOpen(false); // Close drawer after logout
      } catch (error) {
        console.error("Logout error:", error);
        // logout() already handles error cases and cleans up local state
        setIsDrawerOpen(false); // Still close drawer even if logout fails
      }
    }, [logout]);

    return (
      <Drawer.Root
        open={isDrawerOpen} // Control open state
        onOpenChange={(open) => {
          if (typeof open.open === "boolean") setIsDrawerOpen(open.open);
        }}
        size="xs"
      >
        <Drawer.Trigger asChild>
          <IconButton
            aria-label="Open menu"
            variant="ghost"
            size="md"
            display={{ base: "flex", lg: "none" }}
            position="absolute"
            right={{ base: "10px", sm: "15px" }}
            top={isPreview ? "82px" : "32px"}
            transform={isPreview ? "translateY(-50%)" : "translateY(-50%)"}
            zIndex={1001}
            color={isDark ? "white" : "gray.600"}
            onClick={() => setIsDrawerOpen(true)} // Manually open
          >
            <Grid3X3Icon />
          </IconButton>
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
                    onClick={() => setIsDrawerOpen(false)} // Close on logo click
                  >
                    <Box>
                      <Image
                        src="/images/logo/logo.png"
                        width={width}
                        height={height}
                        alt="logo"
                      />
                    </Box>
                  </Link>
                </Drawer.Title>
                <Drawer.CloseTrigger asChild pos="initial">
                  <CloseButton onClick={() => setIsDrawerOpen(false)} />
                </Drawer.CloseTrigger>
              </Drawer.Header>
              <Drawer.Body>
                <VStack gap={3} align="stretch">
                  {isAuthenticated ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigate("/mypage")}
                        color={isDark ? "gray.200" : "gray.700"}
                        justifyContent="flex-start"
                      >
                        <User2Icon size={18} />
                        마이페이지
                      </Button>
                      <Button
                        variant="ghost"
                        colorPalette="red"
                        onClick={handleLogout}
                        justifyContent="flex-start"
                      >
                        <LogOutIcon size={18} />
                        로그아웃
                      </Button>
                    </>
                  ) : (
                    <Flex gap={2}>
                      <Button
                        flex={1}
                        justifyContent="center"
                        variant="outline"
                        onClick={() => handleNavigate("/login")}
                        color={isDark ? "gray.200" : "gray.700"}
                      >
                        로그인
                      </Button>
                      <Button
                        flex={1}
                        justifyContent="center"
                        variant="solid"
                        colorPalette="blue"
                        onClick={() => handleNavigate("/signup")}
                      >
                        회원가입
                      </Button>
                    </Flex>
                  )}
                </VStack>
                <VStack gap={6} align="stretch" mt={4} flexGrow={1}>
                  {menusWithLastFlag?.map((menu, index) => {
                    const isActive = isMenuActive(menu.url);
                    return (
                      <Box key={index + menu.id}>
                        <Link
                          as={NextLink}
                          href={menu.url || "#"}
                          display="block"
                          py={2} // Adjusted padding for tighter feel
                          fontSize="2xl" // Slightly smaller for more items
                          fontWeight="medium"
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
                          _focus={{ boxShadow: "none" }}
                          onClick={() => setIsDrawerOpen(false)} // Close on menu item click
                        >
                          {menu.name}
                        </Link>

                        {menu.children && menu.children.length > 0 && (
                          <VStack gap={1} align="stretch" pl={4} mt={1}>
                            {menu.children.map((child) => {
                              const isChildActive = isMenuActive(child.url);
                              return (
                                <Link
                                  key={child.id}
                                  as={NextLink}
                                  href={child.url || "#"}
                                  display="block"
                                  py={1.5}
                                  fontSize={isChildActive ? "lg" : "md"}
                                  fontWeight={
                                    isChildActive ? "semibold" : "normal"
                                  }
                                  color={
                                    isChildActive
                                      ? isDark
                                        ? "blue.200"
                                        : "#4CCEC6"
                                      : isDark
                                      ? "gray.400"
                                      : "gray.600" // Corrected from #ss
                                  }
                                  _hover={{
                                    textDecoration: "none",
                                    color: isDark ? "blue.200" : "#4CCEC6",
                                  }}
                                  _focus={{ boxShadow: "none" }}
                                  onClick={() => setIsDrawerOpen(false)} // Close on child menu item click
                                >
                                  {child.name}
                                </Link>
                              );
                            })}
                          </VStack>
                        )}
                        {index < menusWithLastFlag.length - 1 && (
                          <Separator
                            my={2}
                            borderColor={isDark ? "gray.700" : "gray.200"}
                          />
                        )}
                      </Box>
                    );
                  })}
                </VStack>

                {/* Auth buttons section */}
                <Separator
                  mt={6}
                  mb={4}
                  borderColor={isDark ? "gray.700" : "gray.200"}
                />
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    );
  }
);

MobileMenuDrawer.displayName = "MobileMenuDrawer";
export default MobileMenuDrawer;
