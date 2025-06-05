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
  DialogBackdrop,
  DialogPositioner,
  For,
  Textarea,
  Spinner,
  HStack,
  Portal,
  Checkbox,
  Tag,
} from "@chakra-ui/react";
import {
  SearchIcon,
  UserIcon,
  XIcon,
  MessageSquareIcon,
  Edit2Icon,
  DownloadIcon,
  PlusCircleIcon,
  PlusIcon,
} from "lucide-react";
import { useColors } from "@/styles/theme";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type {
  EnrollAdminResponseDto,
  PaginatedResponse,
  TemporaryEnrollmentRequestDto,
} from "@/types/api";
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

import { useColorMode } from "@/components/ui/color-mode";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
import { toaster } from "@/components/ui/toaster";
import { AdminCancelReasonDialog } from "./enrollmentManagement/AdminCancelReasonDialog";
import { payStatusOptions } from "@/lib/utils/statusUtils";
import { getMembershipLabel } from "@/lib/utils/displayUtils";

// Import the new dialog components
import { UserMemoDialog } from "./enrollmentManagement/UserMemoDialog";
import { TemporaryEnrollmentDialog } from "./enrollmentManagement/TemporaryEnrollmentDialog";
import { CommonPayStatusBadge } from "@/components/common/CommonPayStatusBadge";

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
    | "CANCELED_UNPAID"
    | "PARTIALLY_REFUNDED"
    | "REFUND_PENDING_ADMIN_CANCEL";
  usesLocker: boolean;
  userName: string;
  userGender: string;
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
  membershipType?: string;
}

interface EnrollmentManagementTabProps {
  lessonIdFilter?: number | null;
}

const enrollmentQueryKeys = {
  all: ["adminEnrollments"] as const,
  list: (lessonId?: number | null, params?: any) =>
    [...enrollmentQueryKeys.all, lessonId, params] as const,
  temporaryCreate: () => [...enrollmentQueryKeys.all, "temporaryCreate"],
  userHistory: (userLoginId?: string) =>
    [...enrollmentQueryKeys.all, "userHistory", userLoginId] as const,
  cancelRequests: ["adminCancelRequests"] as const,
};

const UsesLockerCellRenderer: React.FC<
  ICellRendererParams<EnrollmentData, boolean>
