"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import {
  User as ApiUserType,
  LoginCredentials,
  AuthResponse,
  VerifyTokenResponse,
} from "@/types/api";
import {
  authKeys,
  getToken,
  removeToken,
  setToken as storeTokenInStorage,
  getUser as getStoredUserFromLocalStorage,
  USER_KEY as AUTH_USER_LOCAL_STORAGE_KEY,
} from "./auth-utils";
import { setAuthToken as setAxiosAuthHeader } from "@/lib/api/client";
import { Box, Spinner, Text } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { toaster } from "@/components/ui/toaster";

export interface UserContextState {
  uuid: string;
  username: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SYSTEM_ADMIN";
  status: string;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  requiresPasswordChange: boolean;
}

interface LocalStorageUser extends ApiUserType {
  requiresPasswordChange: boolean;
}

interface AuthContextType {
  user: UserContextState | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserContextState | null) => void;
  setError: (error: string | null) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mapToUserContextState = (
  userData: LocalStorageUser | ApiUserType | null,
  requiresPwdChangeOverride?: boolean
): UserContextState | null => {
  if (!userData) return null;

  const apiRole =
    typeof userData.role === "string"
      ? userData.role.toUpperCase().replace("ROLE_", "")
      : "USER";
  let contextRole: UserContextState["role"] = "USER";
  if (apiRole === "ADMIN") contextRole = "ADMIN";
  if (apiRole === "SYSTEM_ADMIN") contextRole = "SYSTEM_ADMIN";

  return {
    uuid: userData.uuid,
    username: userData.username,
    name: userData.name || userData.username,
    email: userData.email,
    role: contextRole,
    status: userData.status,
    avatar: userData.avatar,
    lastLoginAt: userData.lastLoginAt,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
    requiresPasswordChange:
      requiresPwdChangeOverride ??
      (userData as LocalStorageUser).requiresPasswordChange ??
      false,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserContextState | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const currentPath = usePathname();
  const colors = useColors();
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const verifyTokenQuery = useQuery<
    VerifyTokenResponse,
    Error,
    VerifyTokenResponse,
    ReturnType<typeof authKeys.current>
  >({
    queryKey: authKeys.current(),
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        return Promise.reject(new Error("No token available"));
      }
      const response = await authApi.verifyToken();
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Token verification failed from API"
        );
      }
      return response.data;
    },
    enabled: isClient && !!getToken() && !user && !isLoggedOut,
    retry: 1,
  });

  useEffect(() => {
    if (verifyTokenQuery.data) {
      const verifyData = verifyTokenQuery.data;
      if (verifyData.data.valid) {
        const { uuid, username, authorities } = verifyData.data;
        const currentStoredUser =
          getStoredUserFromLocalStorage() as LocalStorageUser | null;

        const roleFromAuthorities =
          authorities && authorities.length > 0
            ? authorities[0].authority.toUpperCase().replace("ROLE_", "")
            : "USER";

        const userToUpdateInLocalStorage: LocalStorageUser = {
          ...(currentStoredUser || ({} as Partial<LocalStorageUser>)),
          uuid: uuid,
          username: username,
          role: roleFromAuthorities,
          name: currentStoredUser?.name || username,
          email: currentStoredUser?.email || "",
          status: currentStoredUser?.status || "ACTIVE",
          requiresPasswordChange:
            currentStoredUser?.requiresPasswordChange ?? false,
        } as LocalStorageUser;

        localStorage.setItem(
          AUTH_USER_LOCAL_STORAGE_KEY,
          JSON.stringify(userToUpdateInLocalStorage)
        );

        const mappedUser = mapToUserContextState(userToUpdateInLocalStorage);
        setUserState(mappedUser);
        setIsAuthenticated(true);
        setErrorState(null);
      } else {
        removeToken();
        setAxiosAuthHeader("");
        setUserState(null);
        setIsAuthenticated(false);
      }
    } else if (verifyTokenQuery.error) {
      removeToken();
      setAxiosAuthHeader("");
      setUserState(null);
      setIsAuthenticated(false);
    }
  }, [verifyTokenQuery.data, verifyTokenQuery.error]);

  const loginMutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => (await authApi.login(credentials)).data,
    onSuccess: (response) => {
      if (response.success && response.data?.accessToken) {
        const apiUser = response.data.user;
        const requiresPwdChange = false;

        const userToStoreInLocalStorage: LocalStorageUser = {
          ...apiUser,
          requiresPasswordChange: requiresPwdChange,
        };

        storeTokenInStorage(
          response.data.accessToken,
          response.data.refreshToken,
          undefined,
          userToStoreInLocalStorage
        );

        setAxiosAuthHeader(response.data.accessToken);

        const mappedUser = mapToUserContextState(
          userToStoreInLocalStorage,
          requiresPwdChange
        );
        setUserState(mappedUser);
        setIsAuthenticated(true);
        setErrorState(null);
        setIsLoggedOut(false);

        const fromCMSLogin = currentPath === "/cms/login";
        const fromPublicLogin = currentPath === "/login";

        if (mappedUser?.requiresPasswordChange) {
          router.push("/mypage/change-password");
          toaster.create({
            title: "비밀번호 변경 필요",
            description: "계속하려면 비밀번호를 변경해야 합니다.",
            type: "warning",
          });
        } else if (fromCMSLogin) {
          if (
            mappedUser?.role === "ADMIN" ||
            mappedUser?.role === "SYSTEM_ADMIN"
          ) {
            router.push("/cms/dashboard");
          } else {
            setErrorState("관리자 권한이 없습니다.");
            logout();
            toaster.create({
              title: "접근 불가",
              description: "관리자 계정으로 로그인해주세요.",
              type: "error",
            });
          }
        } else if (fromPublicLogin || currentPath === "/") {
          if (
            mappedUser?.role === "ADMIN" ||
            mappedUser?.role === "SYSTEM_ADMIN"
          ) {
            router.push("/admin/dashboard");
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      } else {
        const errorMessage =
          response.message || "로그인 정보가 올바르지 않습니다.";
        setErrorState(errorMessage);
        storeTokenInStorage("", "", undefined, null);
        setAxiosAuthHeader("");
        setUserState(null);
        setIsAuthenticated(false);
        toaster.create({
          title: "로그인 실패",
          description: errorMessage,
          type: "error",
        });
      }
    },
    onError: (error) => {
      const apiError = error as any;
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "로그인 중 오류가 발생했습니다.";
      setErrorState(errorMessage);
      storeTokenInStorage("", "", undefined, null);
      setAxiosAuthHeader("");
      setUserState(null);
      setIsAuthenticated(false);
      toaster.create({
        title: "로그인 오류",
        description: errorMessage,
        type: "error",
      });
    },
  });

  const credentialsForLoginRef = useRef<LoginCredentials | null>(null);

  const login = async (credentials: LoginCredentials) => {
    credentialsForLoginRef.current = credentials;
    setErrorState(null);
    await loginMutation.mutateAsync(credentials);
  };

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: authApi.logout,
    onSuccess: () => {
      const fromCMS = currentPath.startsWith("/cms");
      removeToken();
      setAxiosAuthHeader("");
      setUserState(null);
      setIsAuthenticated(false);
      setErrorState(null);
      setIsLoggedOut(true);

      queryClient.clear();

      router.push(fromCMS ? "/cms/login" : "/login");
      toaster.create({
        title: "로그아웃 성공",
        description: "성공적으로 로그아웃되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      const fromCMS = currentPath.startsWith("/cms");
      console.error("Logout API error:", error);
      removeToken();
      setAxiosAuthHeader("");
      setUserState(null);
      setIsAuthenticated(false);
      setErrorState(null);
      setIsLoggedOut(true);

      queryClient.clear();

      router.push(fromCMS ? "/cms/login" : "/login");
      toaster.create({
        title: "로그아웃",
        description:
          "로그아웃 처리 중 문제가 발생했으나, 로컬 세션은 정리되었습니다.",
        type: "warning",
      });
    },
  });

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const contextSetUser = (newUserState: UserContextState | null) => {
    setUserState(newUserState);
    if (newUserState) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  };

  const contextSetError = (newError: string | null) => {
    setErrorState(newError);
  };

  const calculatedIsLoading =
    loginMutation.isPending ||
    logoutMutation.isPending ||
    verifyTokenQuery.isLoading;

  const showInitialLoadingSpinner =
    isClient && calculatedIsLoading && !user && !!getToken();

  if (!isClient) return null;

  if (showInitialLoadingSpinner) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bg={colors.bg}
      >
        <Spinner size="xl" color="blue.500" />
        <Text ml={4}>인증 정보를 확인 중입니다...</Text>
      </Box>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading: calculatedIsLoading,
        login,
        logout,
        setUser: contextSetUser,
        setError: contextSetError,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider. Make sure the component is wrapped in <AuthProvider>."
    );
  }
  return context;
};
