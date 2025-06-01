"use client";

import { Flex, IconButton, Menu, Portal } from "@chakra-ui/react";
import { memo, useCallback, useState, useEffect } from "react";
import { Grid3x3, Search, User2Icon } from "lucide-react";
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
      const checkAuthState = () => {
        // Ensure this runs only on the client
        if (typeof window !== "undefined") {
          const authToken = localStorage.getItem("auth_token");
          const authUser = localStorage.getItem("auth_user");
          setIsAuthenticated(!!(authToken && authUser));
        }
      };

      checkAuthState(); // Initial check

      const handleStorageChange = (event: StorageEvent) => {
        if (
          event.key === "auth_token" ||
          event.key === "auth_user" ||
          event.key === null
        ) {
          checkAuthState();
        }
      };

      const handleAuthChangeEvent = () => {
        checkAuthState();
      };

      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("authChange", handleAuthChangeEvent); // Listen for custom event

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("authChange", handleAuthChangeEvent); // Cleanup custom event listener
      };
    }, []); // Check on initial mount and when storage/auth changes

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
        window.dispatchEvent(new CustomEvent("authChange")); // Dispatch custom event
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

        {/* User Menu */}
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton
              aria-label="User Menu"
              variant="ghost"
              color={iconColor}
              size="sm"
              borderRadius="full"
            >
              <User2Icon />
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {isAuthenticated ? (
                  <>
                    <Menu.Item
                      value="mypage"
                      onClick={handleMypage}
                      alignItems="center"
                      justifyContent="center"
                    >
                      마이페이지
                    </Menu.Item>
                    <Menu.Item
                      value="logout"
                      onClick={handleLogout}
                      alignItems="center"
                      justifyContent="center"
                    >
                      로그아웃
                    </Menu.Item>
                  </>
                ) : (
                  <>
                    <Menu.Item
                      value="login"
                      onClick={handleLogin}
                      alignItems="center"
                      justifyContent="center"
                    >
                      로그인
                    </Menu.Item>
                    <Menu.Item
                      value="signup"
                      onClick={handleSignup}
                      alignItems="center"
                      justifyContent="center"
                    >
                      회원가입
                    </Menu.Item>
                  </>
                )}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>

        <IconButton
          aria-label="Search"
          variant="ghost"
          color={iconColor}
          size="sm"
          borderRadius="full"
          // TODO: Implement search functionality or drawer
        >
          <Search />
        </IconButton>
        <IconButton
          aria-label="Sitemap"
          variant="ghost"
          color={iconColor}
          size="sm"
          borderRadius="full"
          onClick={onSitemapOpen}
        >
          <Grid3x3 />
        </IconButton>
      </Flex>
    );
  }
);

UtilityIcons.displayName = "UtilityIcons";
export default UtilityIcons;
