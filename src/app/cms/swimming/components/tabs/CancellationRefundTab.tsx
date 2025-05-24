"use client";

import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { CheckIcon, XIcon, CalendarIcon, DollarSignIcon } from "lucide-react";
import { useColors } from "@/styles/theme";

interface CancelRequestData {
  enrollId: number;
  userName: string;
  userId: string;
  lessonTitle: string;
  requestedAt: string;
  reason: string;
  lessonStartDate: string;
  usesLocker: boolean;
  paidAmount: {
    lesson: number;
    locker?: number;
    total: number;
  };
  calculatedRefund: {
    usedDays: number;
    manualUsedDays?: number;
    lessonUsageAmount: number;
    lockerUsageAmount: number;
    lessonPenalty: number;
    lockerPenalty: number;
    finalRefundAmount: number;
  };
  status: "PENDING" | "APPROVED" | "DENIED";
}

export const CancellationRefundTab: React.FC = () => {
  const colors = useColors();

  // Mock data
  const [cancelRequests, setCancelRequests] = useState<CancelRequestData[]>([
    {
      enrollId: 1,
      userName: "김수영",
      userId: "swimKim",
      lessonTitle: "초급반 (오전)",
      requestedAt: "2025-01-15T14:30:00Z",
      reason: "개인 사정으로 인한 취소",
      lessonStartDate: "2025-01-10",
      usesLocker: true,
      paidAmount: {
        lesson: 65000,
        locker: 5000,
        total: 70000,
      },
      calculatedRefund: {
        usedDays: 5,
        lessonUsageAmount: 17500, // 5일 * 3500원
        lockerUsageAmount: 850, // 5일 * 170원
        lessonPenalty: 6500, // 65000 * 10%
        lockerPenalty: 500, // 5000 * 10%
        finalRefundAmount: 45150, // 70000 - 17500 - 850 - 6500 - 500
      },
      status: "PENDING",
    },
  ]);

  const [selectedRequest, setSelectedRequest] =
    useState<CancelRequestData | null>(null);
  const [manualUsedDays, setManualUsedDays] = useState<number>(0);
  const [adminComment, setAdminComment] = useState("");

  const handleOpenDialog = (request: CancelRequestData) => {
    setSelectedRequest(request);
    setManualUsedDays(request.calculatedRefund.usedDays);
    setAdminComment("");
  };

  const calculateRefund = (request: CancelRequestData, usedDays: number) => {
    const lessonUsageAmount = usedDays * 3500;
    const lockerUsageAmount = request.usesLocker ? usedDays * 170 : 0;
    const lessonPenalty = request.paidAmount.lesson * 0.1;
    const lockerPenalty = request.usesLocker
      ? (request.paidAmount.locker || 0) * 0.1
      : 0;

    const lessonRefund = Math.max(
      0,
      request.paidAmount.lesson - lessonUsageAmount - lessonPenalty
    );
    const lockerRefund = request.usesLocker
      ? Math.max(
          0,
          (request.paidAmount.locker || 0) - lockerUsageAmount - lockerPenalty
        )
      : 0;

    return {
      usedDays,
      lessonUsageAmount,
      lockerUsageAmount,
      lessonPenalty,
      lockerPenalty,
      finalRefundAmount: lessonRefund + lockerRefund,
    };
  };

  const recalculatedRefund = selectedRequest
    ? calculateRefund(selectedRequest, manualUsedDays)
    : null;

  const handleApprove = () => {
    if (!selectedRequest) return;

    // Update the request with final calculations
    setCancelRequests((prev) =>
      prev.map((req) =>
        req.enrollId === selectedRequest.enrollId
          ? {
              ...req,
              status: "APPROVED" as const,
              calculatedRefund: {
                ...req.calculatedRefund,
                manualUsedDays: manualUsedDays,
                ...recalculatedRefund!,
              },
            }
          : req
      )
    );

    // TODO: API 호출하여 KISPG 환불 처리
    console.log("취소 승인:", {
      enrollId: selectedRequest.enrollId,
      refundAmount: recalculatedRefund?.finalRefundAmount,
      adminComment,
    });

    setSelectedRequest(null);
  };

  const handleDeny = () => {
    if (!selectedRequest) return;

    setCancelRequests((prev) =>
      prev.map((req) =>
        req.enrollId === selectedRequest.enrollId
          ? { ...req, status: "DENIED" as const }
          : req
      )
    );

    // TODO: API 호출
    console.log("취소 거부:", {
      enrollId: selectedRequest.enrollId,
      adminComment,
    });

    setSelectedRequest(null);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount) + "원";
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

  const pendingRequests = cancelRequests.filter(
    (req) => req.status === "PENDING"
  );

  return (
    <Box>
      <Heading as="h2" size="md" mb={4} color={colors.text.primary}>
        취소/환불 관리
      </Heading>

      <Text mb={4} fontSize="sm" color={colors.text.secondary}>
        사용자의 취소 요청을 검토하고 환불을 처리합니다.
      </Text>

      {/* 대기 중인 요청 요약 */}
      <Card.Root mb={6} p={4}>
        <Card.Body>
          <Flex align="center" gap={4}>
            <Box>
              <Text fontSize="sm" color={colors.text.secondary}>
                대기 중인 취소 요청
              </Text>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={colors.primary.default}
              >
                {pendingRequests.length}건
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color={colors.text.secondary}>
                예상 환불 총액
              </Text>
              <Text fontSize="xl" fontWeight="semibold" color="red.500">
                {formatCurrency(
                  pendingRequests.reduce(
                    (sum, req) => sum + req.calculatedRefund.finalRefundAmount,
                    0
                  )
                )}
              </Text>
            </Box>
          </Flex>
        </Card.Body>
      </Card.Root>

      {/* 취소 요청 테이블 */}
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>신청자</Table.ColumnHeader>
              <Table.ColumnHeader>강습명</Table.ColumnHeader>
              <Table.ColumnHeader>요청일시</Table.ColumnHeader>
              <Table.ColumnHeader>사용일수</Table.ColumnHeader>
              <Table.ColumnHeader>환불예정액</Table.ColumnHeader>
              <Table.ColumnHeader>상태</Table.ColumnHeader>
              <Table.ColumnHeader>관리</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {cancelRequests.map((request) => (
              <Table.Row key={request.enrollId}>
                <Table.Cell>
                  <Stack gap={1}>
                    <Text fontWeight="medium">{request.userName}</Text>
                    <Text fontSize="xs" color={colors.text.secondary}>
                      {request.userId}
                    </Text>
                  </Stack>
                </Table.Cell>
                <Table.Cell>{request.lessonTitle}</Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap={1}>
                    <CalendarIcon size={14} />
                    <Text fontSize="sm">{formatDate(request.requestedAt)}</Text>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text>
                    {request.calculatedRefund.manualUsedDays ||
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

      {/* 취소 검토 다이얼로그 */}
      <DialogRoot
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent maxW="2xl">
          <DialogHeader>
            <DialogTitle>
              취소/환불 검토 - {selectedRequest?.userName}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {selectedRequest && (
              <Stack gap={6}>
                {/* 신청 정보 */}
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
                    </Flex>
                  </Fieldset.Content>
                </Fieldset.Root>

                {/* 취소 사유 */}
                <Field.Root>
                  <Field.Label>취소 사유</Field.Label>
                  <Textarea value={selectedRequest.reason} readOnly rows={3} />
                </Field.Root>

                {/* 환불 계산 */}
                <Fieldset.Root>
                  <Fieldset.Legend>환불 계산</Fieldset.Legend>
                  <Fieldset.Content>
                    <Stack gap={4}>
                      <Field.Root>
                        <Field.Label>실사용일수 (수정 가능)</Field.Label>
                        <Input
                          type="number"
                          value={manualUsedDays}
                          onChange={(e) =>
                            setManualUsedDays(Number(e.target.value))
                          }
                          min={0}
                        />
                        <Field.HelperText>
                          기본: {selectedRequest.calculatedRefund.usedDays}일
                          (시스템 계산)
                        </Field.HelperText>
                      </Field.Root>

                      {recalculatedRefund && (
                        <Box p={4} bg="gray.50" borderRadius="md">
                          <Text fontWeight="bold" mb={3}>
                            환불 계산 내역
                          </Text>
                          <Stack gap={2} fontSize="sm">
                            <Flex justify="space-between">
                              <Text>
                                강습료 사용액 ({manualUsedDays}일 × 3,500원)
                              </Text>
                              <Text>
                                -
                                {formatCurrency(
                                  recalculatedRefund.lessonUsageAmount
                                )}
                              </Text>
                            </Flex>
                            {selectedRequest.usesLocker && (
                              <Flex justify="space-between">
                                <Text>
                                  사물함료 사용액 ({manualUsedDays}일 × 170원)
                                </Text>
                                <Text>
                                  -
                                  {formatCurrency(
                                    recalculatedRefund.lockerUsageAmount
                                  )}
                                </Text>
                              </Flex>
                            )}
                            <Flex justify="space-between">
                              <Text>강습료 위약금 (10%)</Text>
                              <Text>
                                -
                                {formatCurrency(
                                  recalculatedRefund.lessonPenalty
                                )}
                              </Text>
                            </Flex>
                            {selectedRequest.usesLocker && (
                              <Flex justify="space-between">
                                <Text>사물함료 위약금 (10%)</Text>
                                <Text>
                                  -
                                  {formatCurrency(
                                    recalculatedRefund.lockerPenalty
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
                                    recalculatedRefund.finalRefundAmount
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

                {/* 관리자 메모 */}
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
                onClick={() => setSelectedRequest(null)}
              >
                취소
              </Button>
              <Button colorScheme="red" onClick={handleDeny}>
                <XIcon size={16} />
                거부
              </Button>
              <Button colorScheme="green" onClick={handleApprove}>
                <CheckIcon size={16} />
                승인 및 환불 처리
              </Button>
            </Stack>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      {cancelRequests.length === 0 && (
        <Box textAlign="center" py={8}>
          <Text color={colors.text.secondary}>
            현재 처리할 취소 요청이 없습니다.
          </Text>
        </Box>
      )}
    </Box>
  );
};
