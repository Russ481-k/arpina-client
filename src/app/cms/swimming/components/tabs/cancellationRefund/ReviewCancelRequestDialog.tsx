"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Text,
  Button,
  Field,
  Fieldset,
  Input,
  Stack,
  Flex,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogBackdrop,
  DialogPositioner,
  Textarea,
  Spinner,
  Portal,
} from "@chakra-ui/react";
import { CheckIcon, XIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type {
  ApproveCancelRequestDto,
  DenyCancelRequestDto,
  EnrollAdminResponseDto, // For mutation response types
} from "@/types/api";
import { toaster } from "@/components/ui/toaster";

// Assuming these interfaces are defined or imported from a shared location
// If not, they need to be defined here or passed as generics more robustly.
interface BackendCalculatedRefundDetails {
  usedDays: number;
  manualUsedDays?: number;
  lessonUsageAmount: number;
  lockerUsageAmount: number;
  lessonPenalty: number;
  lockerPenalty: number;
  finalRefundAmount: number;
}

interface BackendPaymentDetails {
  lesson: number;
  locker?: number;
  total: number;
}

interface CancelRequestData {
  id: string;
  enrollId: number;
  userName: string;
  lessonTitle: string;
  lessonStartDate: string;
  usesLocker: boolean;
  paidAmount: BackendPaymentDetails;
  calculatedRefund: BackendCalculatedRefundDetails;
  reason: string;
  adminMemo?: string;
  status?: "PENDING" | "APPROVED" | "DENIED"; // Add status if needed inside dialog for conditional logic
}

// Define query keys if specific invalidations are needed from this dialog
// const cancelTabQueryKeys = {
//   cancelRequests: (status?: string) => ["adminCancelRequests", status] as const,
//   refundPreview: (enrollId: number, manualUsedDays?: number) => ["refundPreview", enrollId, manualUsedDays] as const,
// };

interface ReviewCancelRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: CancelRequestData | null;
  // It's often better to pass specific data rather than the whole queryClient
  // but if complex invalidations are needed, it can be an option.
  // queryClient: ReturnType<typeof useQueryClient>;
}

// Helper functions (consider moving to a shared utility file)
const formatCurrency = (
  amount: number | undefined | null,
  showWon: boolean = true
) => {
  if (amount === undefined || amount === null) return "-";
  const formatted = new Intl.NumberFormat("ko-KR").format(Math.round(amount));
  return showWon ? formatted + "원" : formatted;
};

export const ReviewCancelRequestDialog: React.FC<
  ReviewCancelRequestDialogProps
