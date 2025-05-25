"use client";

import React, { useState, useMemo } from "react";
import { Box, Text, Stack, Badge, Flex, Tabs } from "@chakra-ui/react";
import { CreditCardIcon } from "lucide-react";
import { useColors } from "@/styles/theme";
import { AgGridReact } from "ag-grid-react";
import {
  type ColDef,
  ModuleRegistry,
  AllCommunityModule,
  type ICellRendererParams,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@/styles/ag-grid-custom.css";
import { useColorMode } from "@/components/ui/color-mode";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";

ModuleRegistry.registerModules([AllCommunityModule]);

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
}

export const PaymentHistoryTab = ({
  lessonIdFilter,
}: PaymentHistoryTabProps) => {
  const colors = useColors();
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState<"payments" | "refunds">(
    "payments"
  );
  const paymentGridRef = React.useRef<AgGridReact<PaymentData>>(null);
  const refundGridRef = React.useRef<AgGridReact<RefundData>>(null);

  // Mock data
  const mockPayments: PaymentData[] = [
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
  ];

  const mockRefunds: RefundData[] = [
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
  ];

  const [payments, setPayments] = useState<PaymentData[]>(mockPayments);
  const [refunds, setRefunds] = useState<RefundData[]>(mockRefunds);

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
    paymentGridRef.current?.api.exportDataAsCsv();
    console.log("결제 내역 CSV 다운로드 (AG Grid)");
  };

  const handleExportRefunds = () => {
    refundGridRef.current?.api.exportDataAsCsv();
    console.log("환불 내역 CSV 다운로드 (AG Grid)");
  };

  const filteredPayments = useMemo(() => {
    let data = payments;
    if (lessonIdFilter) {
      data = data.filter((p) => p.lessonId === lessonIdFilter);
    }
    return data.filter((payment) => {
      const searchTermLower = paymentFilters.searchTerm.toLowerCase();
      const matchesSearch =
        payment.userName.toLowerCase().includes(searchTermLower) ||
        (payment.userPhone && payment.userPhone.includes(searchTermLower)) ||
        payment.tid.toLowerCase().includes(searchTermLower);

      const matchesStatus =
        !paymentFilters.status || payment.status === paymentFilters.status;

      return matchesSearch && matchesStatus;
    });
  }, [payments, paymentFilters, lessonIdFilter]);

  const filteredRefunds = useMemo(() => {
    let data = refunds;
    if (lessonIdFilter) {
      data = data.filter((r) => r.lessonId === lessonIdFilter);
    }
    return data.filter((refund) => {
      const searchTermLower = refundFilters.searchTerm.toLowerCase();
      const matchesSearch =
        refund.userName.toLowerCase().includes(searchTermLower) ||
        (refund.userPhone && refund.userPhone.includes(searchTermLower)) ||
        refund.tid.toLowerCase().includes(searchTermLower);

      const matchesStatus =
        !refundFilters.status || refund.status === refundFilters.status;

      return matchesSearch && matchesStatus;
    });
  }, [refunds, refundFilters, lessonIdFilter]);

  const bg = colorMode === "dark" ? "#1A202C" : "white";
  const textColor = colorMode === "dark" ? "#E2E8F0" : "#2D3748";
  const borderColor = colorMode === "dark" ? "#2D3748" : "#E2E8F0";
  const primaryColor = colors.primary?.default || "#2a7fc1";
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  // 통계 계산
  const paymentStats = useMemo(() => {
    const currentData = lessonIdFilter
      ? payments.filter((p) => p.lessonId === lessonIdFilter)
      : payments;
    return {
      totalAmount: currentData.reduce((sum, p) => sum + p.paidAmount, 0),
      totalRefunded: currentData.reduce((sum, p) => sum + p.refundedAmount, 0),
      totalCount: currentData.length,
      refundCount: refunds.length,
    };
  }, [payments, refunds, lessonIdFilter]);

  // PaymentMethodCellRenderer
  const PaymentMethodCellRenderer: React.FC<
    ICellRendererParams<PaymentData, string>
  > = (params) => {
    if (!params.value) return null;
    // Simple text display for now, can be enhanced with icons
    let paymentMethodText = params.value;
    if (params.value.toUpperCase() === "CARD") {
      paymentMethodText = "카드결제";
    } else if (params.value.toUpperCase() === "TRANSFER") {
      paymentMethodText = "계좌이체";
    }
    // Could add a <CreditCardIcon /> or similar based on value
    return (
      <Flex align="center" h="100%">
        {params.value.toUpperCase() === "CARD" && (
          <CreditCardIcon size={16} style={{ marginRight: "4px" }} />
        )}
        <Text fontSize="sm">{paymentMethodText}</Text>
      </Flex>
    );
  };

  // NEW: PaymentStatusCellRenderer
  const PaymentStatusCellRenderer: React.FC<
    ICellRendererParams<PaymentData, PaymentData["status"]>
  > = (params) => {
    if (!params.value) return null;
    const statusConfig = {
      PAID: { colorScheme: "green", label: "결제완료" },
      PARTIALLY_REFUNDED: { colorScheme: "yellow", label: "부분환불" },
      FULLY_REFUNDED: { colorScheme: "red", label: "전액환불" },
      CANCELED: { colorScheme: "gray", label: "취소" },
    };
    const config = statusConfig[params.value as keyof typeof statusConfig] || {
      colorScheme: "gray",
      label: params.value,
    };
    return (
      <Badge colorScheme={config.colorScheme} variant="solid" size="sm">
        {config.label}
      </Badge>
    );
  };

  // NEW: RefundStatusCellRenderer
  const RefundStatusCellRenderer: React.FC<
    ICellRendererParams<RefundData, RefundData["status"]>
  > = (params) => {
    if (!params.value) return null;
    const statusConfig = {
      COMPLETED: { colorScheme: "green", label: "완료" },
      PENDING: { colorScheme: "yellow", label: "처리중" },
      FAILED: { colorScheme: "red", label: "실패" },
    };
    const config = statusConfig[params.value as keyof typeof statusConfig] || {
      colorScheme: "gray",
      label: params.value,
    };
    return (
      <Badge colorScheme={config.colorScheme} variant="solid" size="sm">
        {config.label}
      </Badge>
    );
  };

  // ColDefs for Payments Table
  const paymentColDefs = useMemo<ColDef<PaymentData>[]>(
    () => [
      { headerName: "주문ID", field: "tid", width: 180, sortable: true },
      {
        headerName: "이름",
        field: "userName",
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "핸드폰 번호",
        field: "userPhone",
        flex: 1,
        minWidth: 130,
      },
      {
        headerName: "강습명",
        field: "lessonTitle",
        flex: 1.5,
        minWidth: 250,
      },
      {
        headerName: "결제금액",
        field: "paidAmount",
        valueFormatter: (params) => formatCurrency(params.value),
        width: 120,
        cellStyle: {
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        },
      },
      {
        headerName: "환불금액",
        field: "refundedAmount",
        valueFormatter: (params) => formatCurrency(params.value),
        width: 120,
        cellStyle: {
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        },
      },
      {
        headerName: "결제수단",
        field: "paymentMethod",
        cellRenderer: PaymentMethodCellRenderer,
        width: 120,
        cellStyle: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      },
      {
        headerName: "결제일시",
        field: "paidAt",
        valueFormatter: (params) => formatDateTime(params.value),
        width: 180,
      },
      {
        headerName: "상태",
        field: "status",
        cellRenderer: PaymentStatusCellRenderer,
        width: 100,
        cellStyle: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formatCurrency, formatDateTime] // Add stable dependencies
  );

  const paymentDefaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      filter: false,
      sortable: true,
      cellStyle: {
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
      },
    }),
    []
  );

  // ColDefs for Refunds Table
  const refundColDefs = useMemo<ColDef<RefundData>[]>(
    () => [
      { headerName: "주문ID", field: "tid", width: 180, sortable: true },
      {
        headerName: "이름",
        field: "userName",
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "핸드폰 번호",
        field: "userPhone",
        flex: 1,
        minWidth: 130,
      },
      {
        headerName: "강습명",
        field: "lessonTitle",
        flex: 1.5,
        minWidth: 250,
      },
      {
        headerName: "환불금액",
        field: "refundAmount",
        valueFormatter: (params) => formatCurrency(params.value),
        width: 120,
        cellStyle: {
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        },
      },
      {
        headerName: "환불유형",
        field: "refundType", // Assuming refundType exists (e.g. PARTIAL, FULL)
        width: 100,
        cellStyle: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      },
      {
        headerName: "환불사유",
        field: "refundReason",
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: "처리일시",
        field: "refundedAt",
        valueFormatter: (params) => formatDateTime(params.value),
        width: 180,
      },
      {
        headerName: "처리자",
        field: "adminName",
        width: 100,
      },
      {
        headerName: "상태",
        field: "status",
        cellRenderer: RefundStatusCellRenderer,
        width: 100,
        cellStyle: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formatCurrency, formatDateTime] // Add stable dependencies
  );

  const refundDefaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      filter: false,
      sortable: true,
      cellStyle: {
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
      },
    }),
    []
  );

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
          <Stack gap={4}>
            <CommonGridFilterBar
              searchTerm={paymentFilters.searchTerm}
              onSearchTermChange={(e) =>
                setPaymentFilters((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                }))
              }
              searchTermPlaceholder="검색 (이름/번호/주문ID)"
              onExport={handleExportPayments}
              selectFilters={[
                {
                  id: "paymentStatusFilter",
                  label: "결제상태",
                  value: paymentFilters.status,
                  onChange: (e) =>
                    setPaymentFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    })),
                  options: statusOptions,
                  placeholder: "전체",
                },
                {
                  id: "paymentPeriodFilter",
                  label: "기간",
                  value: paymentFilters.period,
                  onChange: (e) =>
                    setPaymentFilters((prev) => ({
                      ...prev,
                      period: e.target.value,
                    })),
                  options: periodOptions,
                },
              ]}
              dateFilters={{
                show: paymentFilters.period === "custom",
                startDate: paymentFilters.startDate,
                onStartDateChange: (e) =>
                  setPaymentFilters((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  })),
                endDate: paymentFilters.endDate,
                onEndDateChange: (e) =>
                  setPaymentFilters((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  })),
              }}
              onSearchButtonClick={() => {
                // Placeholder for actual search trigger
                console.log("Search payments with filters:", paymentFilters);
              }}
              showSearchButton={true}
            />

            <Box className={agGridTheme} h="calc(100vh - 400px)" w="full">
              <AgGridReact<PaymentData>
                ref={paymentGridRef}
                rowData={filteredPayments}
                columnDefs={paymentColDefs}
                defaultColDef={paymentDefaultColDef}
                domLayout="autoHeight"
                headerHeight={36}
                rowHeight={40}
                suppressCellFocus={true}
                getRowStyle={() => ({
                  color: textColor,
                  background: bg,
                  borderBottom: `1px solid ${borderColor}`,
                  display: "flex",
                  alignItems: "center",
                })}
                animateRows={true}
              />
            </Box>
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="refunds">
          <Stack gap={4}>
            <CommonGridFilterBar
              searchTerm={refundFilters.searchTerm}
              onSearchTermChange={(e) =>
                setRefundFilters((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                }))
              }
              searchTermPlaceholder="검색 (이름/번호/주문ID)"
              onExport={handleExportRefunds}
              selectFilters={[
                {
                  id: "refundStatusFilter",
                  label: "환불상태",
                  value: refundFilters.status,
                  onChange: (e) =>
                    setRefundFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    })),
                  options: refundStatusOptions,
                  placeholder: "전체",
                },
                {
                  id: "refundPeriodFilter",
                  label: "기간",
                  value: refundFilters.period,
                  onChange: (e) =>
                    setRefundFilters((prev) => ({
                      ...prev,
                      period: e.target.value,
                    })),
                  options: periodOptions,
                },
              ]}
              onSearchButtonClick={() => {
                // Placeholder for actual search trigger
                console.log("Search refunds with filters:", refundFilters);
              }}
              showSearchButton={true}
            />
            <Box className={agGridTheme} h="calc(100vh - 400px)" w="full">
              <AgGridReact<RefundData>
                ref={refundGridRef}
                rowData={filteredRefunds}
                columnDefs={refundColDefs}
                defaultColDef={refundDefaultColDef}
                domLayout="autoHeight"
                headerHeight={36}
                rowHeight={40}
                suppressCellFocus={true}
                getRowStyle={() => ({
                  color: textColor,
                  background: bg,
                  borderBottom: `1px solid ${borderColor}`,
                  display: "flex",
                  alignItems: "center",
                })}
                animateRows={true}
              />
            </Box>
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};
