"use client";

import React, { useState, useMemo, useRef } from "react";
import { Box, Text, Stack, Badge, Flex } from "@chakra-ui/react";
import { CreditCardIcon } from "lucide-react"; // Keep if used by a renderer
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
// Import AdminPaymentData as PaymentData and PaymentTransactionStatus from @/types/api and @/types/statusTypes
import type { AdminPaymentData as PaymentData } from "@/types/api";
import type { PaymentTransactionStatus } from "@/types/statusTypes";
import {
  formatPhoneNumberForKISPG,
  formatPhoneNumberWithHyphen,
} from "@/lib/utils/phoneUtils";
import dayjs from "dayjs";

// Local PaymentData interface is removed to resolve conflict
// interface PaymentData { ... } // This local definition is deleted

interface PaymentsViewProps {
  payments: PaymentData[]; // Now uses AdminPaymentData aliased as PaymentData, which has status: PaymentTransactionStatus
  lessonIdFilter?: number | null;
  selectedYear: string; // Added prop
  selectedMonth: string; // Added prop
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
  try {
    const date = dayjs(dateString);
    if (!date.isValid()) return "-";
    return date.format("YYYY-MM-DD HH:mm:ss");
  } catch (e) {
    return "-";
  }
};

// Configuration for PaymentTransactionStatus display
export const paymentTransactionStatusConfig: Record<
  PaymentTransactionStatus,
  { label: string; colorPalette: string; badgeVariant?: "solid" | "outline" }
> = {
  PAID: { label: "결제완료", colorPalette: "green", badgeVariant: "solid" },
  FAILED: { label: "결제실패", colorPalette: "red", badgeVariant: "solid" },
  CANCELED: {
    label: "결제취소",
    colorPalette: "gray",
    badgeVariant: "outline",
  },
  PARTIAL_REFUNDED: {
    label: "부분환불",
    colorPalette: "yellow",
    badgeVariant: "solid",
  },
  REFUND_REQUESTED: {
    label: "환불요청",
    colorPalette: "blue",
    badgeVariant: "outline",
  },
};

// PaymentMethodCellRenderer (can be part of this file or shared)
const PaymentMethodCellRenderer: React.FC<
  ICellRendererParams<PaymentData, string | undefined> // paymentMethod is string, but value could be undefined
> = (params) => {
  // params.value is paymentMethod. params.data is the full PaymentData object.
  const paymentMethod = params.data?.paymentMethod?.toUpperCase();
  if (!paymentMethod) return null;

  let paymentMethodText = params.data?.paymentMethod || ""; // Default to raw value if not mapped

  if (paymentMethod === "CARD") {
    paymentMethodText = "카드결제";
  } else if (paymentMethod === "BANK_TRANSFER") {
    paymentMethodText = "계좌이체";
  } else if (paymentMethod === "VIRTUAL_ACCOUNT") {
    paymentMethodText = "가상계좌";
  }

  return (
    <Flex align="center" h="100%">
      {paymentMethod === "CARD" && (
        <CreditCardIcon size={16} style={{ marginRight: "4px" }} />
      )}
      <Text fontSize="sm">{paymentMethodText}</Text>
    </Flex>
  );
};

// PaymentStatusCellRenderer updated for PaymentTransactionStatus
const PaymentStatusCellRenderer: React.FC<
  ICellRendererParams<PaymentData, PaymentTransactionStatus>
