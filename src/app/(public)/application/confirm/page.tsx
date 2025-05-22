"use client";

import React, { useEffect, useState } from "react";
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
  Checkbox,
  Container,
  SimpleGrid,
  Fieldset,
  Field,
  ListItem,
  Icon,
} from "@chakra-ui/react";
import { MdInfoOutline } from "react-icons/md"; // For list icons
import { swimmingPaymentService } from "@/lib/api/swimming";
import { mypageApi, ProfileDto } from "@/lib/api/mypageApi";
import { EnrollLessonRequestDto } from "@/types/api";
import { toaster } from "@/components/ui/toaster";

const membershipOptions = [
  { value: "general", label: "해당사항없음", discountPercentage: 0 },
  {
    value: "merit",
    label: "국가 유공자 10%할인",
    discountPercentage: 10,
  },
  {
    value: "multi-child",
    label: "다자녀 3인이상 10%할인",
    discountPercentage: 10,
  },
  {
    value: "multicultural",
    label: "다문화 가정 10%할인",
    discountPercentage: 10,
  },
];

const DEFAULT_LOCKER_FEE = 5000;
const APPLICATION_TIMEOUT_SECONDS = 300; // 5 minutes

const ApplicationConfirmPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lessonId, setLessonId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [lessonPrice, setLessonPrice] = useState<number>(0);

  const [profile, setProfile] = useState<ProfileDto | null>(null);

  const [selectedLocker, setSelectedLocker] = useState(true); // Checked by default in image
  const [selectedMembershipType, setSelectedMembershipType] = useState<string>(
    membershipOptions[0].value // "general" is default
  );

  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(APPLICATION_TIMEOUT_SECONDS);

  useEffect(() => {
    const idStr = searchParams.get("lessonId");
    const title = searchParams.get("lessonTitle");
    const priceStr = searchParams.get("lessonPrice");

    if (
      idStr &&
      !isNaN(parseInt(idStr)) &&
      title &&
      priceStr &&
      !isNaN(parseFloat(priceStr))
    ) {
      setLessonId(parseInt(idStr));
      setLessonTitle(title);
      setLessonPrice(parseFloat(priceStr));
    } else {
      setError("잘못된 접근입니다. 강습 정보가 URL에 충분하지 않습니다.");
      setIsLoading(false);
      toaster.create({
        title: "오류",
        description:
          "필수 강습 정보(ID, 제목, 가격)가 URL에 포함되어 있지 않습니다.",
        type: "error",
      });
      router.push("/sports/swimming/lesson");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!lessonId) return;

    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const profileData = await mypageApi.getProfile();
        if (profileData) {
          setProfile(profileData);
        } else {
          // This case should ideally be handled by withAuthRedirect if it's a 401 or no-data-auth.
          // If profileData is null for other reasons, we might show an error or a specific UI.
          // For now, if withAuthRedirect doesn't catch it, the page will show a loading/error state.
          console.warn(
            "Profile data is null after fetch, potential issue if not a redirect."
          );
        }
      } catch (err: any) {
        // withAuthRedirect should handle 401s by redirecting.
        // Only set local error for non-401s that slip through or are re-thrown.
        if (err.status !== 401) {
          console.error("Failed to fetch profile:", err);
          const errMsg =
            err.response?.data?.message ||
            err.message ||
            "프로필 정보를 불러오는데 실패했습니다.";
          setError(errMsg);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [lessonId]);

  // Countdown Timer Logic
  useEffect(() => {
    if (isLoading || isSubmitting || error) return; // Don't run timer if loading, submitting, or error

    if (countdown <= 0) {
      // Handle timeout - e.g., disable button, show message
      // For now, just stops countdown
      toaster.create({
        title: "시간 초과",
        description: "신청 시간이 초과되었습니다. 다시 시도해주세요.",
        type: "warning",
        duration: 5000,
      });
      return;
    }

    const timerId = setInterval(() => {
      setCountdown((prevCount) => prevCount - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [countdown, isLoading, isSubmitting, error]);

  // Calculate Final Amount
  useEffect(() => {
    if (!lessonPrice) return;

    let currentAmount = lessonPrice;
    const selectedMembership = membershipOptions.find(
      (opt) => opt.value === selectedMembershipType
    );

    if (selectedMembership && selectedMembership.discountPercentage > 0) {
      currentAmount =
        currentAmount * (1 - selectedMembership.discountPercentage / 100);
    }

    if (selectedLocker) {
      currentAmount += DEFAULT_LOCKER_FEE;
    }
    setFinalAmount(currentAmount);
  }, [lessonPrice, selectedLocker, selectedMembershipType]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleProceedToPayment = async () => {
    if (!lessonId || !profile) {
      toaster.create({
        title: "오류",
        description:
          "필수 정보가 로드되지 않았습니다. (강습 ID 또는 사용자 정보 누락)",
        type: "error",
      });
      return;
    }
    if (countdown <= 0) {
      toaster.create({
        title: "시간 초과",
        description:
          "신청 시간이 초과되었습니다. 페이지를 새로고침하고 다시 시도해주세요.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const enrollRequestData: EnrollLessonRequestDto = {
        lessonId: lessonId,
        wantsLocker: selectedLocker,
        membershipType: selectedMembershipType,
      };

      const enrollResponse = await swimmingPaymentService.enrollLesson(
        enrollRequestData
      );

      if (enrollResponse && enrollResponse.paymentPageUrl) {
        toaster.create({
          title: "신청 성공",
          description: "결제 페이지로 이동합니다.",
          type: "success",
          duration: 2000,
        });
        router.push(enrollResponse.paymentPageUrl);
      } else {
        throw new Error("신청 후 결제 페이지 정보를 받지 못했습니다.");
      }
    } catch (err: any) {
      console.error("Failed to enroll lesson:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "강습 신청에 실패했습니다. 다시 시도해주세요.";
      if (err.status !== 401) {
        setError(errMsg); // Set local error for non-401s
        toaster.create({
          title: "강습 신청 실패",
          description: errMsg,
          type: "error",
        });
      }
      // If it was 401, withAuthRedirect on enrollLesson should handle it.
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>신청 정보를 불러오는 중입니다...</Text>
      </Container>
    );
  }

  // This will show if setError was called for a non-401 during profile fetch or enroll
  if (error && !isSubmitting) {
    // The id property in toaster.create should ideally handle deduplication if the library supports it.
    toaster.create({
      id: "page-load-error",
      title: "정보 로딩 오류",
      description: error,
      type: "error",
      duration: 7000,
      closable: true,
    });
    // Consider if redirect is always best here, or just show error and allow retry
    // router.push("/sports/swimming/lesson");
    // return null;
  }

  // If profile is still null AFTER loading and no specific error was set for profile loading
  // (and withAuthRedirect didn't redirect for 401), then it implies an issue.
  if (!profile && !isLoading && !error) {
    // This state can be reached if withAuthRedirect initiated a redirect and returned null,
    // or if getProfile somehow resolved to null without it being an auth error.
    // If a redirect is already initiated by withAuthRedirect, rendering a brief status is best.
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4} color="gray.600">
          사용자 정보를 확인 중입니다...
        </Text>
      </Container>
    );
  }

  // Guard against rendering without essential data even if profile exists
  if (!lessonId && !isLoading && !error) {
    return (
      <Container centerContent py={10}>
        <Text color="orange.500">
          강습 정보를 불러올 수 없습니다. 강습 목록에서 다시 시도해주세요.
        </Text>
        <Button mt={4} onClick={() => router.push("/sports/swimming/lesson")}>
          강습 목록으로 돌아가기
        </Button>
      </Container>
    );
  }

  const getDiscountedPrice = (
    originalPrice: number,
    discountPercentage: number
  ) => {
    return originalPrice * (1 - discountPercentage / 100);
  };

  return (
    <Container maxW="700px" py={8}>
      <VStack gap={6} align="stretch">
        <Box bg="blue.50" p={5} borderRadius="md">
          <Heading as="h2" size="lg" mb={3} color="blue.700">
            결제 안내 필독 사항
          </Heading>
          <Box gap={2} fontSize="sm" ml={0}>
            <li>
              <Icon as={MdInfoOutline} color="red.500" mr={2} />
              신청은{" "}
              <Text as="span" fontWeight="bold" color="red.500">
                5분 이내
              </Text>
              에 결제까지 완료하셔야 신청이 확정됩니다.
            </li>
            <li>
              <Icon as={MdInfoOutline} color="red.500" mr={2} />
              수영장강습과, 사물함신청은{" "}
              <Text as="span" fontWeight="bold">
                결제완료 기준
              </Text>
              으로 선착순 확정됩니다.
            </li>
            <li>
              <Icon as={MdInfoOutline} color="red.500" mr={2} />
              <Text as="span" fontWeight="bold" color="red.500">
                5분 이내
              </Text>
              에 미결제 시 신청은{" "}
              <Text as="span" fontWeight="bold">
                자동취소
              </Text>{" "}
              됩니다.
            </li>
            <li>
              <Icon as={MdInfoOutline} color="red.500" mr={2} />
              할인회원 신청시{" "}
              <Text as="span" fontWeight="bold">
                오프라인으로 증빙서류 제출
              </Text>
              이 필요합니다.
            </li>
          </Box>
        </Box>

        <Heading as="h1" size="xl" textAlign="center" mt={4}>
          수영 강습 프로그램 신청정보
        </Heading>
        <Text textAlign="center" color="red.500" fontWeight="bold">
          신청정보를 다시 한번 확인해주세요
        </Text>

        {profile && (
          <Fieldset.Root>
            <Box p={5} borderWidth={1} borderRadius="md" shadow="sm">
              <Fieldset.Legend fontSize="xl" fontWeight="semibold" mb={3}>
                신청자 정보
              </Fieldset.Legend>
              <Fieldset.Content>
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                  <Field.Root>
                    <Field.Label>이름</Field.Label>
                    <Text>{profile.name}</Text>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>연락처</Field.Label>
                    <Text>{profile.phone}</Text>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>이메일</Field.Label>
                    <Text>{profile.email}</Text>
                  </Field.Root>
                </SimpleGrid>
              </Fieldset.Content>
            </Box>
          </Fieldset.Root>
        )}

        <Fieldset.Root>
          <Box p={5} borderWidth={1} borderRadius="md" shadow="sm">
            <Fieldset.Legend fontSize="xl" fontWeight="semibold" mb={3}>
              강습 정보
            </Fieldset.Legend>
            <Fieldset.Content>
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                <Field.Root>
                  <Field.Label>강습명</Field.Label>
                  <Text>{lessonTitle}</Text>
                </Field.Root>
                {/* These are placeholders from image, actual data should come from lesson object if available */}
                <Field.Root>
                  <Field.Label>강습기간</Field.Label>
                  <Text>25년 05월 01일 ~ 25년 05월 30일</Text>
                </Field.Root>
                <Field.Root>
                  <Field.Label>강습시간</Field.Label>
                  <Text>오전 06:00 ~ 06:50</Text>
                </Field.Root>
                <Field.Root>
                  <Field.Label>결제금액 (기본)</Field.Label>
                  <Text fontWeight="bold">
                    {lessonPrice.toLocaleString()}원
                  </Text>
                </Field.Root>
              </SimpleGrid>
            </Fieldset.Content>
          </Box>
        </Fieldset.Root>

        <Fieldset.Root>
          <Box p={5} borderWidth={1} borderRadius="md" shadow="sm">
            <Fieldset.Legend fontSize="xl" fontWeight="semibold" mb={3}>
              사물함을 추가 신청합니다
            </Fieldset.Legend>
            <Fieldset.Content>
              <Checkbox.Root
                checked={selectedLocker}
                onCheckedChange={(details: {
                  checked: boolean | "indeterminate";
                }) => {
                  if (typeof details.checked === "boolean")
                    setSelectedLocker(details.checked);
                }}
                colorScheme="blue"
                display="flex"
                alignItems="center"
                gap={2}
                py={2}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label fontSize="lg">
                  사물함 사용 (선택)
                </Checkbox.Label>
              </Checkbox.Root>
              <Text fontSize="sm" color="orange.500" mt={2}>
                * 사물함은 신청 시에만 선택할 수 있으며, 이후 변경/추가는 현장
                문의바랍니다.
              </Text>
              <Text fontSize="sm" color="red.500">
                * 선착순 배정입니다.
              </Text>
              <HStack justifyContent="space-between" mt={3}>
                <Text>추가요금:</Text>
                <Text fontWeight="semibold">
                  {DEFAULT_LOCKER_FEE.toLocaleString()}원
                </Text>
              </HStack>
              <HStack justifyContent="space-between" mt={1}>
                <Text>잔여 수량:</Text>
                <Text fontWeight="semibold">60개 (예시)</Text>{" "}
                {/* Placeholder from image */}
              </HStack>
            </Fieldset.Content>
          </Box>
        </Fieldset.Root>

        <Fieldset.Root>
          <Box p={5} borderWidth={1} borderRadius="md" shadow="sm">
            <Fieldset.Legend fontSize="xl" fontWeight="semibold" mb={3}>
              할인 회원유형선택
            </Fieldset.Legend>
            <Fieldset.Content>
              <RadioGroup.Root
                value={selectedMembershipType}
                onValueChange={(details: { value: string | null }) => {
                  if (typeof details.value === "string")
                    setSelectedMembershipType(details.value);
                }}
              >
                <VStack align="stretch" gap={2}>
                  {membershipOptions.map((opt) => {
                    const discountedLessonPrice = getDiscountedPrice(
                      lessonPrice,
                      opt.discountPercentage
                    );
                    return (
                      <RadioGroup.Item
                        key={opt.value}
                        value={opt.value}
                        display="flex"
                        alignItems="center"
                        gap={2}
                        p={2}
                        borderWidth={1}
                        borderRadius="md"
                        _hover={{ bg: "gray.50" }}
                      >
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl />
                        <RadioGroup.ItemText flexGrow={1}>
                          {opt.label}
                        </RadioGroup.ItemText>
                        <Text fontWeight="semibold">
                          {(opt.discountPercentage > 0
                            ? discountedLessonPrice
                            : lessonPrice
                          ).toLocaleString()}
                          원
                        </Text>
                      </RadioGroup.Item>
                    );
                  })}
                </VStack>
              </RadioGroup.Root>
              <Text fontSize="xs" color="gray.600" mt={2}>
                * 유공자 및 할인 대상 회원은 증빙서류를 지참하여 현장
                안내데스크에 제출해주셔야 할인 적용이 완료됩니다.
              </Text>
            </Fieldset.Content>
          </Box>
        </Fieldset.Root>

        <Box
          p={5}
          borderWidth={1}
          borderRadius="md"
          bg="gray.100"
          shadow="inner"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Heading as="h2" size="lg">
              최종 결제 예정 금액
            </Heading>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {finalAmount.toLocaleString()}원
            </Text>
          </Flex>
        </Box>

        <Button
          colorScheme="purple"
          size="lg"
          py={7}
          fontSize="xl"
          onClick={handleProceedToPayment}
          w="full"
          disabled={isSubmitting || isLoading || countdown <= 0 || !profile}
          loading={isSubmitting}
        >
          {isSubmitting
            ? "처리 중..."
            : `신청완료 / 결제하러가기 (${formatTime(countdown)})`}
        </Button>
      </VStack>
    </Container>
  );
};

export default ApplicationConfirmPage;
