import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "@/types/api";
import { menuApi } from "@/lib/api/menu";
import { MenuApiResponse } from "@/types/api-response";

interface MenuContextType {
  menus: MenuApiResponse;
  isLoading: boolean;
  error: Error | null;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const {
    data: menus = {
      success: false,
      message: "",
      data: [],
      errorCode: null,
      stackTrace: null,
    },
    isLoading,
    error,
  } = useQuery<MenuApiResponse>({
    queryKey: ["menus"],
    queryFn: async () => {
      // 실제 API 호출
      const response = await menuApi.getPublicMenus();
      // API 응답 형식이 변경되어 response.data가 MenuApiResponse 타입이어야 함
      return response.data as MenuApiResponse;
    },
  });

  return (
    <MenuContext.Provider
      value={{
        menus,
        isLoading,
        error: error as Error | null,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenuContext must be used within a MenuProvider");
  }
  return context;
}
