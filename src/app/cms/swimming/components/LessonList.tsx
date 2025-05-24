"use client";

import React, { useMemo, useState } from "react";
import { Box, VStack, Text, Flex, Badge, Button } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { useColorModeValue } from "@/components/ui/color-mode";
import type { AdminLessonDto } from "@/types/api";
import { LuBook, LuTrash2 } from "react-icons/lu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface LessonListProps {
  lessons: AdminLessonDto[];
  onAddLesson: () => void;
  onEditLesson: (lesson: AdminLessonDto) => void;
  onDeleteLesson: (lessonId: number) => Promise<void>;
  isLoading: boolean;
  selectedLessonMenuId?: number;
  loadingLessonId: number | null;
}

const LessonList = React.memo(function LessonList({
  lessons,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  isLoading,
  selectedLessonMenuId,
  loadingLessonId,
}: LessonListProps) {
  const colors = useColors();
  const hoverBg = useColorModeValue(colors.bg, colors.darkBg);
  const selectedBorderColor = colors.primary.default;
  const textColor = colors.text.primary;
  const secondaryTextColor = colors.text.secondary;

  // Deletion confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);

  const handleDelete = () => {
    if (lessonToDelete) {
      // Close the dialog first to prevent double confirmation
      setIsDeleteDialogOpen(false);
      // Then trigger the delete operation
      onDeleteLesson(lessonToDelete);
      setLessonToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setLessonToDelete(null);
  };

  // Group lessons by status
  const lessonsByStatus = useMemo(() => {
    const grouped = lessons.reduce((acc, lesson) => {
      const status = lesson.status || "ACTIVE";
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(lesson);
      return acc;
    }, {} as Record<string, AdminLessonDto[]>);

    // Sort statuses (ACTIVE first, then others)
    return Object.entries(grouped)
      .sort(([statusA], [statusB]) => {
        if (statusA === "ACTIVE") return -1;
        if (statusB === "ACTIVE") return 1;
        return statusA.localeCompare(statusB);
      })
      .reduce((acc, [status, lessons]) => {
        acc[status] = lessons;
        return acc;
      }, {} as Record<string, AdminLessonDto[]>);
  }, [lessons]);

  const [expandedStatuses, setExpandedStatuses] = React.useState<
    Record<string, boolean>
  >({
    ACTIVE: true,
  });

  const toggleStatus = (status: string) => {
    setExpandedStatuses((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "INACTIVE":
        return "gray";
      case "DRAFT":
        return "yellow";
      default:
        return "blue";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "활성";
      case "INACTIVE":
        return "비활성";
      case "DRAFT":
        return "임시저장";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
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
    <>
      <VStack gap={1} align="stretch">
        {Object.keys(lessonsByStatus).length === 0 ? (
          <Text color={secondaryTextColor} textAlign="center" py={4}>
            등록된 강습이 없습니다.
          </Text>
        ) : (
          Object.entries(lessonsByStatus).map(([status, statusLessons]) => (
            <Box key={status}>
              <Flex
                key={status}
                h="50px"
                alignItems="center"
                p={2}
                cursor="pointer"
                onClick={() => toggleStatus(status)}
                borderRadius="md"
                justifyContent="space-between"
                pl={2}
                py={1.5}
                px={2}
                bg={expandedStatuses[status] ? colors.bg : "transparent"}
                borderLeft={expandedStatuses[status] ? "3px solid" : "none"}
                borderColor={
                  expandedStatuses[status] ? selectedBorderColor : "transparent"
                }
                _hover={{
                  bg: hoverBg,
                  transform: "translateX(2px)",
                  boxShadow: "sm",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "& .lesson-icon": {
                    opacity: 1,
                    transform: "scale(1.1)",
                  },
                }}
                transition="all 0.2s ease-out"
                position="relative"
                role="group"
                mb={1}
                mr={1}
              >
                <Flex alignItems="center">
                  <Text fontWeight="bold" color={textColor}>
                    {getStatusLabel(status)}
                  </Text>
                  <Badge
                    ml={2}
                    colorScheme={getStatusBadgeColor(status)}
                    fontSize="xs"
                  >
                    {statusLessons.length}개
                  </Badge>
                </Flex>
              </Flex>
              {expandedStatuses[status] && (
                <VStack gap={1} align="stretch" pl={6}>
                  {statusLessons.map((lesson) => (
                    <Flex
                      key={lesson.lessonId}
                      pl={2}
                      py={1.5}
                      px={2}
                      alignItems="center"
                      cursor="pointer"
                      bg={
                        selectedLessonMenuId === lesson.lessonId
                          ? colors.bg
                          : "transparent"
                      }
                      borderLeft={
                        selectedLessonMenuId === lesson.lessonId
                          ? "3px solid"
                          : "none"
                      }
                      borderColor={
                        selectedLessonMenuId === lesson.lessonId
                          ? selectedBorderColor
                          : "transparent"
                      }
                      _hover={{
                        bg: hoverBg,
                        transform: "translateX(2px)",
                        boxShadow: "sm",
                        backdropFilter: "blur(4px)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "& .lesson-icon": {
                          opacity: 1,
                          transform: "scale(1.1)",
                        },
                      }}
                      transition="all 0.2s ease-out"
                      borderRadius="md"
                      position="relative"
                      role="group"
                      mb={1}
                      mr={1}
                      onClick={() => onEditLesson(lesson)}
                    >
                      <Box
                        width="24px"
                        mr={2}
                        textAlign="center"
                        className="lesson-icon"
                        style={{ cursor: "pointer" }}
                      >
                        <Flex
                          width="24px"
                          height="24px"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <LuBook
                            size={18}
                            style={{
                              color: colors.primary.default,
                              opacity: 0.7,
                            }}
                          />
                        </Flex>
                      </Box>
                      <Flex
                        flex="1"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Text fontWeight="medium" color={textColor}>
                            {lesson.title}
                          </Text>
                          {lesson.instructorName && (
                            <Text fontSize="sm" color={secondaryTextColor}>
                              강사: {lesson.instructorName}
                            </Text>
                          )}
                        </Box>
                        <Flex gap={2} alignItems="center">
                          {lesson.lessonTime && (
                            <Badge colorScheme="blue" fontSize="xs">
                              {lesson.lessonTime}
                            </Badge>
                          )}

                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLessonToDelete(lesson.lessonId!);
                              setIsDeleteDialogOpen(true);
                            }}
                            loading={loadingLessonId === lesson.lessonId}
                          >
                            <LuTrash2 size={14} />
                          </Button>
                        </Flex>
                      </Flex>
                    </Flex>
                  ))}
                </VStack>
              )}
            </Box>
          ))
        )}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDelete}
        title="강습 삭제"
        description="정말로 이 강습을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        backdrop="rgba(0, 0, 0, 0.5)"
      />
    </>
  );
});

export { LessonList };
