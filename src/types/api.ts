import { AuthType, SkinType, YesNoType } from "./common";
import { File } from "@/app/cms/file/types"; // Ensure File type is imported

export type MenuType =
  | "LINK"
  | "FOLDER"
  | "BOARD"
  | "CONTENT"
  | "POPUP"
  | "PROGRAM";
export type DisplayPosition = "HEADER" | "FOOTER";

// 기본 타입 정의
export interface Menu {
  id: number;
  name: string;
  type: MenuType;
  url?: string;
  targetId?: number;
  displayPosition: DisplayPosition;
  visible: boolean;
  sortOrder: number;
  parentId: number | null;
  children?: Menu[];
  createdAt: string;
  updatedAt: string;
}

export interface Content {
  id: number;
  title: string;
  content: string;
  type: string;
  parentId?: number;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

/* // 이전 Attachment 인터페이스 - 주석 처리 또는 삭제 (다른 곳에서 사용하지 않는다면)
export interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string; 
  createdAt: string;
}
*/

// FileDto 인터페이스 (새로운 가이드 기반)
export interface FileDto {
  fileId: number;
  originName: string;
  mimeType: string;
  size: number; // bytes
  ext: string;
  // savedName: string; // 프론트엔드에서 직접 사용하지 않으므로 일단 제외 가능
  // publicYn?: string; // 필요시 추가
  // fileOrder?: number; // 필요시 추가
  // createdAt?: string; // 필요시 추가
  // updatedAt?: string; // 필요시 추가
}

export interface Post {
  no: number;
  nttId: number;
  bbsId: number;
  parentNttId: number | null;
  threadDepth: number;
  writer: string;
  title: string;
  content: string; // HTML 또는 JSON 문자열일 수 있음
  hasImageInContent: boolean;
  hasAttachment: boolean;
  noticeState: "Y" | "N" | "P";
  noticeStartDt: string;
  noticeEndDt: string;
  publishState: "Y" | "N" | "P";
  publishStartDt: string;
  publishEndDt: string | null;
  externalLink: string | null;
  hits: number;
  categories?: string[];
  attachments?: File[] | null; // 변경: File 객체 배열 사용
  thumbnailUrl?: string; // Optional thumbnail URL for press/card layouts
  createdAt: string;
  updatedAt: string;

  // Fields for QnA functionality, used by QnaBoardSkin
  status?: string; // e.g., "답변대기", "답변완료"
  answerContent?: string;
  answerCreatedAt?: string;
  answerUpdatedAt?: string;
  answerUserEmail?: string;
  answerUserNickname?: string;
}

export interface User {
  uuid: string;
  username: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API 요청 데이터 타입
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    tokenType: string;
    user: User;
    refreshToken: string;
  };
  errorCode: string | null;
  stackTrace: string | null;
}

export interface MenuData {
  name: string;
  type: MenuType;
  url?: string;
  targetId?: number;
  displayPosition: "HEADER" | "FOOTER";
  visible: boolean;
  sortOrder: number;
  parentId: number | null;
}

// Template related interfaces
export interface TemplateBlock {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  widget?: {
    type: string;
    config?: Record<string, unknown>;
  };
}

export interface TemplateVersion {
  versionId: number;
  templateId: number;
  versionNo: number;
  layout: TemplateBlock[];
  updater: string;
  updatedAt: string;
}

export interface Template {
  id: number;
  templateName: string;
  type: "MAIN" | "SUB";
  description: string | null;
  published: boolean;
  versions?: TemplateVersion[];
  layout?: TemplateBlock[];
  displayPosition: "HEADER" | "FOOTER";
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateData {
  templateName: string;
  templateType: string;
  description: string | null;
  layout: TemplateBlock[];
  published?: boolean;
}

export interface TemplateListParams {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
  type?: string;
  status?: string;
}

export interface TemplateListResponse {
  data: {
    content: Template[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface ContentData {
  title: string;
  content: string;
  type: string;
  parentId?: number;
  sortOrder: number;
  isVisible: boolean;
}

export interface UserData {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  groupId: string;
}

export interface VerifyTokenResponse {
  success: boolean;
  message: string | null;
  data: {
    valid: boolean;
    uuid: string;
    username: string;
    authorities: {
      authority: string;
    }[];
  };
  errorCode: string | null;
  stackTrace: string | null;
}

export interface TemplateSaveDto {
  templateName: string;
  templateType: string;
  description: string | null;
  layout: TemplateBlock[];
  published?: boolean;
}

export interface Company {
  companyId?: number;
  companyName: string;
  tagline?: string;
  residentYear: number;
  logoFileId?: number;
  homepageUrl?: string;
  summaryHtml?: string;
  ceoName?: string;
  foundedDate?: string;
  industry?: string;
  location?: string;
  displayYn: boolean;
  sortOrder?: number;
  extra?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyQueryParams {
  year?: number;
  category?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  displayYn?: boolean;
}

export interface CompanyListResponse {
  status: number;
  data: Company[];
  pagination: {
    page: number;
    size: number;
    total: number;
  };
}

export interface CompanyResponse {
  status: number;
  data: Company;
}

export interface PostData {
  no: number;
  bbsId: number;
  title: string;
  content: string;
  writer: string;
  publishStartDt: string;
  noticeState: "Y" | "N" | "P";
  noticeStartDt: string;
  noticeEndDt: string;
  publishState: "Y" | "N" | "P";
  publishEndDt: string | null;
  externalLink: string | null;
  parentNttId: number | null;
  categories?: string[];
  nttId: number;
  threadDepth: number;
  hits: number;
}

export interface BoardMaster {
  menuId: number;
  bbsId: number;
  bbsName: string;
  skinType: SkinType;
  readAuth: AuthType;
  writeAuth: AuthType;
  adminAuth: AuthType;
  displayYn: YesNoType;
  noticeYn: YesNoType;
  publishYn: YesNoType;
  attachmentYn: YesNoType;
  attachmentLimit: string;
  attachmentSize: string;
  sortOrder: "A" | "D";
  createdAt: string;
  updatedAt: string;
}

export interface BoardMasterApiResponse {
  success: boolean;
  message: string;
  data: {
    content: Array<BoardMaster>;
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
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
    };
    size: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    totalElements: number;
    totalPages: number;
  };
  errorCode: string | null;
  stackTrace: string | null;
}

// 페이지네이션 파라미터
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  [key: string]: any; // 추가 파라미터를 위한 인덱스 시그니처
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  data: {
    content: T[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
  code: number;
  message: string;
  success: boolean;
}
