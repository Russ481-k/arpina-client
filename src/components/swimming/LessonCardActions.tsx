import React, { useState, useEffect } from "react";
import { Button, Text, Box, Flex } from "@chakra-ui/react";
import { MypageEnrollDto } from "@/types/api";
import { LessonDTO } from "@/types/swimming";
import { UiDisplayStatus } from "@/types/statusTypes";
import dayjs from "dayjs";

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

  const date = dayjs(parsableDateStr);
  if (!date.isValid()) {
    return null;
  }
  return date.toDate();
};

// Helper function to calculate time difference from a target Date object
const calculateTimeDifference = (targetDateObj: Date | null) => {
  if (!targetDateObj) return null;

  const now = dayjs();
  const targetTime = dayjs(targetDateObj);
  const difference = targetTime.diff(now);

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
  onGoToPayment?: (enrollId: number) => void;
}

const LessonCardActions: React.FC<LessonCardActionsProps> = ({
  lesson,
  enrollment,
  onRequestCancel,
  onApplyClick,
  onGoToPayment,
}) => {
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
    let intervalId: NodeJS.Timeout | undefined = undefined;

    if (enrollment || !lesson.reservationId) {
      setIsCountingDown(false);
      setTimeRemaining(null);
      if (intervalId) clearInterval(intervalId); // Though intervalId would not be set here yet
      return;
    }

    const targetApplicationStartDate = parseKSTDateString(lesson.reservationId);

    if (!targetApplicationStartDate) {
      setIsCountingDown(false);
      setTimeRemaining(null);
      return;
    }

    // Check if the target start date is actually in the future
    const initialRemainingOnEffect = calculateTimeDifference(
      targetApplicationStartDate
    );

    if (initialRemainingOnEffect) {
      // Only set if not already set by useState, or if it needs update (though deps should handle this)
      // This ensures that if the component re-renders and time has passed, state is up-to-date.
      setTimeRemaining(initialRemainingOnEffect);
      if (!isCountingDown) {
        setIsCountingDown(true); // Ensure counting state is true if we are starting interval
      }

      intervalId = setInterval(() => {
        const remainingInInterval = calculateTimeDifference(
          targetApplicationStartDate
        );

        setTimeRemaining(remainingInInterval);

        if (!remainingInInterval) {
          setIsCountingDown(false); // Stop counting
          clearInterval(intervalId);
        }
      }, 1000);
    } else {
      // Target date is in the past or now, ensure countdown is stopped.
      if (isCountingDown) {
        setIsCountingDown(false); // Stop counting if it was somehow true
      }
      setTimeRemaining(null); // Clear any remaining time
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    // Dependencies: lesson.id and lesson.reservationId for re-calculating if these change.
    // enrollment to stop countdown if user enrolls/unenrolls (though this component might unmount then).
    // isCountingDown is NOT included to prevent re-triggering based on its own change.
  }, [lesson.id, lesson.reservationId, enrollment, isCountingDown]);

  if (enrollment) {
    const enrollStatus = enrollment.status as UiDisplayStatus;
    const { enrollId } = enrollment;

    // '취소' 관련 상태들을 우선적으로 처리합니다.
    if (enrollStatus === "CANCELED") {
      return (
        <Flex direction="column" align="center" gap={2} w="100%">
          <Button variant="outline" colorPalette="gray" w="100%" disabled>
            <Text color="gray.500" fontSize="sm">
              취소 완료
            </Text>
          </Button>
        </Flex>
      );
    }

    if (enrollStatus === "ADMIN_CANCELED") {
      return (
        <Flex direction="column" align="center" gap={2} w="100%">
          <Button variant="outline" colorPalette="red" w="100%" disabled>
            <Text color="red.500" fontSize="sm">
              관리자 취소
            </Text>
          </Button>
        </Flex>
      );
    }

    if (enrollStatus === "REFUND_REQUESTED") {
      return (
        <Flex direction="column" align="center" gap={2} w="100%">
          <Button variant="outline" colorPalette="blue" w="100%" disabled>
            <Text color="blue.500" fontSize="sm">
              환불 요청됨
            </Text>
          </Button>
        </Flex>
      );
    }

    if (enrollStatus === "PAYMENT_PENDING" || enrollStatus === "UNPAID") {
      return (
        <Flex align="center" gap={3} w="100%">
          <Flex direction="column" align="center" gap={2} w="50%">
            <Button
              colorPalette="teal"
              w="100%"
              onClick={() => {
                if (onGoToPayment && enrollment?.enrollId) {
                  onGoToPayment(enrollment.enrollId);
                } else {
                  console.warn(
                    "결제 핸들러가 설정되지 않았거나 enrollId가 없습니다."
                  );
                }
              }}
            >
              <Text fontSize="sm">결제 신청</Text>
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
    }

    if (enrollStatus === "PAID") {
      return (
        <Flex align="center" gap={3} w="100%">
          {onRequestCancel && (
            <Button
              colorPalette="red"
              w="100%"
              onClick={() => onRequestCancel(enrollId)}
            >
              취소 신청
            </Button>
          )}
        </Flex>
      );
    }

    // Handle other statuses: FAILED, PARTIAL_REFUNDED
    return (
      <Flex direction="column" align="center" gap={2} w="100%">
        <Text fontSize="sm" color="gray.500" textAlign="center">
          상태: {enrollment.status}
        </Text>
        {/* '부분 환불' 상태일 때만 추가적인 취소/환불 요청 버튼을 보여줍니다. */}
        {onRequestCancel && enrollStatus === "PARTIAL_REFUNDED" && (
          <Button
            colorPalette="red"
            w="100%"
            onClick={() => onRequestCancel(enrollId)}
          >
            추가 환불 요청
          </Button>
        )}
      </Flex>
    );
  } else {
    // Listing context (no enrollment) - Purely time and capacity based
    let buttonContent: React.ReactNode = "신청불가"; // Default
    let buttonDisabled = true;
    let buttonBgColor = "#A0AEC0"; // Default disabled color
    let hoverBgColor = "#A0AEC0";

    const now = new Date();
    const applicationStartTime = parseKSTDateString(lesson.reservationId);
    const applicationEndTime = parseKSTDateString(lesson.receiptId);

    if (isCountingDown && timeRemaining) {
      // 1. Countdown is active
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
    } else if (applicationStartTime && now < applicationStartTime) {
      // 2. Before application period starts (and countdown is not active for some reason, or finished early)
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
      // 3. Within application period
      if (lesson.remaining != null && lesson.remaining > 0) {
        buttonContent = "신청하기";
        buttonDisabled = false;
        buttonBgColor = "#2D3092"; // Primary blue
        hoverBgColor = "#1f2366";
      } else {
        buttonContent = "정원마감"; // Capacity full
        buttonDisabled = true;
        buttonBgColor = "#CC0000"; // Red for full
        hoverBgColor = "#CC0000";
      }
    } else if (applicationEndTime && now > applicationEndTime) {
      // 4. After application period ends
      buttonContent = "접수마감";
      buttonDisabled = true;
      buttonBgColor = "#888888"; // Darker gray for ended
      hoverBgColor = "#888888";
    } else if (!applicationStartTime || !applicationEndTime) {
      // 5. Dates are invalid or missing
      buttonContent = "정보확인필요";
      buttonDisabled = true;
      buttonBgColor = "#A0AEC0";
      hoverBgColor = "#A0AEC0";
    }
    // Default case is covered by initialization: "신청불가", disabled, gray

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
