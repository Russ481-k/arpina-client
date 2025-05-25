"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Field,
  Fieldset,
  Input,
  Stack,
  Table,
  Badge,
  Flex,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Textarea,
  Card,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import {
  CheckIcon,
  XIcon,
  CalendarIcon,
  DollarSignIcon,
  SearchIcon,
} from "lucide-react";
import { useColors } from "@/styles/theme";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type {
  EnrollAdminResponseDto,
  CancelRequestAdminDto,
  PaginatedResponse,
  ApproveCancelRequestDto,
  DenyCancelRequestDto,
  // Assuming these DTOs will be properly defined in @/types/api by backend changes
  // CalculatedRefundDetailsDto, // This structure should be part of CancelRequestAdminDto & RefundCalculationPreviewResponseDto
  // ManualUsedDaysRequestDto, // For the preview API request
} from "@/types/api";
import { toaster } from "@/components/ui/toaster";

// Remove local temporary DTOs if they are expected from @/types/api now
// type RefundCalculationPreviewRequestDto = any;
// type RefundCalculationPreviewResponseDto = any;

// Interface for the structure expected from backend for refund details
interface BackendCalculatedRefundDetails {
  usedDays: number;
  manualUsedDays?: number;
  lessonUsageAmount: number;
  lockerUsageAmount: number;
  lessonPenalty: number;
  lockerPenalty: number;
  finalRefundAmount: number;
  // Add other fields if backend provides them e.g.:
  // systemCalculatedUsedDays?: number;
  // originalLessonPrice?: number;
  // paidLessonAmount?: number; // This might be part of paidAmount instead
}

interface BackendPaymentDetails {
  // Assuming backend provides this structure for paid amounts
  lesson: number;
  locker?: number;
  total: number;
}

interface CancelRequestData {
  id: string;
  lessonId?: number;
  enrollId: number;
  userName: string;
  userId: string;
  lessonTitle: string;
  requestedAt: string;
  reason: string;
  lessonStartDate: string;
  usesLocker: boolean;
  paidAmount: BackendPaymentDetails; // Directly from backend DTO's paidAmount
  calculatedRefund: BackendCalculatedRefundDetails; // Directly from backend DTO's calculatedRefund(Details)
  status: "PENDING" | "APPROVED" | "DENIED";
  adminMemo?: string;
}

interface CancellationRefundTabProps {
  lessonIdFilter?: number | null;
}

const cancelTabQueryKeys = {
  enrollmentsByLesson: (lessonId?: number | null) =>
    ["enrollmentsForLesson", lessonId] as const,
  cancelRequests: (status?: string) => ["adminCancelRequests", status] as const,
  refundPreview: (enrollId: number, manualUsedDays?: number) =>
    ["refundPreview", enrollId, manualUsedDays] as const,
};

