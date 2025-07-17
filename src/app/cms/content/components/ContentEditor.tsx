"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Flex, Text, Spinner, Button } from "@chakra-ui/react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { LuPlus } from "react-icons/lu";
import { TreeItem } from "@/components/ui/tree-list";
import { contentApi, contentKeys } from "@/lib/api/content";
import {
  ContentBlock,
  ContentBlockHistory,
  CreateContentBlockDto,
  UpdateContentBlockDto,
} from "@/types/api/content";
import { toaster } from "@/components/ui/toaster";
import { ContentBlockItem } from "./ContentBlockItem";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDisclosure } from "@chakra-ui/react";
import { TextEditDialog } from "./TextEditDialog"; // 다이얼로그 다시 추가
import { Search } from "lucide-react";
import { ContentSearchDialog } from "./ContentSearchDialog";
import { ImageEditDialog } from "./ImageEditDialog";
import { fileApi } from "@/lib/api/file";

interface ContentEditorProps {
  selectedMenu: TreeItem | null;
}

export function ContentEditor({ selectedMenu }: ContentEditorProps) {
  const queryClient = useQueryClient();
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [blockToDelete, setBlockToDelete] = useState<number | null>(null);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null); // 편집 상태 다시 추가
  const deleteDialog = useDisclosure();
  const editDialog = useDisclosure(); // 편집 다이얼로그 상태 다시 추가
  const searchDialog = useDisclosure();
  const imageEditDialog = useDisclosure();

  const menuId = selectedMenu?.id ?? 0;
  const queryKey = contentKeys.list(menuId);

  const {
    data: initialContentBlocks,
    isLoading,
    isError,
  } = useQuery<ContentBlock[]>({
    queryKey,
    queryFn: () => contentApi.getContentBlocks(menuId),
    enabled: !!selectedMenu, // menuId가 0일 때도 조회하도록 수정
  });

  const { data: history = [] } = useQuery<ContentBlockHistory[]>({
    queryKey: contentKeys.history(editingBlock?.id ?? 0),
    queryFn: () => contentApi.getContentBlockHistory(editingBlock!.id),
    enabled: !!editingBlock,
  });

  const reorderMutation = useMutation({
    mutationFn: contentApi.reorderContentBlocks,
    onSuccess: () => {
      toaster.create({ title: "순서가 저장되었습니다.", type: "success" });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err, newOrder, context: any) => {
      toaster.create({ title: "순서 변경에 실패했습니다.", type: "error" });
      if (context?.previousBlocks) {
        setContentBlocks(context.previousBlocks);
      }
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey });
      const previousBlocks = queryClient.getQueryData<ContentBlock[]>(queryKey);
      setContentBlocks((prev) =>
        newOrder.reorderItems.map((item) => prev.find((p) => p.id === item.id)!)
      );
      return { previousBlocks };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: contentApi.deleteContentBlock,
    onSuccess: () => {
      toaster.create({ title: "블록이 삭제되었습니다.", type: "success" });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err, variables, context: any) => {
      toaster.create({ title: "블록 삭제에 실패했습니다.", type: "error" });
      if (context?.previousBlocks) {
        setContentBlocks(context.previousBlocks);
      }
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousBlocks =
        queryClient.getQueryData<ContentBlock[]>(queryKey) ?? [];
      setContentBlocks((prev) =>
        prev.filter((block) => block.id !== deletedId)
      );
      return { previousBlocks };
    },
  });

  const createMutation = useMutation({
    mutationFn: (newBlock: { menuId: number; dto: CreateContentBlockDto }) =>
      contentApi.createContentBlock(newBlock.menuId, newBlock.dto),
    onSuccess: () => {
      toaster.create({ title: "블록이 추가되었습니다.", type: "success" });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      toaster.create({ title: "블록 추가에 실패했습니다.", type: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { blockId: number; dto: UpdateContentBlockDto }) =>
      contentApi.updateContentBlock(vars.blockId, vars.dto),
    onSuccess: () => {
      toaster.create({ title: "블록이 수정되었습니다.", type: "success" });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      toaster.create({ title: "블록 수정에 실패했습니다.", type: "error" });
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: contentApi.restoreContentBlock,
    onSuccess: () => {
      toaster.create({
        title: "성공",
        description: "선택한 버전으로 복원되었습니다.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
      editDialog.onClose();
    },
    onError: (error: any) => {
      toaster.create({
        title: "오류",
        description: `복원에 실패했습니다: ${error.message}`,
        type: "error",
      });
    },
  });

  useEffect(() => {
    if (initialContentBlocks) {
      setContentBlocks(initialContentBlocks);
    } else if (!isLoading) {
      setContentBlocks([]);
    }
  }, [initialContentBlocks, isLoading]);

  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    setContentBlocks((prevBlocks) => {
      const newBlocks = [...prevBlocks];
      const [draggedBlock] = newBlocks.splice(dragIndex, 1);
      newBlocks.splice(hoverIndex, 0, draggedBlock);
      return newBlocks;
    });
  }, []);

  const handleDragEnd = () => {
    if (!reorderMutation.isIdle) return;
    const reorderPayload = {
      reorderItems: contentBlocks.map((item, index) => ({
        id: item.id,
        sortOrder: index,
      })),
    };
    reorderMutation.mutate(reorderPayload);
  };

  const handleDeleteRequest = (blockId: number) => {
    setBlockToDelete(blockId);
    deleteDialog.onOpen();
  };

  const handleConfirmDelete = () => {
    if (blockToDelete) {
      deleteMutation.mutate(blockToDelete);
      setBlockToDelete(null);
    }
    deleteDialog.onClose();
  };

  const handleAddBlock = (type: "TEXT" | "IMAGE") => {
    // !menuId 체크는 menuId가 0일 때 true가 되므로,
    // selectedMenu가 null인 경우는 이미 앞에서 처리되므로 이 체크는 제거합니다.
    const newBlockDto: CreateContentBlockDto = {
      type,
      sortOrder: contentBlocks.length,
      content: type === "TEXT" ? "새 텍스트 블록" : "새 이미지 캡션",
    };

    createMutation.mutate({ menuId, dto: newBlockDto });
  };

  const handleEditRequest = (block: ContentBlock) => {
    setEditingBlock(block);
    if (block.type === "TEXT") {
      editDialog.onOpen();
    } else if (block.type === "IMAGE") {
      imageEditDialog.onOpen();
    }
  };

  const handleTextSave = (content: string) => {
    if (!editingBlock) return;
    updateMutation.mutate({
      blockId: editingBlock.id,
      dto: { type: editingBlock.type, content },
    });
    editDialog.onClose();
  };

  const handleImageSave = async (file: File | null, caption: string) => {
    if (!editingBlock) return;

    let fileId = editingBlock.fileId;

    try {
      if (file) {
        // 새 파일이 있으면 업로드
        const uploadResponse = await fileApi.upload(
          file,
          "CONTENT",
          menuId // 올바른 menuId 사용
        );
        if (uploadResponse.success && uploadResponse.data.length > 0) {
          fileId = uploadResponse.data[0].fileId;
        } else {
          throw new Error(
            uploadResponse.message || "파일 업로드에 실패했습니다."
          );
        }
      }

      // 캡션 또는 파일 ID가 변경되었으면 업데이트
      if (caption !== editingBlock.content || fileId !== editingBlock.fileId) {
        updateMutation.mutate({
          blockId: editingBlock.id,
          dto: { type: "IMAGE", content: caption, fileId: fileId },
        });
      }

      imageEditDialog.onClose();
    } catch (error: any) {
      toaster.create({
        title: "이미지 저장 실패",
        description: error.message,
        type: "error",
      });
    }
  };

  const handleRestore = (historyId: number) => {
    restoreMutation.mutate(historyId);
  };

  const handleSelectBlock = (blockId: number) => {
    const blockElement = document.getElementById(`block-${blockId}`);
    if (blockElement) {
      blockElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // 부드러운 아웃라인 효과 적용
      blockElement.style.outline = "2px solid #3182CE"; // blue.500
      blockElement.style.transition = "outline-color 1s ease-out";

      setTimeout(() => {
        blockElement.style.outlineColor = "transparent";
      }, 1000);

      // 트랜지션이 끝난 후 outline 속성 제거
      setTimeout(() => {
        blockElement.style.outline = "";
      }, 2000);
    }
    searchDialog.onClose();
  };

  if (!selectedMenu) {
    return (
      <Flex justify="center" align="center" h="full">
        <Text>편집할 메뉴를 선택해주세요.</Text>
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="full">
        <Spinner />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex justify="center" align="center" h="full">
        <Text color="red.500">콘텐츠를 불러오는 중 오류가 발생했습니다.</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="full" onMouseUp={handleDragEnd}>
      <Flex
        gap={2}
        _dark={{ bg: "gray.800", borderBottomColor: "gray.700" }}
        flexShrink={0}
        pb={2}
      >
        <Button
          colorPalette="blue"
          variant="ghost"
          onClick={searchDialog.onOpen}
          p={0}
          size="xs"
        >
          <Search />
        </Button>
        <Button
          colorPalette="blue"
          variant="subtle"
          onClick={() => handleAddBlock("TEXT")}
          flex="1"
          size="xs"
        >
          <LuPlus />
          <Text as="span">텍스트</Text>
        </Button>
        <Button
          colorPalette="blue"
          variant="subtle"
          onClick={() => handleAddBlock("IMAGE")}
          flex="1"
          size="xs"
        >
          <LuPlus />
          <Text as="span">이미지</Text>
        </Button>
      </Flex>

      <Box flex="1" overflowY="auto">
        {contentBlocks.map((block, index) => (
          <ContentBlockItem
            key={block.id}
            block={block}
            index={index}
            moveBlock={moveBlock}
            onDelete={handleDeleteRequest}
            onEdit={handleEditRequest}
          />
        ))}
      </Box>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={deleteDialog.onClose}
        onConfirm={handleConfirmDelete}
        title="블록 삭제"
        description="정말로 이 콘텐츠 블록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />

      <TextEditDialog
        open={editDialog.open}
        onClose={editDialog.onClose}
        onSave={handleTextSave}
        block={editingBlock}
        history={history}
        onRestore={handleRestore}
      />

      <ImageEditDialog
        open={imageEditDialog.open}
        onClose={imageEditDialog.onClose}
        onSave={handleImageSave}
        block={editingBlock}
      />

      <ContentSearchDialog
        open={searchDialog.open}
        onClose={searchDialog.onClose}
        onSelect={handleSelectBlock}
        blocks={contentBlocks}
      />
    </Flex>
  );
}