> = ({ isOpen, onClose, selectedRequest }) => {
  const queryClient = useQueryClient(); // Get instance for invalidations
  const [manualUsedDaysInput, setManualUsedDaysInput] = useState<number>(0);
  const [adminComment, setAdminComment] = useState("");
  const [currentRefundDetails, setCurrentRefundDetails] =
    useState<BackendCalculatedRefundDetails | null>(null);

  // Placeholder Mutation for Refund Preview
  const previewRefundMutation = useMutation<
    any, // Should be RefundCalculationPreviewResponseDto
    Error,
    { enrollId: number; manualUsedDays?: number } // Should be RefundCalculationPreviewRequestDto
  >({
    mutationFn: async ({ enrollId, manualUsedDays }) => {
      // This is a MOCK. Replace with adminApi.calculateRefundPreview or similar
      console.log(
        `Mocking API call to calculateRefundPreview for enrollId: ${enrollId} with manualUsedDays: ${manualUsedDays}`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockPreviewResponse: BackendCalculatedRefundDetails = {
        usedDays:
          manualUsedDays || selectedRequest?.calculatedRefund.usedDays || 0,
        manualUsedDays: manualUsedDays,
        lessonUsageAmount:
          ((manualUsedDays || 0) * (selectedRequest?.paidAmount.lesson || 0)) /
          30, // Example
        lockerUsageAmount:
          ((manualUsedDays || 0) * (selectedRequest?.paidAmount.locker || 0)) /
          30, // Example
        lessonPenalty: (selectedRequest?.paidAmount.lesson || 0) * 0.1, // Example
        lockerPenalty: (selectedRequest?.paidAmount.locker || 0) * 0.1, // Example
        finalRefundAmount: Math.max(
          0,
          (selectedRequest?.paidAmount.total || 0) -
            (manualUsedDays || 0) *
              ((selectedRequest?.paidAmount.lesson || 0) / 30) -
            (manualUsedDays || 0) *
              ((selectedRequest?.paidAmount.locker || 0) / 30) -
            (selectedRequest?.paidAmount.lesson || 0) * 0.1 -
            (selectedRequest?.paidAmount.locker || 0) * 0.1
        ),
      };
      return {
        success: true,
        message: "Refund preview calculated (mocked)",
        data: { calculatedRefundDetails: mockPreviewResponse },
      };
    },
    onSuccess: (responseData) => {
      const refundDetailsPreview =
        responseData?.data?.calculatedRefundDetails ||
        responseData?.calculatedRefundDetails ||
        responseData?.data ||
        responseData;
      if (
        refundDetailsPreview &&
        typeof refundDetailsPreview.finalRefundAmount === "number"
      ) {
        setCurrentRefundDetails(
          refundDetailsPreview as BackendCalculatedRefundDetails
        );
        toaster.info({ title: "환불액 미리보기 업데이트됨", duration: 2000 });
      } else {
        toaster.error({
          title: "미리보기 응답 오류",
          description: "환불액 미리보기 정보를 가져오지 못했습니다.",
        });
      }
    },
    onError: (error) => {
      toaster.error({
        title: "미리보기 실패",
        description: error.message || "환불액 미리보기를 가져오는 중 오류 발생",
      });
    },
  });

  const approveMutation = useMutation<
    EnrollAdminResponseDto, // Or a more specific response for approval
    Error,
    { enrollId: number; data: ApproveCancelRequestDto }
  >({
    mutationFn: ({ enrollId, data }) =>
      adminApi.approveAdminCancelRequest(enrollId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCancelRequests"] }); // Broad invalidation
      // queryClient.invalidateQueries(cancelTabQueryKeys.cancelRequests()); // More specific
      // queryClient.invalidateQueries(cancelTabQueryKeys.refundPreview(selectedRequest!.enrollId));
      toaster.success({ title: "승인 처리 완료" });
      onClose();
    },
    onError: (error) => {
      toaster.error({ title: "승인 처리 실패", description: error.message });
    },
  });

  const denyMutation = useMutation<
    EnrollAdminResponseDto, // Or a more specific response for denial
    Error,
    { enrollId: number; data: DenyCancelRequestDto }
  >({
    mutationFn: ({ enrollId, data }) =>
      adminApi.denyAdminCancelRequest(enrollId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCancelRequests"] });
      toaster.success({ title: "거부 처리 완료" });
      onClose();
    },
    onError: (error) => {
      toaster.error({ title: "거부 처리 실패", description: error.message });
    },
  });

  useEffect(() => {
    if (selectedRequest) {
      const initialDialogUsedDays =
        selectedRequest.calculatedRefund.manualUsedDays ??
        selectedRequest.calculatedRefund.usedDays;
      setManualUsedDaysInput(initialDialogUsedDays);
      setCurrentRefundDetails(selectedRequest.calculatedRefund); // Set initial details
      setAdminComment(selectedRequest.adminMemo || "");
      // Trigger initial preview if needed, or rely on manualUsedDaysInput change effect
      if (initialDialogUsedDays !== undefined) {
        previewRefundMutation.mutate({
          enrollId: selectedRequest.enrollId,
          manualUsedDays: initialDialogUsedDays,
        });
      }
    } else {
      // Reset states when dialog is closed or no user selected
      setManualUsedDaysInput(0);
      setAdminComment("");
      setCurrentRefundDetails(null);
      previewRefundMutation.reset();
      approveMutation.reset();
      denyMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequest]); // Rerun when selectedRequest changes

  // Effect to trigger preview when manualUsedDaysInput changes by the user
  useEffect(() => {
    if (selectedRequest && manualUsedDaysInput !== undefined && isOpen) {
      // Only trigger if different from what currentRefundDetails shows or if current is null
      if (
        !currentRefundDetails ||
        currentRefundDetails.manualUsedDays !== manualUsedDaysInput ||
        currentRefundDetails.usedDays !== manualUsedDaysInput
      ) {
        previewRefundMutation.mutate({
          enrollId: selectedRequest.enrollId,
          manualUsedDays: manualUsedDaysInput,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualUsedDaysInput, selectedRequest?.enrollId, isOpen]); // selectedRequest also added to re-trigger if it changes while open

  const handleApprove = () => {
    if (!selectedRequest || !currentRefundDetails) return;
    const approvalData: ApproveCancelRequestDto = {
      manualUsedDays: manualUsedDaysInput,
      adminComment: adminComment || undefined,
    };
    approveMutation.mutate({
      enrollId: selectedRequest.enrollId,
      data: approvalData,
    });
  };

  const handleDeny = () => {
    if (!selectedRequest) return;
    const denialData: DenyCancelRequestDto = {
      adminComment: adminComment || undefined,
    };
    denyMutation.mutate({
      enrollId: selectedRequest.enrollId,
      data: denialData,
    });
  };

  const displayRefundDetails = currentRefundDetails; // Always use the state that gets updated by preview

  if (!selectedRequest) return null;

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent maxW="2xl">
            <DialogHeader>
              <DialogTitle>
                취소/환불 검토 - {selectedRequest.userName}
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap={6}>
                <Fieldset.Root>
                  <Fieldset.Legend>신청 정보</Fieldset.Legend>
                  <Fieldset.Content>
                    <Flex gap={4} wrap="wrap">
                      <Field.Root minW="150px" flexGrow={1}>
                        <Field.Label>강습명</Field.Label>
                        <Input value={selectedRequest.lessonTitle} readOnly />
                      </Field.Root>
                      <Field.Root minW="150px" flexGrow={1}>
                        <Field.Label>강습 시작일</Field.Label>
                        <Input
                          value={new Date(
                            selectedRequest.lessonStartDate
                          ).toLocaleDateString()}
                          readOnly
                        />
                      </Field.Root>
                      <Field.Root minW="150px" flexGrow={1}>
                        <Field.Label>결제 총액</Field.Label>
                        <Input
                          value={formatCurrency(
                            selectedRequest.paidAmount.total
                          )}
                          readOnly
                        />
                      </Field.Root>
                      <Field.Root minW="150px" flexGrow={1}>
                        <Field.Label>강습료 결제액</Field.Label>
                        <Input
                          value={formatCurrency(
                            selectedRequest.paidAmount.lesson
                          )}
                          readOnly
                        />
                      </Field.Root>
                      {selectedRequest.usesLocker &&
                        selectedRequest.paidAmount.locker !== undefined && (
                          <Field.Root minW="150px" flexGrow={1}>
                            <Field.Label>사물함 결제액</Field.Label>
                            <Input
                              value={formatCurrency(
                                selectedRequest.paidAmount.locker
                              )}
                              readOnly
                            />
                          </Field.Root>
                        )}
                    </Flex>
                  </Fieldset.Content>
                </Fieldset.Root>

                <Field.Root>
                  <Field.Label>취소 사유</Field.Label>
                  <Textarea value={selectedRequest.reason} readOnly rows={3} />
                </Field.Root>

                <Fieldset.Root>
                  <Fieldset.Legend>환불 계산</Fieldset.Legend>
                  <Fieldset.Content>
                    <Stack gap={4}>
                      <Field.Root>
                        <Field.Label>
                          실사용일수 (수정 시 미리보기 업데이트)
                        </Field.Label>
                        <Input
                          type="number"
                          value={manualUsedDaysInput.toString()} // Ensure value is string for input
                          onChange={(e) => {
                            const val = e.target.value;
                            setManualUsedDaysInput(
                              val === "" ? 0 : Math.max(0, parseInt(val, 10))
                            );
                          }}
                          min={0}
                          disabled={previewRefundMutation.isPending}
                        />
                        <Field.HelperText>
                          최초 시스템 계산일:{" "}
                          {selectedRequest.calculatedRefund.usedDays}일.
                          {selectedRequest.calculatedRefund.manualUsedDays !==
                            undefined &&
                            selectedRequest.calculatedRefund.manualUsedDays !==
                              selectedRequest.calculatedRefund.usedDays &&
                            ` (이전 관리자 설정: ${selectedRequest.calculatedRefund.manualUsedDays}일)`}
                        </Field.HelperText>
                      </Field.Root>

                      {previewRefundMutation.isPending && <Spinner size="md" />}
                      {previewRefundMutation.isError && (
                        <Text color="red.500">미리보기 오류</Text>
                      )}

                      {displayRefundDetails && (
                        <Box
                          p={4}
                          bg="gray.50"
                          _dark={{ bg: "gray.700" }}
                          borderRadius="md"
                        >
                          <Text fontWeight="bold" mb={3}>
                            환불 계산 내역 (기준 사용일:{" "}
                            {displayRefundDetails.manualUsedDays ??
                              displayRefundDetails.usedDays}
                            일)
                          </Text>
                          <Stack gap={2} fontSize="sm">
                            <Flex justify="space-between">
                              <Text>강습료 사용액</Text>
                              <Text>
                                -
                                {formatCurrency(
                                  displayRefundDetails.lessonUsageAmount
                                )}
                              </Text>
                            </Flex>
                            {selectedRequest.usesLocker && (
                              <Flex justify="space-between">
                                <Text>사물함료 사용액</Text>
                                <Text>
                                  -
                                  {formatCurrency(
                                    displayRefundDetails.lockerUsageAmount
                                  )}
                                </Text>
                              </Flex>
                            )}
                            <Flex justify="space-between">
                              <Text>강습료 위약금</Text>
                              <Text>
                                -
                                {formatCurrency(
                                  displayRefundDetails.lessonPenalty
                                )}
                              </Text>
                            </Flex>
                            {selectedRequest.usesLocker && (
                              <Flex justify="space-between">
                                <Text>사물함료 위약금</Text>
                                <Text>
                                  -
                                  {formatCurrency(
                                    displayRefundDetails.lockerPenalty
                                  )}
                                </Text>
                              </Flex>
                            )}
                            <Box
                              borderTop="1px"
                              borderColor="gray.300"
                              _dark={{ borderColor: "gray.600" }}
                              pt={2}
                              mt={2}
                            >
                              <Flex
                                justify="space-between"
                                fontWeight="bold"
                                fontSize="md"
                              >
                                <Text>최종 환불액</Text>
                                <Text color="red.500">
                                  {formatCurrency(
                                    displayRefundDetails.finalRefundAmount
                                  )}
                                </Text>
                              </Flex>
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Fieldset.Content>
                </Fieldset.Root>

                <Field.Root>
                  <Field.Label>관리자 메모</Field.Label>
                  <Textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="처리 사유나 특이사항을 입력하세요"
                    rows={3}
                  />
                </Field.Root>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <Stack
                direction="row"
                gap={2}
                width="full"
                justifyContent="flex-end"
              >
                <Button variant="outline" onClick={onClose}>
                  취소
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDeny}
                  loading={denyMutation.isPending}
                >
                  <XIcon size={16} style={{ marginRight: "4px" }} /> 거부
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleApprove}
                  loading={
                    approveMutation.isPending || previewRefundMutation.isPending
                  }
                >
                  <CheckIcon size={16} style={{ marginRight: "4px" }} /> 승인 및
                  환불
                </Button>
              </Stack>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
};
