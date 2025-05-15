import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "@/types/api";
import { publicApi } from "../api/client";

interface MenuContextType {
  menus: Menu[];
  isLoading: boolean;
}

const MenuContext = createContext<MenuContextType | null>(null);

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: menus = [], isLoading } = useQuery({
    queryKey: ["menus"],
    queryFn: () => publicApi.get<Menu[]>("/menu"),
  });

  const value = {
    menus,
    isLoading,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
