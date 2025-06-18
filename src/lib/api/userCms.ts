import {
  User,
  UserData,
  PaginatedResponse,
  PaginationParams,
  UserEnrollmentHistoryDto,
} from "@/types/api";
import { privateApi } from "./client";

export interface UserListParams extends PaginationParams {
  username?: string;
  name?: string;
  phone?: string;
  lessonTime?: string;
  payStatus?: string;
}

export const userKeys = {
  all: ["cms_users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export const userCmsApi = {
  getUsers: (params: UserListParams) => {
    return privateApi.get<PaginatedResponse<UserEnrollmentHistoryDto>>(
      "/cms/user",
      { params }
    );
  },

  getUser: (uuid: string) => {
    return privateApi.get<User>(`/cms/user/${uuid}`);
  },

  createUser: (data: Partial<UserData>) => {
    return privateApi.post<User>("/cms/user", data);
  },

  updateUser: (uuid: string, data: Partial<UserData>) => {
    return privateApi.put<User>(`/cms/user/${uuid}`, data);
  },

  deleteUser: (uuid: string) => {
    return privateApi.delete<void>(`/cms/user/${uuid}`);
  },
};