export const CancellationRefundTab = ({
  lessonIdFilter,
}: CancellationRefundTabProps) => {
  const colors = useColors();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ searchTerm: "" });

  const {
    data: enrollmentsForLessonResponse,
    isLoading: isLoadingEnrollmentsForLesson,
  } = useQuery<PaginatedResponse<EnrollAdminResponseDto>, Error, number[]>({
    queryKey: cancelTabQueryKeys.enrollmentsByLesson(lessonIdFilter),
    queryFn: async () => {
      if (!lessonIdFilter)
        return {
          code: 0,
          message: "",
          success: true,
          data: {
            content: [],
            pageable: {
              pageNumber: 0,
              pageSize: 0,
              sort: { empty: true, sorted: false, unsorted: true },
            },
            totalElements: 0,
            totalPages: 0,
            last: true,
            size: 0,
            number: 0,
            first: true,
            numberOfElements: 0,
            empty: true,
          },
        };
      return adminApi.getAdminEnrollments({
        lessonId: lessonIdFilter,
        size: 10000,
        page: 0,
      });
    },
    select: (data) => data.data.content.map((e) => e.enrollId),
    enabled: !!lessonIdFilter,
  });
  const lessonEnrollIds = enrollmentsForLessonResponse || [];

  const { data: allCancelRequestsData, isLoading: isLoadingAllCancelRequests } =
    useQuery<
      PaginatedResponse<CancelRequestAdminDto>,
      Error,
      CancelRequestData[]
    >({
      queryKey: cancelTabQueryKeys.cancelRequests("PENDING"),
      queryFn: async () => {
        return adminApi.getAdminCancelRequests({
          size: 10000,
          page: 0,
          status: "PENDING",
        });
      },
      select: (apiResponse): CancelRequestData[] => {
        return apiResponse.data.content.map(
          (dto: CancelRequestAdminDto): CancelRequestData => {
            // Assuming CancelRequestAdminDto now contains:
            // 1. dto.paidAmount of type BackendPaymentDetails (or similar structure)
            // 2. dto.calculatedRefundDetails of type BackendCalculatedRefundDetails (or similar)
            // 3. dto.adminCancelComment (or similar for admin's memo)

            const paidAmountData = dto.paidAmount || {
              lesson: dto.paid_amt || 0, // Fallback only if dto.paidAmount is not structured
              locker: (dto.paidAmount as any)?.lockerAmount || 0, // Highly dependent on actual DTO
              total: dto.paid_amt || 0,
            };

            // Use `dto.calculatedRefund` as suggested by linter error
            const calculatedRefundData = dto.calculatedRefund || {
              // Fallbacks if backend DTO isn't perfectly aligned yet - SHOULD BE REMOVED once DTO is firm
              usedDays:
                (dto.calculatedRefund as any)?.systemCalculatedUsedDays || 0,
              manualUsedDays: (dto.calculatedRefund as any)?.manualUsedDays,
              lessonUsageAmount:
                (dto.calculatedRefund as any)?.lessonUsageAmount || 0,
              lockerUsageAmount:
                (dto.calculatedRefund as any)?.lockerUsageAmount || 0,
              lessonPenalty: (dto.calculatedRefund as any)?.lessonPenalty || 0,
              lockerPenalty: (dto.calculatedRefund as any)?.lockerPenalty || 0,
              finalRefundAmount:
                dto.calculated_refund_amt ||
                (dto.calculatedRefund as any)?.finalRefundAmount ||
                0,
            };

            return {
              id: dto.requestId.toString(),
              enrollId: dto.enrollId,
              userName: dto.userName,
              userId: dto.userId,
              lessonTitle: dto.lessonTitle,
              requestedAt: dto.requested_at || new Date().toISOString(), // Rely on requested_at or fallback
              reason: dto.reason,
              lessonStartDate: dto.lessonStartDate,
              usesLocker: dto.usesLocker,
              paidAmount: paidAmountData as BackendPaymentDetails,
              calculatedRefund:
                calculatedRefundData as BackendCalculatedRefundDetails,
              status: dto.status,
              adminMemo: undefined, // Assuming no admin memo on fetched PENDING requests from DTO
            };
          }
        );
      },
    });

  const [selectedRequest, setSelectedRequest] =
    useState<CancelRequestData | null>(null);
  const [manualUsedDaysInput, setManualUsedDaysInput] = useState<number>(0);
  const [adminComment, setAdminComment] = useState("");

  const [currentRefundDetails, setCurrentRefundDetails] =
    useState<BackendCalculatedRefundDetails | null>(null);

  const previewRefundMutation = useMutation<
    any, // RefundCalculationPreviewResponseDto - using any until defined in api.ts
    Error,
    any // RefundCalculationPreviewRequestDto & { enrollId: number } - using any
  >({
    mutationFn: async ({ enrollId, manualUsedDays }) => {
      // Mocking the API call as adminApi.calculateRefundPreview is not yet defined
      // console.log(`Mocking API call to calculateRefundPreview for enrollId: ${enrollId} with manualUsedDays: ${manualUsedDays}`);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

      // This mock response should ideally match the structure of BackendCalculatedRefundDetails
      // and what the real RefundCalculationPreviewResponseDto would contain.
      const mockPreviewResponse: BackendCalculatedRefundDetails = {
        usedDays: manualUsedDays || 0, // Effective days for this preview
        manualUsedDays: manualUsedDays, // The input manual days
        lessonUsageAmount: (manualUsedDays || 0) * 3100, // Example mock calculation
        lockerUsageAmount: (manualUsedDays || 0) * 110, // Example mock calculation
        lessonPenalty: 4500, // Example mock calculation
        lockerPenalty: 450, // Example mock calculation
        finalRefundAmount: Math.max(
          0,
          (manualUsedDays || 0) * 3100 + (manualUsedDays || 0) * 110 - 4950
        ), // Example
      };

      // Simulate the structure of RefundCalculationPreviewResponseDto
      return {
        success: true,
        message: "Refund preview calculated (mocked)",
        data: {
          calculatedRefundDetails: mockPreviewResponse, // Assuming the details are nested this way
        },
        // If the response is directly BackendCalculatedRefundDetails, then: return mockPreviewResponse;
      } as any; // Cast to any to satisfy mutation type until DTO is firm
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
        toaster.info({
          title: "환불액 미리보기 업데이트됨",
          duration: 2000,
          closable: true,
        });
      } else {
        toaster.error({
          title: "미리보기 응답 오류",
          description: "환불액 미리보기 정보를 가져오지 못했습니다.",
          duration: 3000,
          closable: true,
        });
      }
    },
    onError: (error) => {
      toaster.error({
        title: "미리보기 실패",
        description: error.message || "환불액 미리보기를 가져오는 중 오류 발생",
        duration: 3000,
        closable: true,
      });
    },
  });

  const approveMutation = useMutation<
    EnrollAdminResponseDto,
    Error,
    { enrollId: number; data: ApproveCancelRequestDto }
  >({
    mutationFn: ({ enrollId, data }) =>
      adminApi.approveAdminCancelRequest(enrollId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cancelTabQueryKeys.cancelRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: cancelTabQueryKeys.refundPreview(selectedRequest!.enrollId),
      });
      setSelectedRequest(null);
      toaster.success({
        title: "승인 처리 완료",
        duration: 2000,
        closable: true,
      });
    },
    onError: (error) => {
      console.error("Approval failed:", error.message);
      toaster.error({
        title: "승인 처리 실패",
        description: error.message,
        duration: 2000,
        closable: true,
      });
    },
  });

  const denyMutation = useMutation<
    EnrollAdminResponseDto,
    Error,
    { enrollId: number; data: DenyCancelRequestDto }
  >({
    mutationFn: ({ enrollId, data }) =>
      adminApi.denyAdminCancelRequest(enrollId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cancelTabQueryKeys.cancelRequests(),
      });
      setSelectedRequest(null);
      toaster.success({
        title: "거부 처리 완료",
        duration: 2000,
        closable: true,
      });
    },
    onError: (error) => {
      console.error("Denial failed:", error.message);
      toaster.error({
        title: "거부 처리 실패",
        description: error.message,
        duration: 2000,
        closable: true,
      });
    },
  });

  useEffect(() => {
    if (selectedRequest && manualUsedDaysInput !== undefined) {
      const initialEffectiveDays =
        selectedRequest.calculatedRefund.manualUsedDays ??
        selectedRequest.calculatedRefund.usedDays;
      if (
        manualUsedDaysInput !== initialEffectiveDays ||
        !currentRefundDetails
      ) {
        previewRefundMutation.mutate({
          enrollId: selectedRequest.enrollId,
          manualUsedDays: manualUsedDaysInput,
        });
      } else if (
        manualUsedDaysInput === initialEffectiveDays &&
        currentRefundDetails?.usedDays !== manualUsedDaysInput
      ) {
        previewRefundMutation.mutate({
          enrollId: selectedRequest.enrollId,
          manualUsedDays: manualUsedDaysInput,
        });
      }
    }
  }, [manualUsedDaysInput, selectedRequest?.enrollId]);

  const finalFilteredRequests = useMemo(() => {
    if (!allCancelRequestsData) return [];
    let dataToFilter = allCancelRequestsData;

    if (lessonIdFilter) {
      if (isLoadingEnrollmentsForLesson) return [];
      if (!enrollmentsForLessonResponse || lessonEnrollIds.length === 0) {
        return [];
      }
      dataToFilter = dataToFilter.filter((req) =>
        lessonEnrollIds.includes(req.enrollId)
      );
    }
    if (filters.searchTerm) {
      return dataToFilter.filter((req) => {
        const searchTermLower = filters.searchTerm.toLowerCase();
        return (
          req.userName.toLowerCase().includes(searchTermLower) ||
          req.userId.toLowerCase().includes(searchTermLower) ||
          req.lessonTitle.toLowerCase().includes(searchTermLower)
        );
      });
    }
    return dataToFilter;
  }, [
    allCancelRequestsData,
    lessonIdFilter,
    lessonEnrollIds,
    filters.searchTerm,
    isLoadingEnrollmentsForLesson,
    enrollmentsForLessonResponse,
  ]);

  const handleOpenDialog = (request: CancelRequestData) => {
    setSelectedRequest(request);
    const initialDialogUsedDays =
      request.calculatedRefund.manualUsedDays ??
      request.calculatedRefund.usedDays;
    setManualUsedDaysInput(initialDialogUsedDays);
    setCurrentRefundDetails(request.calculatedRefund);
    setAdminComment(request.adminMemo || "");
  };

  const handleApprove = () => {
    if (!selectedRequest || !currentRefundDetails) return;

    const finalManualUsedDays = manualUsedDaysInput;

    const approvalData: ApproveCancelRequestDto = {
      manualUsedDays: finalManualUsedDays, // Backend expects the actual number of days
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { colorScheme: "yellow", label: "대기" },
      APPROVED: { colorScheme: "green", label: "승인" },
      DENIED: { colorScheme: "red", label: "거부" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];

    return (
      <Badge colorScheme={config.colorScheme} variant="solid">
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (
    amount: number | undefined,
    showWon: boolean = true
  ) => {
    if (amount === undefined) return "-";
    const formatted = new Intl.NumberFormat("ko-KR").format(Math.round(amount));
    return showWon ? formatted + "원" : formatted;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayRefundDetails =
    currentRefundDetails || selectedRequest?.calculatedRefund;

  if (lessonIdFilter && isLoadingEnrollmentsForLesson) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (isLoadingAllCancelRequests && !allCancelRequestsData) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!lessonIdFilter && !filters.searchTerm) {
    return (
      <Box p={4} textAlign="center">
        <Text>
          강습을 선택하거나 검색어를 입력하면 취소/환불 목록이 표시됩니다.
        </Text>
      </Box>
    );
  }

  if (
    lessonIdFilter &&
    !isLoadingEnrollmentsForLesson &&
    (!enrollmentsForLessonResponse || lessonEnrollIds.length === 0)
  ) {
    return (
      <Box p={4} textAlign="center">
        <Text>
          선택된 강습에 대한 수강정보가 없습니다. 따라서 취소/환불 요청도
          없습니다.
        </Text>
      </Box>
    );
  }

  if (finalFilteredRequests.length === 0) {
    if (lessonIdFilter) {
      return (
        <Box p={4} textAlign="center">
          <Text>선택된 강습에 대한 취소/환불 요청이 없습니다.</Text>
        </Box>
      );
    } else if (filters.searchTerm) {
      return (
        <Box p={4} textAlign="center">
          <Text>검색 결과에 해당하는 취소/환불 요청이 없습니다.</Text>
        </Box>
      );
    }
    return (
      <Box p={4} textAlign="center">
        <Text>표시할 취소/환불 요청이 없습니다.</Text>
      </Box>
    );
  }

  return (
    <Box h="full" display="flex" flexDirection="column">
      <Heading size="md" mb={4}>
        취소/환불 관리
      </Heading>

      <Box
        mb={4}
        p={3}
        borderWidth="1px"
        borderRadius="md"
        borderColor="gray.200"
      >
        <Flex gap={4} align="flex-end">
          <Field.Root flex={1}>
            <Field.Label htmlFor="cancelSearch">
              검색 (이름/ID/강습명)
            </Field.Label>
            <Flex>
              <Input
                id="cancelSearch"
                placeholder="검색어를 입력하세요"
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
              />
              <IconButton
                aria-label="Search a refund request"
                variant="outline"
                ml={2}
              >
                <SearchIcon size={16} />
              </IconButton>
            </Flex>
          </Field.Root>
        </Flex>
      </Box>

      <Card.Root mb={6} p={4}>
        <Card.Body>
          <Flex align="center" gap={4}>
            <Box>
              <Text fontSize="sm" color={colors.text.secondary}>
                {lessonIdFilter ? "선택 강습의 " : ""}
                {filters.searchTerm ? "검색된 " : ""}
                대기 중인 취소 요청
              </Text>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={colors.primary.default}
              >
                {finalFilteredRequests.length}건
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color={colors.text.secondary}>
                {lessonIdFilter ? "선택 강습의 " : ""}
                {filters.searchTerm ? "검색된 " : ""}
                예상 환불 총액
              </Text>
              <Text fontSize="xl" fontWeight="semibold" color="red.500">
                {formatCurrency(
                  finalFilteredRequests.reduce(
                    (sum, req) =>
                      sum + (req.calculatedRefund?.finalRefundAmount || 0),
                    0
                  )
                )}
              </Text>
            </Box>
          </Flex>
        </Card.Body>
      </Card.Root>

      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>신청자</Table.ColumnHeader>
              <Table.ColumnHeader>요청일시</Table.ColumnHeader>
              <Table.ColumnHeader>사용일수</Table.ColumnHeader>
              <Table.ColumnHeader>환불예정액</Table.ColumnHeader>
              <Table.ColumnHeader>상태</Table.ColumnHeader>
              <Table.ColumnHeader>관리</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {finalFilteredRequests.map((request) => (
              <Table.Row key={request.id}>
                <Table.Cell>
                  <Stack gap={1}>
                    <Text fontWeight="medium">{request.userName}</Text>
                    <Text fontSize="xs" color={colors.text.secondary}>
                      {request.userId}
                    </Text>
                  </Stack>
                </Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap={1}>
                    <CalendarIcon size={14} />
                    <Text fontSize="sm">{formatDate(request.requestedAt)}</Text>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text>
                    {request.calculatedRefund.manualUsedDays ??
                      request.calculatedRefund.usedDays}
                    일
                  </Text>
                  <Text fontSize="xs" color={colors.text.secondary}>
                    시작:{" "}
                    {new Date(request.lessonStartDate).toLocaleDateString(
                      "ko-KR"
                    )}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap={1}>
                    <DollarSignIcon size={14} />
                    <Text fontWeight="semibold">
                      {formatCurrency(
                        request.calculatedRefund.finalRefundAmount
                      )}
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color={colors.text.secondary}>
                    / {formatCurrency(request.paidAmount.total)}
                  </Text>
                </Table.Cell>
                <Table.Cell>{getStatusBadge(request.status)}</Table.Cell>
                <Table.Cell>
                  {request.status === "PENDING" && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => handleOpenDialog(request)}
                    >
                      검토
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <DialogRoot
        open={!!selectedRequest}
        onOpenChange={() => {
          setSelectedRequest(null);
          setCurrentRefundDetails(null);
        }}
      >
        <DialogContent maxW="2xl">
          <DialogHeader>
            <DialogTitle>
              취소/환불 검토 - {selectedRequest?.userName}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {selectedRequest && displayRefundDetails && (
              <Stack gap={6}>
                <Fieldset.Root>
                  <Fieldset.Legend>신청 정보</Fieldset.Legend>
                  <Fieldset.Content>
                    <Flex gap={4} wrap="wrap">
                      <Field.Root>
                        <Field.Label>강습명</Field.Label>
                        <Input value={selectedRequest.lessonTitle} readOnly />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>강습 시작일</Field.Label>
                        <Input
                          value={selectedRequest.lessonStartDate}
                          readOnly
                        />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>결제 총액</Field.Label>
                        <Input
                          value={formatCurrency(
                            selectedRequest.paidAmount.total
                          )}
                          readOnly
                        />
                      </Field.Root>
                      <Field.Root>
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
                          <Field.Root>
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
                  <Fieldset.Legend>환불 계산 (백엔드 기준)</Fieldset.Legend>
                  <Fieldset.Content>
                    <Stack gap={4}>
                      <Field.Root>
                        <Field.Label>
                          실사용일수 (수정 시 미리보기 업데이트)
                        </Field.Label>
                        <Input
                          type="number"
                          value={manualUsedDaysInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setManualUsedDaysInput(0);
                            } else {
                              const numVal = parseInt(val, 10);
                              if (!isNaN(numVal)) {
                                setManualUsedDaysInput(Math.max(0, numVal));
                              }
                            }
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
                        <Box p={4} bg="gray.50" borderRadius="md">
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
            )}
          </DialogBody>
          <DialogFooter>
            <Stack direction="row" gap={2}>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null);
                  setCurrentRefundDetails(null);
                }}
              >
                취소
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeny}
                loading={denyMutation.isPending}
              >
                <XIcon size={16} />
                거부
              </Button>
              <Button
                colorScheme="green"
                onClick={handleApprove}
                loading={
                  approveMutation.isPending || previewRefundMutation.isPending
                }
              >
                <CheckIcon size={16} /> 승인 및 환불 처리
              </Button>
            </Stack>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};
