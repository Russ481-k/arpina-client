import { privateApi } from "./client";
import {
  EnterpriseCreateData,
  EnterpriseUpdateData,
  EnterpriseListApiResponse,
  EnterpriseDetailApiResponse,
  EnterpriseMutationResponse,
  GetEnterprisesParams,
} from "@/app/cms/enterprise/types";

const API_BASE_URL = "/cms/enterprises";

/**
 * 입주 기업 목록 조회
 * CMS에서는 모든 정보를 볼 수 있으므로 privateApi 사용 가능.
 * 또는, API 스펙에 따라 year 필터링 등은 publicApi로도 가능할 수 있음.
 * 여기서는 ADMIN 권한을 가정하고 privateApi를 사용.
 */
export const getEnterprises = async (
  params?: GetEnterprisesParams
): Promise<EnterpriseListApiResponse> => {
  try {
    const responseData = await privateApi.get<EnterpriseListApiResponse>(
      API_BASE_URL,
      { params }
    );
    return responseData.data;
  } catch (error: any) {
    console.error("Error fetching enterprises:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "기업 목록 조회에 실패했습니다.",
      data: {
        content: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          limit: params?.limit || 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
        totalElements: 0,
      },
      errorCode: error.response?.data?.errorCode || "NETWORK_ERROR",
    };
  }
};

/**
 * 입주 기업 생성
 */
export const createEnterprise = async (
  data: EnterpriseCreateData
): Promise<EnterpriseMutationResponse> => {
  try {
    // Create a FormData object
    const formData = new FormData();

    // Add the enterprise data as a Blob with application/json content type
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], {
        type: "application/json",
      })
    );

    // Send as multipart/form-data (DO NOT set Content-Type header - browser will set it automatically)
    const responseData = await privateApi.post<EnterpriseMutationResponse>(
      API_BASE_URL,
      formData
    );

    return responseData.data;
  } catch (error: any) {
    console.error("Error creating enterprise:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "기업 정보 생성에 실패했습니다.",
      errorCode: error.response?.data?.errorCode || "NETWORK_ERROR",
      errors: error.response?.data?.errors,
    };
  }
};

/**
 * 입주 기업 상세 조회
 */
export const getEnterpriseById = async (
  id: string
): Promise<EnterpriseDetailApiResponse> => {
  try {
    const responseData = await privateApi.get<EnterpriseDetailApiResponse>(
      `${API_BASE_URL}/${id}`
    );
    return responseData.data;
  } catch (error: any) {
    console.error(`Error fetching enterprise ${id}:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message || "기업 상세 정보 조회에 실패했습니다.",
      // @ts-expect-error - data might be undefined on error, handled by checking success status
      data: undefined,
      errorCode: error.response?.data?.errorCode || "NETWORK_ERROR",
    };
  }
};

/**
 * 입주 기업 정보 수정
 */
export const updateEnterprise = async (
  id: string,
  data: EnterpriseUpdateData
): Promise<EnterpriseMutationResponse> => {
  try {
    // Create a FormData object
    const formData = new FormData();

    // Add the enterprise data as a Blob with application/json content type
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], {
        type: "application/json",
      })
    );

    // Send as multipart/form-data (DO NOT set Content-Type header - browser will set it automatically)
    const responseData = await privateApi.put<EnterpriseMutationResponse>(
      `${API_BASE_URL}/${id}`,
      formData
    );

    return responseData.data;
  } catch (error: any) {
    console.error(`Error updating enterprise ${id}:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message || "기업 정보 수정에 실패했습니다.",
      errorCode: error.response?.data?.errorCode || "NETWORK_ERROR",
      errors: error.response?.data?.errors,
    };
  }
};

/**
 * 입주 기업 정보 삭제
 * API 문서에는 204 No Content로 명시되어 있지만, 일관성을 위해 EnterpriseMutationResponse 반환.
 * privateApi.delete는 응답 본문을 반환하므로, 실제 204일 경우 빈 객체 등이 올 수 있음.
 * 성공 여부는 HTTP status code로 판단해야 하며, 여기서는 try-catch로 성공 간주.
 */
export const deleteEnterprise = async (
  id: string
): Promise<EnterpriseMutationResponse> => {
  try {
    await privateApi.delete<void>(`${API_BASE_URL}/${id}`);
    return {
      success: true,
      message: "기업 정보가 성공적으로 삭제되었습니다.",
    };
  } catch (error: any) {
    console.error(`Error deleting enterprise ${id}:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message || "기업 정보 삭제에 실패했습니다.",
      errorCode: error.response?.data?.errorCode || "NETWORK_ERROR",
    };
  }
};

export const enterpriseApi = {
  getEnterprises,
  createEnterprise,
  getEnterpriseById,
  updateEnterprise,
  deleteEnterprise,
};
