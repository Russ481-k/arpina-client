"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  Box,
  Text,
  Button,
  Field,
  Input,
  NativeSelect,
  Stack,
  Badge,
  Flex,
  IconButton,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  For,
  Textarea,
  Spinner,
  HStack,
  Portal,
} from "@chakra-ui/react";
import {
  SearchIcon,
  UserIcon,
  XIcon,
  MessageSquareIcon,
  Edit2Icon,
  DownloadIcon,
} from "lucide-react";
import { useColors } from "@/styles/theme";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type { EnrollAdminResponseDto, PaginatedResponse } from "@/types/api";
import { AgGridReact } from "ag-grid-react";
import {
  type ColDef,
  ModuleRegistry,
  AllCommunityModule,
  type ICellRendererParams,
  type ValueFormatterParams,
  type RowClickedEvent,
  type CellClickedEvent,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@/styles/ag-grid-custom.css";
import { useColorMode } from "@/components/ui/color-mode";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";

ModuleRegistry.registerModules([AllCommunityModule]);

interface EnrollmentData {
  enrollId: number;
  lessonId: number;
  lessonTitle: string;
  payStatus:
    | "PAID"
    | "UNPAID"
    | "PAYMENT_TIMEOUT"
    | "REFUNDED"
    | "CANCELED_UNPAID";
  usesLocker: boolean;
  userName: string;
  userLoginId: string;
  userPhone: string;
  isRenewal?: boolean;
  discountInfo?: {
    type: string;
    status: "APPROVED" | "DENIED" | "PENDING";
    approvedAt?: string;
    adminComment?: string;
  };
  userMemo?: string;
  enrollStatus?: string;
  createdAt?: string;
}

interface EnrollmentManagementTabProps {
  lessonIdFilter?: number | null;
}

const enrollmentQueryKeys = {
  all: ["adminEnrollments"] as const,
  list: (lessonId?: number | null, params?: any) =>
    [...enrollmentQueryKeys.all, lessonId, params] as const,
};

const PayStatusCellRenderer: React.FC<
  ICellRendererParams<EnrollmentData, EnrollmentData["payStatus"]>
> = (params) => {
  if (!params.value) return null;
  const statusConfig = {
    PAID: { colorScheme: "green", label: "결제완료" },
    UNPAID: { colorScheme: "yellow", label: "미결제" },
    PAYMENT_TIMEOUT: { colorScheme: "gray", label: "결제만료" },
    REFUNDED: { colorScheme: "red", label: "환불" },
    CANCELED_UNPAID: { colorScheme: "gray", label: "취소" },
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

const UsesLockerCellRenderer: React.FC<
  ICellRendererParams<EnrollmentData, boolean>
> = (params) => {
  return (
    <Badge
      colorScheme={params.value ? "blue" : "gray"}
      variant="outline"
      size="sm"
    >
      {params.value ? "사용" : "미사용"}
    </Badge>
  );
};

const RenewalCellRenderer: React.FC<
  ICellRendererParams<EnrollmentData, boolean | undefined>
> = (params) => {
  return (
    <Badge
      colorScheme={params.value ? "purple" : "blue"}
      variant="outline"
      size="sm"
    >
      {params.value ? "재수강" : "신규"}
    </Badge>
  );
};

const ActionCellRenderer: React.FC<ICellRendererParams<EnrollmentData>> = (
  params
) => {
  const { api, node, data, context } = params;
  if (!data) return null;

  const handleMemoClick = () => context.openMemoDialog(data);
  const handleAdminCancelClick = () =>
    context.adminCancelEnrollment(data.enrollId);

  return (
    <HStack gap={1} h="100%" alignItems="center">
      <IconButton
        size="xs"
        variant="ghost"
        aria-label="View/Edit Memo"
        onClick={handleMemoClick}
      >
        <MessageSquareIcon size={14} />
      </IconButton>
      <IconButton
        size="xs"
        variant="ghost"
        colorScheme="red"
        aria-label="Admin Cancel"
        onClick={handleAdminCancelClick}
      >
        <XIcon size={14} />
      </IconButton>
    </HStack>
  );
};

export const EnrollmentManagementTab = ({
  lessonIdFilter,
}: EnrollmentManagementTabProps) => {
  const colors = useColors();
  const { colorMode } = useColorMode();
  const gridRef = useRef<AgGridReact<EnrollmentData>>(null);
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    searchTerm: "",
    payStatus: "",
  });

  const {
    data: enrollmentsData,
    isLoading: isLoadingEnrollments,
    isError: isErrorEnrollments,
    error: enrollmentsError,
  } = useQuery<
    PaginatedResponse<EnrollAdminResponseDto>,
    Error,
    EnrollmentData[]
  >({
    queryKey: enrollmentQueryKeys.list(lessonIdFilter, {
      payStatus: filters.payStatus || undefined,
    }),
    queryFn: async (): Promise<PaginatedResponse<EnrollAdminResponseDto>> => {
      if (!lessonIdFilter) {
        return {
          code: 0,
          message: "No lesson selected.",
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
      }
      return adminApi.getAdminEnrollments({
        lessonId: lessonIdFilter,
        payStatus: filters.payStatus || undefined,
        size: 1000,
        page: 0,
      });
    },
    select: (
      apiResponse: PaginatedResponse<EnrollAdminResponseDto>
    ): EnrollmentData[] => {
      return apiResponse.data.content.map(
        (dto: EnrollAdminResponseDto): EnrollmentData => ({
          enrollId: dto.enrollId,
          lessonId: dto.lessonId,
          lessonTitle: dto.lessonTitle,
          payStatus: dto.payStatus as EnrollmentData["payStatus"],
          usesLocker: dto.usesLocker,
          userName: dto.userName,
          userLoginId: dto.userLoginId || "",
          userPhone: dto.userPhone || "",
          isRenewal: false,
          enrollStatus: dto.status,
          createdAt: dto.createdAt,
        })
      );
    },
    enabled: !!lessonIdFilter,
  });

  const rowData = enrollmentsData || [];

  const [selectedUserForMemo, setSelectedUserForMemo] =
    useState<EnrollmentData | null>(null);
  const [userMemoText, setUserMemoText] = useState("");

  const bg = colorMode === "dark" ? "#1A202C" : "white";
  const textColor = colorMode === "dark" ? "#E2E8F0" : "#2D3748";
  const borderColor = colorMode === "dark" ? "#2D3748" : "#E2E8F0";
  const primaryColor = colors.primary?.default || "#2a7fc1";
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const colDefs = useMemo<ColDef<EnrollmentData>[]>(
    () => [
      {
        headerName: "이름",
        field: "userName",
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "핸드폰 번호",
        field: "userPhone",
        flex: 1,
        minWidth: 130,
      },
      {
        headerName: "결제상태",
        field: "payStatus",
        cellRenderer: PayStatusCellRenderer,
        width: 100,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      {
        headerName: "사물함",
        field: "usesLocker",
        cellRenderer: UsesLockerCellRenderer,
        width: 80,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      {
        headerName: "할인",
        field: "discountInfo",
        width: 80,
        cellRenderer: (params: ICellRendererParams<EnrollmentData>) => {
          const { data, context } = params;
          if (!data || !data.discountInfo)
            return (
              <Badge colorScheme="gray" variant="outline" size="sm">
                없음
              </Badge>
            );

          const statusConfig = {
            APPROVED: { colorScheme: "green", label: "승인" },
            DENIED: { colorScheme: "red", label: "거절" },
            PENDING: { colorScheme: "yellow", label: "대기" },
          };
          const config = statusConfig[data.discountInfo.status];

          return (
            <Stack gap={1} h="100%" justifyContent="center" alignItems="center">
              <Text fontSize="xs" color={colors.text.secondary}>
                {data.discountInfo.type}
              </Text>
              <Badge colorScheme={config.colorScheme} variant="solid" size="sm">
                {config.label}
              </Badge>
              {data.discountInfo.status === "PENDING" && context && (
                <HStack mt={1} gap={1}>
                  <Button
                    size="xs"
                    colorScheme="green"
                    onClick={() =>
                      context.handleDiscountApproval(data.enrollId, "APPROVED")
                    }
                  >
                    승인
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={() =>
                      context.handleDiscountApproval(data.enrollId, "DENIED")
                    }
                  >
                    거절
                  </Button>
                </HStack>
              )}
            </Stack>
          );
        },
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      {
        headerName: "구분",
        field: "isRenewal",
        cellRenderer: RenewalCellRenderer,
        width: 80,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      {
        headerName: "관리",
        cellRenderer: ActionCellRenderer,
        width: 100,
        pinned: "right",
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
    ],
    [colors]
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
      },
    }),
    []
  );

  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - 2 + i).toString()
  );

  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  const payStatusOptions = [
    { value: "", label: "전체" },
    { value: "PAID", label: "결제완료" },
    { value: "UNPAID", label: "미결제" },
    { value: "PAYMENT_TIMEOUT", label: "결제만료" },
    { value: "REFUNDED", label: "환불" },
    { value: "CANCELED_UNPAID", label: "취소" },
  ];

  const handleAdminCancel = (enrollId: number) => {
    console.log("관리자 취소:", enrollId);
  };

  const handleDiscountApproval = (
    enrollId: number,
    status: "APPROVED" | "DENIED"
  ) => {
    console.log("할인 승인/거절:", enrollId, status);
  };

  const openMemoDialog = (data: EnrollmentData) => {
    setSelectedUserForMemo(data);
    setUserMemoText(data.userMemo || "");
  };

  const handleUserMemoSave = () => {
    if (!selectedUserForMemo) return;
    console.log(
      "메모 저장:",
      selectedUserForMemo.userLoginId,
      selectedUserForMemo.userName,
      userMemoText
    );
    setSelectedUserForMemo(null);
    setUserMemoText("");
  };

  const handleExportEnrollments = () => {
    gridRef.current?.api.exportDataAsCsv();
    console.log("신청자 목록 CSV 다운로드 (AG Grid)");
  };

  const agGridContext = useMemo(
    () => ({
      openMemoDialog,
      adminCancelEnrollment: handleAdminCancel,
      handleDiscountApproval,
    }),
    [openMemoDialog, handleAdminCancel, handleDiscountApproval]
  );

  const filteredEnrollmentsForGrid = useMemo(() => {
    let data = rowData;
    if (filters.searchTerm) {
      data = data.filter((enrollment) => {
        const searchTermLower = filters.searchTerm.toLowerCase();
        return (
          enrollment.userName.toLowerCase().includes(searchTermLower) ||
          enrollment.userLoginId.toLowerCase().includes(searchTermLower) ||
          (enrollment.userPhone &&
            enrollment.userPhone.includes(searchTermLower))
        );
      });
    }
    return data;
  }, [rowData, filters.searchTerm]);

  if (isLoadingEnrollments && lessonIdFilter) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (isErrorEnrollments && lessonIdFilter) {
    return (
      <Box p={4} color="red.500">
        <Text>데이터를 불러오는 중 오류가 발생했습니다.</Text>
        <Text fontSize="sm">{enrollmentsError?.message}</Text>
      </Box>
    );
  }

  if (!lessonIdFilter) {
    return (
      <Box p={4} textAlign="center">
        <Text color={colors.text.secondary}>
          강습을 선택하면 신청자 목록이 표시됩니다.
        </Text>
      </Box>
    );
  }

  if (rowData.length === 0 && lessonIdFilter) {
    return (
      <Box p={4} textAlign="center">
        <Text color={colors.text.secondary}>
          선택된 강습에 대한 신청 내역이 없습니다.
        </Text>
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
        onExport={handleExportEnrollments}
        exportButtonLabel="엑셀 다운로드"
        selectFilters={[
          {
            id: "payStatusFilter",
            label: "결제상태",
            value: filters.payStatus,
            onChange: (e) =>
              setFilters((prev) => ({ ...prev, payStatus: e.target.value })),
            options: payStatusOptions,
            maxWidth: "100px",
            placeholder: "전체",
          },
        ]}
        onSearchButtonClick={() => {
          console.log("Search button clicked with filters:", filters);
        }}
        showSearchButton={true}
      >
        <Field.Root w="220px">
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              id="yearFilter"
              value={filters.year}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, year: e.target.value }))
              }
              fontSize="xs"
            >
              <For each={years}>
                {(year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )}
              </For>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root w="220px">
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              id="monthFilter"
              value={filters.month}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, month: e.target.value }))
              }
              fontSize="xs"
            >
              <For each={months}>
                {(month) => (
                  <option key={month} value={month}>
                    {month}월
                  </option>
                )}
              </For>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Field.Root>
      </CommonGridFilterBar>

      <Box className={agGridTheme} h="calc(100vh - 400px)" w="full" p={2}>
        <AgGridReact<EnrollmentData>
          ref={gridRef}
          rowData={filteredEnrollmentsForGrid}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
          headerHeight={36}
          rowHeight={40}
          context={agGridContext}
          suppressCellFocus
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

      <DialogRoot
        open={!!selectedUserForMemo}
        onOpenChange={() => setSelectedUserForMemo(null)}
      >
        <Portal>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                회원 메모 - {selectedUserForMemo?.userName}
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Field.Root>
                <Field.Label>메모 내용</Field.Label>
                <Textarea
                  value={userMemoText}
                  onChange={(e) => setUserMemoText(e.target.value)}
                  placeholder="회원에 대한 메모를 입력하세요"
                  rows={6}
                />
                <Field.HelperText>
                  회원과 관련된 중요한 정보나 상담 내용을 기록하세요.
                </Field.HelperText>
              </Field.Root>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedUserForMemo(null)}
              >
                취소
              </Button>
              <Button colorScheme="blue" onClick={handleUserMemoSave}>
                저장
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </Portal>
      </DialogRoot>

      <Box mt={2} px={2}>
        <Text fontSize="sm" color={colors.text.secondary}>
          총 {filteredEnrollmentsForGrid.length}건의 신청 내역이 표시됩니다.
          (클라이언트 필터링)
        </Text>
      </Box>
    </Box>
  );
};
