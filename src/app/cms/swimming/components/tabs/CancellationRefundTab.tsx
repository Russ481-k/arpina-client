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
  Card,
  IconButton,
} from "@chakra-ui/react";
import { SearchIcon, DownloadIcon } from "lucide-react";
import { useColors } from "@/styles/theme";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type {
  EnrollAdminResponseDto,
  CancelRequestAdminDto,
  PaginatedResponse,
} from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import { AgGridReact } from "ag-grid-react";
import {
  type ColDef,
  ModuleRegistry,
  AllCommunityModule,
  type ICellRendererParams,
  type ValueFormatterParams,
} from "ag-grid-community";

import "@/styles/ag-grid-custom.css";
import { useColorMode } from "@/components/ui/color-mode";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
import { ReviewCancelRequestDialog } from "./cancellationRefund/ReviewCancelRequestDialog";

ModuleRegistry.registerModules([AllCommunityModule]);

interface UICalculatedRefundDetails {
  usedDays: number;
  manualUsedDays?: number;
  lessonUsageAmount?: number;
  finalRefundAmount: number;
}

interface UIPaymentDetails {
  lesson: number;
  locker?: number;
  total: number;
}

interface CancelRequestData {
  id: string;
  enrollId: number;
  userName: string;
  userLoginId?: string;
  userPhone?: string;
  lessonTitle: string;
  requestedAt: string;
  reason: string;
  lessonStartDate?: string;
  usesLocker?: boolean;
  paidAmount: UIPaymentDetails;
  calculatedRefund: UICalculatedRefundDetails;
  status: "PENDING" | "APPROVED" | "DENIED" | undefined;
  originalCancellationStatus:
    | "REQ"
    | "PENDING"
    | "APPROVED"
    | "DENIED"
    | "NONE"
    | undefined;
  paymentDisplayStatus:
    | "UNPAID"
    | "PAID"
    | "REFUNDED"
    | "REFUND_PENDING_ADMIN_CANCEL"
    | "CANCELED_UNPAID"
    | undefined;
  adminMemo?: string;
}

interface CancellationRefundTabProps {
  lessonIdFilter?: number | null;
}

const cancelTabQueryKeys = {
  enrollmentsByLesson: (lessonId?: number | null) =>
    ["enrollmentsForLesson", lessonId] as const,
  cancelRequests: (status?: string) => ["adminCancelRequests", status] as const,
};

const StatusCellRenderer: React.FC<
  ICellRendererParams<
    CancelRequestData,
    CancelRequestData["originalCancellationStatus"]
  >
