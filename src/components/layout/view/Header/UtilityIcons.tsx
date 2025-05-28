"use client";

import { Flex, IconButton, Button } from "@chakra-ui/react";
import { memo, useCallback, useState, useEffect } from "react";
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      // Ensure this runs only on the client
      if (typeof window !== "undefined") {
        const authToken = localStorage.getItem("auth_token");
        const authUser = localStorage.getItem("auth_user");
        setIsAuthenticated(!!(authToken && authUser));
      }
    }, []); // Check on initial mount

    const handleLogin = useCallback(() => {
      router.push("/login");
    }, [router]);

    const handleSignup = useCallback(() => {
      router.push("/signup"); // Assuming /signup is your registration page
    }, [router]);

    const handleMypage = useCallback(() => {
      router.push("/mypage");
    }, [router]);

    const handleLogout = useCallback(() => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setIsAuthenticated(false);
        router.push("/"); // Redirect to homepage after logout
        // Optionally, you can add a toaster notification for successful logout here
      }
    }, [router]);

    return (
      <Flex
        alignItems="center"
        gap={{ base: 2, md: 3 }}
        display={{ base: "none", lg: "flex" }}
        zIndex={1001}
      >
        <Image
          src="/images/logo/부산도시공사_logo.png"
          width={120}
          height={40}
          alt="부산도시공사 로고"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/")}
        />
        {isAuthenticated ? (
          <>
            <IconButton
              aria-label="My Page"
              variant="ghost"
              color={iconColor}
              size="sm"
              borderRadius="full"
              onClick={handleMypage}
            >
              <User2Icon />
            </IconButton>
            <Button
              variant="ghost"
              colorScheme="red"
              size="sm"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              color={iconColor}
              size="sm"
              onClick={handleLogin}
            >
              로그인
            </Button>
            <Button
              variant="solid"
              colorScheme="blue"
              size="sm"
              onClick={handleSignup}
            >
              회원가입
            </Button>
          </>
        )}
        {/* <IconButton
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
        </IconButton> */}
      </Flex>
    );
  }
);

UtilityIcons.displayName = "UtilityIcons";
export default UtilityIcons;
