import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import {
  getToken,
  removeToken,
  getRefreshToken,
  setToken,
} from "../auth-utils";

// Java 백엔드 서버 주소 설정
const BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080") + "/api/v1";

// 기본 API 클라이언트 설정
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 인증 헤더 설정
export const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// 인증이 필요 없는 API 호출용
export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 항상 인증 헤더를 포함하는 API 호출용
export const privateApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add debugging interceptors for auth token issues
privateApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log("[DEBUG] Request to:", config.url);
    console.log("[DEBUG] Auth token present:", !!token);
    console.log(
      "[DEBUG] Auth header:",
      token ? `Bearer ${token.substring(0, 15)}...` : "None"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => {
    console.error("[DEBUG] Request error:", error);
    return Promise.reject(error);
  }
);

// API 인터셉터 설정
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 에러 처리 로직 (예: 401 에러 시 자동 로그아웃 등)
    return Promise.reject(error);
  }
);

// API 클라이언트 생성 함수
const createApiClient = (isPrivate: boolean): AxiosInstance => {
  const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });

  // private API에만 토큰 인터셉터 추가
  if (isPrivate) {
    client.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token.trim()}`;
        }
        return config;
      },
      (error) => {
        console.error("[Private API Request Error]:", error);
        return Promise.reject(error);
      }
    );

    // 공통 에러 처리 (토큰 재발급 등) - private API에만 적용
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // '/auth/refresh' 요청 자체에서 401 발생 시 무한 루프 방지 및 로그인 페이지로 이동
        if (originalRequest.url === "/auth/refresh") {
          removeToken();
          // window.location.href = "/cms/login"; // SSR 환경에서 오류 발생 가능
          console.error(
            "Refresh token request failed. Redirecting to login might be needed on client-side."
          );
          return Promise.reject(error);
        }

        // 401 에러 발생 시 토큰 재발급 시도 (원본 요청이 _retry가 아닐 경우에만)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // 재시도 플래그 설정

          try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              console.warn("No refresh token available for auto-refresh.");
              removeToken(); // Refresh token 없으면 기존 토큰 삭제
              // window.location.href = "/cms/login"; // SSR 환경에서 오류 발생 가능
              return Promise.reject(error); // 에러를 그대로 반환하여 로그인 유도
            }

            // 토큰 재발급을 위한 별도 클라이언트 (기존 인터셉터 방지)
            const refreshClient = axios.create({
              baseURL: BASE_URL,
              withCredentials: true,
            });

            console.log("Attempting to refresh token...");
            const response = await refreshClient.post("/auth/refresh", {
              refreshToken,
            });

            if (response.data?.success && response.data?.data?.accessToken) {
              console.log("Token refreshed successfully.");
              setToken(
                response.data.data.accessToken,
                response.data.data.refreshToken
              );
              // 재요청 헤더에 새로운 토큰 설정
              originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
              return client(originalRequest); // 원래 요청 재시도
            } else {
              console.warn("Token refresh was not successful:", response.data);
              removeToken();
              // window.location.href = "/cms/login"; // SSR 환경에서 오류 발생 가능
              return Promise.reject(error); // 에러 반환
            }
          } catch (refreshError: any) {
            console.error("Token refresh failed:", refreshError.message);
            removeToken();
            // window.location.href = "/cms/login"; // SSR 환경에서 오류 발생 가능
            // 클라이언트 사이드에서는 여기서 로그인 페이지로 리다이렉션할 수 있습니다.
            // 예를 들어, 커스텀 에러 객체를 던져서 최상위 에러 핸들러에서 처리
            return Promise.reject(refreshError); // 재발급 실패 에러 반환
          }
        }

        // 그 외의 에러는 그대로 반환
        return Promise.reject(error);
      }
    );
  } else {
    // Public API의 경우, 간단한 에러 로깅만 수행하거나 특정 공통 로직 처리
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        // console.error("[Public API Response Error]:", error.message);
        // Public API에서 401은 단순 권한 없음일 수 있으므로, 특별한 처리 없이 반환
        return Promise.reject(error);
      }
    );
  }

  return client;
};

// API 메서드 생성 함수
const createApiMethods = (client: AxiosInstance) => ({
  get: async <T>(endpoint: string, config?: AxiosRequestConfig) => {
    const response = await client.get<T>(endpoint, config);
    return response.data as T;
  },
  post: async <T, D = unknown>(
    endpoint: string,
    data?: D,
    config?: AxiosRequestConfig
  ) => {
    const response = await client.post<T>(endpoint, data, config);
    return response.data;
  },
  put: async <T, D = unknown>(
    endpoint: string,
    data?: D,
    config?: AxiosRequestConfig
  ) => {
    const response = await client.put<T>(endpoint, data, config);
    return response.data;
  },
  patch: async <T, D = unknown>(
    endpoint: string,
    data?: D,
    config?: AxiosRequestConfig
  ) => {
    const response = await client.patch<T>(endpoint, data, config);
    return response.data;
  },
  delete: async <T>(endpoint: string, config?: AxiosRequestConfig) => {
    const response = await client.delete<T>(endpoint, config);
    return response.data;
  },
});

// Export API methods
export const publicApiMethods = createApiMethods(publicApi);
export const privateApiMethods = createApiMethods(privateApi);
