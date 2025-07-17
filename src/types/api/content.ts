export interface ContentBlock {
  id: number;
  menuId: number;
  type: "TEXT" | "IMAGE" | "VIDEO" | "BUTTON" | string;
  content: string | null;
  fileId: number | null;
  fileUrl: string | null;
  sortOrder: number;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
}

export interface ContentBlockHistory {
  id: number;
  version: number;
  type: "TEXT" | "IMAGE" | "VIDEO" | "BUTTON" | string;
  content: string | null;
  fileId: number | null;
  createdBy: string;
  createdIp: string;
  createdDate: string;
}

export interface CreateContentBlockDto {
  type: string;
  content?: string | null;
  fileId?: number | null;
  sortOrder: number;
}

export interface UpdateContentBlockDto {
  type: string;
  content?: string | null;
  fileId?: number | null;
}

export interface ReorderContentBlockItem {
  id: number;
  sortOrder: number;
}

export interface ReorderContentBlocksDto {
  reorderItems: ReorderContentBlockItem[];
}
