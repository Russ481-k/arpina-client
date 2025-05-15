"use client";

import { useState, useEffect } from "react";
import { Box, Flex, Heading, Badge } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { ContentList } from "./components/ContentList";
import { ContentEditor } from "./components/ContentEditor";
import { GridSection } from "@/components/ui/grid-section";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { toaster } from "@/components/ui/toaster";
import { TreeItem } from "@/components/ui/tree-list";
import { ContentPreview } from "./components/ContentPreview";
import { convertTreeItemToContent } from "./types";

import { getAuthHeader } from "@/lib/auth-utils";
import { Menu } from "@/types/api";

export default function ContentManagementPage() {
  const [selectedContent, setSelectedContent] = useState<TreeItem | null>(null);
  const [contents, setContents] = useState<TreeItem[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const colors = useColors();
  const bg = useColorModeValue(colors.bg, colors.darkBg);

  // 테마 색상 적용
  const headingColor = useColorModeValue(
    colors.text.primary,
    colors.text.primary
  );
  const buttonBg = useColorModeValue(
    colors.primary.default,
    colors.primary.default
  );
  const buttonHoverBg = useColorModeValue(
    colors.primary.hover,
    colors.primary.hover
  );

  const badgeBg = useColorModeValue(colors.primary.light, colors.primary.light);
  const badgeColor = useColorModeValue(
    colors.primary.default,
    colors.primary.default
  );

  // 컨텐츠 목록 새로고침 함수
  const refreshContents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cms/menu?type=CONTENT", {
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch contents");
      }
      const data = await response.json();
      console.log("API Response:", data);
      setContents(data);
    } catch (error) {
      console.error("Error fetching contents:", error);
      toaster.error({
        title: "컨텐츠 목록을 불러오는데 실패했습니다.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 메뉴 목록 불러오기
  const fetchMenus = async () => {
    try {
      const response = await fetch("/api/cms/menu", {
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch menus");
      }
      const data = await response.json();
      setMenus(data.data);
    } catch (error) {
      console.error("Error fetching menus:", error);
      toaster.create({
        title: "메뉴 목록을 불러오는데 실패했습니다.",
        type: "error",
      });
    }
  };

  const handleAddContent = () => {
    setSelectedContent(null);
  };

  const handleEditContent = (content: TreeItem) => {
    setSelectedContent(content);
  };

  const handleCloseEditor = () => {
    setSelectedContent(null);
  };

  const handleSubmit = async (
    contentData: Omit<TreeItem, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const url = selectedContent
        ? `/api/cms/menu/${selectedContent.id}`
        : "/api/cms/menu";
      const method = selectedContent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contentData),
      });

      if (!response.ok) {
        throw new Error("Failed to save content");
      }

      await refreshContents();
      setSelectedContent(null);
      toaster.create({
        title: selectedContent
          ? "컨텐츠가 수정되었습니다."
          : "컨텐츠가 생성되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving content:", error);
      toaster.create({
        title: "컨텐츠 저장에 실패했습니다.",
        type: "error",
      });
    }
  };

  const handleDeleteContent = async (contentId: number) => {
    try {
      const response = await fetch(`/api/cms/menu/${contentId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete content");
      }

      await refreshContents();
      setSelectedContent(null);
      toaster.create({
        title: "컨텐츠가 삭제되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      toaster.create({
        title: "컨텐츠 삭제에 실패했습니다.",
        type: "error",
      });
    }
  };

  // 컨텐츠 관리 페이지 레이아웃 정의
  const contentLayout = [
    {
      id: "header",
      x: 0,
      y: 0,
      w: 12,
      h: 1,
      isStatic: true,
      isHeader: true,
    },
    {
      id: "contentList",
      x: 0,
      y: 1,
      w: 3,
      h: 5,
      title: "컨텐츠 목록",
      subtitle: "등록된 컨텐츠 목록입니다.",
    },
    {
      id: "contentEditor",
      x: 3,
      y: 1,
      w: 9,
      h: 5,
      title: "컨텐츠 편집",
      subtitle: "컨텐츠의 상세 정보를 수정할 수 있습니다.",
    },
    {
      id: "contentPreview",
      x: 0,
      y: 6,
      w: 12,
      h: 5,
      title: "컨텐츠 미리보기",
      subtitle: "컨텐츠의 미리보기를 확인할 수 있습니다.",
    },
  ];

  // 초기 데이터 로딩
  useEffect(() => {
    refreshContents();
    fetchMenus();
  }, []);

  return (
    <Box bg={bg} minH="100vh" w="full" position="relative">
      <Box w="full">
        <GridSection initialLayout={contentLayout}>
          <Flex justify="space-between" align="center" h="36px">
            <Flex align="center" gap={2} px={2}>
              <Heading size="lg" color={headingColor} letterSpacing="tight">
                컨텐츠 관리
              </Heading>
              <Badge
                bg={badgeBg}
                color={badgeColor}
                px={2}
                py={1}
                borderRadius="md"
                fontSize="xs"
                fontWeight="bold"
              >
                관리자
              </Badge>
            </Flex>
            <Button
              onClick={handleAddContent}
              bg={buttonBg}
              color="white"
              _hover={{ bg: buttonHoverBg, transform: "translateY(-2px)" }}
              _active={{ transform: "translateY(0)" }}
              shadow={colors.shadow.sm}
              transition="all 0.3s ease"
              size="sm"
            >
              새 컨텐츠 추가
            </Button>
          </Flex>

          <Box>
            <ContentList
              menus={contents}
              onEditContent={handleEditContent}
              onDeleteContent={handleDeleteContent}
              isLoading={isLoading}
              selectedContentId={selectedContent?.id}
            />
          </Box>

          <Box>
            <ContentEditor
              content={
                selectedContent
                  ? convertTreeItemToContent(selectedContent)
                  : null
              }
              onClose={handleCloseEditor}
              onDelete={handleDeleteContent}
              onSubmit={handleSubmit}
            />
          </Box>
          <Box>
            <ContentPreview
              content={
                selectedContent
                  ? convertTreeItemToContent(selectedContent)
                  : null
              }
              menus={menus}
            />
          </Box>
        </GridSection>
      </Box>
    </Box>
  );
}
