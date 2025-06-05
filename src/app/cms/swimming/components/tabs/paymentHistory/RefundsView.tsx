"use client";

import React, { useState, useMemo, useRef } from "react";
import { Box, Stack, Badge } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
import type { RefundData, RefundStatusType } from "../PaymentHistoryTab";

interface RefundsViewProps {
  refunds: RefundData[];
  lessonIdFilter?: number | null;
  agGridTheme: string;
  bg: string;
  textColor: string;
  borderColor: string;
}

// Shared utility or helper functions (consider moving to a common file)
const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
};

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "-";
    }
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

// RefundStatusCellRenderer updated for RefundStatusType
const RefundStatusCellRenderer: React.FC<
  ICellRendererParams<RefundData, RefundStatusType>
> = (params) => {
  if (!params.value) return null;
  const statusConfig: Record<
    RefundStatusType,
    { colorPalette: string; label: string }
  > = {
    REFUND_REQUESTED: { colorPalette: "blue", label: "환불요청" },
    REFUND_PROCESSING: { colorPalette: "yellow", label: "처리중" },
    REFUND_COMPLETED: { colorPalette: "green", label: "환불완료" },
    REFUND_REJECTED: { colorPalette: "red", label: "환불거절" },
  };
  const config = statusConfig[params.value] || {
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
    status: "" as RefundStatusType | "",
    period: "all",
    startDate: "",
    endDate: "",
  });

  const refundStatusOptions: { value: RefundStatusType | ""; label: string }[] =
    [
      { value: "", label: "전체" },
      { value: "REFUND_REQUESTED", label: "환불요청" },
      { value: "REFUND_PROCESSING", label: "처리중" },
      { value: "REFUND_COMPLETED", label: "환불완료" },
      { value: "REFUND_REJECTED", label: "환불거절" },
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
    let data = [...refunds];
    if (lessonIdFilter) {
      data = data.filter((r) => r.lessonId === lessonIdFilter);
    }
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
      data = data.filter((r) => {
        try {
          if (!r.refundedAt) return false;
          const refundedDate = new Date(r.refundedAt);
          return (
            !isNaN(refundedDate.getTime()) &&
            refundedDate >= pastDate &&
            refundedDate <= now
          );
        } catch (e) {
          console.error("Error filtering by refundedAt:", r.refundedAt, e);
          return false;
        }
      });
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
        try {
          if (!r.refundedAt) return false;
          const refundedDate = new Date(r.refundedAt);
          return (
            !isNaN(refundedDate.getTime()) &&
            refundedDate >= start &&
            refundedDate <= end
          );
        } catch (e) {
          console.error(
            "Error filtering by custom refundedAt:",
            r.refundedAt,
            e
          );
          return false;
        }
      });
    }

    return data.filter((refund) => {
      const searchTermLower = refundFilters.searchTerm.toLowerCase();
      const matchesSearch =
        (refund.userName?.toLowerCase() || "").includes(searchTermLower) ||
        (refund.userPhone?.toLowerCase() || "").includes(searchTermLower) ||
        (refund.tid?.toLowerCase() || "").includes(searchTermLower);
      const matchesStatus =
        !refundFilters.status || refund.status === refundFilters.status;
      return matchesSearch && matchesStatus;
    });
  }, [refunds, refundFilters, lessonIdFilter]);

  const refundColDefs = useMemo<ColDef<RefundData>[]>(
    () => [
      {
        headerName: "환불ID",
        field: "refundId",
        width: 100,
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "원본결제ID",
        field: "paymentId",
        width: 120,
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "신청ID",
        field: "enrollId",
        width: 100,
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "주문번호(TID)",
        field: "tid",
        width: 180,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "구매자명",
        field: "userName",
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "구매자연락처",
        field: "userPhone",
        flex: 1,
        minWidth: 130,
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
        headerName: "환불금액",
        field: "refundAmount",
        valueFormatter: (params) => formatCurrency(params.value),
        type: "numericColumn",
        width: 120,
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "환불유형",
        field: "refundType",
        width: 100,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "환불사유",
        field: "reason",
        flex: 1,
        minWidth: 150,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "환불요청일시",
        field: "requestedAt",
        valueFormatter: (params) => formatDateTime(params.value),
        width: 170,
        sortable: true,
        filter: "agDateColumnFilter",
      },
      {
        headerName: "환불처리일시",
        field: "refundedAt",
        valueFormatter: (params) => formatDateTime(params.value),
        width: 170,
        sortable: true,
        filter: "agDateColumnFilter",
      },
      {
        headerName: "처리관리자",
        field: "adminName",
        width: 100,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "환불상태",
        field: "status",
        cellRenderer: RefundStatusCellRenderer,
        width: 100,
        sortable: true,
        filter: "agTextColumnFilter",
      },
    ],
    []
  );

  const refundDefaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      filter: true,
      sortable: true,
      floatingFilter: true,
      cellStyle: { fontSize: "13px", display: "flex", alignItems: "center" },
      filterParams: {
        buttons: ["reset", "apply"],
        debounceMs: 200,
      },
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
        searchTermPlaceholder="검색 (이름,연락처,TID,강습명)"
        onExport={handleExportRefunds}
        exportButtonLabel="환불내역 엑셀 다운로드"
        selectFilters={[
          {
            id: "refundStatusFilter",
            label: "환불상태",
            value: refundFilters.status,
            onChange: (e) =>
              setRefundFilters((prev) => ({
                ...prev,
                status: e.target.value as RefundStatusType | "",
              })),
            options: refundStatusOptions,
            placeholder: "전체",
          },
          {
            id: "refundPeriodFilter",
            label: "기간",
            value: refundFilters.period,
            onChange: (e) => {
              const newPeriod = e.target.value;
              setRefundFilters((prev) => ({
                ...prev,
                period: newPeriod,
                startDate: newPeriod === "custom" ? prev.startDate : "",
                endDate: newPeriod === "custom" ? prev.endDate : "",
              }));
            },
            options: periodOptions,
            placeholder: "기간 전체",
          },
        ]}
        dateFilters={
          refundFilters.period === "custom"
            ? {
                show: true,
                startDate: refundFilters.startDate,
                onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setRefundFilters((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  })),
                endDate: refundFilters.endDate,
                onEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setRefundFilters((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  })),
              }
            : undefined
        }
      />
      <Box
        className={agGridTheme}
        w="100%"
        h="600px"
        bg={bg}
        borderColor={borderColor}
        borderWidth={1}
        borderRadius="md"
        overflow="hidden"
      >
        <AgGridReact<RefundData>
          ref={refundGridRef}
          rowData={filteredRefunds}
          columnDefs={refundColDefs}
          defaultColDef={refundDefaultColDef}
          pagination={true}
          paginationPageSize={100}
          paginationPageSizeSelector={[10, 50, 100, 500]}
          domLayout="normal"
        />
      </Box>
    </Stack>
  );
};
