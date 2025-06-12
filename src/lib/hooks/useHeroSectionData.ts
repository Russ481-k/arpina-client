import { usePathname } from "next/navigation";
import { heroSectionData } from "@/lib/constants/heroSectionData";
import { useState, useEffect } from "react";

function getBasePath(currentPath: string): string {
  const segments = currentPath.split("/");
  // A path like "/bbs/slug" has segments ['', 'bbs', 'slug'] (length 3)
  // A path like "/bbs/slug/read" has segments ['', 'bbs', 'slug', 'read'] (length 4)
  // We want to truncate if length > 3, taking the first 3 segments.
  if (segments.length > 3) {
    return segments.slice(0, 3).join("/");
  }
  return currentPath; // Return original path if it's not deeper than /bbs/slug
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
        { label: "기본", url: originalPath }, // Breadcrumb might still use originalPath
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
        { label: "기본", url: originalPath }, // Breadcrumb might still use originalPath
      ],
    };

    setData(newData);
  }, [boardUrl, pathname]);

  return data;
}
