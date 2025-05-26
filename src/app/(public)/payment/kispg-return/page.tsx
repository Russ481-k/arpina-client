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
      // isLoading, error 상태에 따라 setIsLoading(false) 호출 여부 결정은 이미 아래 로직에 포함됨
      // 이 조건문에서는 enrollId가 없을 때 더 이상 진행하지 않도록 return만 수행
      if (!isLoading && !error) {
        // 로딩이 끝났고, moid 관련 에러가 없다면, enrollId가 없다는것 자체가 문제일 수 있음.
        // 이 경우는 이미 위의 useEffect에서 setError등으로 처리되었을 가능성이 높음.
      }
      return;
    }

    const POLLING_INTERVAL = 3000;
    const MAX_POLLS = 10;
    let pollCount = 0;
    let timeoutId: NodeJS.Timeout | null = null; // For cleanup

    const checkStatus = async () => {
      if (paymentDisplayStatus !== "PENDING") return; // 이미 최종 상태이면 중지
      pollCount++;
      try {
        const enrollmentDetails = await mypageApi.getEnrollmentById(enrollId);
        if (enrollmentDetails?.status === "PAID") {
          setPaymentDisplayStatus("SUCCESS");
          setFinalMessage("결제가 성공적으로 완료되었습니다.");
          setIsLoading(false);
          toaster.create({
            title: "결제 성공",
            description: "수강 신청이 완료되었습니다.",
            type: "success",
          });
        } else if (
          enrollmentDetails?.status === "PAYMENT_FAILED" ||
          enrollmentDetails?.status === "PAYMENT_TIMEOUT" ||
          enrollmentDetails?.status === "CANCELED_UNPAID"
        ) {
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
          setPaymentDisplayStatus("PENDING");
          setFinalMessage(
            "결제 결과를 확인하는데 시간이 오래 걸리고 있습니다. 잠시 후 마이페이지에서 확인해주세요."
          );
          // setError('결과 확인 시간 초과'); //  이 경우는 에러라기보단 지연안내이므로 setError는 주석처리
          setIsLoading(false);
          toaster.create({
            title: "확인 지연",
            description: "마이페이지에서 최종 결과를 확인해주세요.",
            type: "warning",
          });
        } else {
          timeoutId = setTimeout(checkStatus, POLLING_INTERVAL);
        }
      } catch (err: any) {
        console.error("Failed to fetch enrollment status:", err);
        // setError('신청 상태를 확인하는 중 오류가 발생했습니다.'); // 반복적인 에러 토스트 방지
        if (pollCount >= MAX_POLLS) {
          setPaymentDisplayStatus("FAILURE");
          setFinalMessage(
            "결제 상태 확인 중 오류 발생. 마이페이지에서 확인해주세요."
          );
          setError("신청 상태 확인 중 오류가 여러 번 발생했습니다."); // 최종적으로 에러 설정
          setIsLoading(false);
        } else {
          timeoutId = setTimeout(checkStatus, POLLING_INTERVAL); // 에러 발생 시에도 일단 재시도
        }
      }
    };

    if (paymentDisplayStatus === "PENDING" && enrollId && isLoading) {
      // isLoading 조건 추가하여 초기 로딩시에만 checkStatus 시작
      checkStatus();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // 의존성 배열에 error, isLoading, finalMessage 등을 추가하면 무한 루프 또는 예상치 못한 동작 발생 가능성이 높음.
    // 폴링 로직의 제어는 enrollId, kispgData, paymentDisplayStatus(최종 상태 시 중단)로 관리.
  }, [enrollId, kispgData, paymentDisplayStatus, isLoading, error]); // isLoading, error 추가

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
              <Button as="a" colorPalette="green" size="lg">
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
              <Button as="a" colorPalette="orange" size="lg">
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
              <Button as="a" colorPalette="gray" variant="outline" size="lg">
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