> = (params) => {
  if (!params.value) return null;
  const statusConfig: {
    [key: string]: { colorPalette: string; label: string };
  } = {
    REQ: { colorPalette: "blue", label: "취소 요청" },
    PENDING: { colorPalette: "yellow", label: "처리 대기" },
    APPROVED: { colorPalette: "green", label: "승인 완료" },
    DENIED: { colorPalette: "red", label: "반려됨" },
    NONE: { colorPalette: "gray", label: "해당 없음" },
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

const ActionCellRenderer: React.FC<ICellRendererParams<CancelRequestData>> = (
  params
) => {
  const { data, context } = params;
  if (!data) return null;

  const handleReviewClick = () => {
    if (context && context.openReviewDialog) {
      context.openReviewDialog(data);
    }
  };

  if (data.originalCancellationStatus === "PENDING") {
    return (
      <Button
        size="xs"
        colorPalette="blue"
        variant="outline"
        onClick={handleReviewClick}
      >
        취소 검토
      </Button>
    );
  } else if (data.originalCancellationStatus === "REQ") {
    return (
      <Button
        size="xs"
        colorPalette="blue"
        variant="outline"
        onClick={handleReviewClick}
      >
        요청 검토
      </Button>
    );
  } else if (data.originalCancellationStatus === "APPROVED") {
    return (
      <Button size="xs" colorPalette="green" variant="solid" disabled>
        승인 완료
      </Button>
    );
  } else if (data.originalCancellationStatus === "DENIED") {
    return (
      <Button size="xs" colorPalette="red" variant="solid" disabled>
        반려됨
      </Button>
    );
  }
  return (
    <Button size="xs" variant="outline" disabled>
      {data.originalCancellationStatus === "NONE"
        ? "해당 없음"
        : data.originalCancellationStatus || "처리 불가"}
    </Button>
  );
};

export const CancellationRefundTab = ({
  lessonIdFilter,
}: CancellationRefundTabProps) => {
  const colors = useColors();
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ searchTerm: "" });
  const gridRef = React.useRef<AgGridReact<CancelRequestData>>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<CancelRequestData | null>(null);

  const formatDate = useCallback((dateString: string | undefined | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatCurrency = useCallback(
    (amount: number | undefined | null, showWon: boolean = true) => {
      if (amount === undefined || amount === null) return "-";
      const formatted = new Intl.NumberFormat("ko-KR").format(
        Math.round(amount)
      );
      return showWon ? formatted + "원" : formatted;
    },
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
      cellStyle: { fontSize: "13px", display: "flex", alignItems: "center" },
    }),
    []
  );

  const handleOpenDialog = useCallback((request: CancelRequestData) => {
    setSelectedRequest(request);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  const agGridContext = useMemo(
    () => ({ openReviewDialog: handleOpenDialog }),
    [handleOpenDialog]
  );

  const colDefs = useMemo<ColDef<CancelRequestData>[]>(
    () => [
      {
        headerName: "이름",
        valueGetter: (params) => {
          if (!params.data) return "";
          return `${params.data.userName}${
            params.data.userLoginId ? ` (${params.data.userLoginId})` : ""
          }`;
        },
        flex: 1,
        minWidth: 120,
        tooltipField: "userName",
      },
      {
        headerName: "ID",
        field: "userLoginId",
        flex: 1,
        minWidth: 120,
        tooltipField: "userLoginId",
      },
      {
        headerName: "전화번호",
        field: "userPhone",
        flex: 1,
        minWidth: 120,
        tooltipField: "userPhone",
      },
      {
        headerName: "요청일시",
        field: "requestedAt",
        valueFormatter: (params) => formatDate(params.value),
        width: 150,
        minWidth: 130,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        },
      },
      {
        headerName: "환불사유",
        field: "reason",
        flex: 2,
        minWidth: 200,
        tooltipField: "reason",
        cellRenderer: (
          params: ICellRendererParams<CancelRequestData, string>
        ) => {
          if (!params.value) return "-";
          return params.value.length > 50
            ? `${params.value.substring(0, 47)}...`
            : params.value;
        },
      },
      {
        headerName: "상태",
        field: "originalCancellationStatus",
        cellRenderer: StatusCellRenderer,
        width: 80,
        minWidth: 80,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      {
        headerName: "검토",
        cellRenderer: ActionCellRenderer,
        width: 80,
        minWidth: 70,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        pinned: "right",
      },
    ],
    [formatDate]
  );

  const {
    data: allCancelRequestsData,
    isLoading: isLoadingAllCancelRequests,
    isError: isErrorAllCancelRequests,
    error: errorAllCancelRequests,
  } = useQuery<
    PaginatedResponse<CancelRequestAdminDto>,
    Error,
    CancelRequestData[]
  >({
    queryKey: cancelTabQueryKeys.cancelRequests(
      lessonIdFilter ? lessonIdFilter.toString() : "all"
    ),
    queryFn: async () => {
      console.log(
        "[QueryFn] Calling adminApi.getAdminCancelRequests with lessonId:",
        lessonIdFilter
      );
      const params: { size: number; page: number; lessonId?: number } = {
        size: 10000,
        page: 0,
      };
      if (lessonIdFilter) {
        params.lessonId = lessonIdFilter;
      }
      try {
        const response = await adminApi.getAdminCancelRequests(params);
        console.log(
          "[QueryFn] Response from adminApi.getAdminCancelRequests:",
          response
        );
        return response;
      } catch (e) {
        console.error(
          "[QueryFn] Error calling adminApi.getAdminCancelRequests:",
          e
        );
        throw e;
      }
    },
    select: (apiResponse): CancelRequestData[] => {
      console.log("[SelectFn] Received apiResponse:", apiResponse);
      if (!apiResponse || !apiResponse.data || !apiResponse.data.content) {
        console.error("[SelectFn] Invalid apiResponse structure", apiResponse);
        return [];
      }
      try {
        const mappedData = apiResponse.data.content.map(
          (dto: CancelRequestAdminDto): CancelRequestData => {
            const paidAmountData: UIPaymentDetails = {
              lesson: dto.paymentInfo?.lessonPaidAmt ?? 0,
              locker: dto.paymentInfo?.lockerPaidAmt ?? 0,
              total: dto.paymentInfo?.paidAmt ?? 0,
            };
            const calculatedRefundData: UICalculatedRefundDetails = {
              usedDays:
                dto.calculatedRefundDetails?.effectiveUsedDays ??
                dto.calculatedRefundDetails?.systemCalculatedUsedDays ??
                0,
              manualUsedDays:
                dto.calculatedRefundDetails?.manualUsedDays === null
                  ? undefined
                  : dto.calculatedRefundDetails?.manualUsedDays,
              lessonUsageAmount: dto.calculatedRefundDetails?.lessonUsageAmount,
              finalRefundAmount:
                dto.calculatedRefundAmtByNewPolicy ??
                dto.calculatedRefundDetails?.finalRefundAmount ??
                0,
            };
            const cancellationStatusFromAPI =
              dto.cancellationProcessingStatus as CancelRequestData["originalCancellationStatus"];
            let dialogCompatibleStatus: CancelRequestData["status"] = undefined;
            if (
              cancellationStatusFromAPI === "PENDING" ||
              cancellationStatusFromAPI === "APPROVED" ||
              cancellationStatusFromAPI === "DENIED"
            ) {
              dialogCompatibleStatus = cancellationStatusFromAPI;
            }

            return {
              id:
                dto.requestId !== undefined && dto.requestId !== null
                  ? dto.requestId.toString()
                  : `fallback_id_${dto.enrollId || Math.random()}`,
              enrollId: dto.enrollId,
              userName: dto.userName,
              userLoginId: dto.userLoginId,
              userPhone: dto.userPhone,
              lessonTitle: dto.lessonTitle,
              requestedAt: dto.requestedAt,
              reason: dto.userReason,
              lessonStartDate: dto.lessonStartDate,
              usesLocker: dto.usesLocker,
              paidAmount: paidAmountData,
              calculatedRefund: calculatedRefundData,
              status: dialogCompatibleStatus,
              originalCancellationStatus: cancellationStatusFromAPI,
              paymentDisplayStatus:
                dto.paymentStatus as CancelRequestData["paymentDisplayStatus"],
              adminMemo: dto.adminComment,
            };
          }
        );
        console.log("[SelectFn] Mapped data:", mappedData);
        return mappedData;
      } catch (e) {
        console.error("[SelectFn] Error during mapping:", e);
        throw e;
      }
    },
  });

  console.log(
    "Query State for Cancel Requests: isLoading:",
    isLoadingAllCancelRequests,
    "isError:",
    isErrorAllCancelRequests,
    "error:",
    errorAllCancelRequests,
    "data:",
    allCancelRequestsData
  );

  const finalFilteredRequests = useMemo(() => {
    console.log(
      "[finalFilteredRequests] Start. allCancelRequestsData:",
      allCancelRequestsData
    );
    console.log(
      "[finalFilteredRequests] filters.searchTerm:",
      filters.searchTerm
    );

    if (!allCancelRequestsData || allCancelRequestsData.length === 0) {
      console.log(
        "[finalFilteredRequests] No allCancelRequestsData, returning []."
      );
      return [];
    }
    let dataToFilter = [...allCancelRequestsData];

    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      dataToFilter = dataToFilter.filter((req) => {
        return (
          req.userName.toLowerCase().includes(searchTermLower) ||
          (req.userLoginId &&
            req.userLoginId.toLowerCase().includes(searchTermLower)) ||
          (req.userPhone &&
            req.userPhone.toLowerCase().includes(searchTermLower))
        );
      });
      console.log(
        "[finalFilteredRequests] After search filter, dataToFilter:",
        dataToFilter
      );
    }
    console.log(
      "[finalFilteredRequests] End, returning dataToFilter:",
      dataToFilter
    );
    return dataToFilter;
  }, [allCancelRequestsData, filters.searchTerm]);

  const bg = colorMode === "dark" ? "#1A202C" : "white";
  const textColor = colorMode === "dark" ? "#E2E8F0" : "#2D3748";
  const borderColor = colorMode === "dark" ? "#2D3748" : "#E2E8F0";
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const handleExportGrid = () => {
    gridRef.current?.api.exportDataAsCsv();
  };

  if (isLoadingAllCancelRequests && !allCancelRequestsData) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (
    !lessonIdFilter &&
    !filters.searchTerm &&
    (!allCancelRequestsData || allCancelRequestsData.length === 0)
  ) {
    return (
      <Box p={4} textAlign="center">
        <Text>
          표시할 취소/환불 요청이 없습니다. (강습을 선택하거나 검색어를
          입력하세요)
        </Text>
      </Box>
    );
  }

  if (finalFilteredRequests.length === 0) {
    if (lessonIdFilter) {
      return (
        <Box p={4} textAlign="center">
          <Text>선택된 강습에 대한 취소/환불 요청이 없습니다.</Text>
        </Box>
      );
    }
    if (filters.searchTerm) {
      return (
        <Box p={4} textAlign="center">
          <Text>검색 결과에 해당하는 취소/환불 요청이 없습니다.</Text>
        </Box>
      );
    }
    return (
      <Box p={4} textAlign="center">
        <Text>표시할 취소/환불 요청이 없습니다.</Text>
      </Box>
    );
  }

  return (
    <Box h="full" display="flex" flexDirection="column">
      <CommonGridFilterBar
        searchTerm={filters.searchTerm}
        onSearchTermChange={(e) =>
          setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
        }
        searchTermPlaceholder="검색 (이름/ID/번호)"
        onExport={handleExportGrid}
        onSearchButtonClick={() =>
          queryClient.invalidateQueries({
            queryKey: cancelTabQueryKeys.cancelRequests(
              lessonIdFilter ? lessonIdFilter.toString() : "all"
            ),
          })
        }
        showSearchButton={true}
      />

      <Card.Root my={2}>
        <Card.Body p={3}>
          <Flex justify="space-around" align="center" gap={4}>
            <Box textAlign="center">
              <Text fontSize="sm" color={colors.text.secondary}>
                {lessonIdFilter ? "선택 강습의 " : ""}
                {filters.searchTerm ? "검색된 " : ""}취소/환불 요청
              </Text>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color={colors.primary.default}
              >
                {finalFilteredRequests.length}건
              </Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="sm" color={colors.text.secondary}>
                {lessonIdFilter ? "선택 강습의 " : ""}
                {filters.searchTerm ? "검색된 " : ""}예상 환불 총액
              </Text>
              <Text fontSize="xl" fontWeight="semibold" color="red.500">
                {formatCurrency(
                  finalFilteredRequests.reduce(
                    (sum, req) =>
                      sum + (req.calculatedRefund?.finalRefundAmount || 0),
                    0
                  )
                )}
              </Text>
            </Box>
          </Flex>
        </Card.Body>
      </Card.Root>

      <Box className={agGridTheme} h="480px" w="full">
        <AgGridReact<CancelRequestData>
          ref={gridRef}
          rowData={finalFilteredRequests}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          context={agGridContext}
          headerHeight={36}
          rowHeight={40}
          suppressCellFocus
          getRowStyle={() => ({
            color: textColor,
            background: bg,
            borderBottom: `1px solid ${borderColor}`,
          })}
          animateRows={true}
        />
      </Box>

      <ReviewCancelRequestDialog
        isOpen={!!selectedRequest}
        onClose={handleCloseDialog}
        selectedRequest={selectedRequest}
      />
    </Box>
  );
};
