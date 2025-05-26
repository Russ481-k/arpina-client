"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Field,
  Textarea,
  Spinner,
  Stack,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogBackdrop,
  DialogPositioner,
  Flex,
  Badge, // Added Badge for renderers
  Portal, // Added Portal import
} from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import {
  type ColDef,
  type ICellRendererParams,
  type ValueFormatterParams,
} from "ag-grid-community";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi"; // Assuming adminApi is correctly structured for this
import type { EnrollAdminResponseDto, PaginatedResponse } from "@/types/api"; // Assuming types
import { Tag } from "@chakra-ui/react"; // For PayStatusCellRenderer

// Re-define or import EnrollmentData if it's not too complex, or pass as generic
// For simplicity, let's redefine a minimal version here or expect it from props.
// It's better to have a shared types file eventually.
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
  enrollStatus?: string;
  createdAt?: string;
  userMemo?: string;
}

const enrollmentQueryKeys = {
  all: ["adminEnrollments"] as const, // Assuming this is a shared key structure
  userHistory: (userLoginId?: string) =>
    [...enrollmentQueryKeys.all, "userHistory", userLoginId] as const,
};

// PayStatusCellRenderer (copied from EnrollmentManagementTab, consider moving to a shared file)
const PayStatusCellRenderer: React.FC<
  ICellRendererParams<EnrollmentData, EnrollmentData["payStatus"]>
> = (params) => {
  if (!params.value) return null;
  const statusConfig = {
    PAID: { colorPalette: "green", label: "결제완료" },
    UNPAID: { colorPalette: "yellow", label: "미결제" },
    PAYMENT_TIMEOUT: { colorPalette: "gray", label: "결제만료" },
    REFUNDED: { colorPalette: "red", label: "환불" },
    CANCELED_UNPAID: { colorPalette: "gray", label: "취소" },
  };
  const config = statusConfig[params.value as keyof typeof statusConfig] || {
    colorPalette: "gray",
    label: params.value,
  };
  return (
    <Tag.Root colorPalette={config.colorPalette} size="sm">
      <Tag.Label>{config.label}</Tag.Label>
    </Tag.Root>
  );
};

// UsesLockerCellRenderer (copied, consider moving to shared)
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

interface UserMemoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: EnrollmentData | null;
  // queryClient: ReturnType<typeof useQueryClient>; // Pass queryClient if needed for mutations inside
  agGridTheme: string;
  bg: string;
  textColor: string;
  borderColor: string;
  colors: any; // Replace with a more specific type from your theme
}

export const UserMemoDialog: React.FC<UserMemoDialogProps> = ({
  isOpen,
  onClose,
  selectedUser,
  agGridTheme,
  bg,
  textColor,
  borderColor,
  colors,
}) => {
  const [userMemoText, setUserMemoText] = useState("");
  const queryClient = useQueryClient(); // Get queryClient instance

  useEffect(() => {
    if (selectedUser) {
      setUserMemoText(selectedUser.userMemo || "");
    } else {
      setUserMemoText("");
    }
  }, [selectedUser]);

  const {
    data: userEnrollmentsHistoryData,
    isLoading: isLoadingUserEnrollmentsHistory,
  } = useQuery<EnrollmentData[], Error>({
    queryKey: enrollmentQueryKeys.userHistory(selectedUser?.userLoginId),
    queryFn: async (): Promise<EnrollmentData[]> => {
      if (!selectedUser?.userLoginId) {
        return [];
      }
      // IMPORTANT: This is a placeholder implementation.
      // Replace with an actual API call to fetch all enrollments for the user.
      console.warn(
        `Placeholder: API call for user enrollment history for ${selectedUser.userLoginId} needs to be implemented. Returning empty data after delay.`
      );
      // Example:
      // const response = await adminApi.getAdminEnrollments({ userId: selectedUser.userLoginId, size: 100, page: 0 });
      // return response.data.content.map(...); // map to EnrollmentData
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return [];
    },
    enabled: !!selectedUser?.userLoginId,
  });

  const userEnrollmentHistoryColDefs = useMemo<ColDef<EnrollmentData>[]>(
    () => [
      { headerName: "강습명", field: "lessonTitle", flex: 1, minWidth: 150 },
      {
        headerName: "신청일",
        field: "createdAt",
        width: 120,
        valueFormatter: (
          params: ValueFormatterParams<EnrollmentData, string | undefined>
        ) => (params.value ? new Date(params.value).toLocaleDateString() : ""),
      },
      {
        headerName: "결제상태",
        field: "payStatus",
        cellRenderer: PayStatusCellRenderer,
        width: 90,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      { headerName: "신청상태", field: "enrollStatus", width: 90 },
      {
        headerName: "사물함",
        field: "usesLocker",
        cellRenderer: UsesLockerCellRenderer,
        width: 70,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
    ],
    []
  );

  const handleUserMemoSave = () => {
    if (!selectedUser) return;
    // TODO: Implement actual memo save mutation
    console.log(
      "메모 저장 (UserMemoDialog):",
      selectedUser.userLoginId,
      selectedUser.userName,
      userMemoText
    );
    // Example: mutation.mutate({ userId: selectedUser.userLoginId, memo: userMemoText });
    onClose();
  };

  if (!selectedUser) return null;

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent maxWidth="container.lg">
            <DialogHeader>
              <DialogTitle>
                회원 정보 - {selectedUser.userName} ({selectedUser.userLoginId})
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap={4}>
                <Field.Root>
                  <Field.Label>메모 내용</Field.Label>
                  <Textarea
                    value={userMemoText}
                    onChange={(e) => setUserMemoText(e.target.value)}
                    placeholder="회원에 대한 메모를 입력하세요"
                    rows={3}
                  />
                  <Field.HelperText>
                    회원과 관련된 중요한 정보나 상담 내용을 기록하세요.
                  </Field.HelperText>
                </Field.Root>

                <Box mt={2}>
                  <Text fontWeight="semibold" mb={2} fontSize="md">
                    신청 내역
                  </Text>
                  {isLoadingUserEnrollmentsHistory ? (
                    <Flex justify="center" align="center" h="150px">
                      <Spinner />
                    </Flex>
                  ) : userEnrollmentsHistoryData &&
                    userEnrollmentsHistoryData.length > 0 ? (
                    <Box className={agGridTheme} h="250px" w="full">
                      <AgGridReact<EnrollmentData>
                        rowData={userEnrollmentsHistoryData}
                        columnDefs={userEnrollmentHistoryColDefs}
                        defaultColDef={{
                          sortable: true,
                          resizable: true,
                          filter: false,
                          cellStyle: { fontSize: "12px" },
                        }}
                        headerHeight={30}
                        rowHeight={36}
                        domLayout="normal"
                        getRowStyle={() => ({
                          color: textColor,
                          background: bg,
                          borderBottom: `1px solid ${borderColor}`,
                        })}
                        suppressCellFocus={true}
                        suppressMenuHide={true}
                      />
                    </Box>
                  ) : (
                    <Text
                      fontSize="sm"
                      color={colors.text.secondary}
                      textAlign="center"
                      p={4}
                    >
                      이 회원의 다른 신청 내역이 없습니다.
                    </Text>
                  )}
                </Box>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button colorScheme="blue" onClick={handleUserMemoSave}>
                저장
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
};
