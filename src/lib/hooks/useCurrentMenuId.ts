import { usePathname } from "next/navigation";
import { useRecoilValue } from "recoil";
import { menuTreeState } from "@/stores/menu";
import type { Menu } from "@/types/api";

const findMenuId = (
  menus: Menu[] | undefined,
  pathname: string
): number | null => {
  if (!menus) {
    return null;
  }
  for (const menu of menus) {
    if (menu.url && pathname.startsWith(menu.url)) {
      return menu.id;
    }
    if (menu.children && menu.children.length > 0) {
      const foundId = findMenuId(menu.children, pathname);
      if (foundId) {
        return foundId;
      }
    }
  }
  return null;
};

export const useCurrentMenuId = (): number | null => {
  const pathname = usePathname();
  const menus = useRecoilValue(menuTreeState);
  return findMenuId(menus, pathname);
};
