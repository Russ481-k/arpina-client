import { selector } from "recoil";
import { menuApi, sortMenus } from "@/lib/api/menu";
import type { Menu as MenuType } from "@/types/api";

// 1. API를 통해 원본 메뉴 데이터를 가져오는 비동기 selector
export const publicMenusQuery = selector<MenuType[]>({
  key: "publicMenusQuery",
  get: async () => {
    try {
      const response = await menuApi.getPublicMenus();
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      // API 응답 실패 시 빈 배열 반환
      console.error("Failed to fetch public menus:", response.data?.message);
      return [];
    } catch (error) {
      console.error("Error fetching public menus:", error);
      return []; // 오류 발생 시 빈 배열 반환
    }
  },
});

// 2. 계층적인 메뉴 트리 구조를 만드는 selector
export const menuTreeState = selector<MenuType[]>({
  key: "menuTreeState",
  get: ({ get }) => {
    const menus = get(publicMenusQuery);
    if (!menus || menus.length === 0) {
      return [];
    }
    return sortMenus(menus);
  },
});

// 헬퍼 함수: 메뉴 트리를 평탄화하고 부모 경로를 추가
const flattenMenusWithParentPath = (
  menus: MenuType[],
  parentPath = ""
): (MenuType & { parent_path?: string })[] => {
  let flattened: (MenuType & { parent_path?: string })[] = [];
  for (const menu of menus) {
    const currentPath = parentPath ? `${parentPath} > ${menu.name}` : menu.name;
    flattened.push({ ...menu, parent_path: parentPath });
    if (menu.children && menu.children.length > 0) {
      flattened = [
        ...flattened,
        ...flattenMenusWithParentPath(menu.children as MenuType[], currentPath),
      ];
    }
  }
  return flattened;
};

// 3. 검색 다이얼로그에서 사용하기 위한 평탄화된 메뉴 리스트 selector
export const flattenedMenusState = selector<
  (MenuType & { parent_path?: string })[]
>({
  key: "flattenedMenusState",
  get: ({ get }) => {
    const menuTree = get(menuTreeState);
    return flattenMenusWithParentPath(menuTree);
  },
});
