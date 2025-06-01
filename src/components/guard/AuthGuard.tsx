import { useAuth, User } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { toaster } from "@/components/ui/toaster";
import { Center, Spinner, Text, Box, Flex } from "@chakra-ui/react";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: Array<"ROLE_USER" | "ROLE_ADMIN">;
  checkPasswordChange?: boolean;
  redirectTo?: string;
  authenticationNeededMessage?: {
    title: string;
    description: string;
  };
  authorizationFailedMessage?: {
    title: string;
    description: string;
  };
}

export const AuthGuard = ({
  children,
  allowedRoles,
  checkPasswordChange = true,
  redirectTo = "/login",
  authenticationNeededMessage = {
    title: "로그인 필요",
    description: "이 페이지에 접근하려면 로그인이 필요합니다.",
  },
  authorizationFailedMessage = {
    title: "접근 권한 없음",
    description: "이 페이지에 접근할 권한이 없습니다.",
  },
}: AuthGuardProps) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const changePasswordPath = "/mypage/change-password";

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const publicPaths = [
        "/login",
        "/signup",
        "/find-credentials/id",
        "/find-credentials/password",
      ];
      if (!publicPaths.includes(pathname) && pathname !== redirectTo) {
        toaster.create({
          title: authenticationNeededMessage.title,
          description: authenticationNeededMessage.description,
          type: "error",
        });
        router.push(redirectTo);
      }
      return;
    }

    const currentUser = user as User;

    if (
      checkPasswordChange &&
      currentUser.requiresPasswordChange &&
      pathname !== changePasswordPath
    ) {
      toaster.create({
        title: "비밀번호 변경 필요",
        description:
          "계속하려면 비밀번호를 변경해야 합니다. 안전한 서비스 이용을 위해 비밀번호를 변경해주세요.",
        type: "warning",
        duration: 5000,
      });
      router.push(changePasswordPath);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = currentUser.role;
      if (!allowedRoles.includes(userRole)) {
        toaster.create({
          title: authorizationFailedMessage.title,
          description: authorizationFailedMessage.description,
          type: "error",
        });
        router.push(userRole === "ROLE_ADMIN" ? "/admin/dashboard" : "/");
        return;
      }
    }

    if (
      currentUser.role === "ROLE_ADMIN" &&
      pathname.startsWith("/application/confirm")
    ) {
      toaster.create({
        title: "접근 불가 (관리자)",
        description: "관리자 계정은 해당 페이지에 직접 접근할 수 없습니다.",
        type: "error",
      });
      router.push("/admin/dashboard");
      return;
    }
  }, [
    user,
    isAuthenticated,
    isLoading,
    router,
    pathname,
    allowedRoles,
    checkPasswordChange,
    redirectTo,
    authenticationNeededMessage,
    authorizationFailedMessage,
    changePasswordPath,
  ]);

  if (isLoading) {
    return (
      <Flex
        justify="center"
        align="center"
        minH={{ base: "calc(100vh - 160px)", md: "300px" }}
      >
        <Box textAlign="center">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text>사용자 정보를 확인 중입니다...</Text>
        </Box>
      </Flex>
    );
  }

  return <>{children}</>;
};
