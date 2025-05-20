"use client";

import { Flex, IconButton } from "@chakra-ui/react";
import { memo, useCallback } from "react";
import { Grid3X3Icon, SearchCodeIcon, User2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface UtilityIconsProps {
  iconColor: string;
  onSitemapOpen: () => void;
}

export const UtilityIcons = memo(
  ({ iconColor, onSitemapOpen }: UtilityIconsProps) => {
    const router = useRouter();

    // 사용자 인증 상태 확인 함수
    const checkAuthAndRedirect = useCallback(() => {
      // 클라이언트 사이드에서만 실행
      if (typeof window === "undefined") return;

      const authToken = localStorage.getItem("auth_token");
      const authUser = localStorage.getItem("auth_user");

      console.log("Auth check for mypage:", {
        hasToken: !!authToken,
        hasUser: !!authUser,
      });

      if (authToken && authUser) {
        // 인증 정보가 있으면 마이페이지로 이동
        router.push("/mypage");
      } else {
        // 인증 정보가 없으면 로그인 페이지로 이동
        router.push("/login");
      }
    }, [router]);

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
          onClick={checkAuthAndRedirect}
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
