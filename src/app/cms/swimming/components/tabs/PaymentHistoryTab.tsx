"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  // Text, Stack, Badge, Flex, - These are likely used within sub-components now or not at all at this level
  Tabs,
} from "@chakra-ui/react";
// import { CreditCardIcon } from "lucide-react"; // Moved to PaymentsView
import { useColors } from "@/styles/theme";
// import { AgGridReact } from "ag-grid-react"; // Moved to sub-components
// import type { ColDef, ModuleRegistry, AllCommunityModule, ICellRendererParams } from "ag-grid-community"; // Moved

import "@/styles/ag-grid-custom.css";
import { useColorMode } from "@/components/ui/color-mode";
// import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar"; // Moved to sub-components

// Import the new view components
import { PaymentsView } from "./paymentHistory/PaymentsView";
import { RefundsView } from "./paymentHistory/RefundsView";

// ModuleRegistry.registerModules([AllCommunityModule]); // Only register once, perhaps in a global setup or root layout

// Define types locally or import from a shared location (e.g., @/types/api or @/types/models)
interface PaymentData {
  paymentId: number;
  enrollId: number;
  lessonId: number;
  tid: string;
  userName: string;
  userPhone?: string;
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
  lessonId: number;
  tid: string;
  userName: string;
  userPhone?: string;
  lessonTitle: string;
  refundAmount: number;
  refundType: string;
  refundedAt: string;
  adminName: string;
  refundReason?: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
}

interface PaymentHistoryTabProps {
  lessonIdFilter?: number | null;
  // Potentially pass down fetched data if this component is responsible for fetching
  // mockPaymentsData?: PaymentData[];
  // mockRefundsData?: RefundData[];
}

export const PaymentHistoryTab = ({
  lessonIdFilter,
}: PaymentHistoryTabProps) => {
  const colors = useColors(); // Keep if needed for styling common elements, otherwise can be removed
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState<"payments" | "refunds">(
    "payments"
  );

  // Mock data - In a real app, this would come from props or a TanStack Query hook here
  const mockPayments: PaymentData[] = useMemo(
    () => [
      {
        paymentId: 1,
        enrollId: 101,
        lessonId: 1,
        tid: "T1234567890",
        userName: "김결제",
        userPhone: "010-1111-2222",
        lessonTitle: "초급반 A (월수금 09:00)",
        paidAmount: 70000,
        refundedAmount: 0,
        paymentMethod: "CARD",
        paidAt: "2023-11-10 09:30:15",
        status: "PAID",
      },
      {
        paymentId: 2,
        enrollId: 102,
        lessonId: 2,
        tid: "T0987654321",
        userName: "이납부",
        userPhone: "010-3333-4444",
        lessonTitle: "중급반 B (화목 10:00)",
        paidAmount: 85000,
        refundedAmount: 20000,
        paymentMethod: "CARD",
        paidAt: "2023-11-12 14:05:40",
        status: "PARTIALLY_REFUNDED",
      },
      {
        paymentId: 3,
        enrollId: 103,
        lessonId: 1,
        tid: "T1122334455",
        userName: "박송금",
        userPhone: undefined,
        lessonTitle: "초급반 A (월수금 09:00)",
        paidAmount: 65000,
        refundedAmount: 65000,
        paymentMethod: "CARD",
        paidAt: "2023-10-20 11:15:00",
        refundAt: "2023-10-25 10:00:00",
        status: "FULLY_REFUNDED",
      },
    ],
    []
  );

  const mockRefunds: RefundData[] = useMemo(
    () => [
      {
        refundId: 1,
        paymentId: 2,
        enrollId: 102,
        lessonId: 2,
        tid: "T0987654321",
        userName: "이납부",
        userPhone: "010-3333-4444",
        lessonTitle: "중급반 B (화목 10:00)",
        refundAmount: 20000,
        refundType: "PARTIAL",
        refundedAt: "2023-11-18 10:00:00",
        adminName: "관리자A",
        refundReason: "일부 강습 취소",
        status: "COMPLETED",
      },
      {
        refundId: 2,
        paymentId: 3,
        enrollId: 103,
        lessonId: 1,
        tid: "T1122334455",
        userName: "박송금",
        userPhone: undefined,
        lessonTitle: "초급반 A (월수금 09:00)",
        refundAmount: 65000,
        refundType: "FULL",
        refundedAt: "2023-10-25 10:00:00",
        adminName: "관리자B",
        refundReason: "전체 강습 취소",
        status: "COMPLETED",
      },
    ],
    []
  );

  // State for actual data (if fetched here)
  // const [payments, setPayments] = useState<PaymentData[]>(mockPayments);
  // const [refunds, setRefunds] = useState<RefundData[]>(mockRefunds);
  // Replace useState with useQuery if fetching data within this component
  // Example:
  // const { data: paymentsData } = useQuery({ queryKey: ['payments', lessonIdFilter], queryFn: fetchPayments });
  // const { data: refundsData } = useQuery({ queryKey: ['refunds', lessonIdFilter], queryFn: fetchRefunds });

  const bg = colorMode === "dark" ? "#1A202C" : "white";
  const textColor = colorMode === "dark" ? "#E2E8F0" : "#2D3748";
  const borderColor = colorMode === "dark" ? "#2D3748" : "#E2E8F0";
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  // Removed formatCurrency, formatDateTime, cell renderers, colDefs, defaultColDefs as they are in sub-components
  // Removed paymentFilters, refundFilters states as they are in sub-components
  // Removed handleExportPayments, handleExportRefunds, filteredPayments, filteredRefunds as they are in sub-components

  // 통계 계산 can be moved to sub-components if they only use their respective data,
  // or kept here if it needs combined data (though current example doesn't show that)
  // const paymentStats = useMemo(() => { ... });

  return (
    <Box h="full" display="flex" flexDirection="column">
      <Tabs.Root
        value={activeTab}
        onValueChange={(e) => setActiveTab(e.value as any)}
      >
        <Tabs.List>
          <Tabs.Trigger value="payments">결제 내역</Tabs.Trigger>
          <Tabs.Trigger value="refunds">환불 내역</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="payments">
          <PaymentsView
            payments={mockPayments} // Pass actual payments data here
            lessonIdFilter={lessonIdFilter}
            agGridTheme={agGridTheme}
            bg={bg}
            textColor={textColor}
            borderColor={borderColor}
          />
        </Tabs.Content>

        <Tabs.Content value="refunds">
          <RefundsView
            refunds={mockRefunds} // Pass actual refunds data here
            lessonIdFilter={lessonIdFilter}
            agGridTheme={agGridTheme}
            bg={bg}
            textColor={textColor}
            borderColor={borderColor}
          />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};
