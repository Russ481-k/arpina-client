"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Text,
  Button,
  Flex,
  Spinner,
  Heading,
  VStack,
  HStack,
  RadioGroup,
  Stack,
  Separator,
} from "@chakra-ui/react";
import { swimmingPaymentService } from "@/lib/api/swimming";
import {
  PaymentPageDetailsDto,
  KISPGInitParamsDto,
  PaymentConfirmRequestDto,
} from "@/types/api";
import { toaster } from "@/components/ui/toaster";

const KISPG_DEMO_SUCCESS_TOKEN = "kispg_demo_success_token";

const PaymentProcessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [effectiveEnrollId, setEffectiveEnrollId] = useState<number | null>(
    null
  );
  const [details, setDetails] = useState<PaymentPageDetailsDto | null>(null);
  const [kispgParams, setKispgParams] = useState<KISPGInitParamsDto | null>(
    null
  );
  const [isLoadingInitial, setIsLoadingInitial] = useState(true); // For initial enrollId/lessonId processing
  const [isLoadingDetails, setIsLoadingDetails] = useState(false); // For fetching payment details
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>("");
  const [selectedLocker, setSelectedLocker] = useState<string | undefined>(
    undefined
  );
  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const processInitialParams = async () => {
      setIsLoadingInitial(true);
      setError(null);
      const enrollIdFromParams = searchParams.get("enroll_id");

      if (enrollIdFromParams && !isNaN(parseInt(enrollIdFromParams))) {
        setEffectiveEnrollId(parseInt(enrollIdFromParams));
      } else {
        setError("잘못된 접근입니다. 신청 ID가 URL에 없습니다.");
        toaster.create({
          title: "오류",
          description:
            "잘못된 접근입니다. 신청 ID가 URL에 포함되어 있지 않습니다.",
          type: "error",
        });
        router.push("/sports/swimming/lesson");
      }
      setIsLoadingInitial(false);
    };

    processInitialParams();
  }, [searchParams, router]);

  const fetchData = useCallback(async () => {
    if (!effectiveEnrollId) return;
    setIsLoadingDetails(true);
    setError(null);
    try {
      const detailsData = await swimmingPaymentService.getPaymentPageDetails(
        effectiveEnrollId
      );
      setDetails(detailsData);
      setFinalAmount(detailsData?.amountToPay || 0);
    } catch (err: any) {
      console.error("Failed to fetch payment details:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "결제 정보를 불러오는데 실패했습니다.";
      setError(errMsg);
      toaster.create({ title: "오류", description: errMsg, type: "error" });
    }
    setIsLoadingDetails(false);
  }, [effectiveEnrollId]);

  useEffect(() => {
    if (effectiveEnrollId) {
      fetchData();
    }
  }, [effectiveEnrollId, fetchData]);

  useEffect(() => {
    if (details?.paymentDeadline) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const deadlineTime = new Date(details.paymentDeadline).getTime();
        const distance = deadlineTime - now;

        if (distance < 0) {
          clearInterval(interval);
          setCountdown("결제 시간 만료");
          toaster.create({
            title: "시간 초과",
            description: "결제 시간이 만료되었습니다. 다시 신청해주세요.",
            type: "error",
            duration: 7000,
            closable: true,
          });
          router.push("/sports/swimming/lesson");
          return;
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdown(
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [details, router]);

  useEffect(() => {
    if (details && selectedLocker !== undefined) {
      let currentAmount = details.lessonPrice;
      if (selectedLocker === "yes" && details.lockerOptions?.lockerFee) {
        currentAmount += details.lockerOptions.lockerFee;
      }
      setFinalAmount(currentAmount);
    }
  }, [details, selectedLocker]);

  const initiateKispgPayment = async () => {
    if (!effectiveEnrollId || !details) {
      toaster.create({
        title: "오류",
        description: "결제 정보가 올바르지 않습니다.",
        type: "error",
      });
      return;
    }
    setIsProcessingPayment(true);
    try {
      // 1. Fetch KISPG Params right before payment (if not already fetched)
      if (!kispgParams) {
        const kispgData = await swimmingPaymentService.getKISPGInitParams(
          effectiveEnrollId
        );
        setKispgParams(kispgData);
        // TODO: Launch KISPG SDK/UI with kispgData
        // For demo, we'll simulate KISPG interaction
        console.log("KISPG Params:", kispgData);
        toaster.create({
          title: "KISPG 연동 (데모)",
          description: "KISPG 결제창이 호출됩니다 (실제 연동 필요).",
          type: "info",
          duration: 3000,
          closable: true,
        });
      }

      // 2. Simulate KISPG interaction (replace with actual KISPG SDK calls)
      // This is a placeholder. Actual KISPG will likely involve a redirect or a modal provided by their SDK.
      // After KISPG is done, it will provide a pgToken (or similar) via its return mechanism.
      setTimeout(async () => {
        const wantsLockerConfirmed =
          selectedLocker === undefined ? false : selectedLocker === "yes";
        // if locker choice wasn't applicable or user didn't choose, default to false

        const confirmData: PaymentConfirmRequestDto = {
          pgToken: KISPG_DEMO_SUCCESS_TOKEN, // This would come from KISPG
          wantsLocker: wantsLockerConfirmed,
        };

        try {
          const confirmResponse = await swimmingPaymentService.confirmPayment(
            effectiveEnrollId,
            confirmData
          );
          toaster.create({
            title: "결제 확인 중",
            description: `상태: ${confirmResponse?.status}`,
            type: "success",
            closable: true,
          });
          // Redirect to a success page or Mypage based on response
          router.push("/mypage?tab=enrollments&status=paid"); // Example redirect with params
        } catch (confirmError: any) {
          console.error("Payment confirmation failed:", confirmError);
          const errMsg =
            confirmError.response?.data?.message ||
            confirmError.message ||
            "결제 최종 확인에 실패했습니다.";
          toaster.create({
            title: "결제 확인 실패",
            description: errMsg,
            type: "error",
            closable: true,
          });
        }
        setIsProcessingPayment(false);
      }, 2000); // Simulate KISPG processing time
    } catch (error: any) {
      console.error("KISPG Init failed:", error);
      toaster.create({
        title: "결제 준비 실패",
        description: error.response?.data?.message || error.message,
        type: "error",
        closable: true,
      });
      setIsProcessingPayment(false);
    }
  };

  if (isLoadingInitial || isLoadingDetails) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" />
        <Text ml={4}>
          {isLoadingInitial
            ? "신청 정보를 처리 중입니다..."
            : "결제 정보를 불러오는 중입니다..."}
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={5} textAlign="center">
        <Text color="red.500" fontSize="xl">
          {error}
        </Text>
      </Box>
    );
  }

  if (!details) {
    return (
      <Box p={5} textAlign="center">
        <Text fontSize="xl">결제 정보를 불러올 수 없습니다.</Text>
      </Box>
    );
  }

  const lockerRadioItems = [
    {
      value: "yes",
      label: `사용함 (+${details.lockerOptions?.lockerFee.toLocaleString()}원)`,
    },
    { value: "no", label: "사용안함" },
  ];

  return (
    <Box
      maxW="container.md"
      mx="auto"
      p={5}
      my={10}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="lg"
    >
      <VStack gap={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="blue.600">
          수강 결제
        </Heading>

        <Box
          textAlign="center"
          fontSize="2xl"
          color="red.500"
          fontWeight="bold"
        >
          남은 결제 시간: {countdown}
        </Box>

        <Box p={5} borderWidth={1} borderRadius="md" bg="gray.50">
          <Heading as="h2" size="lg" mb={4}>
            강습 정보
          </Heading>
          <Text fontSize="xl" fontWeight="bold">
            {details.lessonTitle}
          </Text>
          <Text>가격: {details.lessonPrice.toLocaleString()}원</Text>
          <Text>
            결제 마감: {new Date(details.paymentDeadline).toLocaleString()}
          </Text>
        </Box>

        {details.lockerOptions && (
          <Box p={5} borderWidth={1} borderRadius="md">
            <Heading as="h3" size="md" mb={3}>
              사물함 신청
            </Heading>
            {details.lockerOptions.lockerAvailableForUserGender ? (
              <VStack align="start">
                <Text>
                  사물함 사용료:{" "}
                  {details.lockerOptions.lockerFee.toLocaleString()}원
                </Text>
                <Text color="gray.600" fontSize="sm">
                  (사용 가능:{" "}
                  {details.lockerOptions.availableCountForUserGender}개)
                </Text>
                <RadioGroup.Root
                  value={selectedLocker}
                  onValueChange={(payload) =>
                    setSelectedLocker(
                      payload.value === null ? undefined : payload.value
                    )
                  }
                >
                  <HStack gap="4">
                    {lockerRadioItems.map((item) => (
                      <RadioGroup.Item
                        key={item.value}
                        value={item.value}
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl />
                        <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
                      </RadioGroup.Item>
                    ))}
                  </HStack>
                </RadioGroup.Root>
              </VStack>
            ) : (
              <Text color="orange.500">
                현재 신청 가능한 사물함이 없습니다 (고객님의 성별 기준).
              </Text>
            )}
          </Box>
        )}

        <Separator />

        <HStack justify="space-between" fontSize="xl" fontWeight="bold">
          <Text>최종 결제 금액:</Text>
          <Text color="blue.700">{finalAmount.toLocaleString()}원</Text>
        </HStack>

        <Button
          colorScheme="blue"
          size="lg"
          onClick={initiateKispgPayment}
          loading={isProcessingPayment}
          disabled={isProcessingPayment || countdown === "결제 시간 만료"}
        >
          {isProcessingPayment ? "결제 처리 중..." : "KISPG로 결제하기"}
        </Button>
      </VStack>
    </Box>
  );
};

export default PaymentProcessPage;
