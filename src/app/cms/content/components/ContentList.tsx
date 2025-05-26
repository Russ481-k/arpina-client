"use client";

import { Badge, Text, Box, Center, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { useColors } from "@/styles/theme";
import { toaster } from "@/components/ui/toaster";
import { useColorModeValue } from "@/components/ui/color-mode";
import { getAuthHeader } from "@/lib/auth-utils";
import { TreeItem } from "@/components/ui/tree-list";
import { LuInbox, LuFileText } from "react-icons/lu";
import { Menu } from "@/types/api";
import { ListItem } from "@/components/ui/list-item";

export interface ContentListProps {
  menus: TreeItem[];
  onEditContent: (content: TreeItem) => void;
  onDeleteContent: (contentId: number) => void;
  isLoading: boolean;
  selectedContentId?: number;
}

export function ContentList({
  menus,
  onEditContent,
  onDeleteContent,
  isLoading,
  selectedContentId,
}: ContentListProps) {
  const [error, setError] = useState<string | null>(null);
  const colors = useColors();
  const emptyColor = useColorModeValue(
    colors.text.secondary,
    colors.text.secondary
  );

  const transformMenuToTreeItem = (menu: Menu): TreeItem => {
    return {
      id: menu.id,
      name: menu.name,
      type: menu.type,
      url: menu.url,
      targetId: menu.targetId,
      displayPosition: menu.displayPosition,
      visible: menu.visible,
      sortOrder: menu.sortOrder,
      parentId: menu.parentId ?? undefined,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
      children: menu.children?.map(transformMenuToTreeItem),
    };
  };

  const fetchMenus = async () => {
    try {
      setError(null);
      const response = await fetch("/api/cms/menu?type=CONTENT", {
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch menus");
      }
      const data = await response.json();
      const transformedData = data.map(transformMenuToTreeItem);
      return transformedData;
    } catch (error) {
      setError("컨텐츠 목록을 불러오는데 실패했습니다.");
      toaster.error({
        title: "컨텐츠 목록을 불러오는데 실패했습니다.",
        duration: 3000,
      });
      return [];
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="full">
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />{" "}
      </Flex>
    );
  }

  if (error) {
    return (
      <Center py={8} flexDirection="column" gap={2}>
        <Text color="red.500">{error}</Text>
        <Badge
          as="button"
          onClick={fetchMenus}
          colorPalette="blue"
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
        >
          다시 시도
        </Badge>
      </Center>
    );
  }

  if (menus.length === 0) {
    return (
      <Center py={8} flexDirection="column" gap={2}>
        <LuInbox size={24} color={emptyColor} />
        <Text color={emptyColor}>등록된 컨텐츠가 없습니다.</Text>
      </Center>
    );
  }

  return (
    <Box>
      {menus?.map((menu) => (
        <ListItem
          key={menu.id}
          id={menu.id}
          name={menu.name}
          icon={<LuFileText />}
          isSelected={menu.id === selectedContentId}
          onDelete={() => onDeleteContent(menu.id)}
          renderBadges={() => !menu.visible && "비활성"}
          onClick={() => onEditContent(menu)}
        />
      ))}
    </Box>
  );
}