> = (params) => {
  if (!params.value) return null;
  const config = paymentTransactionStatusConfig[params.value] || {
    colorPalette: "gray",
    label: params.value.toString(),
  };
  return (
    <Badge
      colorPalette={config.colorPalette}
      variant={config.badgeVariant || "solid"}
      size="sm"
    >
      {config.label}
    </Badge>
  );
};

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  lessonIdFilter,
  selectedYear,
  selectedMonth,
  agGridTheme,
  bg,
  textColor,
  borderColor,
}) => {
  const paymentGridRef = useRef<AgGridReact<PaymentData>>(null);
  const [paymentFilters, setPaymentFilters] = useState({
    searchTerm: "",
    status: "" as PaymentTransactionStatus | "", // Ensure status can be empty string for "all"
  });

  // statusOptions updated for PaymentTransactionStatus
  const statusOptions: {
    value: PaymentTransactionStatus | "";
    label: string;
  }[] = [
    { value: "", label: "전체" },
    ...Object.keys(paymentTransactionStatusConfig).map((statusKey) => ({
      value: statusKey as PaymentTransactionStatus,
      label:
        paymentTransactionStatusConfig[statusKey as PaymentTransactionStatus]
          .label,
    })),
  ];

  const handleExportPayments = () => {
    paymentGridRef.current?.api.exportDataAsCsv();
  };

  const filteredPayments = useMemo(() => {
    let data = [...payments]; // Create a new array to avoid mutating the prop

    return data.filter((payment) => {
      const searchTermLower = paymentFilters.searchTerm.toLowerCase();
      const matchesSearch =
        payment.userName.toLowerCase().includes(searchTermLower) ||
        (payment.userPhone && payment.userPhone.includes(searchTermLower)) ||
        (payment.tid && payment.tid.toLowerCase().includes(searchTermLower)); // Check if tid exists
      const matchesStatus =
        !paymentFilters.status || payment.status === paymentFilters.status;
      return matchesSearch && matchesStatus;
    });
  }, [payments, paymentFilters]);

  const paymentColDefs = useMemo<ColDef<PaymentData>[]>(
    () => [
      {
        headerName: "이름",
        field: "userName",
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "회원ID",
        field: "userId",
        flex: 1,
        minWidth: 150,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "주문ID",
        field: "tid",
        width: 180,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "강습명",
        field: "lessonTitle",
        flex: 1.5,
        minWidth: 200,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "핸드폰 번호",
        field: "userPhone",
        flex: 1,
        minWidth: 130,
        sortable: true,
        valueFormatter: (params) => formatPhoneNumberWithHyphen(params.value),
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "결제금액",
        field: "paidAmount",
        valueFormatter: (params) => formatCurrency(params.value),
        width: 110,
        cellStyle: { justifyContent: "flex-end" },
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "환불금액",
        field: "refundedAmount",
        valueFormatter: (params) => formatCurrency(params.value),
        width: 110,
        cellStyle: { justifyContent: "flex-end" },
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "결제수단",
        field: "paymentMethod",
        cellRenderer: PaymentMethodCellRenderer,
        width: 110,
        cellStyle: { justifyContent: "center" },
        sortable: true,
      },
      {
        headerName: "PG사",
        field: "paymentGateway",
        width: 100,
        sortable: true,
      },
      {
        headerName: "PG결과코드",
        field: "pgResultCode",
        width: 120,
        sortable: true,
      },
      {
        headerName: "결제일시",
        field: "paidAt",
        valueFormatter: (params) => formatDateTime(params.value),
        width: 170,
        sortable: true,
      },
      {
        headerName: "상태",
        field: "status",
        cellRenderer: PaymentStatusCellRenderer,
        width: 100,
        cellStyle: { justifyContent: "center" },
        sortable: true,
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      floatingFilter: false,
      cellStyle: {
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
      },
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
        exportButtonLabel="엑셀 다운로드"
        selectFilters={[
          {
            id: "paymentStatusFilter",
            label: "결제상태",
            value: paymentFilters.status,
            onChange: (e) =>
              setPaymentFilters((prev) => ({
                ...prev,
                status: e.target.value as PaymentTransactionStatus | "",
              })),
            options: statusOptions,
            placeholder: "전체",
          },
        ]}
        onSearchButtonClick={() => {
          console.log("Search payments with filters:", paymentFilters);
        }}
        showSearchButton={true}
      />

      <Box className={agGridTheme} h="510px" w="full">
        <AgGridReact<PaymentData>
          ref={paymentGridRef}
          rowData={filteredPayments}
          columnDefs={paymentColDefs}
          defaultColDef={defaultColDef}
          domLayout="normal"
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
