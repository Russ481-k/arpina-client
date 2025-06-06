"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Badge,
  Flex,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { SearchIcon, DownloadIcon, InfoIcon } from "lucide-react";
import { useColors } from "@/styles/theme";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type { CancelRequestAdminDto, PaginatedResponse } from "@/types/api";
import {
  EnrollmentCancellationProgressStatus,
  CancellationRequestRecordStatus,
  EnrollmentPaymentLifecycleStatus,
} from "@/types/statusTypes";
import { toaster } from "@/components/ui/toaster";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";

import "@/styles/ag-grid-custom.css";
import { useColorMode } from "@/components/ui/color-mode";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
import { ReviewCancelRequestDialog } from "./cancellationRefund/ReviewCancelRequestDialog";
import { formatPhoneNumberWithHyphen } from "@/lib/utils/phoneUtils";
import { paymentTransactionStatusConfig } from "./paymentHistory/PaymentsView";

// Assuming ModuleRegistry is handled if you use AG Grid Enterprise features
// ModuleRegistry.registerModules([AllCommunityModule]);

// Refined local data structure for the grid
interface UICalculatedRefundDetails {
  usedDays: number;
  manualUsedDays?: number;
  lessonUsageAmount: number; // No longer optional, default to 0 if null
  finalRefundAmount: number;
}

interface UIPaymentDetails {
  lesson: number;
  locker: number;
  total: number;
}

interface CancelRequestData {
  id: string;
  enrollId: number;
  userName: string;
  userLoginId?: string; // Mapped from dto.userLoginId or dto.userId
  userPhone?: string;
  lessonTitle: string;
  requestedAt: string;
  reason?: string; // from dto.userReason, can be null/empty
  adminComment?: string; // from dto.adminComment
  lessonStartDate?: string;
  usesLocker?: boolean;
  paidAmount: UIPaymentDetails;
  calculatedRefund: UICalculatedRefundDetails;
  status?: CancellationRequestRecordStatus; // from dto.status
  cancellationProcessingStatus?: EnrollmentCancellationProgressStatus; // from dto.cancellationProcessingStatus
  paymentDisplayStatus?: EnrollmentPaymentLifecycleStatus; // from dto.paymentStatus
}

interface CancellationRefundTabProps {
  lessonIdFilter?: number | null;
  selectedYear: string;
  selectedMonth: string;
}

const cancelTabQueryKeys = {
  cancelRequests: (
    lessonId?: number | null,
    year?: string,
    month?: string
    // status?: string // Status filter not implemented in UI yet
  ) => ["adminCancelRequests", lessonId, year, month] as const,
};

// Status Renderers - adapting to potential new statuses from sample
const MainStatusCellRenderer: React.FC<
  ICellRendererParams<CancelRequestData, CancelRequestData["status"]>
> = (params) => {
  if (!params.value)
    return (
      <Badge colorPalette="gray" variant="outline" size="sm">
        -
      </Badge>
    );
  const statusValue = params.value as CancellationRequestRecordStatus;
  const configMap: Record<
    CancellationRequestRecordStatus,
    { label: string; colorPalette: string; variant?: "solid" | "outline" }
  > = {
    REQUESTED: { label: "요청됨", colorPalette: "blue", variant: "outline" },
    ADMIN_APPROVED: {
      label: "승인됨",
      colorPalette: "green",
      variant: "solid",
    },
    ADMIN_DENIED: { label: "반려됨", colorPalette: "red", variant: "solid" },
    USER_WITHDRAWN: {
      label: "철회됨",
      colorPalette: "gray",
      variant: "outline",
    },
  };
  const config = configMap[statusValue] || {
    label: statusValue.toString(),
    colorPalette: "gray",
    variant: "outline",
  };
  return (
    <Badge
      colorPalette={config.colorPalette}
      variant={config.variant || "outline"}
      size="sm"
    >
      {config.label}
    </Badge>
  );
};

const ProcessingStatusCellRenderer: React.FC<
  ICellRendererParams<
    CancelRequestData,
    CancelRequestData["cancellationProcessingStatus"]
  >
> = (params) => {
  if (!params.value)
    return (
      <Badge colorPalette="gray" variant="outline" size="sm">
        -
      </Badge>
    );
  const statusValue = params.value as EnrollmentCancellationProgressStatus;
  const configMap: Partial<
    Record<
      EnrollmentCancellationProgressStatus,
      { label: string; colorPalette: string; variant?: "solid" | "outline" }
    >
  > = {
    REQ: { label: "요청", colorPalette: "blue" },
    PENDING: { label: "처리대기", colorPalette: "yellow" },
    APPROVED: { label: "승인(PG)", colorPalette: "green" },
    DENIED: { label: "반려(PG)", colorPalette: "red" },
    NONE: { label: "해당없음", colorPalette: "gray" },
  };
  const config = configMap[statusValue] || {
    label: statusValue.toString(),
    colorPalette: "gray",
  };
  return (
    <Badge
      colorPalette={config.colorPalette}
      variant={config.variant || "outline"}
      size="sm"
    >
      {config.label}
    </Badge>
  );
};

