import React, { useState, useMemo } from "react";
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Button,
  IconButton,
  Stack,
  Flex,
} from "@chakra-ui/react";
import {
  startOfMonth,
  endOfMonth,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isValid,
  differenceInDays,
  addDays,
  subDays,
  getDaysInMonth,
  getDay,
  getMonth,
  getYear,
  setMonth,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Schedule } from "../../types";
import { useColors } from "@/styles/theme";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface CalendarProps {
  currentDate: Date;
  schedules: Schedule[];
  onDateChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  onScheduleClick: (schedule: Schedule | null) => void;
  minDate?: Date;
  maxDate?: Date;
  selectedDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  schedules,
  onDateChange,
  onDateSelect,
  onScheduleClick,
  minDate,
  maxDate,
  selectedDate,
}) => {
  const colors = useColors();
  const bgColor = colors.bg;
  const scheduleBgColor = colors.primary.default;
  const [selectedDateState, setSelectedDate] = useState<Date | null>(
    selectedDate || null
  );

  // 날짜 유효성 검사
  const validateDate = (date: Date): boolean => {
    if (!isValid(date)) return false;
    if (minDate && differenceInDays(date, minDate) < 0) return false;
    if (maxDate && differenceInDays(date, maxDate) > 0) return false;
    return true;
  };

  const currentMonth = getMonth(currentDate); // 0-indexed

  // 현재 달의 시작일과 마지막일 계산
  const startDate = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const endDate = useMemo(() => endOfMonth(currentDate), [currentDate]);

  // 달력에 표시할 모든 날짜 계산
  const days = useMemo(() => {
    const firstDayOfMonth = getDay(startDate);
    const daysInMonth = getDaysInMonth(currentDate);

    const prevMonthDaysArray = Array.from({ length: firstDayOfMonth }, (_, i) =>
      subDays(startDate, firstDayOfMonth - i)
    );

    const currentMonthDaysArray = Array.from({ length: daysInMonth }, (_, i) =>
      addDays(startDate, i)
    );

    const totalCells = 35; // 7 days * 5 weeks
    const remainingCells =
      totalCells - (prevMonthDaysArray.length + currentMonthDaysArray.length);

    const nextMonthDaysArray = Array.from(
      { length: Math.max(0, remainingCells) }, // Ensure length is not negative
      (_, i) =>
        addDays(
          currentMonthDaysArray[currentMonthDaysArray.length - 1] || endDate,
          i + 1
        )
    );

    return [
      ...prevMonthDaysArray,
      ...currentMonthDaysArray,
      ...nextMonthDaysArray,
    ].slice(0, totalCells);
  }, [currentDate, startDate, endDate]);

  // 일정 그룹화
  const schedulesMap = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    schedules.forEach((schedule) => {
      const startDate = new Date(schedule.startDateTime);
      const endDate = new Date(schedule.endDateTime);
      const currentDate = new Date(startDate);

      // 시작일부터 종료일까지 모든 날짜에 일정 추가
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        if (!map[dateStr]) {
          map[dateStr] = [];
        }
        map[dateStr].push(schedule);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return map;
  }, [schedules]);

  // 일정 정렬
  const sortSchedulesByTime = (schedules: Schedule[]) => {
    return [...schedules].sort((a, b) => {
      return (
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime()
      );
    });
  };

  const handleMonthChange = (monthIndex: number) => {
    const newDate = setMonth(currentDate, monthIndex);
    if (validateDate(newDate)) {
      onDateChange(newDate);
      setSelectedDate(null);
    }
  };

  const handlePrevYear = () => {
    const newDate = subMonths(currentDate, 12); // Subtract 12 months to go to previous year
    if (validateDate(newDate)) {
      onDateChange(newDate);
      setSelectedDate(null);
    }
  };

  const handleNextYear = () => {
    const newDate = addMonths(currentDate, 12); // Add 12 months to go to next year
    if (validateDate(newDate)) {
      onDateChange(newDate);
      setSelectedDate(null);
    }
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    if (!validateDate(date)) return;
    setSelectedDate(date);
    onDateSelect(date);

    const dateStr = format(date, "yyyy-MM-dd");
    const daySchedules = schedulesMap[dateStr] || [];

    if (daySchedules.length > 0) {
      onScheduleClick(sortSchedulesByTime(daySchedules)[0]);
    } else {
      onScheduleClick(null);
    }
  };

  // 일정 클릭 핸들러
  const handleScheduleClick = (schedule: Schedule, date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
    onScheduleClick(schedule);
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekDayEng = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = Array.from(
    { length: 12 },
    (_, i) => `${String(i + 1).padStart(2, "0")}월`
  );

  return (
    <Box bg={bgColor} p={0} width="100%">
      {/* Year Navigation */}
      <Flex justify="center" align="center" mb={2}>
        <IconButton
          aria-label="이전 년도"
          onClick={handlePrevYear}
          variant="ghost"
          size="lg"
          disabled={
            minDate && getYear(subMonths(currentDate, 12)) < getYear(minDate)
          }
          color="gray.700"
          _hover={{
            bg: "transparent",
            color: "blue.700",
          }}
        >
          <FiChevronLeft />
        </IconButton>
        <Text fontSize="2xl" fontWeight="bold" mx={4} color="gray.700">
          {getYear(currentDate)}년
        </Text>
        <IconButton
          aria-label="다음 년도"
          onClick={handleNextYear}
          variant="ghost"
          size="lg"
          color="gray.700"
          disabled={
            maxDate && getYear(addMonths(currentDate, 12)) > getYear(maxDate)
          }
          _hover={{
            bg: "transparent",
            color: "blue.700",
          }}
        >
          <FiChevronRight />
        </IconButton>
      </Flex>

      {/* Month Navigation */}
      <HStack
        gap={0}
        justify="space-between"
        mb={2}
        p={3}
        bg="#0A2540" // Dark blue background as per image
        borderRadius="md"
      >
        {months.map((month, index) => (
          <Button
            key={month}
            variant="ghost" // Changed to link for cleaner look
            onClick={() => handleMonthChange(index)}
            fontWeight={currentMonth === index ? "bold" : "normal"}
            color={currentMonth === index ? "#FFD700" : "white"} // Yellow for current month, white for others
            fontSize="md"
            flex={1}
            textAlign="center"
            _hover={{
              color: currentMonth === index ? "#FFD700" : "gray.300",
              textDecoration: "none",
              bg: "transparent",
            }}
            _focus={{ boxShadow: "none" }}
          >
            {month}
          </Button>
        ))}
      </HStack>

      <Grid
        templateColumns="repeat(7, 1fr)"
        gap={0}
        borderWidth="1px" // Add border to the grid container
        borderColor="gray.300" // Set border color for the grid
        borderRadius="md" // Optional: adds rounded corners to the grid
        overflow="hidden" // Ensures child borders don't spill out
      >
        {weekDays.map((day, index) => (
          <VStack
            key={day}
            textAlign="center"
            py={2}
            fontWeight="bold"
            bg="gray.50" // Light gray background for day headers
            borderBottomWidth="1px"
            borderColor="gray.300"
            gap={0} // Remove gap between day and dayEng
          >
            <Text
              fontSize="sm"
              color={
                day === "일"
                  ? "red.500"
                  : day === "토"
                  ? "blue.500"
                  : "gray.700" // Darker text for other days
              }
            >
              {day}
            </Text>
            <Text
              fontSize="xs"
              color={
                day === "일"
                  ? "red.500"
                  : day === "토"
                  ? "blue.500"
                  : "gray.500" // Lighter text for ENG day
              }
            >
              {weekDayEng[index]}
            </Text>
          </VStack>
        ))}

        {days.map((date, idx) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const daySchedules = schedulesMap[dateStr] || [];
          const sortedSchedules = sortSchedulesByTime(daySchedules);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isDisabled = !isCurrentMonth || !validateDate(date); // Also disable days not in current month
          const dayOfWeekIndex = getDay(date); // 0 for Sunday, 6 for Saturday
          const isSelected =
            selectedDateState && isSameDay(date, selectedDateState);
          const isTodayDate = isToday(date);

          return (
            <Box
              key={dateStr}
              p={1.5} // Reduced padding
              bg={
                isSelected
                  ? "blue.100"
                  : isTodayDate
                  ? "blue.50" // Subtle background for today's date if not selected
                  : "white"
              } // White background, blue.100 for selected
              minH="120px" // Adjusted height
              maxH="120px" // Adjusted height
              role="gridcell"
              aria-label={format(date, "yyyy년 M월 d일 EEEE", { locale: ko })}
              opacity={isCurrentMonth ? 1 : 0.4} // More faded for non-current month days
              cursor={isDisabled ? "not-allowed" : "pointer"}
              onClick={() => !isDisabled && handleDateClick(date)}
              overflow="hidden"
              _hover={
                !isDisabled && !isSelected
                  ? {
                      bg: "gray.50",
                    }
                  : {}
              }
              transition="background-color 0.2s ease-out"
              position="relative"
              borderRightWidth={idx % 7 === 6 ? "0" : "1px"} // No right border for last cell in a row
              borderBottomWidth={idx >= days.length - 7 ? "0" : "1px"} // No bottom border for last row
              borderColor="gray.300" // Border color for cells
            >
              <Flex direction="column" gap={1} height="100%">
                <Text
                  fontSize="sm"
                  fontWeight="medium" // Slightly less bold
                  color={
                    isDisabled
                      ? "gray.400"
                      : isSelected
                      ? "blue.700"
                      : isTodayDate
                      ? colors.primary.default // Highlight today's date number
                      : dayOfWeekIndex === 0 // Sunday
                      ? "red.500"
                      : dayOfWeekIndex === 6 // Saturday
                      ? "blue.500"
                      : "gray.800" // Default day number color
                  }
                  alignSelf="flex-start" // Align date number to top-left
                  pb={0.5} // Padding below the date number
                >
                  {format(date, "d")}
                </Text>
                <Stack
                  direction="column"
                  gap={0.5} // Reduced gap between schedules
                  flexGrow={1}
                  overflowY="auto"
                  maxH="calc(100% - 20px)" // Adjust based on date number's height
                  // Custom scrollbar styles
                  css={{
                    "&::-webkit-scrollbar": {
                      width: "4px",
                    },
                    "&::-webkit-scrollbar-track": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: colors.primary.default, // Use theme color
                      borderRadius: "24px",
                    },
                  }}
                >
                  {sortedSchedules.slice(0, 2).map((schedule) => {
                    // Show only 2 schedules initially
                    const isStartDate =
                      format(new Date(schedule.startDateTime), "yyyy-MM-dd") ===
                      dateStr;

                    // Determine background color based on image (blue or light gray)
                    // This is a placeholder logic, you might need a specific field in `Schedule` type
                    const scheduleItemBgColor = schedule.title.includes("중요")
                      ? scheduleBgColor
                      : isTodayDate && !isSelected // If it's today and not the main selected item's schedule view
                      ? "gray.50" // Slightly different bg for schedules on today's cell if it's not selected
                      : "gray.100";
                    const scheduleItemTextColor = schedule.title.includes(
                      "중요"
                    )
                      ? "white"
                      : "gray.700";

                    return (
                      <Box
                        key={schedule.scheduleId}
                        py={0.5} // Adjust padding
                        px={1.5} // Adjust padding
                        bg={scheduleItemBgColor}
                        color={scheduleItemTextColor}
                        borderRadius="xs" // Slightly less rounded
                        cursor="pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScheduleClick(schedule, date);
                        }}
                        _hover={{
                          opacity: 0.8,
                        }}
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                      >
                        <Text fontSize="11px" lineHeight="1.2">
                          {/* Adjusted font size and line height */}
                          {isStartDate
                            ? `${format(
                                new Date(schedule.startDateTime),
                                "HH:mm"
                              )}~${format(
                                new Date(schedule.endDateTime),
                                "HH:mm"
                              )}`
                            : ""}{" "}
                          {schedule.title}
                        </Text>
                      </Box>
                    );
                  })}
                  {sortedSchedules.length > 2 && (
                    <Text
                      fontSize="10px" // Smaller font size
                      color="gray.500"
                      textAlign="center"
                      cursor="pointer"
                      mt={0.5} // Margin top
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateClick(date); // Clicking "more" should select the date
                      }}
                      _hover={{ textDecoration: "underline" }}
                    >
                      +{sortedSchedules.length - 2} 더보기
                    </Text>
                  )}
                </Stack>
              </Flex>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};
