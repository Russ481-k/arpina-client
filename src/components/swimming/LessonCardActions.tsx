import React, { useState, useEffect } from "react";
import { Button, Text, Box, Flex } from "@chakra-ui/react";
import { MypageEnrollDto } from "@/types/api"; // Assuming MypageEnrollDto is here
import { LessonDTO } from "@/types/swimming";

interface LessonCardActionsProps {
  enrollment: MypageEnrollDto;
  lesson: LessonDTO; // LessonDTO for lesson details
  onGoToPayment?: (paymentPageUrl: string) => void;
  onRequestCancel?: (enrollId: number) => void;
  onRenewLesson?: (lessonId: number) => void;
}

const LessonCardActions: React.FC<LessonCardActionsProps> = ({
  enrollment,
  lesson,
  onGoToPayment,
  onRequestCancel,
  onRenewLesson,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  const {
    status: enrollStatus,
    paymentExpireDt,
    cancelStatus,
    renewalWindow,
    canAttemptPayment,
    paymentPageUrl,
    enrollId,
  } = enrollment;
  // The lesson object (enrollment.lesson) within MypageEnrollDto might be a summary.
  // We use the main lesson prop for full details like endDate.
  const { endDate: lessonEndDate, id: lessonId } = lesson;

  const isPastLesson = lessonEndDate
    ? new Date(lessonEndDate) < new Date()
    : false;

  const isRenewalPeriod =
    renewalWindow?.open && renewalWindow?.close
      ? new Date() >= new Date(renewalWindow.open) &&
        new Date() <= new Date(renewalWindow.close)
      : false;

  // Placeholder for admin cancel review. Confirm actual status values from backend.
  // Example: if enroll.adminReviewStatus === 'PENDING'
  const isAdminCancelReview =
    enrollStatus === "PAID" && cancelStatus === "REQ_ADMIN_APPROVAL"; // Placeholder, adjust as needed

  useEffect(() => {
    if (enrollStatus === "UNPAID" && paymentExpireDt && canAttemptPayment) {
      const calculateTimeLeft = () => {
        const difference = +new Date(paymentExpireDt) - +new Date();
        let timeLeftOutput = "";

        if (difference > 0) {
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / 1000 / 60) % 60);
          const seconds = Math.floor((difference / 1000) % 60);
          timeLeftOutput = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        } else {
          timeLeftOutput = "결제 시간 만료";
        }
        setTimeLeft(timeLeftOutput);
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentExpireDt, enrollStatus, canAttemptPayment]);

  // 1. Payment Pending (UNPAID and can attempt payment)
  if (enrollStatus === "UNPAID" && canAttemptPayment && paymentPageUrl) {
    if (timeLeft === "결제 시간 만료") {
      return (
        <Text color="red.500" fontSize="sm">
          결제 시간이 만료되었습니다.
        </Text>
      );
    }
    return (
      <Flex direction="column" align="center" gap={2} w="100%">
        <Text color="red.500" fontSize="sm">
          결제 대기중: {timeLeft}
        </Text>
        <Button
          colorScheme="blue"
          w="100%"
          onClick={() =>
            onGoToPayment && paymentPageUrl && onGoToPayment(paymentPageUrl)
          }
        >
          결제하기
        </Button>
      </Flex>
    );
  }
  console.log(enrollStatus, canAttemptPayment);
  // Handle cases where payment cannot be attempted (e.g., UNPAID but payment window closed)
  if (enrollStatus === "UNPAID" && !canAttemptPayment) {
    return (
      <Flex direction="column" align="center" gap={2} w="100%">
        <Button variant="outline" colorPalette="gray" w="100%">
          <Text color="gray.500" fontSize="sm">
            결제 기간이 지났습니다.
          </Text>
        </Button>
      </Flex>
    );
  }

  // 2. Paid Status and sub-statuses
  if (enrollStatus === "PAID") {
    if (isPastLesson) {
      return (
        <Flex direction="column" align="center" gap={2} w="100%">
          <Button variant="outline" colorPalette="gray" w="100%">
            <Text color="gray.500" fontSize="sm">
              수강 완료{" "}
            </Text>
          </Button>
        </Flex>
      );
    }
    if (isAdminCancelReview) {
      return (
        <Flex direction="column" align="center" gap={2} w="100%">
          <Button variant="outline" colorPalette="gray" w="100%">
            <Text color="gray.500" fontSize="sm">
              관리자 취소 검토중
            </Text>
          </Button>
        </Flex>
      );
    }
    if (cancelStatus === "REQ") {
      return (
        <Flex direction="column" align="center" gap={2} w="100%">
          <Button variant="outline" colorPalette="gray" w="100%">
            <Text color="gray.500" fontSize="sm">
              취소 요청됨 (승인 대기중)
            </Text>
          </Button>
        </Flex>
      );
    }
    if (cancelStatus === "APPROVED") {
      return (
        <Flex direction="column" align="center" gap={2} w="100%">
          <Button variant="outline" colorPalette="gray" w="100%">
            <Text color="gray.500" fontSize="sm">
              취소 승인 (환불 처리중)
            </Text>
          </Button>
        </Flex>
      );
    }
    if (cancelStatus === "DENIED") {
      return (
        <Flex direction="column" align="center" gap={2} w="100%">
          <Button variant="outline" colorPalette="gray" w="100%">
            <Text color="gray.500" fontSize="sm">
              취소 요청 거부됨
            </Text>
          </Button>
        </Flex>
      );
    }
    // If paid, not past, no pending/approved/denied cancellation, allow cancellation if applicable
    // The `canCancel` prop logic needs to be determined by the parent based on policy
    // Let's assume if `onRequestCancel` is provided, cancellation is possible.
    if (onRequestCancel) {
      return (
        <Button
          colorScheme="red"
          w="100%"
          onClick={() => onRequestCancel(enrollId)}
        >
          취소 신청
        </Button>
      );
    }
    return (
      <Flex direction="column" align="center" gap={2} w="100%">
        <Button variant="outline" colorPalette="gray" w="100%">
          <Text color="gray.500" fontSize="sm">
            결제 완료
          </Text>
        </Button>
      </Flex>
    );
  }

  // 3. Payment Timeout
  if (enrollStatus === "PAYMENT_TIMEOUT") {
    return (
      <Flex direction="column" align="center" gap={2} w="100%">
        <Button variant="outline" colorPalette="gray" w="100%">
          <Text color="gray.500" fontSize="sm">
            결제 시간 초과
          </Text>
        </Button>
      </Flex>
    );
  }

  // 4. Admin Cancelled (Example, confirm actual status from backend like enroll.isAdministrativelyCancelled)
  // if (enrollment.isAdministrativelyCancelled) {
  //   return <Text color="red.600" fontSize="sm">취소됨 (관리자)</Text>;
  // }

  // 5. User Cancelled (CANCELED_UNPAID or CANCELED post-payment - though PAID + cancelStatus=APPROVED covers latter)
  if (enrollStatus === "CANCELED_UNPAID") {
    return (
      <Flex direction="column" align="center" gap={2} w="100%">
        <Button variant="outline" colorPalette="gray" w="100%">
          <Text color="gray.500" fontSize="sm">
            취소 완료 (미결제)
          </Text>
        </Button>
      </Flex>
    );
  }
  // If enrollStatus is CANCELLED (generic, could be after refund) and cancelStatus was APPROVED
  if (
    (enrollStatus === "CANCELED" || enrollStatus === "CANCELLED") &&
    cancelStatus === "APPROVED"
  ) {
    return (
      <Flex direction="column" align="center" gap={2} w="100%">
        <Button variant="outline" colorPalette="gray" w="100%">
          <Text color="gray.500" fontSize="sm">
            취소 완료
          </Text>
        </Button>
      </Flex>
    );
  }

  // Potentially a more general 'CANCELLED' or 'REFUNDED' if these are final states
  if (enrollStatus === "REFUNDED") {
    // From images, seems like REFUNDED is a final state
    return (
      <Flex direction="column" align="center" gap={2} w="100%">
        <Button variant="outline" colorPalette="gray" w="100%">
          <Text color="gray.500" fontSize="sm">
            환불 완료
          </Text>
        </Button>
      </Flex>
    );
  }

  // 6. Renewal Period
  if (isRenewalPeriod && !isPastLesson && onRenewLesson) {
    return (
      <Flex direction="column" align="center" gap={2} w="100%">
        <Button
          variant="outline"
          colorPalette="gray"
          w="100%"
          onClick={() => onRenewLesson(lessonId)}
        >
          <Text color="gray.500" fontSize="sm">
            재등록 신청
          </Text>
        </Button>
      </Flex>
    );
  }

  // 7. Past Lesson (if no other specific status applies)
  if (isPastLesson) {
    return (
      <Flex direction="column" align="center" gap={2} w="100%">
        <Button variant="outline" colorPalette="gray" w="100%">
          <Text color="gray.500" fontSize="sm">
            수업 종료
          </Text>
        </Button>
      </Flex>
    );
  }

  // Fallback for any other unhandled enrollStatus
  // This helps in development to see what status is not covered.
  if (enrollStatus) {
    return (
      <Flex direction="column" align="center" gap={2} w="100%">
        <Button variant="outline" colorPalette="gray" w="100%">
          <Text color="gray.500" fontSize="sm">
            상태: {enrollStatus} (cancel: {cancelStatus || "N/A"})
          </Text>
        </Button>
      </Flex>
    );
  }

  return null; // Default empty return if no specific state matches
};

export default LessonCardActions;
