"use client";

import React, { useState, useMemo, useRef } from "react";
import { Box, Text, Stack, Badge, Flex, Button } from "@chakra-ui/react";
import { CreditCardIcon } from "lucide-react"; // Keep if used by a renderer
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, GridApi } from "ag-grid-community";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
// Import AdminPaymentData as PaymentData and the new PaymentStatus
import type { AdminPaymentData as PaymentData } from "@/types/api";
import type { PaymentStatus, UiDisplayStatus } from "@/types/statusTypes";
import { displayStatusConfig } from "@/lib/utils/statusUtils"; // Import the centralized config
import {
  formatPhoneNumberForKISPG,
  formatPhoneNumberWithHyphen,
} from "@/lib/utils/phoneUtils";
import dayjs from "dayjs";

// Local PaymentData interface is removed to resolve conflict
// interface PaymentData { ... } // This local definition is deleted

interface PaymentsViewProps {
  payments: PaymentData[];
  agGridTheme: string;
  bg: string;
  textColor: string;
  borderColor: string;
  onQueryPg: (tid: string, amt: number) => void;
  setGridApi: (api: GridApi<PaymentData>) => void;
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

// Configuration for PaymentTransactionStatus display is now removed.

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

// PaymentStatusCellRenderer updated for PaymentStatus
const PaymentStatusCellRenderer: React.FC<
  ICellRendererParams<PaymentData, PaymentStatus>
> = (params) => {
  if (!params.value) return null;
  const config =
    displayStatusConfig[params.value as UiDisplayStatus] ||
    displayStatusConfig["FAILED"];
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

const PgQueryCellRenderer: React.FC<
  ICellRendererParams<PaymentData> & {
    onQueryPg: (tid: string, amt: number) => void;
  }
> = (params) => {
  const { data, onQueryPg } = params;

  const handleClick = () => {
    if (data?.tid && data.paidAmount) {
      onQueryPg(data.tid, data.paidAmount);
    }
  };

  const buttonDisabled = !data?.tid || data.paidAmount === undefined;

  return (
    <Flex align="center" h="100%">
      <Button
        size="xs"
        colorScheme="teal"
        onClick={handleClick}
        disabled={buttonDisabled}
      >
        PG조회
      </Button>
    </Flex>
  );
};

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  agGridTheme,
  bg,
  textColor,
  borderColor,
  onQueryPg,
  setGridApi,
}) => {
  const paymentGridRef = useRef<AgGridReact<PaymentData>>(null);
  const [paymentFilters, setPaymentFilters] = useState({
    searchTerm: "",
    status: "" as PaymentStatus | "", // Ensure status can be empty string for "all"
  });

  // statusOptions updated for PaymentStatus
  const statusOptions: {
    value: PaymentStatus | "";
    label: string;
  }[] = [
    { value: "", label: "전체" },
    { value: "PAID", label: displayStatusConfig.PAID.label },
    { value: "FAILED", label: displayStatusConfig.FAILED.label },
    { value: "CANCELED", label: displayStatusConfig.CANCELED.label },
    {
      value: "PARTIAL_REFUNDED",
      label: displayStatusConfig.PARTIAL_REFUNDED.label,
    },
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
        cellStyle: { textAlign: "right" },
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "환불금액",
        field: "refundedAmount",
        valueFormatter: (params) => formatCurrency(params.value),
        width: 110,
        cellStyle: { textAlign: "right" },
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "결제수단",
        field: "paymentMethod",
        cellRenderer: PaymentMethodCellRenderer,
        width: 110,
        cellStyle: { textAlign: "center" },
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
        cellStyle: { textAlign: "center" },
        sortable: true,
      },
      {
        headerName: "PG 처리 상태",
        field: "pgResultMsg" as any,
        width: 150,
        sortable: true,
      },
      {
        headerName: "PG 조회",
        cellRenderer: PgQueryCellRenderer,
        cellRendererParams: {
          onQueryPg: onQueryPg,
        },
        width: 100,
        cellStyle: { textAlign: "center" },
      },
    ],
    [onQueryPg]
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
                status: e.target.value as PaymentStatus | "",
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

      <Box className={agGridTheme} h="568px" w="full">
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
          onGridReady={(params) => setGridApi(params.api)}
          getRowId={(params) => params.data.tid}
        />
      </Box>
    </Stack>
  );
};
