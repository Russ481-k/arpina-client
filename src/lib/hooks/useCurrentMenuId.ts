import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Menu } from "@/types/api";
import { useMenuContext } from "@/lib/contexts/MenuContext";

/**
 * 현재 페이지의 URL과 메뉴의 URL을 비교하여 메뉴 ID를 찾는 훅
 *
 * @returns 현재 페이지에 해당하는 메뉴 ID 또는 undefined
 */
export function useCurrentMenuId(): number | undefined {
  const { menus } = useMenuContext();
  const rawPathname = usePathname();

  return useMemo(() => {
    if (!rawPathname || !menus?.data?.length) return undefined;

    let pathname = rawPathname;

    // URL 경로 정규화
    const normalizedPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
    const pathWithoutSlash = pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

    // 1. 정확히 일치하는 메뉴 찾기
    const exactMatch = menus.data?.find((menu: Menu) => {
      const menuUrl = menu.url?.trim();
      return (
        menuUrl === pathname ||
        menuUrl === normalizedPath ||
        menuUrl === pathWithoutSlash
      );
    });

    if (exactMatch) return exactMatch.id;

    // 2. 가장 구체적인 부분 일치 메뉴 찾기
    const partialMatches = menus.data?.filter((menu: Menu) => {
      const menuUrl = menu.url?.trim();
      if (!menuUrl) return false;

      return (
        pathname.startsWith(menuUrl) &&
        (pathname === menuUrl ||
          pathname.startsWith(menuUrl + "/") ||
          menuUrl.endsWith("/"))
      );
    });

    if (partialMatches.length > 0) {
      // URL이 가장 긴 메뉴 선택
      const bestMatch = partialMatches.reduce((prev, current) => {
        const prevUrl = prev.url?.trim() || "";
        const currentUrl = current.url?.trim() || "";
        return currentUrl.length > prevUrl.length ? current : prev;
      });

      return bestMatch.id;
    }

    return undefined;
  }, [menus, rawPathname]);
}

/**
 * 주어진 메뉴 ID의 모든 상위 메뉴를 포함한 경로 배열을 찾는 함수
 *
 * @param menus 전체 메뉴 배열
 * @param menuId 경로를 찾을 메뉴 ID
 * @returns 상위 메뉴부터 현재 메뉴까지의 ID 배열
 */
function findMenuPath(menus: Menu[], menuId: number | undefined): number[] {
  if (!menuId || !menus?.length) return [];

  const path: number[] = [];
  let currentId = menuId;

  // 현재 메뉴부터 최상위 메뉴까지 거슬러 올라가며 경로 구성
  while (currentId) {
    // 현재 메뉴 찾기
    const currentMenu = menus.find((menu) => menu.id === currentId);
    if (!currentMenu) break;

    // 순환 참조 방지
    if (path.includes(currentId)) break;

    // 경로의 앞쪽에 추가 (최상위 메뉴가 먼저 오도록)
    path.unshift(currentId);

    // 부모 메뉴가 없으면 종료
    if (currentMenu.parentId === null) break;

    // 부모 메뉴로 이동
    currentId = currentMenu.parentId;
  }

  return path;
}

/**
 * 현재 페이지의 메뉴 경로와 관련 정보를 제공하는 확장 훅
 *
 * @returns 현재 메뉴 정보, 경로, 활성화 상태 확인 함수 등
 */
export function useCurrentMenu() {
  const { menus, isLoading } = useMenuContext();
  const currentMenuId = useCurrentMenuId();

  return useMemo(() => {
    // 메뉴 ID 없으면 기본값 반환
    if (isLoading || !currentMenuId) {
      return {
        currentMenuId: undefined,
        currentMenu: undefined,
        parentMenu: undefined,
        menuPath: [],
        breadcrumb: [],
        isActive: () => false,
      };
    }

    // 메뉴 ID로 메뉴 객체 찾기
    const findMenuById = (id: number) =>
      menus.data?.find((menu: Menu) => menu.id === id);

    // 현재 메뉴 경로 찾기
    const menuPath = findMenuPath(menus.data, currentMenuId);

    // 현재 메뉴와 부모 메뉴 객체
    const currentMenu = findMenuById(currentMenuId);
    const parentMenu = currentMenu?.parentId
      ? findMenuById(currentMenu.parentId)
      : undefined;

    // 브레드크럼용 메뉴 객체 배열
    const breadcrumb = menuPath
      .map((id) => findMenuById(id))
      .filter(Boolean) as Menu[];

    // 메뉴 활성화 상태 확인 함수
    const isActive = (menuId: number) => menuPath.includes(menuId);

    return {
      currentMenuId,
      currentMenu,
      parentMenu,
      menuPath,
      breadcrumb,
      isActive,
    };
  }, [menus, isLoading, currentMenuId]);
}
