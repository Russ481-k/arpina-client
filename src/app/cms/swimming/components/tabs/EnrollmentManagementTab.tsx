"use client";

import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Field,
  Fieldset,
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
} from "@chakra-ui/react";
import { SearchIcon, UserIcon, XIcon, MessageSquareIcon } from "lucide-react";
import { useColors } from "@/styles/theme";

interface EnrollmentData {
  enrollId: number;
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
  userPhone: string;
  isRenewal: boolean;
  discountInfo?: {
    type: string;
    status: "APPROVED" | "DENIED" | "PENDING";
    approvedAt?: string;
    adminComment?: string;
  };
}

export const EnrollmentManagementTab: React.FC = () => {
  const colors = useColors();

  // Mock data
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([
    {
      enrollId: 1,
      lessonTitle: "초급반 (오전)",
      payStatus: "PAID",
      usesLocker: true,
      userName: "김수영",
      userId: "swimKim",
      userPhone: "010-1234-5678",
      isRenewal: false,
      discountInfo: {
        type: "장애인할인",
        status: "PENDING",
      },
    },
    {
      enrollId: 2,
      lessonTitle: "중급반 (저녁)",
      payStatus: "PAID",
      usesLocker: false,
      userName: "박헤엄",
      userId: "parkSwim",
      userPhone: "010-9876-5432",
      isRenewal: true,
    },
  ]);

  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    searchTerm: "",
    payStatus: "",
  });

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
    // TODO: API 호출하여 관리자 취소 처리
    console.log("관리자 취소:", enrollId);
  };

  const handleDiscountApproval = (
    enrollId: number,
    status: "APPROVED" | "DENIED"
  ) => {
    setEnrollments((prev) =>
      prev.map((item) =>
        item.enrollId === enrollId
          ? {
              ...item,
              discountInfo: {
                ...item.discountInfo!,
                status,
                approvedAt: new Date().toISOString(),
              },
            }
          : item
      )
    );
    // TODO: API 호출
  };

  const handleUserMemoSave = () => {
    // TODO: API 호출하여 메모 저장
    console.log("메모 저장:", selectedUser?.userId, userMemo);
    setSelectedUser(null);
    setUserMemo("");
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.userName
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      enrollment.userId
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      enrollment.userPhone.includes(filters.searchTerm);

    const matchesPayStatus =
      !filters.payStatus || enrollment.payStatus === filters.payStatus;

    return matchesSearch && matchesPayStatus;
  });

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
              <Table.ColumnHeader>회원정보</Table.ColumnHeader>
              <Table.ColumnHeader>강습명</Table.ColumnHeader>
              <Table.ColumnHeader>결제상태</Table.ColumnHeader>
              <Table.ColumnHeader>사물함</Table.ColumnHeader>
              <Table.ColumnHeader>할인정보</Table.ColumnHeader>
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
                <Table.Cell>{enrollment.lessonTitle}</Table.Cell>
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
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleAdminCancel(enrollment.enrollId)}
                  >
                    <XIcon size={14} />
                    관리자취소
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
