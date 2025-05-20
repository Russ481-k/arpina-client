"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { User } from "@/types/api";
import {
  authKeys,
  getToken,
  removeToken,
  setToken,
  getUser,
} from "./auth-utils";
import { LoginCredentials } from "@/types/api";
import { Box, Spinner } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const colors = useColors();

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    data: verifyResponse,
    isLoading: isVerifying,
    error: verifyError,
  } = useQuery({
    queryKey: authKeys.current(),
    queryFn: authApi.verifyToken,
    enabled: !!getToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  useEffect(() => {
    console.log("verifyResponse", verifyResponse);
    if (verifyResponse?.data?.success) {
      console.log("Token verification successful:", verifyResponse);
      const responseData = verifyResponse.data.data;
      console.log("Response data from verify:", responseData);

      // Extract role from authorities array
      let role = "USER";
      if (responseData.authorities && responseData.authorities.length > 0) {
        const authority = responseData.authorities[0].authority;
        role = authority.replace("ROLE_", "");
        console.log("Extracted role from authorities:", role);
      }

      // localStorage에 저장할 사용자 정보 객체 (필드 축소 및 정의된 필드만 포함)
      const userToStore: {
        username: string;
        role: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      } = {
        username: responseData.username, // username은 필수
        role: role, // role 정보
        status: "ACTIVE", // status (API에 없다면 기본값)
        createdAt: "", // API 응답에 없으므로 빈 문자열로 설정
        updatedAt: "", // API 응답에 없으므로 빈 문자열로 설정
        // uuid, name, email은 localStorage 저장에서 제외
      };

      // setUser에는 UI에서 사용할 수 있는 전체 정보를 담은 객체를 전달 (기존 구조 유지 시도)
      const fullUserDataForContext = {
        uuid: responseData.uuid,
        username: responseData.username,
        name: responseData.username, // UI 초기 표시용 (어차피 나중에 API로 대체됨)
        email: "", // API에 없다면 빈 값 또는 responseData.email (만약 있다면)
        role: role,
        status: "ACTIVE",
        createdAt: "", // 컨텍스트용 데이터에도 일관성 있게 빈 문자열
        updatedAt: "", // 컨텍스트용 데이터에도 일관성 있게 빈 문자열
      };

      console.log("User data to store in localStorage:", userToStore);
      console.log(
        "Setting user data for context with role:",
        fullUserDataForContext.role
      );

      setUser(fullUserDataForContext);
      setIsAuthenticated(true);
      setToken(getToken()!, undefined, undefined, userToStore);
    } else if (!isVerifying && (verifyError || getToken())) {
      console.log("Token verification failed, removing token");
      console.error("Verify error details:", verifyError);
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
      router.push("/cms/login");
    }
  }, [verifyResponse, isVerifying, verifyError, router]);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const data = response.data;
      if (data?.success && data?.data?.accessToken) {
        console.log("Login successful, setting token:", data.data.accessToken);

        // Extract user data
        const userData = data.data.user;
        console.log("Login user data from API:", userData);
        console.log("User role from login:", userData.role);

        // Set token and user state
        setToken(
          data.data.accessToken,
          data.data.refreshToken,
          undefined,
          userData
        );
        setUser(userData);
        setIsAuthenticated(true);

        // Manually make a verification request after token is set
        console.log("Manually triggering token verification after login...");
        setTimeout(() => {
          authApi
            .verifyToken()
            .then((verifyResponse) => {
              console.log("Manual verification result:", verifyResponse);
            })
            .catch((error) => {
              console.error("Manual verification failed:", error);
            });
        }, 1000); // Give browser time to store token

        // Get the current URL path using window.location
        const currentPath = window.location.pathname;

        // Check user roles
        const isAdmin =
          userData.role === "ADMIN" ||
          userData.role === "SYSTEM_ADMIN" ||
          userData.role === "ROLE_ADMIN" ||
          userData.role === "ROLE_SYSTEM_ADMIN";

        console.log(
          "Login redirect - Path:",
          currentPath,
          "Role:",
          userData.role,
          "Is Admin:",
          isAdmin
        );

        // Determine redirect based on login page and user role
        if (currentPath === "/cms/login") {
          // From CMS login page
          if (isAdmin) {
            console.log("CMS login successful, redirecting to CMS dashboard");
            router.push("/cms");
          } else {
            console.log(
              "Non-admin tried to access CMS, showing error and staying on login page"
            );
            // We don't redirect here - the login page will show the error message
            // and clear the token to force re-login
          }
        } else {
          // From public login page
          console.log("Public login successful, redirecting to homepage");
          router.push("/");
        }
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      console.log("Logout successful, removing token");
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
      router.push("/cms/login");
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = () => {
    return logoutMutation.mutateAsync();
  };

  // Use isClient flag to prevent hydration errors
  if (!isClient || !isInitialized || isVerifying) {
    // Don't render the spinner on server or during hydration
    if (!isClient) {
      return null;
    }

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bg={colors.bg}
      >
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />
      </Box>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading: isVerifying,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
