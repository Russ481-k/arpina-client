import {
  LoginCredentials,
  AuthResponse,
  VerifyTokenResponse,
} from "@/types/api";
import { publicApi, privateApi } from "./client";
import { getToken } from "../auth-utils";

// React Query 키 정의
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  token: () => [...authKeys.all, "token"] as const,
};

// 인증 관련 API 타입 정의
export interface AuthApi {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  verifyToken: () => Promise<VerifyTokenResponse>;
  logout: () => Promise<void>;
}

// 인증 API 구현
export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await publicApi.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    console.log("login response:", response);

    return response;
  },

  logout: async () => {
    await publicApi.post<void>("/auth/logout");
  },

  verifyToken: async () => {
    console.log("Verifying token with privateApi");
    const token = getToken();
    console.log(
      "Current token when verifying:",
      token ? token.substring(0, 15) + "..." : "No token"
    );
    const response = await privateApi.get<VerifyTokenResponse>("/auth/verify", {
      headers: token ? { Authorization: `Bearer ${token.trim()}` } : undefined,
    });
    console.log(
      "Full verify response:",
      JSON.stringify(response.data, null, 2)
    );
    return response;
  },
};