const PaymentLifecycleStatusCellRenderer: React.FC<
  ICellRendererParams<
    CancelRequestData,
    CancelRequestData["paymentDisplayStatus"]
  >
> = (params) => {
  if (!params.value)
    return (
      <Badge colorPalette="gray" variant="outline" size="sm">
        -
      </Badge>
    );
  const statusValue = params.value as EnrollmentPaymentLifecycleStatus;
  // Assuming paymentTransactionStatusConfig can be adapted or a new one created for EnrollmentPaymentLifecycleStatus
  const label =
    paymentTransactionStatusConfig[
      statusValue as keyof typeof paymentTransactionStatusConfig
    ]?.label || statusValue.toString();
  const colorPalette =
    paymentTransactionStatusConfig[
      statusValue as keyof typeof paymentTransactionStatusConfig
    ]?.colorPalette || "gray";
  return (
    <Badge colorPalette={colorPalette} variant="outline" size="sm">
      {label}
    </Badge>
  );
};

const ActionCellRenderer: React.FC<ICellRendererParams<CancelRequestData>> = (
  params
) => {
  const { data, context } = params;
  if (!data || !context.openReviewDialog) return null;
  // Base review button on the main request status (CancellationRequestRecordStatus)
  if (data.status === "REQUESTED") {
    return (
      <Button
        size="xs"
        colorPalette="teal"
        variant="outline"
        onClick={() => context.openReviewDialog(data)}
      >
        검토
      </Button>
    );
  }
  const mainStatusConfig = {
    ADMIN_APPROVED: "승인됨",
    ADMIN_DENIED: "반려됨",
    USER_WITHDRAWN: "철회됨",
  };
  const label = data.status
    ? mainStatusConfig[data.status as keyof typeof mainStatusConfig] ||
      data.status.toString()
    : "-";
  return (
    <Button size="xs" variant="ghost" colorPalette="gray" disabled>
      {label}
    </Button>
  );
};

