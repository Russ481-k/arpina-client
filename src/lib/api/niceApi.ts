import { publicApi } from "./client"; // Assuming this is the correct path to your API client

export interface NiceInitiateResponse {
  encodeData: string;
  reqSeq: string;
  // Add any other fields your backend might return for this initiation call
}

// DTO for successful NICE verification data relevant for public/signup purposes
export interface NicePublicUserDataDto {
  name: string; // Or utf8Name, ensure it matches backend response
  birthDate: string; // e.g., YYYYMMDD
  gender: string; // e.g., "1" for male, "0" for female
  mobileNo: string; // Phone number
  ci?: string; // Optional: Client Identifier
  di?: string; // Optional: Duplicate Information
  nationalInfo: string; // 내/외국인 구분 (Korean/Foreigner)
  // Add any other fields the backend provides for pre-filling signup
}

// DTO for structured error details from NICE or backend processing
export interface NiceErrorDataDto {
  errorCode?: string; // NICE specific error code or backend error code
  errorMessage?: string;
  // any other structured error details
}

// DTO for the result of NICE authentication
export interface NiceAuthResultDto {
  success: boolean;
  data?: NicePublicUserDataDto;
  error?: NiceErrorDataDto;
  key?: string;
}

export const niceApi = {
  /**
   * Initiates the NICE self-identification process.
   * Calls the backend to get encrypted data for the NICE popup.
   */
  initiateVerification: async (): Promise<NiceInitiateResponse> => {
    // The endpoint for initiating NICE verification, as per your Spring Boot guide
    const endpoint = "/nice/checkplus/initiate";

    // This API call does not send a body, as the backend generates necessary info.
    const response = await publicApi.post<NiceInitiateResponse, any>(
      endpoint,
      {}
    );
    return response.data; // API 클라이언트가 response.data를 자동으로 반환하지 않는 경우
  },

  /**
   * Fetches the result of the NICE self-identification process.
   * @param key The key received from the NICE callback.
   */
  getNiceAuthResult: async (key: string): Promise<NiceAuthResultDto> => {
    // Endpoint updated as per the new specification.
    const endpoint = `/nice/checkplus/result/${key}`;
    try {
      const response = await publicApi.get(endpoint);

      // 백엔드 응답이 NiceAuthResultDto 구조가 아닐 경우 변환
      if (response.data && !("success" in response.data)) {
        // 백엔드가 직접 사용자 데이터를 반환하는 경우, NiceAuthResultDto 형식으로 감싸기
        return {
          success: true,
          data: response.data,
          key: key,
        };
      }

      return response.data;
    } catch (error) {
      console.error("[NICE_API] Error fetching result:", error);
      // 에러 발생 시 NiceAuthResultDto 형식으로 에러 반환
      return {
        success: false,
        error: {
          errorCode: "API_ERROR",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
        key: key,
      };
    }
  },
};
