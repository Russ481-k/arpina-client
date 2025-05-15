import { Content, ContentData } from "@/types/api";
import { privateApi } from "./client";

export const contentKeys = {
  all: ["content"] as const,
  lists: () => [...contentKeys.all, "list"] as const,
  list: (filters: string) => [...contentKeys.lists(), { filters }] as const,
  details: () => [...contentKeys.all, "detail"] as const,
  detail: (id: string) => [...contentKeys.details(), id] as const,
};

export const contentApi = {
  getContents: () => {
    return privateApi.get<Content[]>("/cms/content");
  },

  createContent: (data: ContentData) => {
    return privateApi.post<Content>("/cms/content", data);
  },

  updateContent: (id: string, data: ContentData) => {
    return privateApi.put<Content>(`/cms/content/${id}`, data);
  },

  deleteContent: (id: string) => {
    return privateApi.delete<void>(`/cms/content/${id}`);
  },
};
