"use client";

import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Field,
  Fieldset,
  NativeSelect,
  Stack,
  Flex,
  For,
  Card,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import {
  DownloadIcon,
  TrendingUpIcon,
  UsersIcon,
  DollarSignIcon,
  BarChart3Icon,
  LockIcon,
} from "lucide-react";
import { useColors } from "@/styles/theme";

interface MonthlyStats {
  month: string;
  revenue: number;
  enrollments: number;
  lockerUsage: number;
  refunds: number;
  newUsers: number;
  renewalUsers: number;
}

export const StatisticsTab: React.FC = () => {
  const colors = useColors();

  // Mock data - 실제로는 API에서 가져와야 함
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("all");

  const monthlyStats: MonthlyStats[] = [
    {
      month: "2025-01",
      revenue: 15400000,
      enrollments: 240,
      lockerUsage: 85,
      refunds: 1200000,
      newUsers: 150,
      renewalUsers: 90,
    },
    {
      month: "2024-12",
      revenue: 14800000,
      enrollments: 230,
      lockerUsage: 82,
      refunds: 800000,
      newUsers: 140,
      renewalUsers: 90,
    },
    {
      month: "2024-11",
      revenue: 16200000,
      enrollments: 260,
      lockerUsage: 88,
      refunds: 1500000,
      newUsers: 165,
      renewalUsers: 95,
    },
  ];

  const years = ["2025", "2024", "2023"];
  const months = [
    { value: "all", label: "전체" },
    { value: "01", label: "1월" },
    { value: "02", label: "2월" },
    { value: "03", label: "3월" },
    { value: "04", label: "4월" },
    { value: "05", label: "5월" },
    { value: "06", label: "6월" },
    { value: "07", label: "7월" },
    { value: "08", label: "8월" },
    { value: "09", label: "9월" },
    { value: "10", label: "10월" },
    { value: "11", label: "11월" },
    { value: "12", label: "12월" },
  ];

  const handleExportData = () => {
    // TODO: 엑셀 다운로드 구현
    console.log("통계 데이터 엑셀 다운로드", { selectedYear, selectedMonth });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount) + "원";
  };

  const formatPercent = (value: number) => {
    return value.toFixed(1) + "%";
  };

  // 현재 선택된 기간의 통계 계산
  const filteredStats =
    selectedMonth === "all"
      ? monthlyStats.filter((stat) => stat.month.startsWith(selectedYear))
      : monthlyStats.filter(
          (stat) => stat.month === `${selectedYear}-${selectedMonth}`
        );

  const totalStats = filteredStats.reduce(
    (acc, stat) => ({
      revenue: acc.revenue + stat.revenue,
      enrollments: acc.enrollments + stat.enrollments,
      lockerUsage: acc.lockerUsage + stat.lockerUsage,
      refunds: acc.refunds + stat.refunds,
      newUsers: acc.newUsers + stat.newUsers,
      renewalUsers: acc.renewalUsers + stat.renewalUsers,
    }),
    {
      revenue: 0,
      enrollments: 0,
      lockerUsage: 0,
      refunds: 0,
      newUsers: 0,
      renewalUsers: 0,
    }
  );

  const avgLockerUsage =
    filteredStats.length > 0
      ? filteredStats.reduce((sum, stat) => sum + stat.lockerUsage, 0) /
        filteredStats.length
      : 0;

  const renewalRate =
    totalStats.newUsers + totalStats.renewalUsers > 0
      ? (totalStats.renewalUsers /
          (totalStats.newUsers + totalStats.renewalUsers)) *
        100
      : 0;

  return (
    <Box h="full" overflow="auto">
      {/* 간소화된 필터 */}
      <Flex gap={2} mb={3} wrap="wrap" align="center">
        <NativeSelect.Root size="sm" maxW="80px">
          <NativeSelect.Field
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
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
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            fontSize="xs"
          >
            <For each={months}>
              {(month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              )}
            </For>
          </NativeSelect.Field>
        </NativeSelect.Root>

        <Button
          size="xs"
          colorScheme="green"
          variant="outline"
          onClick={handleExportData}
        >
          <DownloadIcon size={12} />
        </Button>
      </Flex>

      {/* 주요 지표 카드 */}
      <Stack gap={2} mb={4}>
        <Card.Root p={2} size="sm">
          <Card.Body p={0}>
            <Flex align="center" gap={2}>
              <Box p={1} borderRadius="md" bg={colors.primary.light}>
                <DollarSignIcon size={14} color={colors.primary.default} />
              </Box>
              <Box flex="1">
                <Text fontSize="xs" color={colors.text.secondary}>
                  총 매출
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color={colors.primary.default}
                >
                  {new Intl.NumberFormat("ko-KR", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(totalStats.revenue)}
                  원
                </Text>
              </Box>
            </Flex>
          </Card.Body>
        </Card.Root>

        <Card.Root p={2} size="sm">
          <Card.Body p={0}>
            <Flex align="center" gap={2}>
              <Box p={1} borderRadius="md" bg="blue.100">
                <UsersIcon size={14} color="blue.600" />
              </Box>
              <Box flex="1">
                <Text fontSize="xs" color={colors.text.secondary}>
                  신청자
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                  {totalStats.enrollments}명
                </Text>
              </Box>
            </Flex>
          </Card.Body>
        </Card.Root>

        <Card.Root p={2} size="sm">
          <Card.Body p={0}>
            <Flex align="center" gap={2}>
              <Box p={1} borderRadius="md" bg="purple.100">
                <LockIcon size={14} color="purple.600" />
              </Box>
              <Box flex="1">
                <Text fontSize="xs" color={colors.text.secondary}>
                  사물함
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="purple.600">
                  {formatPercent(avgLockerUsage)}
                </Text>
              </Box>
            </Flex>
          </Card.Body>
        </Card.Root>
      </Stack>

      {/* 차트 영역 */}
      <Card.Root p={2} mb={3}>
        <Card.Header pb={1}>
          <Heading size="xs" mb={1}>
            <BarChart3Icon
              size={12}
              style={{ display: "inline", marginRight: "4px" }}
            />
            매출 추이
          </Heading>
        </Card.Header>
        <Card.Body pt={0}>
          <Box
            h="60px"
            bg="gray.100"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="xs" color={colors.text.secondary}>
              📊 차트
            </Text>
          </Box>
        </Card.Body>
      </Card.Root>

      {/* 간소화된 통계 */}
      <Card.Root p={2}>
        <Card.Header pb={1}>
          <Heading size="xs" mb={1}>
            상세 통계
          </Heading>
        </Card.Header>
        <Card.Body pt={0}>
          <Stack gap={2} fontSize="xs">
            <Flex justify="space-between">
              <Text color={colors.text.secondary}>순 매출</Text>
              <Text fontWeight="medium" color={colors.primary.default}>
                {new Intl.NumberFormat("ko-KR", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(totalStats.revenue - totalStats.refunds)}
                원
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text color={colors.text.secondary}>환불</Text>
              <Text fontWeight="medium" color="red.500">
                {new Intl.NumberFormat("ko-KR", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(totalStats.refunds)}
                원
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text color={colors.text.secondary}>재수강율</Text>
              <Text fontWeight="medium">{formatPercent(renewalRate)}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text color={colors.text.secondary}>신규 회원</Text>
              <Text fontWeight="medium" color="green.600">
                {totalStats.newUsers}명
              </Text>
            </Flex>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};
