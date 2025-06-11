"use client";

import React, { useState, useEffect } from "react";
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
  Grid,
  Checkbox,
} from "@chakra-ui/react";
import { CheckIcon, XIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type {
  ApproveCancelRequestDto,
  DenyCancelRequestDto,
  EnrollAdminResponseDto,
  RefundCalculationPreviewDto,
  RefundCalculationPreviewRequestDto,
  ApiResponse,
} from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import type { CancellationRequestRecordStatus } from "@/types/statusTypes";
import type { EnrollmentPaymentLifecycleStatus } from "@/types/statusTypes";
import { AxiosError } from "axios";

// API 응답 구조에 맞게 인터페이스 수정
interface UICalculatedRefundDetails {
  usedDays: number;
  manualUsedDays?: number | null;
  lessonUsageAmount: number;
  finalRefundAmount: number;
  originalLessonPrice: number;
  paidLessonAmount: number;
  paidLockerAmount: number;
}

interface UIPaymentInfo {
  tid: string | null;
  paidAmt?: number;
  lessonPaidAmt: number;
  lockerPaidAmt: number;
}

export interface CancelRequestData {
  // Dialog fields
  enrollId: number;
  userName: string;
  userLoginId: string;
  userPhone: string;
  lessonTitle: string;
  lessonId: number;
  requestedAt: string;
  userReason: string | null;
  paymentInfo: UIPaymentInfo;
  calculatedRefundDetails: {
    systemCalculatedUsedDays: number;
    manualUsedDays: number | null;
    effectiveUsedDays: number;
    originalLessonPrice: number;
    paidLessonAmount: number;
    paidLockerAmount: number;
    lessonUsageDeduction: number;
    finalRefundAmount: number;
  };
  calculatedRefundAmtByNewPolicy: number;
  cancellationProcessingStatus: string;
  paymentStatus: string;
  adminComment?: string;

  // Additional fields for the grid in CancellationRefundTab
  id?: string;
  paymentDisplayStatus?: EnrollmentPaymentLifecycleStatus;
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
  const queryClient = useQueryClient();
  const [manualUsedDaysInput, setManualUsedDaysInput] = useState<number>(0);
  const [adminComment, setAdminComment] = useState("");
  const [currentRefundDetails, setCurrentRefundDetails] =
    useState<UICalculatedRefundDetails | null>(null);
  const [isFullRefund, setIsFullRefund] = useState(false);
  const [finalRefundAmountInput, setFinalRefundAmountInput] = useState("0");

  // 다이얼로그가 열릴 때 초기값 설정 및 API 호출
  useEffect(() => {
    if (selectedRequest && isOpen) {
      const initialDays =
        selectedRequest.calculatedRefundDetails?.manualUsedDays ??
        selectedRequest.calculatedRefundDetails?.systemCalculatedUsedDays;

      setManualUsedDaysInput(initialDays);
      // API 응답 구조에 맞게 데이터 매핑
      setCurrentRefundDetails({
        usedDays:
          selectedRequest.calculatedRefundDetails?.systemCalculatedUsedDays,
        manualUsedDays: selectedRequest.calculatedRefundDetails?.manualUsedDays,
        lessonUsageAmount:
          selectedRequest.calculatedRefundDetails?.lessonUsageDeduction,
        finalRefundAmount:
          selectedRequest.calculatedRefundDetails?.finalRefundAmount,
        originalLessonPrice:
          selectedRequest.calculatedRefundDetails?.originalLessonPrice,
        paidLessonAmount:
          selectedRequest.calculatedRefundDetails?.paidLessonAmount,
        paidLockerAmount:
          selectedRequest.calculatedRefundDetails?.paidLockerAmount,
      });
      setAdminComment("");
      setIsFullRefund(false); // Reset checkbox on open
      setFinalRefundAmountInput(
        String(selectedRequest.calculatedRefundDetails?.finalRefundAmount || 0)
      );

      // 초기 API 호출
      previewRefundMutation.mutate({
        enrollId: selectedRequest.enrollId,
        data: { manualUsedDays: initialDays },
      });
    } else {
      setManualUsedDaysInput(0);
      setAdminComment("");
      setCurrentRefundDetails(null);
      setIsFullRefund(false);
      setFinalRefundAmountInput("0");
      previewRefundMutation.reset();
      approveMutation.reset();
      denyMutation.reset();
    }
  }, [selectedRequest, isOpen]);

  // Update final refund input when preview details change
  useEffect(() => {
    if (currentRefundDetails && !isFullRefund) {
      setFinalRefundAmountInput(String(currentRefundDetails.finalRefundAmount));
    }
  }, [currentRefundDetails, isFullRefund]);

  const handleFullRefundChange = (checked: boolean) => {
    setIsFullRefund(checked);
    if (checked) {
      const totalPaid = selectedRequest?.paymentInfo.paidAmt ?? 0;
      setFinalRefundAmountInput(String(totalPaid));
    } else {
      // Revert to calculated amount
      setFinalRefundAmountInput(
        String(currentRefundDetails?.finalRefundAmount ?? 0)
      );
    }
  };

  const handleUsedDaysChange = (value: string) => {
    const days = value === "" ? 0 : Math.max(0, parseInt(value, 10));
    setManualUsedDaysInput(days);

    if (!selectedRequest) return;

    previewRefundMutation.mutate({
      enrollId: selectedRequest.enrollId,
      data: { manualUsedDays: days },
    });
  };

  const previewRefundMutation = useMutation<
    ApiResponse<RefundCalculationPreviewDto>,
    Error,
    { enrollId: number; data: RefundCalculationPreviewRequestDto }
  >({
    mutationFn: ({ enrollId, data }) =>
      adminApi.calculateRefundPreview(enrollId, data),
    onSuccess: (responseData) => {
      if (!responseData.success) {
        toaster.create({
          title: "미리보기 실패",
          description:
            responseData.message ||
            "환불 미리보기 계산 중 오류가 발생했습니다.",
          type: "error",
        });
        return;
      }

      const refundDetailsPreview = responseData.data;
      if (refundDetailsPreview) {
        const newRefundDetails: UICalculatedRefundDetails = {
          usedDays: refundDetailsPreview.systemCalculatedUsedDays,
          manualUsedDays: refundDetailsPreview.manualUsedDays,
          lessonUsageAmount: refundDetailsPreview.lessonUsageDeduction,
          finalRefundAmount: refundDetailsPreview.finalRefundAmount,
          originalLessonPrice: refundDetailsPreview.originalLessonPrice,
          paidLessonAmount: refundDetailsPreview.paidLessonAmount,
          paidLockerAmount: refundDetailsPreview.lockerPaidAmt,
        };
        setCurrentRefundDetails(newRefundDetails);

        // API 응답의 isFullRefund 값을 사용하여 UI 상태 업데이트
        handleFullRefundChange(refundDetailsPreview.isFullRefund);

        toaster.create({
          title: "환불액 미리보기 업데이트됨",
          description: `환불 예정액: ${formatCurrency(
            newRefundDetails.finalRefundAmount
          )}`,
          type: "info",
          duration: 2000,
        });
      }
    },
    onError: (error: Error) => {
      toaster.create({
        title: "미리보기 실패",
        description:
          error.message || "환불 미리보기 계산 중 오류가 발생했습니다.",
        type: "error",
      });
    },
  });

  const approveMutation = useMutation<
    EnrollAdminResponseDto,
    AxiosError<ApiResponse<null>>,
    { enrollId: number; data: ApproveCancelRequestDto }
  >({
    mutationFn: ({ enrollId, data }) =>
      adminApi.approveAdminCancelRequest(enrollId, data),
    onSuccess: () => {
      toaster.create({
        title: "성공",
        description: "승인 처리가 완료되었습니다.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["adminCancelRequests"] });
      onClose();
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "승인 처리 중 오류가 발생했습니다.";
      toaster.create({
        title: "승인 처리 실패",
        description: message,
        type: "error",
      });
    },
  });

  const denyMutation = useMutation<
    EnrollAdminResponseDto,
    AxiosError<ApiResponse<null>>,
    { enrollId: number; data: DenyCancelRequestDto }
  >({
    mutationFn: ({ enrollId, data }) =>
      adminApi.denyAdminCancelRequest(enrollId, data),
    onSuccess: () => {
      toaster.create({
        title: "성공",
        description: "거부 처리가 완료되었습니다.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["adminCancelRequests"] });
      onClose();
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "거부 처리 중 오류가 발생했습니다.";
      toaster.create({
        title: "거부 처리 실패",
        description: message,
        type: "error",
      });
    },
  });

  const handleApprove = () => {
    if (!selectedRequest) return;
    const finalAmount = parseInt(finalRefundAmountInput, 10);
    if (isNaN(finalAmount) || finalAmount < 0) {
      toaster.create({
        title: "입력 오류",
        description: "유효한 환불 금액을 입력해주세요.",
        type: "error",
      });
      return;
    }

    approveMutation.mutate({
      enrollId: selectedRequest.enrollId,
      data: {
        adminComment: adminComment,
        refundAmount: finalAmount, // Use the state value
        manualUsedDays: manualUsedDaysInput,
      },
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
          <DialogContent maxW="xl">
            <DialogHeader>
              <DialogTitle>
                취소/환불 검토 - {selectedRequest.userName}
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap={3}>
                <Fieldset.Root>
                  <Fieldset.Content>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      <Field.Root>
                        <Field.Label>강습명</Field.Label>
                        <Input value={selectedRequest?.lessonTitle} readOnly />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>회원명</Field.Label>
                        <Input value={selectedRequest?.userName} readOnly />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>회원ID</Field.Label>
                        <Input value={selectedRequest?.userLoginId} readOnly />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>연락처</Field.Label>
                        <Input value={selectedRequest?.userPhone} readOnly />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>결제 총액</Field.Label>
                        <Input
                          value={formatCurrency(
                            selectedRequest?.paymentInfo?.paidAmt
                          )}
                          readOnly
                        />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>강습료 결제액</Field.Label>
                        <Input
                          value={formatCurrency(
                            selectedRequest?.paymentInfo?.lessonPaidAmt
                          )}
                          readOnly
                        />
                      </Field.Root>
                      {selectedRequest?.paymentInfo?.lockerPaidAmt > 0 && (
                        <Field.Root>
                          <Field.Label>사물함 결제액</Field.Label>
                          <Input
                            value={formatCurrency(
                              selectedRequest.paymentInfo.lockerPaidAmt
                            )}
                            readOnly
                          />
                        </Field.Root>
                      )}{" "}
                      <Field.Root>
                        <Field.Label>실사용일수</Field.Label>
                        <Input
                          type="number"
                          value={manualUsedDaysInput?.toString()}
                          onChange={(e) => handleUsedDaysChange(e.target.value)}
                          min={0}
                          disabled={previewRefundMutation.isPending}
                        />
                        <Field.HelperText>
                          최초 시스템 계산일:{" "}
                          {
                            selectedRequest?.calculatedRefundDetails
                              ?.systemCalculatedUsedDays
                          }
                          일
                          {selectedRequest?.calculatedRefundDetails
                            ?.manualUsedDays !== null &&
                            selectedRequest?.calculatedRefundDetails
                              ?.manualUsedDays !==
                              selectedRequest?.calculatedRefundDetails
                                ?.systemCalculatedUsedDays &&
                            ` (이전 관리자 설정: ${selectedRequest?.calculatedRefundDetails?.manualUsedDays}일)`}
                        </Field.HelperText>
                      </Field.Root>
                    </Grid>
                  </Fieldset.Content>
                </Fieldset.Root>

                <Fieldset.Root>
                  <Fieldset.Content>
                    <Stack gap={4}>
                      {currentRefundDetails && (
                        <Box
                          p={4}
                          bg="gray.50"
                          _dark={{ bg: "gray.700" }}
                          borderRadius="md"
                        >
                          {" "}
                          {previewRefundMutation.isPending ? (
                            <Flex
                              justify="center"
                              align="center"
                              height="120px"
                            >
                              <Spinner size="md" />
                            </Flex>
                          ) : (
                            <Box height="120px">
                              {" "}
                              <Text fontWeight="bold" mb={3}>
                                환불 계산 내역 (기준 사용일:{" "}
                                {currentRefundDetails?.manualUsedDays ??
                                  currentRefundDetails?.usedDays}
                                일)
                              </Text>
                              <Stack gap={2} fontSize="sm">
                                <Flex justify="space-between">
                                  <Text>강습료 결제액</Text>
                                  <Text>
                                    {formatCurrency(
                                      currentRefundDetails?.paidLessonAmount
                                    )}
                                  </Text>
                                </Flex>
                                <Flex justify="space-between">
                                  <Text>강습료 사용액</Text>
                                  <Text>
                                    -
                                    {formatCurrency(
                                      currentRefundDetails?.lessonUsageAmount
                                    )}
                                  </Text>
                                </Flex>
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
                                        currentRefundDetails?.finalRefundAmount
                                      )}
                                    </Text>
                                  </Flex>
                                </Box>
                              </Stack>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </Fieldset.Content>
                </Fieldset.Root>

                <Stack direction="column" gap={4} my={4}>
                  <Checkbox.Root
                    checked={isFullRefund}
                    onCheckedChange={(details) =>
                      handleFullRefundChange(details.checked === true)
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>전액환불</Checkbox.Label>
                  </Checkbox.Root>
                  <Field.Root>
                    <Field.Label>최종 환불액 (원)</Field.Label>
                    <Input
                      type="number"
                      value={finalRefundAmountInput}
                      onChange={(e) =>
                        setFinalRefundAmountInput(e.target.value)
                      }
                      disabled={isFullRefund}
                      min={0}
                    />
                    <Field.HelperText>
                      PG사를 통해 실제 환불될 금액을 입력하세요.
                    </Field.HelperText>
                  </Field.Root>
                </Stack>

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
                  colorPalette="red"
                  onClick={handleDeny}
                  loading={denyMutation.isPending}
                >
                  <XIcon size={16} style={{ marginRight: "4px" }} /> 거부
                </Button>
                <Button
                  colorPalette="green"
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
