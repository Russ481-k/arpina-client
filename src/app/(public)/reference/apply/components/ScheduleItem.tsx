"use client";

import { Box, Text } from "@chakra-ui/react";
import { Schedule } from "@/app/cms/schedule/types";

interface ScheduleItemProps {
  schedule: Schedule;
}

// Component to display a schedule item
export function ScheduleItem({ schedule }: ScheduleItemProps) {
  // Helper to format date as YYYY.MM.DD(요일)
  const formatDatePart = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[date.getDay()];
    return `${year}.${month}.${day}(${weekday})`;
  };

  // Helper to format time as HH:MM
  const formatTimePart = (date: Date): string => {
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${hour}:${minute}`;
  };

  // Format the full start and end date/time strings
  const formatDetailedDateTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return `${formatDatePart(date)} ${formatTimePart(date)}`;
  };

  const startDateObj = new Date(schedule.startDateTime);
  const endDateObj = new Date(schedule.endDateTime);

  // Determine the text for the blue time slot header
  const getTimeSlotHeaderText = (): string => {
    const startCalDate = startDateObj.toISOString().split("T")[0];
    const endCalDate = endDateObj.toISOString().split("T")[0];

    const startTime = formatTimePart(startDateObj);

    if (startCalDate === endCalDate) {
      // Event starts and ends on the same calendar day
      const endTime = formatTimePart(endDateObj);
      return `${startTime} ~ ${endTime}`;
    } else {
      // Event spans multiple calendar days
      return startTime; // Show only start time in header
    }
  };

  const timeSlotHeaderText = getTimeSlotHeaderText();
  const formattedStartDateTime = formatDetailedDateTime(schedule.startDateTime);
  const formattedEndDateTime = formatDetailedDateTime(schedule.endDateTime);

  return (
    <Box borderBottom="1px solid" borderColor="gray.200">
      {/* Time slot with light blue background */}
      <Box bg="#E3F2FD" p={2} px={4}>
        <Text fontWeight="medium">{timeSlotHeaderText}</Text>
      </Box>

      {/* Schedule content */}
      <Box p={4}>
        <Text fontWeight="bold" mb={1}>
          {schedule.title}
        </Text>
        {schedule.content && (
          <Text color="gray.600" fontSize="sm" whiteSpace="pre-line" mb={2}>
            {schedule.content}
          </Text>
        )}
        <Text fontSize="sm" color="gray.700">
          시작: {formattedStartDateTime}
        </Text>
        <Text fontSize="sm" color="gray.700">
          종료: {formattedEndDateTime}
        </Text>
      </Box>
    </Box>
  );
}
