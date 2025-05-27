import React from "react"; // Removed useState, useEffect as timer logic is removed
import { Button, Text, Box, Flex } from "@chakra-ui/react";
import { MypageEnrollDto } from "@/types/api";
import { LessonDTO } from "@/types/swimming";

interface LessonCardActionsProps {
  enrollment: MypageEnrollDto;
  lesson: LessonDTO; // Kept for potential future use or if lessonId is needed from it
  onRequestCancel?: (enrollId: number) => void;
  // onGoToPayment and onRenewLesson are removed as they are not applicable here
}

const LessonCardActions: React.FC<LessonCardActionsProps> = ({
  enrollment,
  // lesson, // lesson prop is available if needed for lessonId, but not used in simplified logic
  onRequestCancel,
}) => {
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
};

export default LessonCardActions;
