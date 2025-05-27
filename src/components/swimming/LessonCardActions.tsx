import React, { useState, useEffect } from "react";
import { Button, Text, Box, Flex } from "@chakra-ui/react";
import { MypageEnrollDto } from "@/types/api";
import { LessonDTO } from "@/types/swimming";

// Helper function to parse KST date strings like "YYYY.MM.DD HH:MM부터" or "YYYY.MM.DD HH:MM까지"
// and return a Date object.
const parseKSTDateString = (
  kstDateStringWithSuffix: string | undefined
): Date | null => {
  if (!kstDateStringWithSuffix) {
    return null;
  }

  let parsableDateStr = kstDateStringWithSuffix
    .replace(/부터|까지/g, "")
    .trim();
  parsableDateStr = parsableDateStr.replace(/\./g, "-"); // e.g., "YYYY-MM-DD HH:MM" or "YYYY-MM-DD"

  // Ensure it's in a format that new Date() can parse reliably with timezone
  // YYYY-MM-DD HH:MM:SS or YYYY-MM-DDTHH:MM:SS
  if (parsableDateStr.includes(" ")) {
    parsableDateStr = parsableDateStr.replace(" ", "T");
  }

  // Add seconds if missing and time is present (e.g., "YYYY-MM-DDTHH:MM")
  if (parsableDateStr.length === 16 && parsableDateStr.includes("T")) {
    parsableDateStr += ":00"; // "YYYY-MM-DDTHH:MM:SS"
  } else if (
    parsableDateStr.length === 10 &&
    parsableDateStr.match(/^\d{4}-\d{2}-\d{2}$/)
  ) {
    // Date-only "YYYY-MM-DD"
    parsableDateStr += "T00:00:00"; // Assume start of the day
  } else if (
    !(parsableDateStr.length === 19 && parsableDateStr.includes("T"))
  ) {
    // If not a full YYYY-MM-DDTHH:MM:SS or recognized date-only, log and return null
    console.warn(
      `[LessonCardActions] Unrecognized date format before timezone adjustment: Original: '${kstDateStringWithSuffix}', Processed: '${parsableDateStr}'`
    );
    return null;
  }

  // Append KST offset if not already specified by Z or +/-HH:MM
  const hasTimezoneRegex = /Z|[+-]\d{2}(:\d{2})?$/;
  if (!hasTimezoneRegex.test(parsableDateStr)) {
    parsableDateStr += "+09:00"; // Explicitly KST
  }

  const dateObj = new Date(parsableDateStr);

  if (isNaN(dateObj.getTime())) {
    console.warn(
      `[LessonCardActions] Failed to parse KST date string. Original: '${kstDateStringWithSuffix}', Processed for Date constructor: '${parsableDateStr}'`
    );
    return null;
  }
  return dateObj;
};