> = (params) => {
  return (
    <Badge
      colorPalette={params.value ? "blue" : "gray"}
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
      colorPalette={params.value ? "purple" : "blue"}
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
        colorPalette="red"
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
          userGender: dto.userGender || "0",
          userLoginId: dto.userLoginId || "",
          userPhone: dto.userPhone || "",
          isRenewal: false,
          enrollStatus: dto.status,
          createdAt: dto.createdAt,
          userMemo: (dto as any).userMemo || undefined,
          membershipType: dto.membershipType,
        })
      );
    },
    enabled: !!lessonIdFilter,
  });

  const rowData = useMemo(() => enrollmentsData || [], [enrollmentsData]);

  const [selectedUserForMemo, setSelectedUserForMemo] =
    useState<EnrollmentData | null>(null);
  const [isTempEnrollDialogOpen, setIsTempEnrollDialogOpen] = useState(false);
  const [isCancelReasonDialogOpen, setIsCancelReasonDialogOpen] =
    useState(false);
  const [enrollmentIdToCancel, setEnrollmentIdToCancel] = useState<
    number | null
  >(null);

  const bg = colorMode === "dark" ? "#1A202C" : "white";
  const textColor = colorMode === "dark" ? "#E2E8F0" : "#2D3748";
  const borderColor = colorMode === "dark" ? "#2D3748" : "#E2E8F0";
  const primaryColor = colors.primary?.default || "#2a7fc1";
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const colDefs = useMemo<ColDef<EnrollmentData>[]>(
    () => [
      {
        headerName: "회원ID",
        field: "userLoginId",
        minWidth: 80,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "회원명",
        field: "userName",
        minWidth: 80,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "성별",
        field: "userGender",
        minWidth: 60,
        filter: "agTextColumnFilter",
        cellRenderer: (params: ICellRendererParams<EnrollmentData, string>) => {
          return params.value === "1" ? "남" : "여";
        },
      },
      {
        headerName: "연락처",
        field: "userPhone",
        minWidth: 100,
      },
      {
        headerName: "할인유형",
        field: "membershipType",
        minWidth: 100,
        valueFormatter: (
          params: ValueFormatterParams<EnrollmentData, string | undefined>
        ) => {
          return getMembershipLabel(params.value);
        },
        filter: "agTextColumnFilter",
      },
      {
        headerName: "결제상태",
        field: "payStatus",
        flex: 1,
        minWidth: 80,
        cellRenderer: (
          params: ICellRendererParams<
            EnrollmentData,
            EnrollmentData["payStatus"]
          >
        ) => (
          <Flex h="100%" w="100%" alignItems="center" justifyContent="center">
            <CommonPayStatusBadge status={params.value} />
          </Flex>
        ),
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
      // {
      //   headerName: "할인",
      //   field: "discountInfo",
      //   width: 80,
      //   cellRenderer: (params: ICellRendererParams<EnrollmentData>) => {
      //     const { data, context } = params;
      //     if (!data || !data.discountInfo)
      //       return (
      //         <Badge colorPalette="gray" variant="outline" size="sm">
      //           없음
      //         </Badge>
      //       );

      //     const statusConfig = {
      //       APPROVED: { colorPalette: "green", label: "승인" },
      //       DENIED: { colorPalette: "red", label: "거절" },
      //       PENDING: { colorPalette: "yellow", label: "대기" },
      //     };
      //     const config = statusConfig[data.discountInfo.status];

      //     return (
      //       <Stack gap={1} h="100%" justifyContent="center" alignItems="center">
      //         <Text fontSize="xs" color={colors.text.secondary}>
      //           {data.discountInfo.type}
      //         </Text>
      //         <Badge
      //           colorPalette={config.colorPalette}
      //           variant="solid"
      //           size="sm"
      //         >
      //           {config.label}
      //         </Badge>
      //         {data.discountInfo.status === "PENDING" && context && (
      //           <HStack mt={1} gap={1}>
      //             <Button
      //               size="xs"
      //               colorPalette="green"
      //               onClick={() =>
      //                 context.handleDiscountApproval(data.enrollId, "APPROVED")
      //               }
      //             >
      //               승인
      //             </Button>
      //             <Button
      //               size="xs"
      //               colorPalette="red"
      //               onClick={() =>
      //                 context.handleDiscountApproval(data.enrollId, "DENIED")
      //               }
      //             >
      //               거절
      //             </Button>
      //           </HStack>
      //         )}
      //       </Stack>
      //     );
      //   },
      //   cellStyle: {
      //     display: "flex",
      //     alignItems: "center",
      //     justifyContent: "center",
      //   },
      // },
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

  const adminCancelEnrollmentMutation = useMutation<
    EnrollAdminResponseDto,
    Error,
    { enrollId: number; reason: string }
  >({
    mutationFn: ({ enrollId, reason }) =>
      adminApi.adminCancelEnrollment(enrollId, { reason }),
    onSuccess: (data) => {
      toaster.success({
        title: "신청 취소 성공",
        description: `신청 ID ${data.enrollId}이(가) 취소되었습니다.`,
      });
      queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.list(lessonIdFilter, {
          payStatus: filters.payStatus || undefined,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.cancelRequests,
      });
      setIsCancelReasonDialogOpen(false);
      setEnrollmentIdToCancel(null);
    },
    onError: (error, variables) => {
      toaster.error({
        title: "신청 취소 실패",
        description:
          error.message || `신청 ID ${variables.enrollId} 취소 중 오류 발생`,
      });
      setIsCancelReasonDialogOpen(false);
      setEnrollmentIdToCancel(null);
    },
  });

  const handleAdminCancelRequest = useCallback((enrollId: number) => {
    setEnrollmentIdToCancel(enrollId);
    setIsCancelReasonDialogOpen(true);
  }, []);

  const handleSubmitAdminCancel = useCallback(
    (reason: string) => {
      if (enrollmentIdToCancel) {
        adminCancelEnrollmentMutation.mutate({
          enrollId: enrollmentIdToCancel,
          reason,
        });
      }
    },
    [enrollmentIdToCancel, adminCancelEnrollmentMutation]
  );

  const handleDiscountApproval = useCallback(
    (enrollId: number, status: "APPROVED" | "DENIED") => {
      console.log("할인 승인/거절:", enrollId, status);
    },
    []
  );

  const openMemoDialog = useCallback((data: EnrollmentData) => {
    setSelectedUserForMemo(data);
  }, []);

  const closeMemoDialog = () => {
    setSelectedUserForMemo(null);
  };

  const handleExportEnrollments = () => {
    gridRef.current?.api.exportDataAsCsv();
    console.log("신청자 목록 CSV 다운로드 (AG Grid)");
  };

  const agGridContext = useMemo(
    () => ({
      openMemoDialog,
      adminCancelEnrollment: handleAdminCancelRequest,
      handleDiscountApproval,
    }),
    [openMemoDialog, handleAdminCancelRequest, handleDiscountApproval]
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

  const handleOpenTempEnrollDialog = () => {
    if (!lessonIdFilter) {
      console.warn("임시 등록하려면 강습 선택 필요");
      return;
    }
    setIsTempEnrollDialogOpen(true);
  };

  const closeTempEnrollDialog = () => {
    setIsTempEnrollDialogOpen(false);
  };

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
    <Box
      h="full"
      display="flex"
      flexDirection="column"
      transform="none"
      willChange="auto"
    >
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
            maxWidth: "120px",
            placeholder: "전체",
          },
        ]}
        onSearchButtonClick={() => {
          console.log("Search button clicked with filters:", filters);
        }}
        showSearchButton={true}
      >
        {/* Year/Month filters removed from here as they were also removed from state/query 
           Re-add if needed: 
        <Field.Root w="220px">
          <NativeSelect.Root size="sm">
            <NativeSelect.Field id="yearFilter" value={filters.year} onChange={(e) => setFilters((prev) => ({ ...prev, year: e.target.value }))} fontSize="xs">
              <For each={years}>{(year) => <option key={year} value={year}>{year}</option>}</For>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root w="220px">
          <NativeSelect.Root size="sm">
            <NativeSelect.Field id="monthFilter" value={filters.month} onChange={(e) => setFilters((prev) => ({ ...prev, month: e.target.value }))} fontSize="xs">
              <For each={months}>{(month) => <option key={month} value={month}>{month}월</option>}</For>
            </NativeSelect.Field>
          </NativeSelect.Root> 
        */}
      </CommonGridFilterBar>
      <Flex my={2} justifyContent="space-between" alignItems="center">
        <Text fontSize="sm" color={colors.text.secondary}>
          총 {filteredEnrollmentsForGrid.length}건의 신청 내역이 표시됩니다.
        </Text>
        <Button
          size="xs"
          colorPalette="teal"
          variant="outline"
          onClick={handleOpenTempEnrollDialog}
          ml={2}
        >
          <PlusIcon size={12} /> 임시 등록
        </Button>
      </Flex>
      <Box
        className={agGridTheme}
        w="full"
        transform="none"
        willChange="auto"
        h="532px"
      >
        <AgGridReact<EnrollmentData>
          ref={gridRef}
          rowData={filteredEnrollmentsForGrid}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          headerHeight={36}
          rowHeight={40}
          context={agGridContext}
          getRowStyle={() => ({
            color: textColor,
            background: bg,
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
          })}
          animateRows={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
        />
      </Box>

      <UserMemoDialog
        isOpen={!!selectedUserForMemo}
        onClose={closeMemoDialog}
        selectedUser={selectedUserForMemo}
        agGridTheme={agGridTheme}
        bg={bg}
        textColor={textColor}
        borderColor={borderColor}
        colors={colors}
      />

      <TemporaryEnrollmentDialog
        isOpen={isTempEnrollDialogOpen}
        onClose={closeTempEnrollDialog}
        lessonIdFilter={lessonIdFilter}
      />

      <AdminCancelReasonDialog
        isOpen={isCancelReasonDialogOpen}
        onClose={() => {
          setIsCancelReasonDialogOpen(false);
          setEnrollmentIdToCancel(null);
        }}
        onSubmit={handleSubmitAdminCancel}
        enrollId={enrollmentIdToCancel}
      />
    </Box>
  );
};
