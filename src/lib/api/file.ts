import {
  File as FileType,
  FileListResponse,
  FileResponse,
  FileOrder,
} from "@/app/cms/file/types";
import { publicApi, privateApi } from "./client";

// Define the new FileUploadResponse interface as per the user's example
export interface FileUploadResponse {
  success: boolean;
  message: string;
  data: {
    fileId: number;
    originName: string;
    savedName: string;
    mimeType: string;
    size: number;
    ext: string;
    publicYn: string;
    fileOrder: number;
  }[];
}

const BASE_URL = "/cms/file";

// 관리자용 API
export const fileApi = {
  /**
   * 통합 파일 업로드
   * @param files 업로드할 File 객체 또는 File 객체 배열
   * @param menu 메뉴 코드 (e.g., "BBS", "EDITOR")
   * @param menuId 관련 리소스 ID
   * @returns 업로드 결과 Promise (FileUploadResponse)
   */
  upload: async (
    filesToUpload: File | File[],
    menu: string,
    menuId: number
  ): Promise<FileUploadResponse> => {
    console.log("[fileApi.upload] Received params:", {
      filesToUpload,
      menu,
      menuId,
    });

    const formData = new FormData();

    // Handle single or multiple files
    if (Array.isArray(filesToUpload)) {
      if (filesToUpload.length > 0) {
        console.log(
          `[fileApi.upload] Adding ${filesToUpload.length} files with field name 'files'`
        );
        filesToUpload.forEach((file, index) => {
          formData.append("files", file, file.name); // Always use 'files' key
          console.log(
            `[fileApi.upload] Added file ${index + 1}/${
              filesToUpload.length
            }: ${file.name} (${file.size} bytes)`
          );
        });
      } else {
        console.warn("[fileApi.upload] No files to upload (empty array)");
      }
    } else {
      // Single file case
      console.log("[fileApi.upload] Attempting single file upload strategy");
      formData.append("files", filesToUpload, filesToUpload.name); // Always use 'files' key
      console.log(
        `[fileApi.upload] Added single file: ${filesToUpload.name} (${filesToUpload.size} bytes)`
      );
    }

    formData.append("menu", menu);
    formData.append("menuId", String(menuId));

    // FormData 내용 로깅 (optional, but good for debugging)
    console.log("[fileApi.upload] FormData entries:");
    for (const pair of formData.entries()) {
      console.log(
        `${pair[0]}: ${
          pair[1] instanceof File
            ? `File(${pair[1].name}, ${pair[1].size} bytes)`
            : pair[1]
        }`
      );
    }

    const response = await publicApi.post<FileUploadResponse>(
      `${BASE_URL}/public/upload`,
      formData
      // Axios will automatically set Content-Type for FormData
    );

    return response.data;
  },

  getList: (params: {
    module: string; // API spec uses 'menu', consider renaming 'module' to 'menu' for consistency
    moduleId: number; // API spec uses 'menuId', consider renaming 'moduleId' to 'menuId'
    publicYn?: "Y" | "N";
  }) => {
    // Rename query params to match API spec ('menu', 'menuId')
    const queryParams = {
      menu: params.module,
      menuId: params.moduleId,
      publicYn: params.publicYn,
    };
    return privateApi.get<FileListResponse>(`${BASE_URL}/private/list`, {
      params: queryParams,
    });
  },

  // Use FileType for response/update data
  getFile: (fileId: number) => {
    return privateApi.get<FileResponse>(`${BASE_URL}/private/${fileId}`);
  },

  updateFile: (fileId: number, data: Partial<FileType>) => {
    return privateApi.put<FileResponse>(`${BASE_URL}/private/${fileId}`, data);
  },

  deleteFile: (fileId: number) => {
    return privateApi.delete<void>(`${BASE_URL}/private/${fileId}`);
  },

  updateOrder: (data: FileOrder[]) => {
    return privateApi.put<void>(`${BASE_URL}/private/order`, data);
  },

  // Use FileType[] for the response type
  getAllFiles: () => privateApi.get<FileType[]>(`${BASE_URL}/private/all`),
};

// 공개용 API
export const publicFileApi = {
  // Use FileType for response
  getFile: (fileId: number) => {
    return publicApi.get<FileResponse>(`${BASE_URL}/public/${fileId}`);
  },

  download: (fileId: number) => {
    return publicApi.get<Blob>(`${BASE_URL}/public/download/${fileId}`, {
      responseType: "blob",
    });
  },

  getList: (params: {
    module: string; // Consider renaming to 'menu'
    moduleId: number; // Consider renaming to 'menuId'
    publicYn?: "Y" | "N";
  }) => {
    // Rename query params to match API spec ('menu', 'menuId')
    const queryParams = {
      menu: params.module,
      menuId: params.moduleId,
      publicYn: params.publicYn,
    };
    return publicApi.get<FileListResponse>(`${BASE_URL}/public/list`, {
      params: queryParams,
    });
  },
};
