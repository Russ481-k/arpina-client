"use client";

import {
  Box,
  Link,
  Drawer,
  Portal,
  VStack,
  CloseButton,
  IconButton,
} from "@chakra-ui/react";
import Image from "next/image";
import { memo } from "react";
import NextLink from "next/link";
import { Menu } from "@/types/api";
import { Grid3X3Icon } from "lucide-react";

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
    return (
      <Drawer.Root size="xs">
        <Drawer.Trigger asChild>
          <IconButton
            aria-label="Open menu"
            variant="ghost"
            size="md"
            display={{ base: "flex", lg: "none" }}
            position="absolute"
            right={{ base: "10px", sm: "15px" }}
            top={isPreview ? "calc(50% + 25px)" : "50%"}
            transform={isPreview ? "translateY(-50%)" : "translateY(-50%)"}
            zIndex={1001}
            color={isDark ? "white" : "gray.600"}
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
                                      : "#ss" // Note: Potential typo "#ss", kept from original
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
    );
  }
);

MobileMenuDrawer.displayName = "MobileMenuDrawer";
export default MobileMenuDrawer;
