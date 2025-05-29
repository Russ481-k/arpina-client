"use client";

import React, { useState, useMemo, useRef } from "react";
import { Box, Text, Stack, Badge, Flex } from "@chakra-ui/react";
import { CreditCardIcon } from "lucide-react"; // Keep if used by a renderer
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
// import type { PaymentData } from "@/types/models"; // Assuming PaymentData is moved to a shared model type definition

// Define PaymentData locally for now, can be moved to a shared type later
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

interface PaymentsViewProps {
  payments: PaymentData[];
  lessonIdFilter?: number | null;
  agGridTheme: string;
  bg: string;
  textColor: string;
  borderColor: string;
  // Pass any other shared props like colors if needed by renderers
}

// Shared utility or helper functions (consider moving to a common file)
const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
};

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// PaymentMethodCellRenderer (can be part of this file or shared)
const PaymentMethodCellRenderer: React.FC<
  ICellRendererParams<PaymentData, string>
> = (params) => {
  if (!params.value) return null;
  let paymentMethodText = params.value;
  if (params.value.toUpperCase() === "CARD") {
    paymentMethodText = "카드결제";
  } else if (params.value.toUpperCase() === "TRANSFER") {
    paymentMethodText = "계좌이체";
  }
  return (
    <Flex align="center" h="100%">
      {params.value.toUpperCase() === "CARD" && (
        <CreditCardIcon size={16} style={{ marginRight: "4px" }} />
      )}
      <Text fontSize="sm">{paymentMethodText}</Text>
    </Flex>
  );
};

// PaymentStatusCellRenderer (can be part of this file or shared)
const PaymentStatusCellRenderer: React.FC<
  ICellRendererParams<PaymentData, PaymentData["status"]>
> = (params) => {
  if (!params.value) return null;
  const statusConfig = {
    PAID: { colorPalette: "green", label: "결제완료" },
    PARTIALLY_REFUNDED: { colorPalette: "yellow", label: "부분환불" },
    FULLY_REFUNDED: { colorPalette: "red", label: "전액환불" },
    CANCELED: { colorPalette: "gray", label: "취소" }, // Assuming CANCELED is a valid status
  };
  const config = statusConfig[params.value as keyof typeof statusConfig] || {
    colorPalette: "gray",
    label: params.value,
  };
  return (
    <Badge colorPalette={config.colorPalette} variant="solid" size="sm">
      {config.label}
    </Badge>
  );
};

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  lessonIdFilter,
  agGridTheme,
  bg,
  textColor,
  borderColor,
}) => {
  const paymentGridRef = useRef<AgGridReact<PaymentData>>(null);
  const [paymentFilters, setPaymentFilters] = useState({
    searchTerm: "",
    status: "",
    period: "all", // "all", "today", "week", "month", "custom"
    startDate: "",
    endDate: "",
  });

  const statusOptions = [
    { value: "", label: "전체" },
    { value: "PAID", label: "결제완료" },
    { value: "PARTIALLY_REFUNDED", label: "부분환불" },
    { value: "FULLY_REFUNDED", label: "전액환불" },
    { value: "CANCELED", label: "취소" },
  ];

  const periodOptions = [
    { value: "all", label: "전체" },
    { value: "today", label: "오늘" },
    { value: "week", label: "최근 7일" },
    { value: "month", label: "최근 30일" },
    { value: "custom", label: "기간 선택" },
  ];

  const handleExportPayments = () => {
    paymentGridRef.current?.api.exportDataAsCsv();
  };

  const filteredPayments = useMemo(() => {
    let data = [...payments]; // Create a new array to avoid mutating the prop
    if (lessonIdFilter) {
      data = data.filter((p) => p.lessonId === lessonIdFilter);
    }
    // Apply date filters based on period, startDate, endDate
    // This part needs careful implementation based on actual date objects
    if (paymentFilters.period !== "all" && paymentFilters.period !== "custom") {
      const now = new Date();
      let pastDate = new Date(now);
      if (paymentFilters.period === "today") {
        pastDate.setHours(0, 0, 0, 0);
      } else if (paymentFilters.period === "week") {
        pastDate.setDate(now.getDate() - 7);
        pastDate.setHours(0, 0, 0, 0);
      } else if (paymentFilters.period === "month") {
        pastDate.setMonth(now.getMonth() - 1);
        pastDate.setHours(0, 0, 0, 0);
      }
      data = data.filter(
        (p) => new Date(p.paidAt) >= pastDate && new Date(p.paidAt) <= now
      ); // ensure it's not in future
    } else if (
      paymentFilters.period === "custom" &&
      paymentFilters.startDate &&
      paymentFilters.endDate
    ) {
      const start = new Date(paymentFilters.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(paymentFilters.endDate);
      end.setHours(23, 59, 59, 999);
      data = data.filter((p) => {
        const paidDate = new Date(p.paidAt);
        return paidDate >= start && paidDate <= end;
      });
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

  const paymentColDefs = useMemo<ColDef<PaymentData>[]>(
    () => [
      { headerName: "주문ID", field: "tid", width: 180, sortable: true },
      { headerName: "이름", field: "userName", flex: 1, minWidth: 120 },
      { headerName: "핸드폰 번호", field: "userPhone", flex: 1, minWidth: 130 },
      { headerName: "강습명", field: "lessonTitle", flex: 1.5, minWidth: 250 },
      {
        headerName: "결제금액",
        field: "paidAmount",
        valueFormatter: (params) => formatCurrency(params.value),
        width: 120,
        cellStyle: { justifyContent: "flex-end" },
      },
      {
        headerName: "환불금액",
        field: "refundedAmount",
        valueFormatter: (params) => formatCurrency(params.value),
        width: 120,
        cellStyle: { justifyContent: "flex-end" },
      },
      {
        headerName: "결제수단",
        field: "paymentMethod",
        cellRenderer: PaymentMethodCellRenderer,
        width: 120,
        cellStyle: { justifyContent: "center" },
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
        cellStyle: { justifyContent: "center" },
      },
    ],
    []
  );

  const paymentDefaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      filter: false,
      sortable: true,
      cellStyle: { fontSize: "13px", display: "flex", alignItems: "center" },
    }),
    []
  );

  return (
    <Stack gap={4}>
      <CommonGridFilterBar
        searchTerm={paymentFilters.searchTerm}
        onSearchTermChange={(e) =>
          setPaymentFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
        }
        searchTermPlaceholder="검색 (이름/번호/주문ID)"
        onExport={handleExportPayments}
        exportButtonLabel="엑셀 다운로드" // Added label
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
          onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setPaymentFilters((prev) => ({
              ...prev,
              startDate: e.target.value,
            })),
          endDate: paymentFilters.endDate,
          onEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setPaymentFilters((prev) => ({ ...prev, endDate: e.target.value })),
        }}
        onSearchButtonClick={() => {
          console.log("Search payments with filters:", paymentFilters);
        }}
        showSearchButton={true}
      />

      <Box className={agGridTheme} maxH="480px" w="full">
        {" "}
        {/* Adjusted height considering filters might take more space */}
        <AgGridReact<PaymentData>
          ref={paymentGridRef}
          rowData={filteredPayments}
          columnDefs={paymentColDefs}
          defaultColDef={paymentDefaultColDef}
          domLayout="normal" // Changed from autoHeight for better performance with fixed height container
          headerHeight={36}
          rowHeight={40}
          suppressCellFocus={true}
          getRowStyle={() => ({
            color: textColor,
            background: bg,
            borderBottom: `1px solid ${borderColor}`,
          })}
          animateRows={true}
        />
      </Box>
    </Stack>
  );
};
