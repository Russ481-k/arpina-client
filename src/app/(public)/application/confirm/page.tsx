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
  Icon,
} from "@chakra-ui/react";
import {
  MdInfoOutline,
  MdChevronRight,
  MdCheck,
  MdLocalFlorist,
} from "react-icons/md";
import { swimmingPaymentService } from "@/lib/api/swimming";
import { mypageApi, ProfileDto } from "@/lib/api/mypageApi";
import { EnrollLessonRequestDto } from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import { useColors } from "@/styles/theme";
import Image from "next/image";

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

interface LockerLessonDetails {
  lessonId: number;
  maleLockerCount: number;
  femaleLockerCount: number;
}

const ApplicationConfirmPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lessonId, setLessonId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [lessonPrice, setLessonPrice] = useState<number>(0);

  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [userGender, setUserGender] = useState<
    "MALE" | "FEMALE" | "OTHER" | undefined
  >(undefined);

  const [lockerDetails, setLockerDetails] =
    useState<LockerLessonDetails | null>(null);
  const [isLockerDetailsLoading, setIsLockerDetailsLoading] = useState(false);

  const [selectedLocker, setSelectedLocker] = useState(true);
  const [selectedMembershipType, setSelectedMembershipType] = useState<string>(
    membershipOptions[0].value
  );

  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockerError, setLockerError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(APPLICATION_TIMEOUT_SECONDS);

  const colors = useColors();

  const pageBg = colors.bg;
  const cardBg = colors.cardBg;
  const primaryText = colors.text.primary;
  const secondaryText = colors.text.secondary;
  const mutedText = colors.text.muted;
  const inverseText = colors.text.inverse;
  const borderColor = colors.border;
  const primaryDefault = colors.primary.default;
  const primaryHover = colors.primary.hover;
  const primaryDark = colors.primary.dark;
  const primaryLight = colors.primary.light;
  const primaryAlpha = colors.primary.alpha;

  const accentDelete = colors.accent.delete.default;
  const accentWarning = colors.accent.warning.default;
  const accentInfo = colors.accent.info.default;
  const leafIconColor = colors.accent.leafIcon;
  const timerYellowColor = colors.accent.timerYellow;
  const outlineButtonHoverBg = colors.accent.outlineButtonHoverBg;
  const errorNoticeBg = colors.accent.errorNoticeBg;
  const errorNoticeBorder = colors.accent.errorNoticeBorder;
  const radioUnselectedBg = colors.accent.radioUnselectedBg;
  const radioUnselectedHoverBorder = colors.accent.radioUnselectedHoverBorder;

  const cardStyleProps = {
    bg: cardBg,
    p: { base: 4, md: 6 },
    borderRadius: "lg",
    borderWidth: "1px",
    borderColor: borderColor,
    boxShadow: "sm",
  };

  const legendStyleProps = {
    fontSize: "md",
    fontWeight: "bold",
    color: primaryText,
    pb: 2,
    mb: 4,
    borderBottomWidth: "1px",
    borderColor: borderColor,
  };

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
        description: "필수 강습 정보가 URL에 없습니다.",
        type: "error",
      });
      router.push("/sports/swimming/lesson");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!lessonId) return;
    setIsLoading(true);
    const fetchInitialData = async () => {
      try {
        const profileData = await mypageApi.getProfile();
        if (profileData) {
          setProfile(profileData);
          if (profileData.gender) {
            setUserGender(profileData.gender as "MALE" | "FEMALE" | "OTHER");
          } else {
            console.warn("Gender not found on profile DTO");
          }
        } else {
          console.warn("Profile data is null after fetch.");
        }
      } catch (err: any) {
        if (err.status !== 401) {
          console.error("Failed to fetch profile:", err);
          setError(err.message || "프로필 정보를 불러오는데 실패했습니다.");
        }
        // If 401, withAuthRedirect should handle it.
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [lessonId]);

  useEffect(() => {
    if (lessonId && userGender) {
      setIsLockerDetailsLoading(true);
      setLockerError(null);
      // Simulating API call for locker details as per previous logic
      setTimeout(() => {
        setLockerDetails({
          lessonId: lessonId,
          maleLockerCount: 30, // Example data
          femaleLockerCount: 25, // Example data
        });
        setIsLockerDetailsLoading(false);
      }, 1000);
    } else if (lessonId && !userGender && profile) {
      setLockerError(
        "사용자 성별 정보가 없어 사물함 정보를 가져올 수 없습니다."
      );
      setIsLockerDetailsLoading(false);
    }
  }, [lessonId, userGender, profile]);

  useEffect(() => {
    if (isLoading || isLockerDetailsLoading || isSubmitting || error) return;

    if (countdown <= 0) {
      toaster.create({
        id: "application-timeout-toast",
        title: "시간 초과",
        description:
          "신청 시간이 초과되었습니다. 강습 목록 페이지로 이동합니다.",
        type: "warning",
        duration: 5000,
      });
      router.push("/sports/swimming/lesson");
      return;
    }

    const timerId = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [
    countdown,
    isLoading,
    isLockerDetailsLoading,
    isSubmitting,
    error,
    router,
  ]);

  useEffect(() => {
    if (!lessonPrice) return;
    let currentAmount = lessonPrice;
    const selectedMembership = membershipOptions.find(
      (opt) => opt.value === selectedMembershipType
    );
    if (selectedMembership && selectedMembership.discountPercentage > 0) {
      currentAmount *= 1 - selectedMembership.discountPercentage / 100;
    }
    if (selectedLocker) currentAmount += DEFAULT_LOCKER_FEE;
    setFinalAmount(currentAmount);
  }, [lessonPrice, selectedLocker, selectedMembershipType]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const rs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(rs).padStart(2, "0")}`;
  };

  const handleProceedToPayment = async () => {
    if (!lessonId || !profile) {
      toaster.create({
        title: "오류",
        description: "필수 정보(강습 또는 사용자)가 로드되지 않았습니다.",
        type: "error",
      });
      return;
    }
    if (isLockerDetailsLoading) {
      toaster.create({
        title: "확인 중",
        description: "사물함 정보를 확인 중입니다. 잠시 후 다시 시도해주세요.",
        type: "info",
      });
      return;
    }
    if (lockerError && selectedLocker) {
      toaster.create({
        title: "사물함 오류",
        description: lockerError,
        type: "error",
      });
      return;
    }

    if (countdown <= 0) {
      toaster.create({
        title: "시간 초과",
        description: "신청 시간이 초과되었습니다. 다시 시도해주세요.",
        type: "error",
      });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const enrollRequestData: EnrollLessonRequestDto = {
        lessonId,
        wantsLocker: selectedLocker,
        membershipType: selectedMembershipType,
      };
      const enrollResponse = await swimmingPaymentService.enrollLesson(
        enrollRequestData
      );
      if (enrollResponse && enrollResponse.paymentPageUrl) {
        toaster.create({
          title: "신청 시작",
          description: "결제 페이지로 이동합니다.",
          type: "success",
          duration: 2000,
        });
        router.push(enrollResponse.paymentPageUrl);
      } else throw new Error("결제 페이지 URL 정보 누락");
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.message || "강습 신청 실패";
      if (err.status !== 401) {
        setError(errMsg);
        toaster.create({
          title: "강습 신청 실패",
          description: errMsg,
          type: "error",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const spinnerColor = primaryDefault;

  if (isLoading || (lessonId && !profile && !error)) {
    return (
      <Flex
        bg={pageBg}
        minH="100vh"
        justify="center"
        align="center"
        color={primaryText}
      >
        <Spinner size="xl" color={spinnerColor} />
        <Text mt={4} ml={3}>
          신청 정보를 불러오는 중입니다...
        </Text>
      </Flex>
    );
  }

  if (error && !isSubmitting) {
    return (
      <Flex
        bg={pageBg}
        minH="100vh"
        justify="center"
        align="center"
        color={primaryText}
        direction="column"
        p={5}
      >
        <Icon as={MdInfoOutline} w={12} h={12} color={accentDelete} mb={4} />

        <Heading size="md" mb={2}>
          오류 발생
        </Heading>
        <Text textAlign="center">{error}</Text>
        <Button
          mt={6}
          variant="outline"
          borderColor={borderColor}
          color={primaryText}
          _hover={{ bg: outlineButtonHoverBg }}
          onClick={() => router.push("/sports/swimming/lesson")}
        >
          강습 목록으로 돌아가기
        </Button>
      </Flex>
    );
  }

  if (!profile && !isLoading && !error) {
    return (
      <Flex
        bg={pageBg}
        minH="100vh"
        justify="center"
        align="center"
        color={primaryText}
      >
        <Spinner size="xl" color={spinnerColor} />
        <Text mt={4} ml={3} color={secondaryText}>
          사용자 정보를 확인 중입니다... (문제가 지속되면 새로고침 해주세요)
        </Text>
      </Flex>
    );
  }

  if (!lessonId && !isLoading && !error) {
    return (
      <Flex
        bg={pageBg}
        minH="100vh"
        justify="center"
        align="center"
        color={primaryText}
        direction="column"
        p={5}
      >
        <Icon as={MdInfoOutline} w={12} h={12} color={accentWarning} mb={4} />
        <Text color={accentWarning} fontWeight="bold">
          강습 정보 누락.
        </Text>
        <Button
          mt={6}
          variant="outline"
          borderColor={borderColor}
          color={primaryText}
          _hover={{ bg: outlineButtonHoverBg }}
          onClick={() => router.push("/sports/swimming/lesson")}
        >
          목록에서 다시 시도해주세요.
        </Button>
      </Flex>
    );
  }

  const getDiscountedPrice = (price: number, discount: number) =>
    price * (1 - discount / 100);

  let currentLockerCount: number | string = "-";
  if (lockerDetails && userGender) {
    if (userGender === "MALE")
      currentLockerCount = lockerDetails.maleLockerCount;
    else if (userGender === "FEMALE")
      currentLockerCount = lockerDetails.femaleLockerCount;
    else currentLockerCount = "정보없음";
  }

  const radioItemSpinnerColor = primaryDefault;

  return (
    <Container maxW="700px" py={8}>
      {" "}
      <Box
        mb={6}
        {...cardStyleProps}
        bg={errorNoticeBg}
        borderColor={errorNoticeBorder}
      >
        <HStack mb={3} alignItems="center">
          <Image
            src="/images/apply/pay_asset.png"
            alt="pay_asset"
            width={16}
            height={16}
          />
          <Heading as="h2" size="sm" color={primaryText} fontWeight="bold">
            결제 안내 필독 사항
          </Heading>
        </HStack>
        <VStack align="stretch" gap={1} pl={2}>
          {[
            {
              text: "신청은 ",
              boldRed: "5분 이내",
              rest: "에 결제까지 완료하셔야 신청이 확정됩니다.",
            },
            {
              text: "수영장강습과, 사물함신청은 ",
              boldRed: "결제완료 기준",
              rest: "으로 선착순 확정됩니다.",
            },
            {
              text: "",
              boldRed: "5분 이내",
              rest: " 미결제 시 신청은 ",
              boldRed2: "자동취소",
              rest2: " 됩니다.",
            },
            {
              text: "할인회원 신청시 ",
              boldRed: "오프라인으로 증빙서류 제출",
              rest: "이 필요합니다.",
            },
          ].map((item, index) => (
            <Flex
              key={index}
              display="flex"
              alignItems="flex-start"
              fontSize="xs"
              color={accentDelete}
            >
              <Text as="span" color={secondaryText}>
                {item.text}
                {item.boldRed && (
                  <Text
                    as="span"
                    fontWeight="bold"
                    color={accentDelete}
                    mx="3px"
                  >
                    {item.boldRed}
                  </Text>
                )}
                {item.rest}
                {item.boldRed2 && (
                  <Text
                    as="span"
                    fontWeight="bold"
                    color={accentDelete}
                    mx="3px"
                  >
                    {item.boldRed2}
                  </Text>
                )}
                {item.rest2}
              </Text>
            </Flex>
          ))}
        </VStack>
      </Box>
      <HStack mt={10} mb={1} justifyContent="center" alignItems="center">
        <Image
          src="/images/apply/pay_asset.png"
          alt="pay_asset"
          width={16}
          height={16}
        />
        <Heading
          as="h1"
          size="md"
          textAlign="center"
          color={primaryText}
          fontWeight="bold"
        >
          수영 강습 프로그램 신청정보
        </Heading>
      </HStack>
      <Text
        textAlign="center"
        color={accentDelete}
        fontWeight="bold"
        mb={6}
        fontSize="sm"
      >
        신청정보를 다시 한번 확인해주세요
      </Text>
      {profile && (
        <Fieldset.Root mb={6}>
          <Box {...cardStyleProps}>
            <Fieldset.Legend {...legendStyleProps}>신청자 정보</Fieldset.Legend>
            <Fieldset.Content>
              <SimpleGrid
                columns={{ base: 1, sm: 2 }}
                gapX={8}
                gapY={3}
                fontSize="sm"
              >
                <HStack justifyContent="space-between">
                  <Text color={secondaryText}>이름</Text>
                  <Text fontWeight="medium" color={primaryText}>
                    {profile.name}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color={secondaryText}>연락처</Text>
                  <Text fontWeight="medium" color={primaryText}>
                    {profile.phone}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color={secondaryText}>이메일</Text>
                  <Text fontWeight="medium" color={primaryText}>
                    {profile.email}
                  </Text>
                </HStack>
                {userGender && (
                  <HStack justifyContent="space-between">
                    <Text color={secondaryText}>성별</Text>
                    <Text fontWeight="medium" color={primaryText}>
                      {userGender === "MALE"
                        ? "남성"
                        : userGender === "FEMALE"
                        ? "여성"
                        : "기타"}
                    </Text>
                  </HStack>
                )}
              </SimpleGrid>
            </Fieldset.Content>
          </Box>
        </Fieldset.Root>
      )}
      <Fieldset.Root mb={6}>
        <Box {...cardStyleProps}>
          <Fieldset.Legend {...legendStyleProps}>강습 정보</Fieldset.Legend>
          <Fieldset.Content>
            <SimpleGrid
              columns={{ base: 1, sm: 2 }}
              gapX={8}
              gapY={3}
              fontSize="sm"
            >
              <HStack justifyContent="space-between">
                <Text color={secondaryText}>강습명</Text>
                <Text fontWeight="medium" color={primaryText}>
                  {lessonTitle}
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color={secondaryText}>강습기간</Text>
                <Text fontWeight="medium" color={primaryText}>
                  25년 05월 01일 ~ 25년 05월 30일
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color={secondaryText}>강습시간</Text>
                <Text fontWeight="medium" color={primaryText}>
                  오전 06:00 ~ 06:50
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color={secondaryText}>결제금액 (기본)</Text>
                <Text fontWeight="bold" color={primaryText}>
                  {lessonPrice.toLocaleString()}원
                </Text>
              </HStack>
            </SimpleGrid>
          </Fieldset.Content>
        </Box>
      </Fieldset.Root>
      <Fieldset.Root mb={6}>
        <Box {...cardStyleProps}>
          <Flex justifyContent="space-between" alignItems="center" mb={3}>
            <Checkbox.Root
              display="flex"
              alignItems="center"
              checked={selectedLocker}
              onCheckedChange={(d) => {
                if (typeof d.checked === "boolean")
                  setSelectedLocker(d.checked);
              }}
              colorScheme={primaryDefault}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control
                borderColor={borderColor}
                mr={2}
                _checked={{
                  bg: primaryDefault,
                  borderColor: primaryDefault,
                  color: inverseText,
                }}
                _focus={{ boxShadow: "outline" }}
              />
              <Checkbox.Label
                fontSize="md"
                fontWeight="bold"
                color={primaryText}
              >
                사물함을 추가 신청합니다
              </Checkbox.Label>
            </Checkbox.Root>
            <Text fontSize="xs" color={accentDelete} fontWeight="bold">
              * 선착순 배정입니다.
            </Text>
          </Flex>
          <Fieldset.Content>
            <Text fontSize="xs" color={accentWarning} mt={0} mb={3} ml={0}>
              * 사물함은 신청 시에만 선택할 수 있으며, 이후 변경/추가는 현장
              문의바랍니다.
            </Text>

            <HStack justifyContent="space-between" mt={2} fontSize="sm">
              <Text color={secondaryText}>추가요금:</Text>
              <Text fontWeight="medium" color={primaryText}>
                {DEFAULT_LOCKER_FEE.toLocaleString()}원
              </Text>
            </HStack>
            <HStack justifyContent="space-between" mt={1} fontSize="sm">
              <Text color={secondaryText}>
                잔여 수량 (
                {userGender
                  ? userGender === "MALE"
                    ? "남성"
                    : userGender === "FEMALE"
                    ? "여성"
                    : "전체"
                  : "전체"}
                ):
              </Text>
              {isLockerDetailsLoading ? (
                <Spinner size="xs" color={radioItemSpinnerColor} />
              ) : lockerError ? (
                <Text color={accentDelete} fontSize="xs">
                  확인불가
                </Text>
              ) : (
                <Text fontWeight="medium" color={primaryText}>
                  {currentLockerCount}개
                </Text>
              )}
            </HStack>
          </Fieldset.Content>
        </Box>
      </Fieldset.Root>
      <Fieldset.Root mb={6}>
        <Box {...cardStyleProps}>
          <HStack {...legendStyleProps} alignItems="baseline">
            <Image
              src="/images/apply/pay_asset.png"
              alt="pay_asset"
              width={16}
              height={16}
            />
            <Text>
              할인 회원유형선택{" "}
              <Text
                as="span"
                fontSize="xs"
                fontWeight="normal"
                color={secondaryText}
              >
                (정상요금{" "}
                {membershipOptions.find((o) => o.discountPercentage > 0)
                  ?.discountPercentage || 10}
                %할인)
              </Text>
            </Text>
          </HStack>
          <Fieldset.Content>
            <RadioGroup.Root
              value={selectedMembershipType}
              onValueChange={(d) => {
                if (typeof d.value === "string")
                  setSelectedMembershipType(d.value);
              }}
            >
              <VStack align="stretch" gap={2}>
                {membershipOptions.map((opt) => {
                  const discountedLessonPrice = getDiscountedPrice(
                    lessonPrice,
                    opt.discountPercentage
                  );
                  const isSelected = selectedMembershipType === opt.value;

                  const radioBg = isSelected ? primaryAlpha : radioUnselectedBg;
                  const radioBorder = isSelected ? primaryDefault : borderColor;
                  const radioHoverBorder = isSelected
                    ? primaryDefault
                    : radioUnselectedHoverBorder;
                  const radioPriceTextColor = isSelected
                    ? primaryDefault
                    : primaryText;
                  const radioControlBorder = borderColor;
                  const radioControlCheckedBg = primaryDefault;
                  const radioControlCheckedBorder = primaryDefault;
                  const radioControlCheckedColor = inverseText;

                  return (
                    <RadioGroup.Item
                      key={opt.value}
                      value={opt.value}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      p={3}
                      borderWidth={1}
                      borderColor={radioBorder}
                      borderRadius="md"
                      bg={radioBg}
                      cursor="pointer"
                      _hover={{
                        borderColor: radioHoverBorder,
                      }}
                    >
                      <HStack gap={3}>
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl
                          borderColor={radioControlBorder}
                          _checked={{
                            bg: radioControlCheckedBg,
                            borderColor: radioControlCheckedBorder,
                            color: radioControlCheckedColor,
                            _before: {
                              content: `""`,
                              display: "inline-block",
                              w: "50%",
                              h: "50%",
                              borderRadius: "50%",
                              bg: radioControlCheckedColor,
                            },
                          }}
                          _focus={{ boxShadow: "outline" }}
                        />
                        <RadioGroup.ItemText
                          fontSize="sm"
                          fontWeight="medium"
                          color={primaryText}
                        >
                          {opt.label}
                        </RadioGroup.ItemText>
                      </HStack>
                      <Text
                        fontWeight="bold"
                        fontSize="sm"
                        color={radioPriceTextColor}
                      >
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
            <Text fontSize="xs" color={secondaryText} mt={3}>
              * 유공자 및 할인 대상 회원은 증빙서류를 지참하여 현장 안내데스크에
              제출해주셔야 할인 적용이 완료됩니다.
            </Text>
          </Fieldset.Content>
        </Box>
      </Fieldset.Root>
      <Box
        p={{ base: 3, md: 4 }}
        borderRadius="md"
        bg={primaryDefault}
        color={inverseText}
        mb={6}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h2" size="sm" fontWeight="bold">
            최종 결제 예정 금액
          </Heading>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color={timerYellowColor}
          >
            {finalAmount.toLocaleString()}원
          </Text>
        </Flex>
      </Box>
      <Button
        bg={primaryDefault}
        color={inverseText}
        _hover={{ bg: primaryHover }}
        _active={{ bg: primaryDark }}
        size="lg"
        height="50px"
        fontSize="md"
        onClick={handleProceedToPayment}
        w="full"
        disabled={
          isSubmitting ||
          isLoading ||
          isLockerDetailsLoading ||
          countdown <= 0 ||
          !profile ||
          (!!lockerError && selectedLocker)
        }
        loading={isSubmitting}
        loadingText="처리 중..."
      >
        {isSubmitting ? (
          "처리 중..."
        ) : (
          <Flex align="center">
            <Text>신청완료 / 결제하러가기</Text>
            <Text as="span" fontWeight="bold" color={timerYellowColor} ml={2}>
              ({formatTime(countdown)})
            </Text>
          </Flex>
        )}
      </Button>
    </Container>
  );
};

export default ApplicationConfirmPage;
