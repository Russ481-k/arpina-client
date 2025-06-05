"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Tabs,
  Spinner, // For loading state
  Text, // For error/empty state
  // Alert, // Temporarily removed due to persistent linting issues
  // AlertIcon, // Temporarily removed
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import { PaymentsView } from "./paymentHistory/PaymentsView";
import { RefundsView } from "./paymentHistory/RefundsView";
import { useColorMode } from "@/components/ui/color-mode"; // Assuming this is the correct path
import "@/styles/ag-grid-custom.css";

// --- Status Enum-like Types ---
export type PaymentStatusType =
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "PARTIAL_REFUNDED"
  | "REFUND_REQUESTED";

export type RefundStatusType =
  | "REFUND_REQUESTED" // 환불 요청됨
  | "REFUND_PROCESSING" // 환불 처리 중
  | "REFUND_COMPLETED" // 환불 완료
  | "REFUND_REJECTED"; // 환불 거절

// --- API Service (가상, 실제로는 별도 파일로 분리) ---
const apiClient = {
  get: async (url: string, params?: any) => {
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const response = await fetch(`/api/v1${url}${queryParams}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Error fetching data from ${url}`);
    }
    return response.json();
  },
};

const fetchAdminPayments = async (
  lessonIdFilter?: number | null,
  page = 0,
  size = 100
) => {
  const params: any = { page, size };
  if (lessonIdFilter !== null && lessonIdFilter !== undefined) {
    params.lessonId = lessonIdFilter.toString();
  }
  return apiClient.get("/admin/payments", params);
};

const fetchAdminRefunds = async (
  lessonIdFilter?: number | null,
  page = 0,
  size = 100
) => {
  const params: any = { page, size };
  if (lessonIdFilter !== null && lessonIdFilter !== undefined) {
    params.lessonId = lessonIdFilter.toString();
  }
  return apiClient.get("/admin/refunds", params);
};
// --- END API Service ---

export interface PaymentData {
  paymentId: number;
  enrollId: number;
  lessonId: number;
  tid: string;
  userName: string;
  userPhone?: string;
  userId?: string;
  lessonTitle: string;
  initialAmount: number;
  paidAmount: number;
  discountAmount?: number;
  refundedAmount: number;
  paymentMethod: string;
  paymentGateway?: string;
  status: PaymentStatusType;
  paidAt: string;
  lastRefundAt?: string;
  orderNo?: string;
  memberType?: string;
  lockerFee?: number;
}

export interface RefundData {
  refundId: number;
  paymentId: number;
  enrollId: number;
  lessonId: number;
  tid: string;
  refundTid?: string;
  userName: string;
  userPhone?: string;
  userId?: string;
  lessonTitle: string;
  refundAmount: number;
  refundMethod?: string;
  refundType: string;
  status: RefundStatusType;
  reason?: string;
  adminName: string;
  requestedAt: string;
  refundedAt: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  adminMemo?: string;
}

interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

interface PaymentHistoryTabProps {
  lessonIdFilter?: number | null;
}

export const PaymentHistoryTab = ({
  lessonIdFilter,
}: PaymentHistoryTabProps) => {
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState<"payments" | "refunds">(
    "payments"
  );

  const bg = colorMode === "dark" ? "#1A202C" : "white";
  const textColor = colorMode === "dark" ? "#E2E8F0" : "#2D3748";
  const borderColor = colorMode === "dark" ? "#2D3748" : "#E2E8F0";
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const {
    data: paymentsPage,
    isLoading: isLoadingPayments,
    error: errorPayments,
  } = useQuery<Page<PaymentData>, Error>({
    queryKey: ["adminPayments", lessonIdFilter],
    queryFn: () => fetchAdminPayments(lessonIdFilter),
  });

  const {
    data: refundsPage,
    isLoading: isLoadingRefunds,
    error: errorRefunds,
  } = useQuery<Page<RefundData>, Error>({
    queryKey: ["adminRefunds", lessonIdFilter],
    queryFn: () => fetchAdminRefunds(lessonIdFilter),
  });

  const payments = useMemo(() => paymentsPage?.content || [], [paymentsPage]);
  const refunds = useMemo(() => refundsPage?.content || [], [refundsPage]);

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
              payments={payments} // Type 'PaymentData[]' from this file might be incompatible with PaymentsView's expected PaymentData type
              lessonIdFilter={lessonIdFilter}
              agGridTheme={agGridTheme}
              bg={bg}
              textColor={textColor}
              borderColor={borderColor}
            />
          )}
        </Tabs.Content>

        <Tabs.Content value="refunds">
          {isLoadingRefunds && (
            <Box textAlign="center" p={10}>
              <Spinner size="xl" />
              <Text mt={2}>환불 내역을 불러오는 중...</Text>
            </Box>
          )}
          {errorRefunds && !isLoadingRefunds && (
            <Box p={4} bg="red.50" borderRadius="md" color="red.700">
              <Text fontWeight="bold">오류 발생</Text>
              <Text>
                환불 내역을 불러오는데 실패했습니다: {errorRefunds.message}
              </Text>
            </Box>
          )}
          {!isLoadingRefunds && !errorRefunds && (
            <RefundsView
              refunds={refunds} // Type 'RefundData[]' from this file might be incompatible with RefundsView's expected RefundData type
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
