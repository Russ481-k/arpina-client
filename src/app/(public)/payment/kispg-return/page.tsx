"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Text,
  Button,
  Flex,
  Spinner,
  Heading,
  VStack,
  Icon,
} from "@chakra-ui/react";
import {
  MdCheckCircleOutline,
  MdErrorOutline,
  MdHourglassEmpty,
} from "react-icons/md";
import Link from "next/link";
import { mypageApi } from "@/lib/api/mypageApi"; // To fetch enrollment status
import { toaster } from "@/components/ui/toaster";

// KISPG 결과 파라미터 타입 (실제 KISPG 명세에 따라 필드 추가/수정 필요)
interface KispgReturnParams {
  resultCode?: string;
  resultMsg?: string;
  moid?: string; // 주문번호 (enrollId와 매핑될 수 있음)
  tid?: string; // KISPG 거래 ID
  amt?: string; // 금액
  // ... 기타 KISPG가 전달하는 파라미터들
}

type PaymentDisplayStatus = "PENDING" | "SUCCESS" | "FAILURE";

const KispgReturnContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [kispgData, setKispgData] = useState<KispgReturnParams | null>(null);
  const [enrollId, setEnrollId] = useState<number | null>(null);
  const [paymentDisplayStatus, setPaymentDisplayStatus] =
    useState<PaymentDisplayStatus>("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalMessage, setFinalMessage] =
    useState<string>("결제 결과를 확인 중입니다...");

  useEffect(() => {
    // 1. Parse KISPG parameters from URL
    const params: KispgReturnParams = {};
    searchParams.forEach((value, key) => {
      params[key as keyof KispgReturnParams] = value;
    });
    setKispgData(params);

    if (params.moid) {
      // moid 형식에 따라 enrollId 추출 (예: "enroll_123_timestamp" -> 123)
      const moidParts = params.moid.split("_");
      if (moidParts.length >= 2 && !isNaN(parseInt(moidParts[1]))) {
        setEnrollId(parseInt(moidParts[1]));
      } else {
        setError("잘못된 주문번호 형식입니다.");
        setPaymentDisplayStatus("FAILURE");
        setIsLoading(false);
        setFinalMessage(
          "잘못된 주문 정보로 인해 결제 결과를 확인할 수 없습니다."
        );
      }
    } else {
      setError("주문번호(moid)가 없습니다.");
      setPaymentDisplayStatus("FAILURE");
      setIsLoading(false);
      setFinalMessage(
        "필수 주문 정보가 누락되어 결제 결과를 확인할 수 없습니다."
      );
    }
  }, [searchParams]);

  useEffect(() => {
    if (!enrollId) {
      if (!isLoading && error) {
        // Only stop loading if an error already occurred related to moid/enrollId
        setIsLoading(false);
      }
      return;
    }

    // 2. Poll backend for final payment status
    // This is a simplified polling mechanism. For production, consider SWR or React Query with refetchInterval.
    const POLLING_INTERVAL = 3000; // 3 seconds
    const MAX_POLLS = 10; // Poll for a maximum of 30 seconds
    let pollCount = 0;

    const checkStatus = async () => {
      pollCount++;
      try {
        const enrollmentDetails = await mypageApi.getEnrollmentById(enrollId);
        if (enrollmentDetails?.status === "PAID") {
          // Assuming 'PAID' is the success status from EnrollDto
          setPaymentDisplayStatus("SUCCESS");
          setFinalMessage("결제가 성공적으로 완료되었습니다.");
          setIsLoading(false);
          toaster.create({
            title: "결제 성공",
            description: "수강 신청이 완료되었습니다.",
            type: "success",
          });
          // Optionally, call swimmingPaymentService.confirmPayment here if still needed for any final UX steps
          // await swimmingPaymentService.confirmPayment(enrollId, { pgToken: kispgData?.tid || '', wantsLocker: ??? });
          // wantsLocker state needs to be persisted or fetched if confirm is called here.
        } else if (
          enrollmentDetails?.status === "PAYMENT_FAILED" ||
          enrollmentDetails?.status === "PAYMENT_TIMEOUT" ||
          enrollmentDetails?.status === "CANCELED_UNPAID"
        ) {
          // Example failure statuses
          setPaymentDisplayStatus("FAILURE");
          setFinalMessage(
            `결제에 실패하였거나 시간이 초과되었습니다. (상태: ${enrollmentDetails.status})`
          );
          setError(kispgData?.resultMsg || "결제 처리 중 문제가 발생했습니다.");
          setIsLoading(false);
          toaster.create({
            title: "결제 실패",
            description: kispgData?.resultMsg || "다시 시도해주세요.",
            type: "error",
          });
        } else if (pollCount >= MAX_POLLS) {
          setPaymentDisplayStatus("PENDING"); // Or FAILURE if timeout is considered failure
          setFinalMessage(
            "결제 결과를 확인하는데 시간이 오래 걸리고 있습니다. 잠시 후 마이페이지에서 확인해주세요."
          );
          setError("결과 확인 시간 초과");
          setIsLoading(false);
          toaster.create({
            title: "확인 지연",
            description: "마이페이지에서 최종 결과를 확인해주세요.",
            type: "warning",
          });
        } else {
          // Still PENDING or UNPAID, continue polling
          setTimeout(checkStatus, POLLING_INTERVAL);
        }
      } catch (err: any) {
        console.error("Failed to fetch enrollment status:", err);
        setError("신청 상태를 확인하는 중 오류가 발생했습니다.");
        // Don't stop polling on transient network errors, but stop if it's a critical error or max polls reached.
        if (pollCount >= MAX_POLLS) {
          setPaymentDisplayStatus("FAILURE");
          setFinalMessage(
            "결제 상태 확인 중 오류 발생. 마이페이지에서 확인해주세요."
          );
          setIsLoading(false);
        }
      }
    };

    if (paymentDisplayStatus === "PENDING") {
      setTimeout(checkStatus, POLLING_INTERVAL); // Start initial check after a brief delay or immediately
    }

    // Cleanup function for timeout
    return () => {
      // Clear any running timers if component unmounts
      // This is implicitly handled by setTimeout not repeating if condition (pollCount < MAX_POLLS) fails
    };
  }, [enrollId, kispgData, paymentDisplayStatus]); // Add paymentDisplayStatus to dependencies to stop polling once status is final

  const renderStatus = () => {
    if (isLoading) {
      return (
        <Flex direction="column" align="center" justify="center" height="50vh">
          <Spinner size="xl" color="blue.500" />
          <Text mt={4} fontSize="lg">
            {finalMessage}
          </Text>
        </Flex>
      );
    }

    switch (paymentDisplayStatus) {
      case "SUCCESS":
        return (
          <VStack gap={4} align="center" p={8} bg="green.50" borderRadius="md">
            <Icon as={MdCheckCircleOutline} w={16} h={16} color="green.500" />
            <Heading size="lg" color="green.700">
              결제 완료
            </Heading>
            <Text fontSize="md" textAlign="center">
              {finalMessage}
            </Text>
            {kispgData?.tid && (
              <Text fontSize="sm" color="gray.600">
                거래번호: {kispgData.tid}
              </Text>
            )}
            <Link href="/mypage?tab=enrollments" passHref legacyBehavior>
              <Button as="a" colorScheme="green" size="lg">
                마이페이지로 이동
              </Button>
            </Link>
          </VStack>
        );
      case "FAILURE":
        return (
          <VStack gap={4} align="center" p={8} bg="red.50" borderRadius="md">
            <Icon as={MdErrorOutline} w={16} h={16} color="red.500" />
            <Heading size="lg" color="red.700">
              결제 실패
            </Heading>
            <Text fontSize="md" textAlign="center">
              {finalMessage}
            </Text>
            {error && (
              <Text color="red.600" fontSize="sm">
                사유: {error}
              </Text>
            )}
            {kispgData?.tid && (
              <Text fontSize="sm" color="gray.600">
                거래번호: {kispgData.tid}
              </Text>
            )}
            <Link href="/sports/swimming/lesson" passHref legacyBehavior>
              <Button as="a" colorScheme="orange" size="lg">
                강습 목록으로 돌아가기
              </Button>
            </Link>
          </VStack>
        );
      case "PENDING": // Also handles the timeout case where user needs to check later
      default:
        return (
          <VStack gap={4} align="center" p={8} bg="yellow.50" borderRadius="md">
            <Icon as={MdHourglassEmpty} w={16} h={16} color="yellow.500" />
            <Heading size="lg" color="yellow.700">
              결과 확인 중
            </Heading>
            <Text fontSize="md" textAlign="center">
              {finalMessage}
            </Text>
            <Link href="/mypage?tab=enrollments" passHref legacyBehavior>
              <Button as="a" colorScheme="gray" variant="outline" size="lg">
                마이페이지에서 확인
              </Button>
            </Link>
          </VStack>
        );
    }
  };

  return (
    <Box maxW="container.md" mx="auto" py={10} px={4}>
      {renderStatus()}
    </Box>
  );
};

// Wrap with Suspense because useSearchParams() needs it.
const KispgReturnPage = () => {
  return (
    <Suspense
      fallback={
        <Flex justify="center" align="center" height="80vh">
          <Spinner size="xl" />
        </Flex>
      }
    >
      <KispgReturnContent />
    </Suspense>
  );
};

export default KispgReturnPage;
