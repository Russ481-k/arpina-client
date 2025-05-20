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
  const router = useRouter();
  const colors = useColors();

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
      const userData = {
        uuid: responseData.userId,
        username: responseData.username,
        name: responseData.username,
        email: "",
        role: responseData.role,
        status: "ACTIVE",
        createdAt: "",
        updatedAt: "",
      };
      setUser(userData);
      setIsAuthenticated(true);
      setToken(getToken()!, undefined, undefined, userData);
    } else if (!isVerifying && (verifyError || getToken())) {
      console.log("Token verification failed, removing token");
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

        // Set token and user state
        setToken(
          data.data.accessToken,
          data.data.refreshToken,
          undefined,
          userData
        );
        setUser(userData);
        setIsAuthenticated(true);

        // Get the current URL path using window.location
        const currentPath = window.location.pathname;

        // Check user roles
        const isAdmin =
          userData.role === "ADMIN" || userData.role === "SYSTEM_ADMIN";

        console.log(
          "Login redirect - Path:",
          currentPath,
          "Role:",
          userData.role
        );

        // Determine redirect based on login page and user role
        if (currentPath === "/cms/login") {
          // From CMS login page
          if (isAdmin) {
            console.log("CMS login successful, redirecting to CMS dashboard");
            router.push("/cms");
          } else {
            console.log(
              "Non-admin tried to access CMS, redirecting to homepage"
            );
            router.push("/");
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

  if (!isInitialized || isVerifying) {
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
