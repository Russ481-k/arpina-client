"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Text,
  Button,
  Field,
  Input,
  NativeSelect,
  Stack,
  Table,
  Badge,
  Flex,
  IconButton,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  For,
  Textarea,
  Spinner,
} from "@chakra-ui/react";
import { SearchIcon, UserIcon, XIcon, MessageSquareIcon } from "lucide-react";
import { useColors } from "@/styles/theme";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type { EnrollAdminResponseDto, PaginatedResponse } from "@/types/api";

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
  userId: string;
  userPhone?: string;
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

export const EnrollmentManagementTab = ({
  lessonIdFilter,
}: EnrollmentManagementTabProps) => {
  const colors = useColors();

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
          userId: dto.userId,
          userPhone: "(미제공)",
          isRenewal: false,
          enrollStatus: dto.status,
          createdAt: dto.createdAt,
        })
      );
    },
    enabled: !!lessonIdFilter,
  });

  const enrollments = enrollmentsData || [];

  const [selectedUser, setSelectedUser] = useState<EnrollmentData | null>(null);
  const [userMemo, setUserMemo] = useState("");

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

  const getPayStatusBadge = (status: string) => {
    const statusConfig = {
      PAID: { colorScheme: "green", label: "결제완료" },
      UNPAID: { colorScheme: "yellow", label: "미결제" },
      PAYMENT_TIMEOUT: { colorScheme: "gray", label: "결제만료" },
      REFUNDED: { colorScheme: "red", label: "환불" },
      CANCELED_UNPAID: { colorScheme: "gray", label: "취소" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      colorScheme: "gray",
      label: status,
    };

    return (
      <Badge colorScheme={config.colorScheme} variant="solid">
        {config.label}
      </Badge>
    );
  };

  const getDiscountStatusBadge = (
    discountInfo?: EnrollmentData["discountInfo"]
  ) => {
    if (!discountInfo) {
      return (
        <Badge colorScheme="gray" variant="outline">
          없음
        </Badge>
      );
    }

    const statusConfig = {
      APPROVED: { colorScheme: "green", label: "승인" },
      DENIED: { colorScheme: "red", label: "거절" },
      PENDING: { colorScheme: "yellow", label: "대기" },
    };

    const config = statusConfig[discountInfo.status];

    return (
      <Stack gap={1}>
        <Text fontSize="xs" color={colors.text.secondary}>
          {discountInfo.type}
        </Text>
        <Badge colorScheme={config.colorScheme} variant="solid" size="sm">
          {config.label}
        </Badge>
      </Stack>
    );
  };

  const handleAdminCancel = (enrollId: number) => {
    console.log("관리자 취소:", enrollId);
  };

  const handleDiscountApproval = (
    enrollId: number,
    status: "APPROVED" | "DENIED"
  ) => {
    console.log("할인 승인/거절:", enrollId, status);
  };

  const handleUserMemoSave = () => {
    console.log("메모 저장:", selectedUser?.userId, userMemo);
    setSelectedUser(null);
    setUserMemo("");
  };

  const filteredEnrollments = useMemo(() => {
    let data = enrollments;
    return data.filter((enrollment) => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        enrollment.userName.toLowerCase().includes(searchTermLower) ||
        enrollment.userId.toLowerCase().includes(searchTermLower) ||
        (enrollment.userPhone &&
          enrollment.userPhone.includes(searchTermLower));

      return matchesSearch;
    });
  }, [enrollments, filters.searchTerm]);

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

  if (enrollments.length === 0 && lessonIdFilter) {
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
      {/* 필터 섹션 */}
      <Box p={2} borderBottom="1px" borderColor="gray.200">
        <Flex gap={2} wrap="wrap" align="center">
          <NativeSelect.Root size="sm" maxW="80px">
            <NativeSelect.Field
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

          <NativeSelect.Root size="sm" maxW="80px">
            <NativeSelect.Field
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

          <NativeSelect.Root size="sm" maxW="100px">
            <NativeSelect.Field
              value={filters.payStatus}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  payStatus: e.target.value,
                }))
              }
              fontSize="xs"
            >
              <For each={payStatusOptions}>
                {(option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )}
              </For>
            </NativeSelect.Field>
          </NativeSelect.Root>

          <Input
            size="sm"
            placeholder="검색 (이름/ID/번호)"
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                searchTerm: e.target.value,
              }))
            }
            flex="1"
            minW="150px"
            fontSize="xs"
          />
          <IconButton size="sm" variant="outline">
            <SearchIcon size={14} />
          </IconButton>
        </Flex>
      </Box>

      {/* 신청자 테이블 */}
      <Box flex="1" overflow="auto" p={2}>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>신청자</Table.ColumnHeader>
              <Table.ColumnHeader>연락처</Table.ColumnHeader>
              <Table.ColumnHeader>결제상태</Table.ColumnHeader>
              <Table.ColumnHeader>사물함</Table.ColumnHeader>
              <Table.ColumnHeader>할인</Table.ColumnHeader>
              <Table.ColumnHeader>구분</Table.ColumnHeader>
              <Table.ColumnHeader>관리</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredEnrollments.map((enrollment) => (
              <Table.Row key={enrollment.enrollId}>
                <Table.Cell>
                  <Stack gap={1}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(enrollment);
                        setUserMemo("");
                      }}
                    >
                      <UserIcon size={14} />
                      {enrollment.userName}
                    </Button>
                    <Text fontSize="xs" color={colors.text.secondary}>
                      {enrollment.userId}
                    </Text>
                    <Text fontSize="xs" color={colors.text.secondary}>
                      {enrollment.userPhone}
                    </Text>
                  </Stack>
                </Table.Cell>
                <Table.Cell>{enrollment.userPhone || "-"}</Table.Cell>
                <Table.Cell>
                  {getPayStatusBadge(enrollment.payStatus)}
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorScheme={enrollment.usesLocker ? "blue" : "gray"}
                    variant="outline"
                  >
                    {enrollment.usesLocker ? "사용" : "미사용"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap={2}>
                    {getDiscountStatusBadge(enrollment.discountInfo)}
                    {enrollment.discountInfo?.status === "PENDING" && (
                      <Flex gap={1}>
                        <Button
                          size="xs"
                          colorScheme="green"
                          variant="solid"
                          onClick={() =>
                            handleDiscountApproval(
                              enrollment.enrollId,
                              "APPROVED"
                            )
                          }
                        >
                          승인
                        </Button>
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="solid"
                          onClick={() =>
                            handleDiscountApproval(
                              enrollment.enrollId,
                              "DENIED"
                            )
                          }
                        >
                          거절
                        </Button>
                      </Flex>
                    )}
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorScheme={enrollment.isRenewal ? "purple" : "blue"}
                    variant="outline"
                  >
                    {enrollment.isRenewal ? "재수강" : "신규"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleAdminCancel(enrollment.enrollId)}
                  >
                    <XIcon size={12} />
                    결제 취소
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* 회원 메모 다이얼로그 */}
      <DialogRoot
        open={!!selectedUser}
        onOpenChange={() => setSelectedUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원 메모 - {selectedUser?.userName}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field.Root>
              <Field.Label>메모 내용</Field.Label>
              <Textarea
                value={userMemo}
                onChange={(e) => setUserMemo(e.target.value)}
                placeholder="회원에 대한 메모를 입력하세요"
                rows={6}
              />
              <Field.HelperText>
                회원과 관련된 중요한 정보나 상담 내용을 기록하세요.
              </Field.HelperText>
            </Field.Root>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              취소
            </Button>
            <Button colorScheme="blue" onClick={handleUserMemoSave}>
              저장
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      <Box mt={6}>
        <Text fontSize="sm" color={colors.text.secondary}>
          총 {filteredEnrollments.length}건의 신청 내역이 있습니다.
        </Text>
      </Box>
    </Box>
  );
};
