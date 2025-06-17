import {
  LoginCredentials,
  AuthResponse,
  VerifyTokenResponse,
  User,
} from "@/types/api";
import { publicApi, privateApi } from "./client";
import { getToken } from "../auth-utils";

// React Query 키 정의
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  token: () => [...authKeys.all, "token"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

// 인증 관련 API 타입 정의
export interface AuthApi {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  verifyToken: () => Promise<User>;
  logout: () => Promise<void>;
}

// 인증 API 구현
export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await publicApi.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    // API 응답 데이터의 role 형식 통일 ("ROLE_ADMIN" -> "ADMIN")
    if (response.data.data?.user?.role) {
      response.data.data.user.role =
        response.data.data.user.role.replace("ROLE_", "") || "USER";
    }

    return response;
  },

  logout: async () => {
    await publicApi.post<void>("/auth/logout");
  },

  verifyToken: async (): Promise<User> => {
    const token = getToken();
    const response = await privateApi.get<VerifyTokenResponse>("/auth/verify", {
      headers: token ? { Authorization: `Bearer ${token.trim()}` } : undefined,
    });

    const apiData = response.data.data;

    // "ROLE_ADMIN" -> "ADMIN"
    const role =
      apiData.authorities?.[0]?.authority.replace("ROLE_", "") || "USER";

    // 프론트엔드 User 모델로 변환
    const user: User = {
      uuid: apiData.uuid,
      username: apiData.username,
      role: role,
      // 백엔드 응답에 없는 필드는 기본값 또는 빈 값으로 채웁니다.
      name: apiData.username, // name이 없으면 username으로 대체
      email: "", // email 정보가 없음
      status: "ACTIVE", // status 정보가 없음
      createdAt: new Date().toISOString(), // 정보가 없으므로 현재 시간으로 설정
      updatedAt: new Date().toISOString(),
    };

    return user;
  },
};
