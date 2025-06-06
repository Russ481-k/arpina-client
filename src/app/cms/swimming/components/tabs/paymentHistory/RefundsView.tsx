"use client";

import React, { useState, useMemo, useRef } from "react";
import { Box, Stack, Badge, Flex, Text } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
import type { AdminPaymentData as PaymentData } from "@/types/api";
import type { PaymentTransactionStatus } from "@/types/statusTypes";
import { paymentTransactionStatusConfig } from "./PaymentsView";
import { CreditCardIcon } from "lucide-react";

interface RefundsViewProps {
  paymentsForRefundView: PaymentData[];
  lessonIdFilter?: number | null;
  selectedYear: string;
  selectedMonth: string;
  agGridTheme: string;
  bg: string;
  textColor: string;
  borderColor: string;
}

const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
};

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "-";
  }
};

const PaymentStatusCellRenderer: React.FC<
  ICellRendererParams<PaymentData, PaymentTransactionStatus>
> = (params) => {
  if (!params.value) return null;
  const config = paymentTransactionStatusConfig[params.value] || {
    colorPalette: "gray",
    label: params.value.toString(),
  };
  return (
    <Flex h="100%" w="100%" alignItems="center" justifyContent="center">
      <Badge
        colorPalette={config.colorPalette}
        variant={config.badgeVariant || "solid"}
        size="sm"
      >
        {config.label}
      </Badge>
    </Flex>
  );
};

const PaymentMethodCellRenderer: React.FC<
  ICellRendererParams<PaymentData, string | undefined>
> = (params) => {
  const paymentMethod = params.data?.paymentMethod?.toUpperCase();
  if (!paymentMethod) return null;
  let paymentMethodText = params.data?.paymentMethod || "";
  if (paymentMethod === "CARD") paymentMethodText = "카드결제";
  else if (paymentMethod === "BANK_TRANSFER") paymentMethodText = "계좌이체";
  else if (paymentMethod === "VIRTUAL_ACCOUNT") paymentMethodText = "가상계좌";

  return (
    <Flex align="center" h="100%" justifyContent="center">
      {paymentMethod === "CARD" && (
        <CreditCardIcon size={16} style={{ marginRight: "4px" }} />
      )}
      <Text fontSize="sm">{paymentMethodText}</Text>
    </Flex>
  );
};

export const RefundsView: React.FC<RefundsViewProps> = ({
  paymentsForRefundView,
  lessonIdFilter,
  selectedYear,
  selectedMonth,
  agGridTheme,
  bg,
  textColor,
  borderColor,
}) => {
  const refundGridRef = useRef<AgGridReact<PaymentData>>(null);
  const [refundFilters, setRefundFilters] = useState({
    searchTerm: "",
    status: "" as PaymentTransactionStatus | "",
  });

  const refundStatusOptions: {
    value: PaymentTransactionStatus | "";
    label: string;
  }[] = [
    { value: "", label: "전체 상태" },
    {
      value: "PARTIAL_REFUNDED",
      label: paymentTransactionStatusConfig.PARTIAL_REFUNDED.label,
    },
    { value: "CANCELED", label: paymentTransactionStatusConfig.CANCELED.label },
  ];

  const handleExportRefunds = () => {
    refundGridRef.current?.api.exportDataAsCsv();
  };

  const filteredPaymentsForRefundGrid = useMemo(() => {
    let data = [...paymentsForRefundView];
    if (lessonIdFilter) {
      data = data.filter((p) => p.lessonId === lessonIdFilter);
    }

    return data.filter((payment) => {
      const searchTermLower = refundFilters.searchTerm.toLowerCase();
      const matchesSearch =
        payment.userName.toLowerCase().includes(searchTermLower) ||
        (payment.userPhone && payment.userPhone.includes(searchTermLower)) ||
        payment.tid.toLowerCase().includes(searchTermLower) ||
        payment.lessonTitle.toLowerCase().includes(searchTermLower) ||
        (payment.userId &&
          payment.userId.toLowerCase().includes(searchTermLower));

      const matchesStatus =
        !refundFilters.status || payment.status === refundFilters.status;
      return matchesSearch && matchesStatus;
    });
  }, [paymentsForRefundView, refundFilters, lessonIdFilter]);

  const refundColDefs = useMemo<ColDef<PaymentData>[]>(
    () => [
      {
        headerName: "회원명",
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
        minWidth: 120,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "원본 주문ID",
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
        headerName: "원 결제금액",
        field: "paidAmount",
        valueFormatter: (params: ValueFormatterParams<PaymentData, number>) =>
          formatCurrency(params.value),
        width: 120,
        cellStyle: { justifyContent: "flex-end" },
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "환불금액",
        field: "refundedAmount",
        valueFormatter: (
          params: ValueFormatterParams<PaymentData, number | null>
        ) => formatCurrency(params.value),
        width: 120,
        cellStyle: { justifyContent: "flex-end" },
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "처리상태",
        field: "status",
        cellRenderer: PaymentStatusCellRenderer,
        width: 110,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "원 결제수단",
        field: "paymentMethod",
        cellRenderer: PaymentMethodCellRenderer,
        width: 120,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "원 결제일시",
        field: "paidAt",
        valueFormatter: (params: ValueFormatterParams<PaymentData, string>) =>
          formatDateTime(params.value),
        width: 170,
        sortable: true,
        filter: "agDateColumnFilter",
      },
      {
        headerName: "최종환불일시",
        field: "lastRefundAt",
        valueFormatter: (
          params: ValueFormatterParams<PaymentData, string | undefined>
        ) => formatDateTime(params.value),
        width: 170,
        sortable: true,
        filter: "agDateColumnFilter",
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
      cellStyle: {
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      },
      floatingFilter: false,
    }),
    []
  );

  return (
    <Stack gap={4}>
      <CommonGridFilterBar
        searchTerm={refundFilters.searchTerm}
        onSearchTermChange={(e) =>
          setRefundFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
        }
        searchTermPlaceholder="검색 (주문ID/강습명/회원명/ID)"
        onExport={handleExportRefunds}
        exportButtonLabel="엑셀 다운로드"
        selectFilters={[
          {
            id: "refundStatusFilter",
            label: "처리상태",
            value: refundFilters.status,
            onChange: (e) =>
              setRefundFilters((prev) => ({
                ...prev,
                status: e.target.value as PaymentTransactionStatus | "",
              })),
            options: refundStatusOptions,
            placeholder: "전체 상태",
          },
        ]}
        onSearchButtonClick={() => {
          console.log("Search refunds with filters:", refundFilters);
        }}
        showSearchButton={true}
      />

      <Box className={agGridTheme} w="full" h="510px">
        <AgGridReact<PaymentData>
          ref={refundGridRef}
          rowData={filteredPaymentsForRefundGrid}
          columnDefs={refundColDefs}
          defaultColDef={defaultColDef}
          headerHeight={36}
          rowHeight={40}
          domLayout="normal"
          suppressCellFocus={true}
          getRowStyle={() => ({
            color: textColor,
            background: bg,
            borderBottom: `1px solid ${borderColor}`,
          })}
          animateRows={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
        />
      </Box>
    </Stack>
  );
};
