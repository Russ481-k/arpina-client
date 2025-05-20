"use client";

import { Box, Spinner, Flex, Text } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { RootLayoutClient } from "@/components/layout/RootLayoutClient";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { toaster } from "@/components/ui/toaster";

function CMSLayoutContent({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  // Skip protection for login page
  const isLoginPage = pathname === "/cms/login";

  // Check for admin/manager role
  const isAuthorized =
    user?.role === "ADMIN" ||
    user?.role === "SYSTEM_ADMIN" ||
    user?.role === "ROLE_ADMIN" ||
    user?.role === "ROLE_SYSTEM_ADMIN";

  // Handle auth redirect
  useEffect(() => {
    if (isLoading || isLoginPage || redirecting) return;

    if (!isAuthenticated) {
      // Not logged in, redirect to login
      router.push("/cms/login");
    } else if (!isAuthorized) {
      // Logged in but not authorized for CMS
      setRedirecting(true);

      // Show toast message
      toaster.create({
        title: "권한이 없습니다",
        description: "관리자 계정이 아닙니다. 관리자 계정으로 로그인하세요.",
        type: "error",
        duration: 5000,
      });

      // Delay redirect slightly to allow toast to be seen
      setTimeout(() => {
        router.push("/cms/login");
      }, 1500);
    }
  }, [
    isAuthenticated,
    isAuthorized,
    isLoading,
    isLoginPage,
    router,
    redirecting,
  ]);

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
  if (isAuthenticated && !isAuthorized && !isLoginPage && !redirecting) {
    return (
      <Flex
        direction="column"
        justify="center"
        align="center"
        minH="100vh"
        bg={colors.bg}
      >
        <Text fontSize="xl" color="red.500">
          권한이 없습니다. 관리자 계정으로 로그인하세요.
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
