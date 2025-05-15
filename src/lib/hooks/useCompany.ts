import { Company, CompanyResponse, CompanyListResponse } from "@/types/api";
import { CompanyQueryParams } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (params: CompanyQueryParams) =>
    [...companyKeys.lists(), params] as const,
  detail: (id: number) => [...companyKeys.all, "detail", id] as const,
};

export const useCompanies = (params: CompanyQueryParams) => {
  return useQuery<CompanyListResponse>({
    queryKey: companyKeys.list(params),
    queryFn: () =>
      api
        .get<CompanyListResponse>("/companies", { params })
        .then((res) => res.data),
  });
};

export const useCompany = (id: number) => {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<CompanyResponse>(`/companies/${id}`);
      return response.data;
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (company: Omit<Company, "companyId">) => {
      const response = await api.post<CompanyResponse>("/companies", company);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: number;
      company: Partial<Company>;
    }) => {
      const response = await api.put<CompanyResponse>(
        `/companies/${id}`,
        company
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
};
