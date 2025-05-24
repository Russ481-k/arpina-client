"use client";

import React, { useState } from "react";
import { Box, Flex, Heading, Badge } from "@chakra-ui/react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type {
  AdminLessonDto,
  PaginationParams,
  PaginatedResponse,
} from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import { GridSection } from "@/components/ui/grid-section";
import { useColors } from "@/styles/theme";
import { LessonEditor } from "./LessonEditor";
import { LessonList } from "./LessonList";
import { AdminTabsManager } from "./AdminTabsManager";
import { LockerManager } from "./LockerManager";
import { StatisticsManager } from "./StatisticsManager";

// Admin Lesson Query Keys
const adminLessonKeys = {
  all: ["adminLessons"] as const,
  lists: () => [...adminLessonKeys.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...adminLessonKeys.lists(), params] as const,
  details: () => [...adminLessonKeys.all, "detail"] as const,
  detail: (id: number) => [...adminLessonKeys.details(), id] as const,
};

export const LessonManager: React.FC = () => {
  const queryClient = useQueryClient();
  const colors = useColors();

  const [selectedAdminLesson, setSelectedAdminLesson] =
    useState<AdminLessonDto | null>(null);

  // Lesson data query
  const [lessonParams, setLessonParams] = useState<PaginationParams>({
    page: 0,
    size: 10,
  });

  const {
    data: adminLessonsResponse,
    isLoading: isAdminLessonsLoading,
    isError: isAdminLessonsError,
    error: adminLessonsErrorData,
  } = useQuery<
    PaginatedResponse<AdminLessonDto>,
    Error,
    PaginatedResponse<AdminLessonDto>,
    any
  >({
    queryKey: adminLessonKeys.list(lessonParams),
    queryFn: () => adminApi.getAdminLessons(lessonParams),
  });

  const adminLessons = adminLessonsResponse?.data?.content || [];
  console.log(adminLessons);
  // Mutations
  const createAdminLessonMutation = useMutation<
    AdminLessonDto,
    Error,
    AdminLessonDto
  >({
    mutationFn: (newData: AdminLessonDto) =>
      adminApi.createAdminLesson(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLessonKeys.lists() });
      toaster.create({
        title: "성공",
        description: "강습이 생성되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      toaster.create({
        title: "오류",
        description: `강습 생성 실패: ${error.message}`,
        type: "error",
      });
    },
  });

  const updateAdminLessonMutation = useMutation<
    AdminLessonDto,
    Error,
    { lessonId: number; data: AdminLessonDto }
  >({
    mutationFn: ({ lessonId, data }) =>
      adminApi.updateAdminLesson(lessonId, data),
    onSuccess: (updatedLesson) => {
      queryClient.invalidateQueries({ queryKey: adminLessonKeys.lists() });
      queryClient.setQueryData(
        adminLessonKeys.detail(updatedLesson.lessonId!),
        updatedLesson
      );
      toaster.create({
        title: "성공",
        description: "강습이 수정되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      toaster.create({
        title: "오류",
        description: `강습 수정 실패: ${error.message}`,
        type: "error",
      });
    },
  });

  const deleteAdminLessonMutation = useMutation<void, Error, number>({
    mutationFn: (lessonId: number) => adminApi.deleteAdminLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLessonKeys.lists() });
      toaster.create({
        title: "성공",
        description: "강습이 삭제되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      toaster.create({
        title: "오류",
        description: `강습 삭제 실패: ${error.message}`,
        type: "error",
      });
    },
  });

  // Event handlers
  const handleAddLesson = () => {
    setSelectedAdminLesson(null);
  };

  const handleEditLesson = (lesson: AdminLessonDto) => {
    setSelectedAdminLesson(lesson);
  };

  const handleDeleteLesson = async (lessonId: number) => {
    await deleteAdminLessonMutation.mutateAsync(lessonId);
  };

  const handleSaveLesson = async (data: AdminLessonDto) => {
    if (selectedAdminLesson && selectedAdminLesson.lessonId) {
      await updateAdminLessonMutation.mutateAsync({
        lessonId: selectedAdminLesson.lessonId,
        data,
      });
    } else {
      await createAdminLessonMutation.mutateAsync(data);
    }
  };

  const handleRemoveLesson = async () => {
    if (selectedAdminLesson?.lessonId) {
      await deleteAdminLessonMutation.mutateAsync(selectedAdminLesson.lessonId);
      setSelectedAdminLesson(null);
    }
  };

  const handleAddLessonClick = () => {
    setSelectedAdminLesson(null);
  };

  const swimmingLayout = [
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
      id: "lessonList",
      x: 0,
      y: 1,
      w: 3,
      h: 5,
      title: "강습 목록",
      subtitle: "등록된 강습 목록입니다.",
    },
    {
      id: "lessonEditor",
      x: 0,
      y: 6,
      w: 3,
      h: 6,
      title: "강습 편집",
      subtitle: "강습의 상세 정보를 수정할 수 있습니다.",
    },
    {
      id: "adminTabs",
      x: 3,
      y: 1,
      w: 6,
      h: 11,
      title: "관리 시스템",
      subtitle: "신청자, 취소/환불, 결제 내역 관리입니다.",
    },
    {
      id: "lockerManager",
      x: 9,
      y: 1,
      w: 3,
      h: 5,
      title: "사물함 재고 관리",
      subtitle: "성별별 사물함 재고를 관리합니다.",
    },
    {
      id: "statisticsManager",
      x: 9,
      y: 6,
      w: 3,
      h: 6,
      title: "통계 및 리포트",
      subtitle: "수영장 운영 현황과 매출 통계입니다.",
    },
  ];

  if (isAdminLessonsLoading) {
    return (
      <Box
        p={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
      >
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />
      </Box>
    );
  }

  return (
    <Box bg={colors.bg} minH="100vh" w="full" position="relative">
      <Box w="full">
        <GridSection initialLayout={swimmingLayout}>
          <Flex justify="space-between" align="center" h="36px">
            <Flex align="center" gap={2} px={2}>
              <Heading
                size="lg"
                color={colors.text.primary}
                letterSpacing="tight"
              >
                수영장 통합 관리 시스템
              </Heading>
              <Badge
                bg={colors.secondary.light}
                color={colors.secondary.default}
                px={2}
                py={1}
                borderRadius="md"
                fontSize="xs"
                fontWeight="bold"
              >
                관리자
              </Badge>
            </Flex>
          </Flex>

          {/* Lesson List */}
          <Box>
            <LessonList
              lessons={adminLessons}
              onAddLesson={handleAddLesson}
              onEditLesson={handleEditLesson}
              onDeleteLesson={handleDeleteLesson}
              isLoading={isAdminLessonsLoading}
              selectedLessonMenuId={selectedAdminLesson?.lessonId}
              loadingLessonId={
                deleteAdminLessonMutation.isPending
                  ? selectedAdminLesson?.lessonId ?? null
                  : null
              }
            />
          </Box>

          {/* Lesson Editor */}
          <Box id="lessonEditor" position="relative">
            <LessonEditor
              lesson={selectedAdminLesson}
              onSubmit={handleSaveLesson}
              onDelete={handleRemoveLesson}
              onAddNew={handleAddLessonClick}
              isLoading={
                createAdminLessonMutation.isPending ||
                updateAdminLessonMutation.isPending ||
                deleteAdminLessonMutation.isPending
              }
            />
          </Box>

          {/* Admin Tabs Manager */}
          <Box id="adminTabs" position="relative">
            <AdminTabsManager />
          </Box>

          {/* Locker Manager */}
          <Box id="lockerManager" position="relative">
            <LockerManager />
          </Box>

          {/* Statistics Manager */}
          <Box id="statisticsManager" position="relative">
            <StatisticsManager />
          </Box>
        </GridSection>
      </Box>
    </Box>
  );
};
