import { useRecoilValue } from "recoil";
import { publicMenusQuery } from "@/stores/menu";

export const useMenu = () => {
  // `useRecoilValue`는 selector가 resolve될 때까지 컴포넌트를 Suspense 상태로 만듭니다.
  // 로딩 및 에러 상태는 Suspense와 Error Boundary를 통해 상위 컴포넌트에서 처리해야 합니다.
  const menus = useRecoilValue(publicMenusQuery);

  return { menus, isLoading: false, error: null }; // 로딩/에러는 Suspense로 관리되므로 기본값을 반환
};
