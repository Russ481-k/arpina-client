"use client";

import { Flex, Box } from "@chakra-ui/react";
import { memo } from "react";
import { Menu } from "@/types/api";
import { MenuItem as MemoizedMenuItem } from "./MenuItem"; // Assuming MenuItem handles its own memoization or is already memoized

interface DesktopNavProps {
  menusWithLastFlag: (Menu & { isLastMenuItem?: boolean })[];
  isNavHovered: boolean;
  isDark: boolean;
  currentPage: string;
  isMainPage: boolean;
}

export const DesktopNav = memo(
  ({
    menusWithLastFlag,
    isNavHovered,
    isDark,
    currentPage,
    isMainPage,
  }: DesktopNavProps) => {
    return (
      <Box
        display={{ base: "none", lg: "block" }}
        mx="auto"
        position="relative"
        flex={1}
        width="100%"
        justifyContent="space-between"
      >
        <Box>
          <Flex
            as="nav"
            display={{ base: "none", md: "flex" }}
            width="100%"
            justifyContent="space-between"
          >
            {menusWithLastFlag?.map((menu, index) => (
              <MemoizedMenuItem
                key={index + menu.id}
                menu={menu}
                isNavHovered={isNavHovered}
                isDark={isDark}
                isRoot={true}
                currentPage={currentPage}
                isMainPage={isMainPage}
              />
            ))}
          </Flex>
        </Box>
      </Box>
    );
  }
);

DesktopNav.displayName = "DesktopNav";
export default DesktopNav;
