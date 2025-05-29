"use client";

import React, { useState, useMemo, useRef } from "react";
import { Box, Stack, Badge } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";

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

interface RefundsViewProps {
  refunds: RefundData[];
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

// RefundStatusCellRenderer (can be part of this file or shared)
const RefundStatusCellRenderer: React.FC<
  ICellRendererParams<RefundData, RefundData["status"]>
> = (params) => {
  if (!params.value) return null;
  const statusConfig = {
    COMPLETED: { colorPalette: "green", label: "완료" },
    PENDING: { colorPalette: "yellow", label: "처리중" },
    FAILED: { colorPalette: "red", label: "실패" },
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

export const RefundsView: React.FC<RefundsViewProps> = ({
  refunds,
  lessonIdFilter,
  agGridTheme,
  bg,
  textColor,
  borderColor,
}) => {
  const refundGridRef = useRef<AgGridReact<RefundData>>(null);
  const [refundFilters, setRefundFilters] = useState({
    searchTerm: "",
    status: "",
    period: "all", // "all", "today", "week", "month", "custom"
    startDate: "",
    endDate: "",
  });

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

  const handleExportRefunds = () => {
    refundGridRef.current?.api.exportDataAsCsv();
  };

  const filteredRefunds = useMemo(() => {
    let data = [...refunds]; // Create a new array to avoid mutating the prop
    if (lessonIdFilter) {
      data = data.filter((r) => r.lessonId === lessonIdFilter);
    }
    // Apply date filters based on period, startDate, endDate
    if (refundFilters.period !== "all" && refundFilters.period !== "custom") {
      const now = new Date();
      let pastDate = new Date(now);
      if (refundFilters.period === "today") {
        pastDate.setHours(0, 0, 0, 0);
      } else if (refundFilters.period === "week") {
        pastDate.setDate(now.getDate() - 7);
        pastDate.setHours(0, 0, 0, 0);
      } else if (refundFilters.period === "month") {
        pastDate.setMonth(now.getMonth() - 1);
        pastDate.setHours(0, 0, 0, 0);
      }
      data = data.filter(
        (r) =>
          new Date(r.refundedAt) >= pastDate && new Date(r.refundedAt) <= now
      );
    } else if (
      refundFilters.period === "custom" &&
      refundFilters.startDate &&
      refundFilters.endDate
    ) {
      const start = new Date(refundFilters.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(refundFilters.endDate);
      end.setHours(23, 59, 59, 999);
      data = data.filter((r) => {
        const refundedDate = new Date(r.refundedAt);
        return refundedDate >= start && refundedDate <= end;
      });
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

  const refundColDefs = useMemo<ColDef<RefundData>[]>(
    () => [
      { headerName: "주문ID", field: "tid", width: 180, sortable: true },
      { headerName: "이름", field: "userName", flex: 1, minWidth: 120 },
      { headerName: "핸드폰 번호", field: "userPhone", flex: 1, minWidth: 130 },
      { headerName: "강습명", field: "lessonTitle", flex: 1.5, minWidth: 250 },
      {
        headerName: "환불금액",
        field: "refundAmount",
        valueFormatter: (params) => formatCurrency(params.value),
        width: 120,
        cellStyle: { justifyContent: "flex-end" },
      },
      {
        headerName: "환불유형",
        field: "refundType",
        width: 100,
        cellStyle: { justifyContent: "center" },
      },
      { headerName: "환불사유", field: "refundReason", flex: 1, minWidth: 150 },
      {
        headerName: "처리일시",
        field: "refundedAt",
        valueFormatter: (params) => formatDateTime(params.value),
        width: 180,
      },
      { headerName: "처리자", field: "adminName", width: 100 },
      {
        headerName: "상태",
        field: "status",
        cellRenderer: RefundStatusCellRenderer,
        width: 100,
        cellStyle: { justifyContent: "center" },
      },
    ],
    []
  );

  const refundDefaultColDef = useMemo<ColDef>(
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
        searchTerm={refundFilters.searchTerm}
        onSearchTermChange={(e) =>
          setRefundFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
        }
        searchTermPlaceholder="검색 (이름/번호/주문ID)"
        onExport={handleExportRefunds}
        exportButtonLabel="엑셀 다운로드" // Added label
        selectFilters={[
          {
            id: "refundStatusFilter",
            label: "환불상태",
            value: refundFilters.status,
            onChange: (e) =>
              setRefundFilters((prev) => ({ ...prev, status: e.target.value })),
            options: refundStatusOptions,
            placeholder: "전체",
          },
          {
            id: "refundPeriodFilter",
            label: "기간",
            value: refundFilters.period,
            onChange: (e) =>
              setRefundFilters((prev) => ({ ...prev, period: e.target.value })),
            options: periodOptions,
          },
        ]}
        dateFilters={{
          show: refundFilters.period === "custom",
          startDate: refundFilters.startDate,
          onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setRefundFilters((prev) => ({
              ...prev,
              startDate: e.target.value,
            })),
          endDate: refundFilters.endDate,
          onEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setRefundFilters((prev) => ({ ...prev, endDate: e.target.value })),
        }}
        onSearchButtonClick={() => {
          console.log("Search refunds with filters:", refundFilters);
        }}
        showSearchButton={true}
      />

      <Box className={agGridTheme} maxH="480px" w="full">
        {/* Adjusted height */}
        <AgGridReact<RefundData>
          ref={refundGridRef}
          rowData={filteredRefunds}
          columnDefs={refundColDefs}
          defaultColDef={refundDefaultColDef}
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