export const CancellationRefundTab = ({
  lessonIdFilter,
  selectedYear,
  selectedMonth,
}: CancellationRefundTabProps) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ searchTerm: "" });
  const gridRef = React.useRef<AgGridReact<CancelRequestData>>(null);
  const [selectedRequestForDialog, setSelectedRequestForDialog] =
    useState<CancelRequestData | null>(null);

  const formatDate = useCallback((dateString: string | undefined | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  }, []);
  const formatCurrency = useCallback((amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return "0원";
    return new Intl.NumberFormat("ko-KR").format(Math.round(amount)) + "원";
  }, []);

  const defaultColDef = useMemo<ColDef<CancelRequestData>>(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
      floatingFilter: false,
      cellStyle: { fontSize: "13px", display: "flex", alignItems: "center" },
    }),
    []
  );

  const handleOpenDialog = useCallback(
    (request: CancelRequestData) => setSelectedRequestForDialog(request),
    []
  );
  const handleCloseDialog = useCallback(
    () => setSelectedRequestForDialog(null),
    []
  );
  const agGridContext = useMemo(
    () => ({ openReviewDialog: handleOpenDialog }),
    [handleOpenDialog]
  );
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const {
    data: cancelRequestsData,
    isLoading: isLoadingCancelRequests,
    isError: isErrorCancelRequests,
    error: cancelRequestsError,
  } = useQuery<
    PaginatedResponse<CancelRequestAdminDto>,
    Error,
    CancelRequestData[]
  >({
    queryKey: cancelTabQueryKeys.cancelRequests(
      lessonIdFilter,
      selectedYear,
      selectedMonth
    ),
    queryFn: () =>
      adminApi.getAdminCancelRequests({
        lessonId: lessonIdFilter ?? undefined,
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        page: 0,
        size: 1000,
      }),
    select: (
      apiResponse: PaginatedResponse<CancelRequestAdminDto>
    ): CancelRequestData[] => {
      if (!apiResponse?.data?.content) return [];
      return apiResponse.data.content.map(
        (dto: CancelRequestAdminDto): CancelRequestData => {
          const paymentInfo = dto.paymentInfo || {};
          const calculatedDetails = dto.calculatedRefundDetails || {};
          const userLoginIdFromDto = dto.userLoginId;

          return {
            id: dto.requestId?.toString() ?? `enroll-${dto.enrollId}-req`,
            enrollId: dto.enrollId,
            userName: dto.userName,
            userLoginId: userLoginIdFromDto || "-",
            userPhone: dto.userPhone || "-",
            lessonTitle: dto.lessonTitle,
            requestedAt: dto.requestedAt,
            reason: dto.userReason || "-",
            adminComment: dto.adminComment || undefined,
            lessonStartDate: dto.lessonStartDate || undefined,
            usesLocker: dto.usesLocker === null ? undefined : dto.usesLocker,
            paidAmount: {
              lesson: paymentInfo.lessonPaidAmt ?? 0,
              locker: paymentInfo.lockerPaidAmt ?? 0,
              total: paymentInfo.paidAmt ?? 0,
            },
            calculatedRefund: {
              finalRefundAmount:
                dto.calculatedRefundAmtByNewPolicy ??
                calculatedDetails.finalRefundAmount ??
                0,
              usedDays:
                calculatedDetails.effectiveUsedDays ??
                calculatedDetails.systemCalculatedUsedDays ??
                0,
              manualUsedDays:
                calculatedDetails.manualUsedDays === null
                  ? undefined
                  : calculatedDetails.manualUsedDays,
              lessonUsageAmount: calculatedDetails.lessonUsageAmount ?? 0,
            },
            status: dto.status as CancellationRequestRecordStatus | undefined,
            cancellationProcessingStatus: dto.cancellationProcessingStatus as
              | EnrollmentCancellationProgressStatus
              | undefined,
            paymentDisplayStatus: dto.paymentStatus as
              | EnrollmentPaymentLifecycleStatus
              | undefined,
          };
        }
      );
    },
    enabled: !!selectedYear && !!selectedMonth,
  });

  const filteredCancelRequests = useMemo(() => {
    if (!cancelRequestsData) return [];
    if (!filters.searchTerm) return cancelRequestsData;
    const searchTermLower = filters.searchTerm.toLowerCase();
    return cancelRequestsData.filter(
      (req) =>
        (req.userName?.toLowerCase() || "").includes(searchTermLower) ||
        (req.userLoginId?.toLowerCase() || "").includes(searchTermLower) ||
        (req.userPhone || "").includes(searchTermLower) || // Phone numbers might not be toLowerCase
        (req.lessonTitle?.toLowerCase() || "").includes(searchTermLower) ||
        (req.id?.toLowerCase() || "").includes(searchTermLower)
    );
  }, [cancelRequestsData, filters.searchTerm]);

  // Mutations remain at top level
  const approveMutation = useMutation<
    any,
    Error,
    {
      enrollId: number;
      data: { manualUsedDays?: number; adminComment?: string };
    }
  >({
    mutationFn: ({ enrollId, data }) =>
      adminApi.approveAdminCancelRequest(enrollId, data),
    onSuccess: () => {
      toaster.create({
        title: "성공",
        description: "요청이 처리되었습니다.",
        type: "success",
      });
      queryClient.invalidateQueries({
        queryKey: cancelTabQueryKeys.cancelRequests(
          lessonIdFilter,
          selectedYear,
          selectedMonth
        ),
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toaster.create({
        title: "오류",
        description: `승인 처리 중 오류 발생: ${error.message}`,
        type: "error",
      });
    },
  });

  const denyMutation = useMutation<
    any,
    Error,
    { enrollId: number; data: { adminComment?: string } }
  >({
    mutationFn: ({ enrollId, data }) =>
      adminApi.denyAdminCancelRequest(enrollId, data),
    onSuccess: () => {
      toaster.create({
        title: "성공",
        description: "요청이 처리되었습니다.",
        type: "success",
      });
      queryClient.invalidateQueries({
        queryKey: cancelTabQueryKeys.cancelRequests(
          lessonIdFilter,
          selectedYear,
          selectedMonth
        ),
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toaster.create({
        title: "오류",
        description: `거부 처리 중 오류 발생: ${error.message}`,
        type: "error",
      });
    },
  });

  const colDefs = useMemo<ColDef<CancelRequestData>[]>(
    () => [
      {
        headerName: "요청ID",
        field: "id",
        width: 120,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "회원명",
        field: "userName",
        width: 100,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "회원ID",
        field: "userLoginId",
        width: 100,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "강습명",
        field: "lessonTitle",
        flex: 1,
        minWidth: 150,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "요청일",
        field: "requestedAt",
        valueFormatter: (p) => formatDate(p.value),
        width: 140,
        sortable: true,
      },
      {
        headerName: "요청상태",
        field: "status",
        cellRenderer: MainStatusCellRenderer,
        width: 100,
        sortable: true,
      },
      {
        headerName: "PG처리상태",
        field: "cancellationProcessingStatus",
        cellRenderer: ProcessingStatusCellRenderer,
        width: 110,
        sortable: true,
      },
      {
        headerName: "결제처리상태",
        field: "paymentDisplayStatus",
        cellRenderer: PaymentLifecycleStatusCellRenderer,
        width: 130,
        sortable: true,
      },
      {
        headerName: "총 결제액",
        field: "paidAmount.total",
        valueFormatter: (p) => formatCurrency(p.value),
        width: 100,
        cellStyle: { justifyContent: "flex-end" },
        sortable: true,
      },
      {
        headerName: "환불예정액",
        field: "calculatedRefund.finalRefundAmount",
        valueFormatter: (p) => formatCurrency(p.value),
        width: 110,
        cellStyle: { justifyContent: "flex-end" },
        sortable: true,
      },
      {
        headerName: "사유",
        field: "reason",
        width: 150,
        wrapText: true,
        autoHeight: true,
        cellRenderer: (
          params: ICellRendererParams<CancelRequestData, string | undefined>
        ) => {
          if (!params.value || params.value === "-") return "-";
          return (
            <Tooltip content={params.value}>
              <Button variant="outline" size="sm">
                {params.value}
              </Button>
            </Tooltip>
          );
        },
      },
      {
        headerName: "관리자메모",
        field: "adminComment",
        width: 150,
        wrapText: true,
        autoHeight: true,
        cellRenderer: (
          params: ICellRendererParams<CancelRequestData, string | undefined>
        ) => {
          if (!params.value) return "-";
          return (
            <Tooltip content={params.value}>
              <Button variant="outline" size="sm">
                {params.value}
              </Button>
            </Tooltip>
          );
        },
      },
      {
        headerName: "관리",
        colId: "actionsCol",
        cellRenderer: ActionCellRenderer,
        width: 70,
        pinned: "right",
        sortable: false,
        filter: false,
      },
    ],
    [formatDate, formatCurrency]
  );

  const handleExportGrid = () => gridRef.current?.api.exportDataAsCsv();

  return (
    <Stack h="full" gap={4}>
      <CommonGridFilterBar
        searchTerm={filters.searchTerm}
        onSearchTermChange={(e) =>
          setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
        }
        searchTermPlaceholder="검색 (요청ID/회원명/ID/강습명)"
        onExport={handleExportGrid}
        exportButtonLabel="엑셀 다운로드"
        // No status filter UI implemented yet
      />

      {isLoadingCancelRequests && (
        <Box textAlign="center" p={10}>
          <Spinner size="xl" />
          <Text mt={2}>취소/환불 요청 목록을 불러오는 중...</Text>
        </Box>
      )}
      {isErrorCancelRequests && !isLoadingCancelRequests && (
        <Box p={4} bg="red.50" borderRadius="md" color="red.700">
          <Text fontWeight="bold">오류 발생</Text>
          <Text>데이터 로딩 실패: {cancelRequestsError?.message}</Text>
        </Box>
      )}

      {!isLoadingCancelRequests && !isErrorCancelRequests && (
        <Box className={agGridTheme} h="562px" w="full">
          <AgGridReact<CancelRequestData>
            ref={gridRef}
            rowData={filteredCancelRequests}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            context={agGridContext}
            rowSelection="single"
            onCellClicked={(event) => {
              if (event.column.getColId() !== "actionsCol") {
                if (event.data)
                  handleOpenDialog(event.data as CancelRequestData);
              }
            }}
            domLayout="normal"
            headerHeight={36} // Standard header height
            // rowHeight={40} // Consider autoHeight or specific height for wrapped text
            getRowHeight={(params) => {
              // Simple logic: if reason or adminComment has significant text, give more height.
              // This is a basic example; more sophisticated logic might be needed.
              const reasonText = params.data?.reason;
              const adminCommentText = params.data?.adminComment;
              const baseHeight = 40;
              let extraHeight = 0;
              if (reasonText && reasonText.length > 30)
                extraHeight = Math.max(extraHeight, 20); // Rough estimate
              if (adminCommentText && adminCommentText.length > 30)
                extraHeight = Math.max(extraHeight, 20);
              return baseHeight + extraHeight;
            }}
            animateRows={true}
            suppressRowTransform={true} // Good with autoHeight
          />
        </Box>
      )}
      {selectedRequestForDialog && (
        <ReviewCancelRequestDialog
          isOpen={!!selectedRequestForDialog}
          onClose={handleCloseDialog}
          selectedRequest={selectedRequestForDialog}
        />
      )}
    </Stack>
  );
};
