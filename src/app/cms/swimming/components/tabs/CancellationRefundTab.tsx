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
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@/styles/ag-grid-custom.css";
import { useColorMode } from "@/components/ui/color-mode";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
import { ReviewCancelRequestDialog } from "./cancellationRefund/ReviewCancelRequestDialog";

ModuleRegistry.registerModules([AllCommunityModule]);

interface BackendCalculatedRefundDetails {
  usedDays: number;
  manualUsedDays?: number;
  lessonUsageAmount: number;
  lockerUsageAmount: number;
  lessonPenalty: number;
  lockerPenalty: number;
  finalRefundAmount: number;
}

interface BackendPaymentDetails {
  lesson: number;
  locker?: number;
  total: number;
}

interface CancelRequestData {
  id: string;
  lessonId?: number;
  enrollId: number;
  userName: string;
  userLoginId?: string;
  userPhone?: string;
  lessonTitle: string;
  requestedAt: string;
  reason: string;
  lessonStartDate: string;
  usesLocker: boolean;
  paidAmount: BackendPaymentDetails;
  calculatedRefund: BackendCalculatedRefundDetails;
  status: "PENDING" | "APPROVED" | "DENIED";
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
  ICellRendererParams<CancelRequestData, CancelRequestData["status"]>
> = (params) => {
  if (!params.value) return null;
  const statusConfig = {
    PENDING: { colorScheme: "yellow", label: "대기" },
    APPROVED: { colorScheme: "green", label: "승인" },
    DENIED: { colorScheme: "red", label: "거부" },
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

const ActionCellRenderer: React.FC<ICellRendererParams<CancelRequestData>> = (
  params
) => {
  const { data, context } = params;
  if (!data || data.status !== "PENDING") return null;
  const handleReviewClick = () => context.openReviewDialog(data);
  return (
    <Button
      size="xs"
      colorScheme="blue"
      variant="outline"
      onClick={handleReviewClick}
    >
      검토
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

  const {
    data: enrollmentsForLessonResponse,
    isLoading: isLoadingEnrollmentsForLesson,
  } = useQuery<PaginatedResponse<EnrollAdminResponseDto>, Error, number[]>({
    queryKey: cancelTabQueryKeys.enrollmentsByLesson(lessonIdFilter),
    queryFn: async () => {
      if (!lessonIdFilter)
        return {
          code: 0,
          message: "",
          success: true,
          data: {
            content: [],
            pageable: {
              pageNumber: 0,
              pageSize: 0,
              sort: { empty: true, sorted: false, unsorted: true },
            },
            totalElements: 0,
            totalPages: 0,
            last: true,
            size: 0,
            number: 0,
            first: true,
            numberOfElements: 0,
            empty: true,
          },
        };
      return adminApi.getAdminEnrollments({
        lessonId: lessonIdFilter,
        size: 10000,
        page: 0,
      });
    },
    select: (data) => data.data.content.map((e) => e.enrollId),
    enabled: !!lessonIdFilter,
  });
  const lessonEnrollIds = enrollmentsForLessonResponse || [];

  const bg = colorMode === "dark" ? "#1A202C" : "white";
  const textColor = colorMode === "dark" ? "#E2E8F0" : "#2D3748";
  const borderColor = colorMode === "dark" ? "#2D3748" : "#E2E8F0";
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const { data: allCancelRequestsData, isLoading: isLoadingAllCancelRequests } =
    useQuery<
      PaginatedResponse<CancelRequestAdminDto>,
      Error,
      CancelRequestData[]
    >({
      queryKey: cancelTabQueryKeys.cancelRequests("PENDING"),
      queryFn: async () => {
        return adminApi.getAdminCancelRequests({
          size: 10000,
          page: 0,
          status: "PENDING",
        });
      },
      select: (apiResponse): CancelRequestData[] => {
        return apiResponse.data.content.map(
          (dto: CancelRequestAdminDto): CancelRequestData => {
            const paidAmountData = dto.paidAmount || {
              lesson: dto.paid_amt || 0,
              locker: (dto.paidAmount as any)?.lockerAmount || 0,
              total: dto.paid_amt || 0,
            };
            const calculatedRefundData = dto.calculatedRefund || {
              usedDays:
                (dto.calculatedRefund as any)?.systemCalculatedUsedDays || 0,
              manualUsedDays: (dto.calculatedRefund as any)?.manualUsedDays,
              lessonUsageAmount:
                (dto.calculatedRefund as any)?.lessonUsageAmount || 0,
              lockerUsageAmount:
                (dto.calculatedRefund as any)?.lockerUsageAmount || 0,
              lessonPenalty: (dto.calculatedRefund as any)?.lessonPenalty || 0,
              lockerPenalty: (dto.calculatedRefund as any)?.lockerPenalty || 0,
              finalRefundAmount:
                dto.calculated_refund_amt ||
                (dto.calculatedRefund as any)?.finalRefundAmount ||
                0,
            };
            return {
              id: dto.requestId.toString(),
              enrollId: dto.enrollId,
              userName: dto.userName,
              userLoginId: (dto as any).userLoginId || undefined,
              userPhone: (dto as any).userPhone || undefined,
              lessonTitle: dto.lessonTitle,
              requestedAt: dto.requested_at || new Date().toISOString(),
              reason: dto.reason,
              lessonStartDate: dto.lessonStartDate,
              usesLocker: dto.usesLocker,
              paidAmount: paidAmountData as BackendPaymentDetails,
              calculatedRefund:
                calculatedRefundData as BackendCalculatedRefundDetails,
              status: dto.status,
              adminMemo: (dto as any).adminMemo || undefined,
            };
          }
        );
      },
    });

  const finalFilteredRequests = useMemo(() => {
    if (!allCancelRequestsData) return [];
    let dataToFilter = allCancelRequestsData;
    if (lessonIdFilter) {
      if (isLoadingEnrollmentsForLesson) return [];
      if (!enrollmentsForLessonResponse || lessonEnrollIds.length === 0)
        return [];
      dataToFilter = dataToFilter.filter((req) =>
        lessonEnrollIds.includes(req.enrollId)
      );
    }
    if (filters.searchTerm) {
      return dataToFilter.filter((req) => {
        const searchTermLower = filters.searchTerm.toLowerCase();
        return (
          req.userName.toLowerCase().includes(searchTermLower) ||
          (req.userLoginId &&
            req.userLoginId.toLowerCase().includes(searchTermLower)) ||
          (req.userPhone &&
            req.userPhone.toLowerCase().includes(searchTermLower))
        );
      });
    }
    return dataToFilter;
  }, [
    allCancelRequestsData,
    lessonIdFilter,
    lessonEnrollIds,
    filters.searchTerm,
    isLoadingEnrollmentsForLesson,
    enrollmentsForLessonResponse,
  ]);

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

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (
    amount: number | undefined | null,
    showWon: boolean = true
  ) => {
    if (amount === undefined || amount === null) return "-";
    const formatted = new Intl.NumberFormat("ko-KR").format(Math.round(amount));
    return showWon ? formatted + "원" : formatted;
  };

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
      cellStyle: { fontSize: "13px", display: "flex", alignItems: "center" },
    }),
    []
  );

  const handleExportGrid = () => {
    gridRef.current?.api.exportDataAsCsv();
  };

  if (lessonIdFilter && isLoadingEnrollmentsForLesson) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (isLoadingAllCancelRequests && !allCancelRequestsData) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (!lessonIdFilter && !filters.searchTerm) {
    return (
      <Box p={4} textAlign="center">
        <Text>
          강습을 선택하거나 검색어를 입력하면 취소/환불 목록이 표시됩니다.
        </Text>
      </Box>
    );
  }
  if (
    lessonIdFilter &&
    !isLoadingEnrollmentsForLesson &&
    (!enrollmentsForLessonResponse || lessonEnrollIds.length === 0)
  ) {
    return (
      <Box p={4} textAlign="center">
        <Text>
          선택된 강습에 대한 수강정보가 없습니다. 따라서 취소/환불 요청도
          없습니다.
        </Text>
      </Box>
    );
  }
  if (finalFilteredRequests.length === 0) {
    if (lessonIdFilter)
      return (
        <Box p={4} textAlign="center">
          <Text>선택된 강습에 대한 취소/환불 요청이 없습니다.</Text>
        </Box>
      );
    if (filters.searchTerm)
      return (
        <Box p={4} textAlign="center">
          <Text>검색 결과에 해당하는 취소/환불 요청이 없습니다.</Text>
        </Box>
      );
    return (
      <Box p={4} textAlign="center">
        <Text>표시할 취소/환불 요청이 없습니다.</Text>
      </Box>
    );
  }

  const colDefs = useMemo<ColDef<CancelRequestData>[]>(
    () => [
      { headerName: "이름", field: "userName", flex: 1, minWidth: 120 },
      { headerName: "핸드폰 번호", field: "userPhone", flex: 1, minWidth: 130 },
      {
        headerName: "요청일시",
        field: "requestedAt",
        valueFormatter: (
          params: ValueFormatterParams<CancelRequestData, string | null>
        ) => formatDate(params.value),
        width: 180,
      },
      {
        headerName: "사용일수",
        valueGetter: (params) => {
          const d = params.data;
          if (!d) return "";
          return `${
            d.calculatedRefund.manualUsedDays ?? d.calculatedRefund.usedDays
          }일`;
        },
        width: 100,
        cellStyle: { justifyContent: "center" },
      },
      {
        headerName: "환불예정액",
        field: "calculatedRefund.finalRefundAmount",
        valueFormatter: (
          params: ValueFormatterParams<CancelRequestData, number | null>
        ) => formatCurrency(params.value),
        width: 130,
        cellStyle: { justifyContent: "flex-end" },
      },
      {
        headerName: "상태",
        field: "status",
        cellRenderer: StatusCellRenderer,
        width: 100,
        cellStyle: { justifyContent: "center" },
      },
      {
        headerName: "관리",
        cellRenderer: ActionCellRenderer,
        width: 100,
        pinned: "right",
        cellStyle: { justifyContent: "center" },
      },
    ],
    [formatDate, formatCurrency]
  );

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
            queryKey: cancelTabQueryKeys.cancelRequests(),
          })
        }
        showSearchButton={true}
      />

      <Card.Root mb={6} p={4}>
        <Card.Body>
          <Flex align="center" gap={4}>
            <Box>
              <Text fontSize="sm" color={colors.text.secondary}>
                {lessonIdFilter ? "선택 강습의 " : ""}
                {filters.searchTerm ? "검색된 " : ""}대기 중인 취소 요청
              </Text>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={colors.primary.default}
              >
                {finalFilteredRequests.length}건
              </Text>
            </Box>
            <Box>
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

      <Box className={agGridTheme} h="calc(100vh - 400px)" w="full">
        <AgGridReact<CancelRequestData>
          ref={gridRef}
          rowData={finalFilteredRequests}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          context={agGridContext}
          domLayout="autoHeight"
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
