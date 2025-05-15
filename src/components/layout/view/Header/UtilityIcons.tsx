"use client";

import { Flex, IconButton } from "@chakra-ui/react";
import { memo } from "react";
import { Grid3X3Icon, SearchCodeIcon, User2Icon } from "lucide-react";
import router from "next/router"; // Keep for existing mypage/login logic
import Image from "next/image";

interface UtilityIconsProps {
  iconColor: string;
  onSitemapOpen: () => void;
}

export const UtilityIcons = memo(
  ({ iconColor, onSitemapOpen }: UtilityIconsProps) => {
    return (
      <Flex
        alignItems="center"
        gap={2}
        display={{ base: "none", lg: "flex" }}
        zIndex={1001}
      >
        <Image
          src="/images/logo/부산도시공사_logo.png"
          width={120}
          height={40}
          alt="부산도시공사 로고"
        />
        <IconButton
          aria-label="User menu"
          variant="ghost"
          color={iconColor}
          size="sm"
          borderRadius="full"
          onClick={() => {
            if (localStorage.getItem("token")) {
              router.push("/mypage");
            } else {
              router.push("/login");
            }
          }}
        >
          <User2Icon />
        </IconButton>
        <IconButton
          aria-label="Search"
          variant="ghost"
          color={iconColor}
          size="sm"
          borderRadius="full"
          // TODO: Implement search functionality or drawer
        >
          <SearchCodeIcon />
        </IconButton>
        <IconButton
          aria-label="Sitemap"
          variant="ghost"
          color={iconColor}
          size="sm"
          borderRadius="full"
          onClick={onSitemapOpen}
        >
          <Grid3X3Icon />
        </IconButton>
      </Flex>
    );
  }
);

UtilityIcons.displayName = "UtilityIcons";
export default UtilityIcons;