// Helper function to calculate time difference from a target Date object
const calculateTimeDifference = (targetDateObj: Date | null) => {
  if (!targetDateObj) return null;

  const now = new Date().getTime(); // Current time in UTC milliseconds
  const targetTime = targetDateObj.getTime(); // Target time in UTC milliseconds
  const difference = targetTime - now;

  if (difference <= 0) {
    return null;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

interface LessonCardActionsProps {
  lesson: LessonDTO;
  enrollment?: MypageEnrollDto;
  onRequestCancel?: (enrollId: number) => void;
  onApplyClick?: () => void;
}

const LessonCardActions: React.FC<LessonCardActionsProps> = ({
  lesson,
  enrollment,
  onRequestCancel,
  onApplyClick,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(() => {
    if (!enrollment && lesson.reservationId && lesson.status === "접수대기") {
      const targetDate = parseKSTDateString(lesson.reservationId);
      return calculateTimeDifference(targetDate);
    }
    return null;
  });

  const [isCountingDown, setIsCountingDown] = useState(
    !!(
      !enrollment &&
      lesson.reservationId &&
      lesson.status === "접수대기" &&
      timeRemaining
    )
  );

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;

    if (enrollment || !lesson.reservationId || lesson.status !== "접수대기") {
      setIsCountingDown(false);
      setTimeRemaining(null);
      if (intervalId) clearInterval(intervalId); // Clear interval if conditions no longer met
      return;
    }

    const targetApplicationStartDate = parseKSTDateString(lesson.reservationId);

    if (!targetApplicationStartDate) {
      setIsCountingDown(false);
      setTimeRemaining(null);
      return;
    }

    // Initial check and set state if countdown should start
    const initialRemaining = calculateTimeDifference(
      targetApplicationStartDate
    );
    if (initialRemaining) {
      setTimeRemaining(initialRemaining);
      if (!isCountingDown) setIsCountingDown(true); // Start countdown if not already
    } else {
      setTimeRemaining(null);
      if (isCountingDown) setIsCountingDown(false); // Stop countdown if time is up
      return; // No interval needed if time is already up
    }

    intervalId = setInterval(() => {
      const remaining = calculateTimeDifference(targetApplicationStartDate);
      setTimeRemaining(remaining); // This will trigger re-render

      if (remaining) {
        console.log(
          `Lesson ID ${lesson.id} (${lesson.title}): Remaining - ${remaining.days}d ${remaining.hours}h ${remaining.minutes}m ${remaining.seconds}s`
        );
      } else {
        console.log(
          `Lesson ID ${lesson.id} (${lesson.title}): Countdown finished.`
        );
        setIsCountingDown(false); // Ensure countdown state is false
        clearInterval(intervalId); // Stop the interval
      }
    }, 1000);

    return () => {
      if (intervalId) clearInterval(intervalId); // Cleanup on unmount or when dependencies change
    };
  }, [
    lesson.id,
    lesson.title,
    lesson.reservationId,
    lesson.status,
    enrollment,
    isCountingDown,
  ]); // Removed isCountingDown

  if (enrollment) {
    const { status: enrollStatus, cancelStatus, enrollId } = enrollment;

    if (
      enrollStatus === "REFUND_PENDING_ADMIN_CANCEL" &&
      cancelStatus === "APPROVED"
    ) {
      return (
        <Flex direction="column" align="center" gap={2} w="100%">
          <Button variant="outline" colorPalette="gray" w="100%" disabled>
            <Text color="gray.500" fontSize="sm">
              관리자 확인 취소
            </Text>
          </Button>
        </Flex>
      );
    }

    if (enrollStatus === "CANCELED_UNPAID") {
      return (
        <Flex direction="column" align="center" gap={2} w="100%">
          <Button variant="outline" colorPalette="gray" w="100%" disabled>
            <Text color="gray.500" fontSize="sm">
              취소 완료 (미결제)
            </Text>
          </Button>
        </Flex>
      );
    }
    return (
      <Flex align="center" gap={3} w="100%">
        <Flex direction="column" align="center" gap={2} w="50%">
          <Button variant="outline" colorPalette="gray" w="100%" disabled>
            <Text color="gray.500" fontSize="sm">
              미결제 상태
            </Text>
          </Button>
        </Flex>
        {onRequestCancel && (
          <Button
            colorPalette="red"
            w="50%"
            onClick={() => onRequestCancel(enrollId)}
          >
            취소 신청
          </Button>
        )}
      </Flex>
    );
  } else {
    // Listing context (no enrollment)
    let buttonContent: React.ReactNode = "신청불가";
    let buttonDisabled = true;
    let buttonBgColor = "#888888";
    let hoverBgColor = "#888888";

    const now = new Date();
    const applicationStartTime = parseKSTDateString(lesson.reservationId);
    const applicationEndTime = parseKSTDateString(lesson.receiptId);

    if (lesson.status === "접수대기") {
      if (applicationStartTime && now < applicationStartTime) {
        if (isCountingDown && timeRemaining) {
          let countdownText = "";
          if (timeRemaining.days > 0) {
            countdownText += `${timeRemaining.days}일 `;
          }
          countdownText += `${String(timeRemaining.hours).padStart(
            2,
            "0"
          )}:${String(timeRemaining.minutes).padStart(2, "0")}:${String(
            timeRemaining.seconds
          ).padStart(2, "0")}`;
          buttonContent = `접수 시작 ${countdownText}`;
          buttonDisabled = true;
          buttonBgColor = "orange.400";
          hoverBgColor = "orange.400";
        } else {
          // This case handles if the countdown isn't active but it is indeed before start time.
          // It could be initial render or if the timer logic had an issue or just finished.
          buttonContent = "접수시작전";
          buttonDisabled = true;
          // Optionally set a specific color for "접수시작전" if different from default disabled
          buttonBgColor = "#A0AEC0"; // A more neutral disabled color
          hoverBgColor = "#A0AEC0";
        }
      } else {
        // "접수대기" but applicationStartTime is past or invalid, or countdown finished (timeRemaining is null)
        // This implies the status might be stale and should ideally transition to "접수중" soon.
        buttonContent = "확인중...";
        buttonDisabled = true;
        buttonBgColor = "#A0AEC0";
        hoverBgColor = "#A0AEC0";
      }
    } else if (lesson.status === "접수중") {
      buttonDisabled = false; // Assume enabled unless a condition below disables it
      buttonContent = "신청하기";
      buttonBgColor = "#2D3092";
      hoverBgColor = "#1f2366";

      if (applicationStartTime && now < applicationStartTime) {
        buttonContent = "접수시작전";
        buttonDisabled = true;
        buttonBgColor = "orange.400"; // Or your preferred color for this state
        hoverBgColor = "orange.400";
        // console.log(`Lesson ID ${lesson.id} (${lesson.title}): Status '접수중' but current time is before application start. Button disabled.`);
      } else if (applicationEndTime && now > applicationEndTime) {
        buttonContent = "접수시간종료";
        buttonDisabled = true;
        buttonBgColor = "#888888";
        hoverBgColor = "#888888";
        // console.log(`Lesson ID ${lesson.id} (${lesson.title}): Status '접수중' but current time is after application end. Button disabled.`);
      }
    } else if (lesson.status === "접수마감") {
      buttonContent = "접수마감";
      buttonDisabled = true;
    } else if (lesson.status === "수강중") {
      buttonContent = "수강중";
      buttonDisabled = true;
    }

    // console.log(`Lesson ID ${lesson.id} (${lesson.title}): Status: ${lesson.status}, isCountingDown: ${isCountingDown}, Disabled: ${buttonDisabled}, Content: ${buttonContent}, Start: ${lesson.reservationId}, End: ${lesson.receiptId}`);

    return (
      <Button
        w="100%"
        bgColor={buttonBgColor}
        color="white"
        height="41px"
        borderRadius="10px"
        _hover={{
          bgColor: buttonDisabled ? buttonBgColor : hoverBgColor,
        }}
        disabled={buttonDisabled}
        onClick={!buttonDisabled && onApplyClick ? onApplyClick : undefined}
      >
        {buttonContent}
      </Button>
    );
  }
};

export default LessonCardActions;
