"use client";

import React, { useState, useMemo } from "react";
import { Box, Tabs, Spinner, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

// Import types from the global API types file
import type {
  AdminPaymentData,
  // AdminRefundData, // Removed: No longer fetching separate refund data
  PaginatedResponse, // This is the outer wrapper { success, message, data: PaginatedData<T> }
  PaginatedData, // This is the inner data { content: T[], pageable, ... }
  // PaymentStatusType and RefundStatusType are already used by AdminPaymentData/AdminRefundData
  // and will be available if needed directly.
} from "@/types/api";

// Import the API service
import { adminApi } from "@/lib/api/adminApi"; // Adjust path if necessary

import { PaymentsView } from "./paymentHistory/PaymentsView";
import { RefundsView } from "./paymentHistory/RefundsView";
import { useColorMode } from "@/components/ui/color-mode";
import "@/styles/ag-grid-custom.css";

// Local type definitions (PaymentStatusType, RefundStatusType, PaymentData, RefundData, Page) are REMOVED.

// API service functions (fetchAdminPayments, fetchAdminRefunds, apiClient) are REMOVED.

interface PaymentHistoryTabProps {
  lessonIdFilter?: number | null;
  // Add pagination state if managed here, e.g.:
  // currentPage: number;
  // pageSize: number;
  // onPageChange: (page: number) => void;
  // onPageSizeChange: (size: number) => void;
}

export const PaymentHistoryTab = ({
  lessonIdFilter,
}: PaymentHistoryTabProps) => {
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState<"payments" | "refunds">(
    "payments"
  );
  // TODO: Implement pagination state and pass to query functions if needed
  const [paymentsCurrentPage /* setPaymentsCurrentPage */] = useState(0);
  const [paymentsPageSize /* setPaymentsPageSize */] = useState(100); // Default size

  const bg = colorMode === "dark" ? "#1A202C" : "white";
  const textColor = colorMode === "dark" ? "#E2E8F0" : "#2D3748";
  const borderColor = colorMode === "dark" ? "#2D3748" : "#E2E8F0";
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const {
    data: paymentsApiResponse,
    isLoading: isLoadingPayments,
    error: errorPayments,
  } = useQuery<PaginatedResponse<AdminPaymentData>, Error>({
    queryKey: [
      "adminPaymentHistory",
      lessonIdFilter,
      paymentsCurrentPage,
      paymentsPageSize,
    ],
    queryFn: () =>
      adminApi.getAdminPaymentHistory({
        lessonId: lessonIdFilter ?? undefined,
        page: paymentsCurrentPage,
        size: paymentsPageSize,
      }),
  });

  const payments: AdminPaymentData[] = useMemo(
    () => paymentsApiResponse?.data.content || [],
    [paymentsApiResponse]
  );
  // Derive refund-related data from the payments list
  const paymentsForRefundView: AdminPaymentData[] = useMemo(() => {
    if (!payments) return [];
    return payments.filter(
      (payment) =>
        payment.status === "PARTIAL_REFUNDED" ||
        payment.status === "CANCELED" || // Assuming CANCELED implies a refund of a previously paid amount
        (payment.refundedAmount != null && payment.refundedAmount > 0)
    );
  }, [payments]);

  return (
    <Box h="full" display="flex" flexDirection="column">
      <Tabs.Root
        value={activeTab}
        onValueChange={(e) => setActiveTab(e.value as "payments" | "refunds")}
      >
        <Tabs.List>
          <Tabs.Trigger value="payments">결제 내역</Tabs.Trigger>
          <Tabs.Trigger value="refunds">환불 내역</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="payments">
          {isLoadingPayments && (
            <Box textAlign="center" p={10}>
              <Spinner size="xl" />
              <Text mt={2}>결제 내역을 불러오는 중...</Text>
            </Box>
          )}
          {errorPayments && !isLoadingPayments && (
            <Box p={4} bg="red.50" borderRadius="md" color="red.700">
              <Text fontWeight="bold">오류 발생</Text>
              <Text>
                결제 내역을 불러오는데 실패했습니다: {errorPayments.message}
              </Text>
            </Box>
          )}
          {!isLoadingPayments && !errorPayments && (
            <PaymentsView
              payments={payments}
              lessonIdFilter={lessonIdFilter}
              agGridTheme={agGridTheme}
              bg={bg}
              textColor={textColor}
              borderColor={borderColor}
            />
          )}
        </Tabs.Content>

        <Tabs.Content value="refunds">
          {isLoadingPayments && (
            <Box textAlign="center" p={10}>
              <Spinner size="xl" />
              <Text mt={2}>환불 내역을 불러오는 중...</Text>
            </Box>
          )}
          {errorPayments && !isLoadingPayments && (
            <Box p={4} bg="red.50" borderRadius="md" color="red.700">
              <Text fontWeight="bold">오류 발생</Text>
              <Text>
                환불 내역을 불러오는데 실패했습니다: {errorPayments.message}
              </Text>
            </Box>
          )}
          {!isLoadingPayments && !errorPayments && (
            <RefundsView
              paymentsForRefundView={paymentsForRefundView}
              lessonIdFilter={lessonIdFilter}
              agGridTheme={agGridTheme}
              bg={bg}
              textColor={textColor}
              borderColor={borderColor}
            />
          )}
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};
