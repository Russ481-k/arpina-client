"use client";

import { Box, Link, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { Menu } from "@/types/api";

interface MenuItemProps {
  menu: Menu;
  isNavHovered: boolean;
  isDark: boolean;
  isRoot: boolean;
  currentPage: string;
  isMainPage?: boolean;
  isLastItem?: boolean;
}

export function MenuItem({
  menu,
  isNavHovered,
  isDark,
  isRoot,
  currentPage,
  isMainPage = false,
  isLastItem = false,
}: MenuItemProps) {
  const isActive = currentPage === menu.url;
  const hasChildren = menu.children && menu.children.length > 0;

  return (
    <Box position="relative" w="20%">
      <Box
        position="relative"
        role="group"
        textAlign="center"
        _before={{
          content: '""',
          position: "absolute",
          bottom: "-2px",
          left: "50%",
          width: "0",
          height: "2px",
          bg: isMainPage ? "#0D344E" : isDark ? "blue.200" : "blue.500",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: "0",
        }}
        _hover={{
          _before: {
            left: "0",
            width: "100%",
            opacity: "1",
          },
        }}
      >
        <Link
          as={NextLink}
          href={menu.url}
          display="block"
          py={10}
          fontSize={{ base: "md", md: "xl", xl: "2xl" }}
          fontWeight={isRoot ? "bold" : "medium"}
          color={
            isMainPage
              ? "white"
              : isActive
              ? isDark
                ? "blue.200"
                : "blue.500"
              : isDark
              ? "gray.300"
              : "#0D344E"
          }
          _hover={{
            textDecoration: "none",
            color: isMainPage ? "#0D344E" : isDark ? "blue.200" : "blue.500",
          }}
          _focus={{
            boxShadow: "none",
            color: isMainPage ? "#0D344E" : isDark ? "blue.200" : "blue.500",
            transform: "translateY(-1px)",
            outline: "none",
            border: "none",
          }}
          _groupHover={{
            color: isMainPage ? "#0D344E" : isDark ? "blue.200" : "blue.500",
          }}
          _active={{
            bg: "transparent",
          }}
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          borderRadius="md"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {menu.name}
        </Link>
      </Box>

      {/* 하위 메뉴 컨테이너 */}
      <Box
        position="static"
        // overflow="hidden"
        maxHeight={isNavHovered && hasChildren ? "1000vh" : "0"}
        opacity={isNavHovered && hasChildren ? 1 : 0}
        transform={`translateY(${isNavHovered && hasChildren ? "0" : "-10px"})`}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        visibility={isNavHovered && hasChildren ? "visible" : "hidden"}
      >
        {/* 하위 메뉴 내용 */}
        <Box
          pt={5}
          pb={5}
          position="relative"
          _before={{
            content: '""',
            position: "absolute",
            left: "0",
            top: "0",
            width: "1px",
            height: "500px",
            bg: "white",
            opacity: isMainPage ? 1 : 0.5,
          }}
          _after={
            isLastItem
              ? {
                  content: '""',
                  position: "absolute",
                  right: "0",
                  top: "0",
                  width: "1px",
                  height: "500px",
                  bg: "white",
                  opacity: isMainPage ? 1 : 0.5,
                }
              : {}
          }
        >
          <VStack align="stretch" gap={0}>
            {menu.children?.map((child) => (
              <Box
                key={child.id}
                role="group"
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  left: "0",
                  width: "2px",
                  height: "0%",
                  bg: isMainPage ? "white" : isDark ? "blue.200" : "blue.500",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  opacity: "0",
                }}
                _hover={{}}
              >
                <Link
                  as={NextLink}
                  href={!!child.url ? child.url : "#"}
                  display="block"
                  mb="10px"
                  fontSize={{ base: "md", md: "lg", lg: "xl" }}
                  textAlign="center"
                  fontWeight="500"
                  color={isMainPage ? "white" : isDark ? "gray.300" : "#373636"}
                  _hover={{
                    textDecoration: "none",
                    color: isMainPage
                      ? "#0D344E"
                      : isDark
                      ? "blue.200"
                      : "#4CCEC6",
                  }}
                  _focus={{
                    boxShadow: "none",
                    color: isMainPage
                      ? "#0D344E"
                      : isDark
                      ? "blue.200"
                      : "#4CCEC6",
                    outline: "none",
                    border: "none",
                  }}
                  _groupHover={{
                    color: isMainPage
                      ? "#0D344E"
                      : isDark
                      ? "blue.200"
                      : "blue.500",
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

                {/* 3차 메뉴 */}
                {child.children && child.children.length > 0 && (
                  <VStack align="stretch" gap={0} pl={4}>
                    {child.children.map((grandChild) => (
                      <Box
                        key={grandChild.id}
                        role="group"
                        position="relative"
                        _before={{
                          content: '""',
                          position: "absolute",
                          left: "0",
                          width: "2px",
                          height: "0%",
                          bg: isMainPage
                            ? "white"
                            : isDark
                            ? "blue.200"
                            : "blue.500",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          opacity: "0",
                        }}
                        _hover={{
                          _before: {
                            height: "80%",
                            opacity: "0.3",
                          },
                        }}
                      >
                        <Link
                          as={NextLink}
                          href={!!grandChild.url ? grandChild.url : "#"}
                          display="block"
                          px={4}
                          py={1.5}
                          fontSize="sm"
                          color={
                            isMainPage
                              ? "white"
                              : isDark
                              ? "gray.400"
                              : "gray.500"
                          }
                          _hover={{
                            textDecoration: "none",
                            color: isMainPage
                              ? "#0D344E"
                              : isDark
                              ? "blue.200"
                              : "#4CCEC6",
                            transform: "translateX(4px)",
                          }}
                          _focus={{
                            boxShadow: "none",
                            color: isMainPage
                              ? "#0D344E"
                              : isDark
                              ? "blue.200"
                              : "#4CCEC6",
                            transform: "translateX(4px)",
                            outline: "none",
                            border: "none",
                          }}
                          _groupHover={{
                            color: isMainPage
                              ? "#0D344E"
                              : isDark
                              ? "blue.200"
                              : "blue.500",
                          }}
                          _active={{
                            bg: "transparent",
                          }}
                          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                          borderRadius="md"
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          {grandChild.name}
                        </Link>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            ))}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
