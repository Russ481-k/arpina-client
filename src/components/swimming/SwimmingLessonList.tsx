"use client";

import { Box, Flex, Text, Grid, GridItem } from "@chakra-ui/react";
import { useState, useCallback, useMemo } from "react";
import { useLessons, useEnrollLesson } from "@/lib/hooks/useSwimming";
import { LessonDTO } from "@/types/swimming";
import { LessonFilterControls } from "./LessonFilterControls";
import { LessonCard } from "./LessonCard";
import { statusOptions } from "./filterConstants";

const statusApiToFilterValue: { [key: string]: string } = {};
statusOptions.forEach((option) => {
  if (option.value !== "all") {
    statusApiToFilterValue[option.label] = option.value;
  }
});

interface FilterState {
  status: string[];
  month: number[];
  timeType: string[];
  timeSlot: string[];
}

export const SwimmingLessonList = () => {
  const [filter, setFilter] = useState<FilterState>(() => ({
    status: [],
    month: [],
    timeType: [],
    timeSlot: [],
  }));

  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);

  let statusForApi: string | undefined;
  if (showAvailableOnly) {
    statusForApi = "OPEN";
  } else {
    if (filter.status.length > 0) {
      statusForApi = filter.status.map((s) => s.toUpperCase()).join(",");
    }
  }

  const monthForApi =
    filter.month.length > 0 ? filter.month.join(",") : undefined;

  const {
    data: lessonsData,
    isLoading: lessonsLoading,
    error: lessonsError,
  } = useLessons({
    page: 0,
    size: 50,
    ...(statusForApi && { status: statusForApi }),
    ...(monthForApi && { month: monthForApi }),
  });

  const enrollMutation = useEnrollLesson();
  const handleApply = useCallback(
    (lessonId: number) => {
      enrollMutation.mutate({ lessonId, wantsLocker: false });
    },
    [enrollMutation]
  );

  const lessons = lessonsData?.data?.content;

  const filteredLessons = useMemo(() => {
    if (!lessons || lessons.length === 0) {
      return [];
    }

    const result = lessons.filter((lesson: LessonDTO) => {
      if (showAvailableOnly && lesson.remaining === 0) {
        return false;
      }

      if (filter.status.length > 0) {
        if (!lesson.status) {
          return false;
        }
        const lessonStatusInFilterFormat =
          statusApiToFilterValue[lesson.status];
        if (!lessonStatusInFilterFormat) {
          return false;
        }
        if (!filter.status.includes(lessonStatusInFilterFormat)) {
          return false;
        }
      }

      if (filter.month.length > 0) {
        if (!lesson.startDate) {
          return false;
        }
        const lessonMonth = new Date(lesson.startDate).getMonth() + 1;
        if (!filter.month.includes(lessonMonth)) {
          return false;
        }
      }

      if (filter.timeType.length > 0) {
        if (!lesson.timePrefix) {
          return false;
        }
        const lessonIsMorning = lesson.timePrefix === "오전";
        const lessonIsAfternoon = lesson.timePrefix === "오후";
        const typeMatch = filter.timeType.some(
          (type) =>
            (type === "morning" && lessonIsMorning) ||
            (type === "afternoon" && lessonIsAfternoon)
        );
        if (!typeMatch) {
          return false;
        }
      }

      if (filter.timeSlot.length > 0) {
        if (!lesson.timeSlot) {
          return false;
        }
        const lessonTimeSlotInternal = lesson.timeSlot?.replace("~", "-");
        if (
          !lessonTimeSlotInternal ||
          !filter.timeSlot.includes(lessonTimeSlotInternal)
        ) {
          return false;
        }
      }

      return true;
    });
    return result;
  }, [lessons, filter, showAvailableOnly]);

  const handleSetFilter = useCallback((newFilter: FilterState) => {
    setFilter(newFilter);
  }, []);

  const handleSetSelectedFilters = useCallback(
    (newSelectedFilters: string[]) => {
      setSelectedFilters(newSelectedFilters);
    },
    []
  );

  const handleSetCategoryOpen = useCallback((isOpen: boolean) => {
    setCategoryOpen(isOpen);
  }, []);

  let lessonContent;
  if (lessonsLoading) {
    lessonContent = (
      <Box textAlign="center" py={10} width="100%">
        <Text fontSize="lg">강습 정보를 불러오는 중입니다...</Text>
      </Box>
    );
  } else if (lessonsError) {
    lessonContent = (
      <Box textAlign="center" py={10} color="red.500" width="100%">
        <Text fontSize="lg">강습 정보를 불러오는데 문제가 발생했습니다.</Text>
        <Text mt={2}>다시 시도해주세요.</Text>
      </Box>
    );
  } else {
    lessonContent = (
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={6}
        justifyItems="center"
      >
        {filteredLessons.map((lesson: LessonDTO) => (
          <GridItem key={lesson.id}>
            <LessonCard lesson={lesson} onApply={handleApply} />
          </GridItem>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      <Flex
        justify="space-between"
        align="center"
        width="100%"
        maxW="1600px"
        height="35px"
        mb={6}
      >
        <Flex align="center" gap="15px" width="auto" height="35px">
          <Text
            fontFamily="'Paperlogy', sans-serif"
            fontWeight="500"
            fontSize="21px"
            lineHeight="25px"
            letterSpacing="-0.05em"
            color="#373636"
          >
            신청정보{" "}
            <Text as="span" color="#2E3192" fontWeight="700">
              {lessonsData?.data?.totalElements != null &&
              !filter.status.length &&
              !filter.month.length &&
              !filter.timeType.length &&
              !filter.timeSlot.length
                ? lessonsData.data.totalElements
                : filteredLessons.length}
            </Text>
            건이 있습니다
          </Text>
        </Flex>

        <Flex align="center" gap="15px" width="auto" height="35px">
          <Text
            fontFamily="'Paperlogy', sans-serif"
            fontWeight="700"
            fontSize="27px"
            lineHeight="32px"
            letterSpacing="-0.05em"
            color="#373636"
          >
            신청 가능한 강습 보기
          </Text>
          <Box
            position="relative"
            width="60px"
            height="30px"
            borderRadius="33.3333px"
            bg={showAvailableOnly ? "#2E3192" : "#ccc"}
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            cursor="pointer"
            transition="background-color 0.2s"
          >
            <Box
              position="absolute"
              width="23.33px"
              height="23.33px"
              left={showAvailableOnly ? "33.34px" : "3.31px"}
              top="3.31px"
              bg="white"
              borderRadius="50%"
              transition="left 0.2s"
            />
          </Box>
        </Flex>
      </Flex>

      <LessonFilterControls
        onFilterChange={handleSetFilter}
        selectedFilters={selectedFilters}
        onSelectedFiltersChange={handleSetSelectedFilters}
        categoryOpen={categoryOpen}
        onCategoryToggle={handleSetCategoryOpen}
      />

      {lessonContent}
    </Box>
  );
};
