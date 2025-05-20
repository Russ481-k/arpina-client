"use client";

import { Box, Spinner, Flex, Text } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { RootLayoutClient } from "@/components/layout/RootLayoutClient";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";

function CMSLayoutContent({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Skip protection for login page
  const isLoginPage = pathname === "/cms/login";

  // Check for admin/manager role
  const isAuthorized = user?.role === "ADMIN" || user?.role === "MANAGER";

  // Handle auth redirect
  useEffect(() => {
    if (isLoading || isLoginPage) return;

    if (!isAuthenticated) {
      // Not logged in, redirect to login
      console.log("CMSLayout: Not authenticated, redirecting to login");
      router.push("/cms/login");
    } else if (!isAuthorized) {
      // Logged in but not authorized for CMS
      console.log("CMSLayout: Not authorized for CMS, redirecting to home");
      router.push("/");
    }
  }, [isAuthenticated, isAuthorized, isLoading, isLoginPage, router]);

  // Show loading while checking authentication
  if (isLoading && !isLoginPage) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={colors.bg}>
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />
      </Flex>
    );
  }

  // Show error if logged in but not authorized (during transition)
  if (isAuthenticated && !isAuthorized && !isLoginPage) {
    return (
      <Flex
        direction="column"
        justify="center"
        align="center"
        minH="100vh"
        bg={colors.bg}
      >
        <Text fontSize="xl" color="red.500">
          권한이 없습니다. 메인 페이지로 이동합니다.
        </Text>
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={colors.bg}
      color={colors.text.primary}
      transition="background-color 0.2s"
    >
      <RootLayoutClient>{children}</RootLayoutClient>
    </Box>
  );
}

export function CMSLayoutClient({ children }: { children: React.ReactNode }) {
  return <CMSLayoutContent>{children}</CMSLayoutContent>;
}
