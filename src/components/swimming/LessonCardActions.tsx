import React, { useState, useEffect } from "react";
import { Button, Text, Box, Flex } from "@chakra-ui/react";
import { MypageEnrollDto } from "@/types/api";
import { LessonDTO } from "@/types/swimming";

// Helper function to calculate time remaining
const calculateTimeRemaining = (targetKSTDateString: string) => {
  if (!targetKSTDateString) {
    // console.warn("[LessonCardActions] calculateTimeRemaining: targetKSTDateString is null or empty.");
    return null;
  }

  let kstCompliantString = targetKSTDateString.replace(" ", "T");

  // Check if the string already has a timezone offset (Z, +HH:MM, or -HH:MM at the end)
  const hasTimezoneRegex = /Z|[+-]\d{2}:\d{2}$/;

  if (!hasTimezoneRegex.test(kstCompliantString)) {
    // If no timezone offset is present, assume KST and append +09:00.
    if (kstCompliantString.includes("T")) {
      // Likely "YYYY-MM-DDTHH:MM:SS" or "YYYY-MM-DDTHH:MM"
      // Ensure seconds are present if only HH:MM
      if (/T\d{2}:\d{2}$/.test(kstCompliantString)) {
        // Ends with T HH:MM
        kstCompliantString += ":00+09:00";
      } else {
        // Assumed to be T HH:MM:SS or other, just add offset
        kstCompliantString += "+09:00";
      }
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(kstCompliantString)) {
      // Date-only string "YYYY-MM-DD", interpret as start of day KST.
      kstCompliantString += "T00:00:00+09:00";
    }
    // If it's some other format without 'T' and not date-only, it might be problematic.
    // For now, this covers common ISO-like date and datetime strings.
  }
  // If it already has a timezone, kstCompliantString is used as is (after T replacement).

  const targetTime = new Date(kstCompliantString).getTime();

  if (isNaN(targetTime)) {
    console.warn(
      `[LessonCardActions] Failed to parse KST date string. Original: '${targetKSTDateString}', Processed: '${kstCompliantString}'`
    );
    return null;
  }

  const now = new Date().getTime(); // Current UTC milliseconds
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
  lesson: LessonDTO & { applicationStartDate?: string }; // Ensure DTO has status and appStartDate
  enrollment?: MypageEnrollDto;
  onRequestCancel?: (enrollId: number) => void;
  onApplyClick?: () => void;
  // Add other callbacks like onGoToPayment, onRenewLesson if they become relevant here
}

const LessonCardActions: React.FC<LessonCardActionsProps> = ({
  lesson,
  enrollment,
  onRequestCancel,
  onApplyClick,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    !enrollment && lesson.applicationStartDate && lesson.status === "접수대기"
      ? calculateTimeRemaining(lesson.applicationStartDate)
      : null
  );
  const [isCountingDown, setIsCountingDown] = useState(
    !!(
      !enrollment &&
      lesson.applicationStartDate &&
      lesson.status === "접수대기" &&
      timeRemaining
    )
  );

  useEffect(() => {
    if (
      enrollment ||
      !lesson.applicationStartDate ||
      lesson.status !== "접수대기"
    ) {
      setIsCountingDown(false);
      return;
    }

    const initialRemaining = calculateTimeRemaining(
      lesson.applicationStartDate
    );
    if (!initialRemaining) {
      setIsCountingDown(false);
      setTimeRemaining(null);
      return;
    }
    setTimeRemaining(initialRemaining);
    setIsCountingDown(true);
    // Log initial remaining time
    console.log(
      `Lesson ID ${lesson.id} (${lesson.title}): Initial remaining time - Days: ${initialRemaining.days}, Hours: ${initialRemaining.hours}, Minutes: ${initialRemaining.minutes}, Seconds: ${initialRemaining.seconds}`
    );

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(lesson.applicationStartDate!);
      setTimeRemaining(remaining);
      if (remaining) {
        // Log remaining time for the specific lesson
        console.log(
          `Lesson ID ${lesson.id} (${lesson.title}): Time Remaining - Days: ${remaining.days}, Hours: ${remaining.hours}, Minutes: ${remaining.minutes}, Seconds: ${remaining.seconds}`
        );
      } else {
        console.log(
          `Lesson ID ${lesson.id} (${lesson.title}): Countdown finished.`
        );
        setIsCountingDown(false);
        clearInterval(interval);
        // Optionally, trigger a re-fetch of lesson data here if status might have changed
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    lesson.applicationStartDate,
    lesson.status,
    enrollment,
    lesson.id,
    lesson.title,
  ]);

  if (enrollment) {
    // Existing logic for when an enrollment is present (My Page context)
    const {
      status: enrollStatus,
      cancelStatus, // Added to check for APPROVED in conjunction with REFUND_PENDING_ADMIN_CANCEL
      // paymentExpireDt, // Not used
      // renewalWindow, // Not used
      // canAttemptPayment, // Assumed false or irrelevant for this branch
      // paymentPageUrl, // Not used
      enrollId,
    } = enrollment;

    // For this temporary branch, we primarily handle "UNPAID" and "CANCELED_UNPAID"

    // State 1: Admin has cancelled the enrollment
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

    // State 2: If the enrollment is cancelled (specifically in the unpaid context by user)
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

    // Default state for this temporary branch: "Unpaid" status and a "Cancel" button
    // All other enrollStatus values will also show this, assuming they are effectively "UNPAID" for this branch's purpose.
    return (
      <Flex align="center" gap={3} w="100%">
        <Flex direction="column" align="center" gap={2} w="50%">
          <Button variant="outline" colorPalette="gray" w="100%" disabled>
            <Text color="gray.500" fontSize="sm">
              {/* More specific status could be shown if available on enrollment */}
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
    // New logic for "listing" context (no enrollment) - countdown or apply button
    let buttonContent: React.ReactNode = "신청불가";
    let buttonDisabled = true;
    let buttonBgColor = "#888888"; // Default disabled color
    let hoverBgColor = "#888888";

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
      buttonContent = countdownText;
      buttonDisabled = true;
      buttonBgColor = "orange.400"; // Color for countdown
      hoverBgColor = "orange.400";
    } else if (lesson.status === "접수중") {
      buttonContent = "신청하기";
      buttonDisabled = false;
      buttonBgColor = "#2D3092";
      hoverBgColor = "#1f2366";
    } else if (lesson.status === "접수마감") {
      buttonContent = "접수마감";
    } else if (lesson.status === "수강중") {
      buttonContent = "수강중"; // Typically can't apply
    } else if (lesson.status === "접수대기" && !isCountingDown) {
      // Countdown finished, or applicationStartDate was in the past, but status not yet "접수중"
      // Or applicationStartDate was not set/invalid for "접수대기" status
      buttonContent = "접수시작전";
    }
    // Other statuses will default to "신청불가"

    return (
      <Button
        w="100%"
        bgColor={buttonBgColor}
        color="white"
        height="41px"
        borderRadius="10px"
        _hover={{
          bgColor: hoverBgColor,
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
