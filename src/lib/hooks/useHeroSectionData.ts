import { usePathname } from "next/navigation";
import { heroSectionData } from "@/lib/constants/heroSectionData";
import { useState, useEffect } from "react";

function getBasePath(currentPath: string): string {
  // 더 이상 경로를 자르지 않고 현재 경로를 그대로 사용
  return currentPath;
}

export function useHeroSectionData(boardUrl?: string) {
  const pathname = usePathname();
  const [data, setData] = useState(() => {
    const originalPath = boardUrl || pathname;
    const keyPath = getBasePath(originalPath);

    const initialData = heroSectionData[keyPath] || {
      header: "기본 헤더",
      title: "기본 타이틀",
      image: "/images/default.png",
      breadcrumb: [
        { label: "홈", url: "/" },
        { label: "기본", url: originalPath },
      ],
    };

    return initialData;
  });

  useEffect(() => {
    const originalPath = boardUrl || pathname;
    const keyPath = getBasePath(originalPath);

    const newData = heroSectionData[keyPath] || {
      header: "기본 헤더",
      title: "기본 타이틀",
      image: "/images/default.png",
      breadcrumb: [
        { label: "홈", url: "/" },
        { label: "기본", url: originalPath },
      ],
    };

    setData(newData);
  }, [boardUrl, pathname]);

  return data;
}
