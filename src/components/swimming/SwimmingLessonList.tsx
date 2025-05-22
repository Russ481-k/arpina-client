"use client";

import { Box, Flex, Text, Grid, GridItem } from "@chakra-ui/react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useLessons } from "@/lib/hooks/useSwimming";
import { LessonDTO } from "@/types/swimming";
import { LessonFilterControls } from "./LessonFilterControls";
import { LessonCard } from "./LessonCard";
import {
  statusOptions,
  monthOptions,
  timeTypeOptions,
  timeSlots,
} from "./filterConstants";

// Create a mapping from Korean status labels to English uppercase values
const statusApiToFilterValue: { [key: string]: string } = {};
statusOptions.forEach((option) => {
  if (option.value !== "all") {
    // "all" is not an API status
    statusApiToFilterValue[option.label] = option.value;
  }
});

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

  // Determine API query parameters based on filter state and showAvailableOnly toggle
  let statusForApi: string | undefined;
  if (showAvailableOnly) {
    // When "show available only" is checked, fetch lessons that are in 'OPEN' or 'WAITING' state from API.
    // These are assumed to be the API's uppercase equivalents.
    statusForApi = "OPEN";
  } else {
    // If not showing only available, use the user's selected statuses, if any.
    if (filter.status.length > 0) {
      statusForApi = filter.status.map((s) => s.toUpperCase()).join(",");
    }
    // If filter.status is empty, statusForApi remains undefined, and no status query param is sent.
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
    // Use the determined statusForApi and monthForApi for the query
    ...(statusForApi && { status: statusForApi }),
    ...(monthForApi && { month: monthForApi }),
  });

  useEffect(() => {
    console.log("SwimmingLessonList: lessonsData changed", lessonsData);
  }, [lessonsData]);

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
    if (!lessons || lessons.length === 0) {
      console.log(
        "SLL.filteredLessons: No lessons to filter or lessons array is empty."
      );
      return [];
    }

    const result = lessons.filter((lesson: LessonDTO) => {
      console.log(
        `SLL.filteredLessons: Evaluating Lesson ID ${lesson.id} ('${lesson.title}'). API Status: '${lesson.status}', Remaining: ${lesson.remaining}`
      );

      // Condition 1: Available and Remaining
      if (showAvailableOnly && lesson.remaining === 0) {
        console.log(
          `SLL.filteredLessons: Lesson ID ${lesson.id} filtered out by: showAvailableOnly && remaining === 0.`
        );
        return false;
      }

      // Condition 2: Status Match
      if (filter.status.length > 0) {
        if (!lesson.status) {
          console.log(
            `SLL.filteredLessons: Lesson ID ${lesson.id} filtered out by: !lesson.status (status is null or undefined).`
          );
          return false;
        }
        // Convert API's Korean status to the English value used in filters
        const lessonStatusInFilterFormat =
          statusApiToFilterValue[lesson.status];
        if (!lessonStatusInFilterFormat) {
          console.log(
            `SLL.filteredLessons: Lesson ID ${lesson.id} ('${
              lesson.title
            }') has status '${
              lesson.status
            }' which couldn't be mapped to a filter value. Known API statuses: ${Object.keys(
              statusApiToFilterValue
            ).join(", ")}`
          );
          // Decide if this should filter out or not. For now, assume if it's unmappable, it doesn't match.
          return false;
        }
        if (!filter.status.includes(lessonStatusInFilterFormat)) {
          console.log(
            `SLL.filteredLessons: Lesson ID ${
              lesson.id
            } filtered out by: status mismatch. Lesson API status (mapped): '${lessonStatusInFilterFormat}', Filter statuses: [${filter.status.join(
              ", "
            )}]`
          );
          return false;
        }
      }

      // Condition 3: Month Match
      if (filter.month.length > 0) {
        if (!lesson.startDate) {
          console.log(
            `SLL.filteredLessons: Lesson ID ${lesson.id} filtered out by: !lesson.startDate (startDate is null or undefined for month filter).`
          );
          return false;
        }
        const lessonMonth = new Date(lesson.startDate).getMonth() + 1;
        if (!filter.month.includes(lessonMonth)) {
          console.log(
            `SLL.filteredLessons: Lesson ID ${
              lesson.id
            } filtered out by: month mismatch. Lesson month: ${lessonMonth}, Filter months: [${filter.month.join(
              ", "
            )}]`
          );
          return false;
        }
      }

      // Condition 4: Time Type Match
      if (filter.timeType.length > 0) {
        if (!lesson.timePrefix) {
          console.log(
            `SLL.filteredLessons: Lesson ID ${lesson.id} filtered out by: !lesson.timePrefix (timePrefix is null or undefined for timeType filter).`
          );
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
          console.log(
            `SLL.filteredLessons: Lesson ID ${
              lesson.id
            } filtered out by: timeType mismatch. Lesson timePrefix: '${
              lesson.timePrefix
            }', Filter timeTypes: [${filter.timeType.join(", ")}]`
          );
          return false;
        }
      }

      // Condition 5: Time Slot Match
      if (filter.timeSlot.length > 0) {
        if (!lesson.timeSlot) {
          console.log(
            `SLL.filteredLessons: Lesson ID ${lesson.id} filtered out by: !lesson.timeSlot (timeSlot is null or undefined for timeSlot filter).`
          );
          return false;
        }
        const lessonTimeSlotInternal = lesson.timeSlot?.replace("~", "-");
        if (
          !lessonTimeSlotInternal ||
          !filter.timeSlot.includes(lessonTimeSlotInternal)
        ) {
          console.log(
            `SLL.filteredLessons: Lesson ID ${
              lesson.id
            } filtered out by: timeSlot mismatch. Lesson timeSlot: '${
              lesson.timeSlot
            }', Filter timeSlots: [${filter.timeSlot.join(", ")}]`
          );
          return false;
        }
      }

      console.log(
        `SLL.filteredLessons: Lesson ID ${lesson.id} ('${lesson.title}') PASSED all client-side filters.`
      );
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

  // Conditional rendering for the lesson grid area only
  let lessonContent;
  if (lessonsLoading) {
    console.log("SwimmingLessonList: Grid - Showing loading state");
    lessonContent = (
      <Box textAlign="center" py={10} width="100%">
        <Text fontSize="lg">강습 정보를 불러오는 중입니다...</Text>
      </Box>
    );
  } else if (lessonsError) {
    console.log("SwimmingLessonList: Grid - Showing error state", lessonsError);
    lessonContent = (
      <Box textAlign="center" py={10} color="red.500" width="100%">
        <Text fontSize="lg">강습 정보를 불러오는데 문제가 발생했습니다.</Text>
        <Text mt={2}>다시 시도해주세요.</Text>
      </Box>
    );
  } else {
    console.log("SwimmingLessonList: Grid - Rendering lessons");
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
            <LessonCard lesson={lesson} />
          </GridItem>
        ))}
      </Grid>
    );
  }

  console.log(
    "SwimmingLessonList: Rendering main structure with controls and lesson content area"
  );
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
              {/* Show total elements from API if available and not filtering client-side heavily, 
                  otherwise, fall back to filteredLessons.length. 
                  Consider if lessonsData.data.totalElements is still relevant if client-side filters are very active.
              */}
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

      {/* Render the conditionally prepared lesson content (Grid, Loading, or Error) */}
      {lessonContent}
    </Box>
  );
};
