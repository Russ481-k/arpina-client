import { User, UserData } from "@/types/api";
import { privateApi } from "./client";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export const userApi = {
  getUsers: () => {
    return privateApi.get<User[]>("/cms/users");
  },

  getUser: (id: string) => {
    return privateApi.get<User>(`/cms/users/${id}`);
  },

  updateUser: (id: string, data: UserData) => {
    return privateApi.put<User>(`/cms/users/${id}`, data);
  },

  deleteUser: (id: string) => {
    return privateApi.delete<void>(`/cms/users/${id}`);
  },
};
