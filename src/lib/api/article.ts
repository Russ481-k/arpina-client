import { privateApi } from "./client";
import { publicApi } from "./client";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode: string | null;
  stackTrace: string | null;
}

export interface AttachmentInfoDto {
  fileId: number;
  originName: string;
  size: number; // byte
  mimeType: string;
  ext: string;
  downloadUrl: string;
}

export interface Article {
  nttId: number;
  bbsId: number;
  no: number;
  parentNttId: number | null;
  threadDepth: number;
  writer: string;
  title: string;
  content: string;
  hasImageInContent: boolean;
  hasAttachment: boolean;
  noticeState: string;
  noticeStartDt: string;
  noticeEndDt: string;
  publishState: string;
  publishStartDt: string;
  publishEndDt: string;
  externalLink: string | null;
  hits: number;
  displayWriter?: string;
  postedAt?: string;
  createdAt: string;
  updatedAt: string;
  attachments: AttachmentInfoDto[] | null;
  skinType: string | null;
  menuId: number;
  status?: string;
  thumbnailUrl?: string;
}

export interface ArticleListParams {
  bbsId: number;
  menuId: number;
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
}

export interface ArticleListResponse {
  content: Article[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface CreateArticleParams {
  bbsId: number;
  menuId: number;
  title: string;
  content: string;
  writer: string;
  noticeState?: string;
  noticeStartDt?: string;
  noticeEndDt?: string;
  publishState?: string;
  publishStartDt?: string;
  publishEndDt?: string;
  externalLink?: string;
}

export interface UpdateArticleParams extends CreateArticleParams {
  nttId: number;
}

export interface AnonymousArticleParams {
  bbsId: number;
  title: string;
  content: string;
  writer: string;
  email: string;
}

export const articleApi = {
  // 게시글 목록 조회
  getArticles: async (
    params: ArticleListParams
  ): Promise<ApiResponse<ArticleListResponse>> => {
    const {
      bbsId,
      menuId,
      page = 0,
      size = 20,
      sort = "createdAt,desc",
      keyword,
    } = params;
    const queryParams = new URLSearchParams({
      bbsId: bbsId.toString(),
      menuId: menuId.toString(),
      page: page.toString(),
      size: size.toString(),
      sort,
    });
    if (keyword) {
      queryParams.append("keyword", keyword);
    }
    const response = await publicApi.get<ApiResponse<ArticleListResponse>>(
      `/cms/bbs/article?${queryParams.toString()}`
    );
    return response.data;
  },

  // 게시글 상세 조회
  getArticle: async (nttId: number): Promise<ApiResponse<Article>> => {
    const response = await privateApi.get<ApiResponse<Article>>(
      `/cms/bbs/article/${nttId}`
    );
    return response.data;
  },

  // 게시글 생성
  createArticle: async (formData: FormData): Promise<ApiResponse<number>> => {
    const response = await privateApi.post<ApiResponse<number>>(
      "/cms/bbs/article",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );
    return response.data;
  },

  // 게시글 수정
  updateArticle: async (
    nttId: number,
    formData: FormData
  ): Promise<ApiResponse<void>> => {
    const response = await privateApi.put<ApiResponse<void>>(
      `/cms/bbs/article/${nttId}`,
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );
    return response.data;
  },

  // 게시글 삭제
  deleteArticle: async (nttId: number): Promise<ApiResponse<void>> => {
    const response = await privateApi.delete<ApiResponse<void>>(
      `/cms/bbs/article/${nttId}`
    );
    return response.data;
  },

  // 첨부파일 업로드
  uploadAttachments: async (
    nttId: number,
    files: File[]
  ): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    const response = await privateApi.post<ApiResponse<void>>(
      `/cms/bbs/article/${nttId}/attach`,
      formData
    );
    return response.data;
  },

  // 첨부파일 목록 조회
  getAttachments: async (nttId: number): Promise<ApiResponse<any[]>> => {
    const response = await privateApi.get<ApiResponse<any[]>>(
      `/cms/bbs/article/${nttId}/attach`
    );
    return response.data;
  },

  // 첨부파일 삭제
  deleteAttachment: async (
    attachmentId: number
  ): Promise<ApiResponse<void>> => {
    const response = await privateApi.delete<ApiResponse<void>>(
      `/cms/bbs/attach/${attachmentId}`
    );
    return response.data;
  },

  // 비로그인 QNA 작성
  createAnonymousArticle: async (
    params: AnonymousArticleParams
  ): Promise<ApiResponse<{ nttId: number }>> => {
    const response = await privateApi.post<ApiResponse<{ nttId: number }>>(
      "/cms/bbs/article/anonymous",
      params
    );
    return response.data;
  },
};
