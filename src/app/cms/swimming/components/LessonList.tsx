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
      setIsDeleteDialogOpen(false);
      onDeleteLesson(lessonToDelete);
      setLessonToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setLessonToDelete(null);
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case "OPEN":
        return "green";
      case "CLOSED":
        return "gray";
      case "ONGOING":
        return "blue";
      case "COMPLETED":
        return "purple";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "OPEN":
        return "모집중";
      case "CLOSED":
        return "마감";
      case "ONGOING":
        return "진행중";
      case "COMPLETED":
        return "종료";
      default:
        return status || "- 미지정 -";
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
        {lessons.length === 0 ? (
          <Text color={secondaryTextColor} textAlign="center" py={4}>
            등록된 강습이 없습니다.
          </Text>
        ) : (
          lessons.map((lesson) => (
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
                selectedLessonMenuId === lesson.lessonId ? "3px solid" : "none"
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
                      color:
                        selectedLessonMenuId === lesson.lessonId
                          ? selectedBorderColor
                          : textColor,
                      transition: "color 0.3s",
                    }}
                  />
                </Flex>
              </Box>
              <VStack align="stretch" gap={0} flex={1}>
                <Flex justify="space-between" align="center">
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={textColor}
                    maxW="calc(100% - 70px)"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {lesson.title}
                  </Text>
                  <Badge
                    ml={2}
                    colorScheme={getStatusBadgeColor(lesson.status)}
                    fontSize="xs" // Smaller badge
                    px={1.5} // Adjust padding for smaller badge
                    py={0.5}
                  >
                    {getStatusLabel(lesson.status)}
                  </Badge>
                </Flex>
                <Text fontSize="xs" color={secondaryTextColor}>
                  {lesson.startDate} ~ {lesson.endDate}
                </Text>
              </VStack>

              {loadingLessonId === lesson.lessonId ? (
                <Box
                  position="absolute"
                  right="10px"
                  top="50%"
                  transform="translateY(-50%)"
                >
                  <Box
                    as="div"
                    w="16px"
                    h="16px"
                    border="2px solid"
                    borderColor="gray.300"
                    borderTopColor="blue.500"
                    borderRadius="full"
                    animation="spin 1s linear infinite"
                  />
                </Box>
              ) : (
                <Box
                  position="absolute"
                  right="10px"
                  top="50%"
                  transform="translateY(-50%)"
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  transition="opacity 0.2s"
                >
                  <LuTrash2
                    size={16}
                    color="red.500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLessonToDelete(lesson.lessonId!);
                      setIsDeleteDialogOpen(true);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                </Box>
              )}
            </Flex>
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
