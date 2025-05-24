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
  NativeSelect,
  Stack,
  Table,
  Badge,
  Flex,
  Tabs,
  For,
  Card,
  IconButton,
} from "@chakra-ui/react";
import {
  DownloadIcon,
  SearchIcon,
  CreditCardIcon,
  RefreshCwIcon,
} from "lucide-react";
import { useColors } from "@/styles/theme";

interface PaymentData {
  paymentId: number;
  enrollId: number;
  tid: string;
  userName: string;
  userId: string;
  lessonTitle: string;
  paidAmount: number;
  refundedAmount: number;
  paymentMethod: string;
  paidAt: string;
  refundAt?: string;
  status: "PAID" | "PARTIALLY_REFUNDED" | "FULLY_REFUNDED" | "CANCELED";
}

interface RefundData {
  refundId: number;
  paymentId: number;
  enrollId: number;
  tid: string;
  userName: string;
  userId: string;
  lessonTitle: string;
  refundAmount: number;
  reason: string;
  processedAt: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
}

export const PaymentHistoryTab: React.FC = () => {
  const colors = useColors();

  // Mock data
  const [payments, setPayments] = useState<PaymentData[]>([
    {
      paymentId: 1,
      enrollId: 101,
      tid: "kistest_20250115001",
      userName: "김수영",
      userId: "swimKim",
      lessonTitle: "초급반 (오전)",
      paidAmount: 70000,
      refundedAmount: 0,
      paymentMethod: "신용카드",
      paidAt: "2025-01-15T09:30:00Z",
      status: "PAID",
    },
    {
      paymentId: 2,
      enrollId: 102,
      tid: "kistest_20250114001",
      userName: "박헤엄",
      userId: "parkSwim",
      lessonTitle: "중급반 (저녁)",
      paidAmount: 65000,
      refundedAmount: 25000,
      paymentMethod: "계좌이체",
      paidAt: "2025-01-14T14:20:00Z",
      refundAt: "2025-01-20T10:15:00Z",
      status: "PARTIALLY_REFUNDED",
    },
  ]);

  const [refunds, setRefunds] = useState<RefundData[]>([
    {
      refundId: 1,
      paymentId: 2,
      enrollId: 102,
      tid: "kistest_20250114001",
      userName: "박헤엄",
      userId: "parkSwim",
      lessonTitle: "중급반 (저녁)",
      refundAmount: 25000,
      reason: "수강 시작 후 취소",
      processedAt: "2025-01-20T10:15:00Z",
      status: "COMPLETED",
    },
  ]);

  const [paymentFilters, setPaymentFilters] = useState({
    searchTerm: "",
    status: "",
    period: "all",
    startDate: "",
    endDate: "",
  });

  const [refundFilters, setRefundFilters] = useState({
    searchTerm: "",
    status: "",
    period: "all",
  });

  const statusOptions = [
    { value: "", label: "전체" },
    { value: "PAID", label: "결제완료" },
    { value: "PARTIALLY_REFUNDED", label: "부분환불" },
    { value: "FULLY_REFUNDED", label: "전액환불" },
    { value: "CANCELED", label: "취소" },
  ];

  const refundStatusOptions = [
    { value: "", label: "전체" },
    { value: "COMPLETED", label: "완료" },
    { value: "PENDING", label: "처리중" },
    { value: "FAILED", label: "실패" },
  ];

  const periodOptions = [
    { value: "all", label: "전체" },
    { value: "today", label: "오늘" },
    { value: "week", label: "최근 7일" },
    { value: "month", label: "최근 30일" },
    { value: "custom", label: "기간 선택" },
  ];

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PAID: { colorScheme: "green", label: "결제완료" },
      PARTIALLY_REFUNDED: { colorScheme: "yellow", label: "부분환불" },
      FULLY_REFUNDED: { colorScheme: "red", label: "전액환불" },
      CANCELED: { colorScheme: "gray", label: "취소" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      colorScheme: "gray",
      label: status,
    };

    return (
      <Badge colorScheme={config.colorScheme} variant="solid">
        {config.label}
      </Badge>
    );
  };

  const getRefundStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { colorScheme: "green", label: "완료" },
      PENDING: { colorScheme: "yellow", label: "처리중" },
      FAILED: { colorScheme: "red", label: "실패" },
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleExportPayments = () => {
    // TODO: 엑셀 다운로드 구현
    console.log("결제 내역 엑셀 다운로드");
  };

  const handleExportRefunds = () => {
    // TODO: 엑셀 다운로드 구현
    console.log("환불 내역 엑셀 다운로드");
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName
        .toLowerCase()
        .includes(paymentFilters.searchTerm.toLowerCase()) ||
      payment.userId
        .toLowerCase()
        .includes(paymentFilters.searchTerm.toLowerCase()) ||
      payment.tid
        .toLowerCase()
        .includes(paymentFilters.searchTerm.toLowerCase());

    const matchesStatus =
      !paymentFilters.status || payment.status === paymentFilters.status;

    return matchesSearch && matchesStatus;
  });

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch =
      refund.userName
        .toLowerCase()
        .includes(refundFilters.searchTerm.toLowerCase()) ||
      refund.userId
        .toLowerCase()
        .includes(refundFilters.searchTerm.toLowerCase()) ||
      refund.tid.toLowerCase().includes(refundFilters.searchTerm.toLowerCase());

    const matchesStatus =
      !refundFilters.status || refund.status === refundFilters.status;

    return matchesSearch && matchesStatus;
  });

  // 통계 계산
  const paymentStats = {
    totalAmount: payments.reduce((sum, p) => sum + p.paidAmount, 0),
    totalRefunded: payments.reduce((sum, p) => sum + p.refundedAmount, 0),
    totalCount: payments.length,
    refundCount: refunds.length,
  };

  return (
    <Box>
      <Heading as="h2" size="md" mb={4} color={colors.text.primary}>
        결제 내역 관리
      </Heading>

      <Text mb={4} fontSize="sm" color={colors.text.secondary}>
        모든 결제 및 환불 내역을 조회하고 관리합니다.
      </Text>

      {/* 통계 요약 */}
      <Flex gap={4} mb={6} wrap="wrap">
        <Card.Root flex="1" minW="200px" p={4}>
          <Card.Body>
            <Flex align="center" gap={3}>
              <CreditCardIcon size={24} color={colors.primary.default} />
              <Box>
                <Text fontSize="sm" color={colors.text.secondary}>
                  총 결제 금액
                </Text>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color={colors.primary.default}
                >
                  {formatCurrency(paymentStats.totalAmount)}
                </Text>
              </Box>
            </Flex>
          </Card.Body>
        </Card.Root>

        <Card.Root flex="1" minW="200px" p={4}>
          <Card.Body>
            <Flex align="center" gap={3}>
              <RefreshCwIcon size={24} color="red.500" />
              <Box>
                <Text fontSize="sm" color={colors.text.secondary}>
                  총 환불 금액
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="red.500">
                  {formatCurrency(paymentStats.totalRefunded)}
                </Text>
              </Box>
            </Flex>
          </Card.Body>
        </Card.Root>

        <Card.Root flex="1" minW="200px" p={4}>
          <Card.Body>
            <Box>
              <Text fontSize="sm" color={colors.text.secondary}>
                결제 건수
              </Text>
              <Text fontSize="xl" fontWeight="bold">
                {paymentStats.totalCount}건
              </Text>
              <Text fontSize="sm" color={colors.text.secondary}>
                환불 {paymentStats.refundCount}건
              </Text>
            </Box>
          </Card.Body>
        </Card.Root>
      </Flex>

      {/* 탭 인터페이스 */}
      <Tabs.Root defaultValue="payments">
        <Tabs.List mb={6}>
          <Tabs.Trigger value="payments">결제 내역</Tabs.Trigger>
          <Tabs.Trigger value="refunds">환불 내역</Tabs.Trigger>
        </Tabs.List>

        {/* 결제 내역 탭 */}
        <Tabs.Content value="payments">
          {/* 필터 섹션 */}
          <Fieldset.Root size="md" mb={6}>
            <Fieldset.Legend>검색 및 필터</Fieldset.Legend>

            <Fieldset.Content>
              <Flex gap={4} wrap="wrap" align="end">
                <Field.Root flex="1" minW="200px">
                  <Field.Label>검색 (이름/아이디/TID)</Field.Label>
                  <Flex gap={2}>
                    <Input
                      placeholder="검색어를 입력하세요"
                      value={paymentFilters.searchTerm}
                      onChange={(e) =>
                        setPaymentFilters((prev) => ({
                          ...prev,
                          searchTerm: e.target.value,
                        }))
                      }
                    />
                    <IconButton variant="outline">
                      <SearchIcon size={16} />
                    </IconButton>
                  </Flex>
                </Field.Root>

                <Field.Root>
                  <Field.Label>결제상태</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={paymentFilters.status}
                      onChange={(e) =>
                        setPaymentFilters((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                    >
                      <For each={statusOptions}>
                        {(option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        )}
                      </For>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>

                <Field.Root>
                  <Field.Label>기간</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={paymentFilters.period}
                      onChange={(e) =>
                        setPaymentFilters((prev) => ({
                          ...prev,
                          period: e.target.value,
                        }))
                      }
                    >
                      <For each={periodOptions}>
                        {(option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        )}
                      </For>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>

                <Button
                  colorScheme="green"
                  variant="outline"
                  onClick={handleExportPayments}
                >
                  <DownloadIcon size={16} />
                  엑셀 다운로드
                </Button>
              </Flex>

              {paymentFilters.period === "custom" && (
                <Flex gap={4} mt={4}>
                  <Field.Root>
                    <Field.Label>시작일</Field.Label>
                    <Input
                      type="date"
                      value={paymentFilters.startDate}
                      onChange={(e) =>
                        setPaymentFilters((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>종료일</Field.Label>
                    <Input
                      type="date"
                      value={paymentFilters.endDate}
                      onChange={(e) =>
                        setPaymentFilters((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </Field.Root>
                </Flex>
              )}
            </Fieldset.Content>
          </Fieldset.Root>

          {/* 결제 내역 테이블 */}
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>TID</Table.ColumnHeader>
                  <Table.ColumnHeader>회원정보</Table.ColumnHeader>
                  <Table.ColumnHeader>강습명</Table.ColumnHeader>
                  <Table.ColumnHeader>결제금액</Table.ColumnHeader>
                  <Table.ColumnHeader>환불금액</Table.ColumnHeader>
                  <Table.ColumnHeader>결제일시</Table.ColumnHeader>
                  <Table.ColumnHeader>상태</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredPayments.map((payment) => (
                  <Table.Row key={payment.paymentId}>
                    <Table.Cell>
                      <Text
                        fontSize="sm"
                        fontFamily="mono"
                        color={colors.primary.default}
                      >
                        {payment.tid}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Stack gap={1}>
                        <Text fontWeight="medium">{payment.userName}</Text>
                        <Text fontSize="xs" color={colors.text.secondary}>
                          {payment.userId}
                        </Text>
                      </Stack>
                    </Table.Cell>
                    <Table.Cell>{payment.lessonTitle}</Table.Cell>
                    <Table.Cell>
                      <Text
                        fontWeight="semibold"
                        color={colors.primary.default}
                      >
                        {formatCurrency(payment.paidAmount)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      {payment.refundedAmount > 0 ? (
                        <Text fontWeight="semibold" color="red.500">
                          {formatCurrency(payment.refundedAmount)}
                        </Text>
                      ) : (
                        <Text color={colors.text.secondary}>-</Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>{formatDateTime(payment.paidAt)}</Table.Cell>
                    <Table.Cell>
                      {getPaymentStatusBadge(payment.status)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Tabs.Content>

        {/* 환불 내역 탭 */}
        <Tabs.Content value="refunds">
          {/* 필터 섹션 */}
          <Fieldset.Root size="md" mb={6}>
            <Fieldset.Legend>검색 및 필터</Fieldset.Legend>

            <Fieldset.Content>
              <Flex gap={4} wrap="wrap" align="end">
                <Field.Root flex="1" minW="200px">
                  <Field.Label>검색 (이름/아이디/TID)</Field.Label>
                  <Flex gap={2}>
                    <Input
                      placeholder="검색어를 입력하세요"
                      value={refundFilters.searchTerm}
                      onChange={(e) =>
                        setRefundFilters((prev) => ({
                          ...prev,
                          searchTerm: e.target.value,
                        }))
                      }
                    />
                    <IconButton variant="outline">
                      <SearchIcon size={16} />
                    </IconButton>
                  </Flex>
                </Field.Root>

                <Field.Root>
                  <Field.Label>처리상태</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={refundFilters.status}
                      onChange={(e) =>
                        setRefundFilters((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                    >
                      <For each={refundStatusOptions}>
                        {(option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        )}
                      </For>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>

                <Button
                  colorScheme="green"
                  variant="outline"
                  onClick={handleExportRefunds}
                >
                  <DownloadIcon size={16} />
                  엑셀 다운로드
                </Button>
              </Flex>
            </Fieldset.Content>
          </Fieldset.Root>

          {/* 환불 내역 테이블 */}
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>TID</Table.ColumnHeader>
                  <Table.ColumnHeader>회원정보</Table.ColumnHeader>
                  <Table.ColumnHeader>강습명</Table.ColumnHeader>
                  <Table.ColumnHeader>환불금액</Table.ColumnHeader>
                  <Table.ColumnHeader>환불사유</Table.ColumnHeader>
                  <Table.ColumnHeader>처리일시</Table.ColumnHeader>
                  <Table.ColumnHeader>상태</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredRefunds.map((refund) => (
                  <Table.Row key={refund.refundId}>
                    <Table.Cell>
                      <Text
                        fontSize="sm"
                        fontFamily="mono"
                        color={colors.primary.default}
                      >
                        {refund.tid}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Stack gap={1}>
                        <Text fontWeight="medium">{refund.userName}</Text>
                        <Text fontSize="xs" color={colors.text.secondary}>
                          {refund.userId}
                        </Text>
                      </Stack>
                    </Table.Cell>
                    <Table.Cell>{refund.lessonTitle}</Table.Cell>
                    <Table.Cell>
                      <Text fontWeight="semibold" color="red.500">
                        {formatCurrency(refund.refundAmount)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm">{refund.reason}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      {formatDateTime(refund.processedAt)}
                    </Table.Cell>
                    <Table.Cell>
                      {getRefundStatusBadge(refund.status)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Tabs.Content>
      </Tabs.Root>

      <Box mt={6}>
        <Text fontSize="sm" color={colors.text.secondary}>
          결제 내역: {filteredPayments.length}건 | 환불 내역:{" "}
          {filteredRefunds.length}건
        </Text>
      </Box>
    </Box>
  );
};
