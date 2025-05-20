"use client";

import { Box, Flex, Text, Grid, GridItem } from "@chakra-ui/react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useLessons, useEnrollLesson } from "@/lib/hooks/useSwimming"; // Adjusted path if necessary
import { LessonDTO } from "@/types/swimming"; // Adjusted path if necessary
import { LessonFilterControls } from "./LessonFilterControls"; // Assuming it's in the same directory
import { LessonCard } from "./LessonCard"; // Assuming it's in the same directory
import {
  statusOptions,
  monthOptions,
  timeTypeOptions,
  timeSlots,
} from "./filterConstants"; // Import constants

// Updated FilterState to support multi-select (array-based)
interface FilterState {
  status: string[];
  month: number[];
  timeType: string[];
  timeSlot: string[];
}

export const SwimmingLessonList = () => {
  console.log("SwimmingLessonList: Rendering");

  const [filter, setFilter] = useState<FilterState>(() => {
    console.log("SwimmingLessonList: Initializing filter state");
    return {
      status: [],
      month: [],
      timeType: [],
      timeSlot: [],
    };
  });

  useEffect(() => {
    console.log("SwimmingLessonList: filter state changed", filter);
  }, [filter]);

  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);

  console.log("SwimmingLessonList: Props for LessonFilterControls", {
    filter,
    selectedFilters,
    categoryOpen,
  });

  const {
    data: lessonsData,
    isLoading: lessonsLoading,
    error: lessonsError,
  } = useLessons({
    page: 0,
    size: 50,
    ...(filter.status.length > 0 && { status: filter.status.join(",") }),
    ...(filter.month.length > 0 && { month: filter.month.join(",") }),
  });

  useEffect(() => {
    console.log("SwimmingLessonList: lessonsData changed", lessonsData);
  }, [lessonsData]);

  const enrollMutation = useEnrollLesson();
  const handleApply = useCallback(
    (lessonId: number) => {
      console.log("SwimmingLessonList: handleApply called with ID:", lessonId);
      enrollMutation.mutate({ lessonId });
    },
    [enrollMutation]
  );

  const lessons = lessonsData?.data?.content || [
    {
      id: 1,
      title: "수영 강습 프로그램",
      name: "힐링수영반",
      startDate: "25년05월01일",
      endDate: "25년05월30일",
      timeSlot: "06:00~06:50",
      timePrefix: "오전",
      days: "(월,화,수,목,금)",
      capacity: 15,
      remaining: 11,
      price: 105000,
      status: "접수중",
      reservationId: "2025.04.17 13:00:00부터",
      receiptId: "2025.04.20 18:00:00까지",
      instructor: "성인(온라인)",
      location: "아르피나 수영장",
    },
  ];

  console.log("SwimmingLessonList: Raw lessons before filtering", lessons);

  const filteredLessons = useMemo(() => {
    console.log(
      "SwimmingLessonList: Recalculating filteredLessons. Dependencies:",
      {
        lessonsL: lessons,
        filterL: filter,
        showAvailableOnlyL: showAvailableOnly,
      }
    );
    const result = lessons.filter((lesson: LessonDTO) => {
      if (showAvailableOnly && lesson.remaining === 0) {
        return false;
      }
      if (filter.status.length > 0) {
        if (
          !lesson.status ||
          !filter.status.includes(lesson.status.toLowerCase())
        ) {
          return false;
        }
      }
      if (filter.month.length > 0) {
        if (!lesson.startDate) return false;
        const lessonMonth = new Date(lesson.startDate).getMonth() + 1;
        if (!filter.month.includes(lessonMonth)) {
          return false;
        }
      }
      if (filter.timeType.length > 0) {
        const lessonIsMorning = lesson.timePrefix === "오전";
        const lessonIsAfternoon = lesson.timePrefix === "오후";
        const typeMatch = filter.timeType.some(
          (type) =>
            (type === "morning" && lessonIsMorning) ||
            (type === "afternoon" && lessonIsAfternoon)
        );
        if (!typeMatch) return false;
      }
      if (filter.timeSlot.length > 0) {
        const lessonTimeSlot = lesson.timeSlot?.replace("~", "-");
        if (!lessonTimeSlot || !filter.timeSlot.includes(lessonTimeSlot)) {
          return false;
        }
      }
      return true;
    });
    console.log(
      "SwimmingLessonList: Recalculated filteredLessons result",
      result
    );
    return result;
  }, [lessons, filter, showAvailableOnly]);

  console.log(
    "SwimmingLessonList: Final filteredLessons to render",
    filteredLessons
  );

  const handleSetFilter = useCallback((newFilter: FilterState) => {
    console.log(
      "SwimmingLessonList: setFilter (onFilterChange in child) called with newFilter:",
      newFilter
    );
    setFilter(newFilter);
  }, []);

  const handleSetSelectedFilters = useCallback(
    (newSelectedFilters: string[]) => {
      console.log(
        "SwimmingLessonList: setSelectedFilters (onSelectedFiltersChange in child) called with:",
        newSelectedFilters
      );
      setSelectedFilters(newSelectedFilters);
    },
    []
  );

  const handleSetCategoryOpen = useCallback((isOpen: boolean) => {
    console.log(
      "SwimmingLessonList: setCategoryOpen (onCategoryToggle in child) called with:",
      isOpen
    );
    setCategoryOpen(isOpen);
  }, []);

  if (lessonsLoading) {
    console.log("SwimmingLessonList: Showing loading state");
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg">강습 정보를 불러오는 중입니다...</Text>
      </Box>
    );
  }

  if (lessonsError) {
    console.log("SwimmingLessonList: Showing error state", lessonsError);
    return (
      <Box textAlign="center" py={10} color="red.500">
        <Text fontSize="lg">강습 정보를 불러오는데 문제가 발생했습니다.</Text>
        <Text mt={2}>다시 시도해주세요.</Text>
      </Box>
    );
  }

  console.log("SwimmingLessonList: Rendering main content");
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
              {lessonsData?.data?.totalElements || filteredLessons.length}
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
            onClick={() => {
              console.log(
                "SwimmingLessonList: Toggling showAvailableOnly. Prev:",
                showAvailableOnly
              );
              setShowAvailableOnly(!showAvailableOnly);
            }}
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
    </Box>
  );
};
