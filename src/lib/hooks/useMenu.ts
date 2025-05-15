import { useQueryClient } from "@tanstack/react-query";
import { menuKeys } from "@/lib/api/menu";
import { useMenuContext } from "@/lib/contexts/MenuContext";

export function useMenu() {
  const queryClient = useQueryClient();
  const { menus, isLoading, error } = useMenuContext();

  const refreshMenus = () => {
    queryClient.invalidateQueries({ queryKey: menuKeys.all });
  };

  return { menus, isLoading, error, refreshMenus };
}
