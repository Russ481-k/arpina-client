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
  console.log(
    "[LessonCardActions] Component Rendering. Lesson ID:",
    lesson?.id
  );
  console.log(
    "[LessonCardActions] Props received: lesson:",
    lesson,
    "enrollment:",
    enrollment
  );

  const getInitialTimeRemaining = () => {
    if (!enrollment && lesson.reservationId) {
      const targetDate = parseKSTDateString(lesson.reservationId);
      // calculateTimeDifference will return null if targetDate is in the past or invalid
      return calculateTimeDifference(targetDate);
    }
    return null;
  };

  const [timeRemaining, setTimeRemaining] = useState(getInitialTimeRemaining);
  // isCountingDown is true if there was an initial time remaining (i.e., reservationId is in the future)
  const [isCountingDown, setIsCountingDown] = useState(!!timeRemaining);

  useEffect(() => {
    console.log(
      `[Lesson ID: ${lesson.id}] useEffect triggered. Checking conditions for countdown.`
    );
    console.log(
      `[Lesson ID: ${lesson.id}] useEffect - Values: enrollment:`,
      enrollment,
      `lesson.reservationId: ${lesson.reservationId}`
    );

    let intervalId: NodeJS.Timeout | undefined = undefined;

    if (enrollment || !lesson.reservationId) {
      console.log(
        `[Lesson ID: ${lesson.id}] useEffect - Bypassing countdown: Enrollment present or no reservationId.`
      );
      setIsCountingDown(false);
      setTimeRemaining(null);
      if (intervalId) clearInterval(intervalId); // Though intervalId would not be set here yet
      return;
    }

    const targetApplicationStartDate = parseKSTDateString(lesson.reservationId);
    console.log(
      `[Lesson ID: ${lesson.id}] useEffect - Parsed targetApplicationStartDate:`,
      targetApplicationStartDate
    );

    if (!targetApplicationStartDate) {
      console.log(
        `[Lesson ID: ${lesson.id}] useEffect - Bypassing countdown: Invalid targetApplicationStartDate.`
      );
      setIsCountingDown(false);
      setTimeRemaining(null);
      return;
    }

    // Check if the target start date is actually in the future
    const initialRemainingOnEffect = calculateTimeDifference(
      targetApplicationStartDate
    );
    console.log(
      `[Lesson ID: ${lesson.id}] useEffect - Initial timeRemaining check in effect:`,
      initialRemainingOnEffect
    );

    if (initialRemainingOnEffect) {
      // Only set if not already set by useState, or if it needs update (though deps should handle this)
      // This ensures that if the component re-renders and time has passed, state is up-to-date.
      setTimeRemaining(initialRemainingOnEffect);
      if (!isCountingDown) {
        setIsCountingDown(true); // Ensure counting state is true if we are starting interval
        console.log(
          `[Lesson ID: ${lesson.id}] useEffect - Countdown STARTING or RE-AFFIRMED. isCountingDown set to true.`
        );
      }

      intervalId = setInterval(() => {
        const remainingInInterval = calculateTimeDifference(
          targetApplicationStartDate
        );
        const nowForInterval = new Date().getTime();
        const targetTimeForInterval = targetApplicationStartDate.getTime();
        const differenceInInterval = targetTimeForInterval - nowForInterval;

        console.log(
          `[Lesson ID: ${lesson.id}] Tick: Now: ${nowForInterval}, Target: ${targetTimeForInterval}, Diff: ${differenceInInterval}, Remaining: `,
          remainingInInterval
          // Removed isCountingDown from here as it might be stale within closure, rely on remainingInInterval
        );
        setTimeRemaining(remainingInInterval);

        if (!remainingInInterval) {
          console.log(
            `[Lesson ID: ${lesson.id}] Tick - Countdown FINISHED in interval.`
          );
          setIsCountingDown(false); // Stop counting
          clearInterval(intervalId);
        }
      }, 1000);
    } else {
      // Target date is in the past or now, ensure countdown is stopped.
      console.log(
        `[Lesson ID: ${lesson.id}] useEffect - Bypassing countdown: targetApplicationStartDate is not in the future.`
      );
      if (isCountingDown) {
        setIsCountingDown(false); // Stop counting if it was somehow true
        console.log(
          `[Lesson ID: ${lesson.id}] useEffect - Explicitly STOPPING countdown as start date is past. isCountingDown set to false.`
        );
      }
      setTimeRemaining(null); // Clear any remaining time
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      console.log(
        `[Lesson ID: ${lesson.id}] useEffect - Countdown effect cleanup.`
      );
    };
    // Dependencies: lesson.id and lesson.reservationId for re-calculating if these change.
    // enrollment to stop countdown if user enrolls/unenrolls (though this component might unmount then).
    // isCountingDown is NOT included to prevent re-triggering based on its own change.
  }, [lesson.id, lesson.reservationId, enrollment]);

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

    if (isCountingDown && timeRemaining) {
      // Countdown is active and has time left
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
      // Countdown is not active (either finished, never started, or reservationId is invalid/past)
      if (applicationStartTime && now < applicationStartTime) {
        // This case should ideally be covered by countdown.
        // If somehow isCountingDown is false but time is still future, show "접수시작전".
        // This might happen on initial render if useEffect hasn't set isCountingDown to true yet.
        buttonContent = "접수시작전";
        buttonDisabled = true;
        buttonBgColor = "#A0AEC0";
        hoverBgColor = "#A0AEC0";
      } else if (
        applicationStartTime &&
        applicationEndTime &&
        now >= applicationStartTime &&
        now <= applicationEndTime
      ) {
        // Active application period
        if (lesson.remaining != null && lesson.remaining > 0) {
          buttonContent = "신청하기";
          buttonDisabled = false;
          buttonBgColor = "#2D3092";
          hoverBgColor = "#1f2366";
        } else {
          buttonContent = "정원마감"; // Or "신청마감" if remaining is 0
          buttonDisabled = true;
          buttonBgColor = "#CC0000"; // A more distinct color for full
          hoverBgColor = "#CC0000";
        }
      } else if (applicationEndTime && now > applicationEndTime) {
        // Application period ended
        buttonContent = "접수시간종료";
        buttonDisabled = true;
        buttonBgColor = "#888888";
        hoverBgColor = "#888888";
      } else if (lesson.status === "접수마감") {
        // Fallback to lesson.status if time conditions don't set a clear state
        buttonContent = "접수마감";
        buttonDisabled = true;
      } else if (lesson.status === "수강중") {
        buttonContent = "수강중";
        buttonDisabled = true;
      } else {
        // Default or if reservationId/receiptId are invalid for some reason
        // but status is '접수대기' or '접수중'
        if (
          (lesson.status === "접수대기" || lesson.status === "접수중") &&
          (!applicationStartTime || !applicationEndTime)
        ) {
          buttonContent = "정보확인필요";
        } else {
          buttonContent = "신청불가";
        }
        buttonDisabled = true;
      }
    }

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
