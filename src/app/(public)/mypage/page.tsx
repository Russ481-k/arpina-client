"use client"; // 클라이언트 컴포넌트로 전환

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Tabs,
  Container,
  Flex,
  Heading,
  Input,
  Button,
  Stack,
  VStack,
  HStack,
  Text,
  Grid,
  GridItem,
  Badge,
  Table,
  Fieldset,
  Field,
  CloseButton,
  Portal,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { mypageApi, ProfileDto } from "@/lib/api/mypageApi";
import { MypageEnrollDto, MypagePaymentDto } from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "@/components/ui/password-input";
import { Tooltip } from "@/components/ui/tooltip";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { LessonDTO } from "@/types/swimming";
import { LessonCard } from "@/components/swimming/LessonCard";
import { swimmingPaymentService } from "@/lib/api/swimming"; // For renewal
import { Dialog } from "@chakra-ui/react";
import KISPGPaymentFrame, {
  KISPGPaymentFrameRef,
} from "@/components/payment/KISPGPaymentFrame";
import { KISPGPaymentInitResponseDto } from "@/types/api";
import { displayStatusConfig } from "@/lib/utils/statusUtils"; // Import the centralized config
import { UiDisplayStatus } from "@/types/statusTypes";
import { getMembershipLabel } from "@/lib/utils/displayUtils";

// Helper to format date strings "YYYY-MM-DD" to "YY년MM월DD일"
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "날짜 정보 없음";
  try {
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    const year = parts[0].substring(2); // 2025 -> 25
    const month = parts[1];
    const day = parts[2];
    return `${year}년${month}월${day}일`;
  } catch (error) {
    return dateString;
  }
};

const initialPasswordCriteria = {
  minLength: false,
  lowercase: false,
  number: false,
  allowedSpecialChar: false,
  noOtherSpecialChars: false,
};

const PasswordTooltipChecklistItem = ({
  label,
  isMet,
}: {
  label: string;
  isMet: boolean;
}) => (
  <HStack gap={2}>
    <Box color={isMet ? "green.400" : "red.400"}>
      {isMet ? <CheckCircle2Icon size={14} /> : <XCircleIcon size={14} />}
    </Box>
    <Text fontSize="xs" color={isMet ? "green.400" : "red.400"}>
      {label}
    </Text>
  </HStack>
);

const getApiErrorMessage = (error: any, defaultMessage: string): string => {
  if (error && error.response && error.response.data) {
    const data = error.response.data;
    if (data.validationErrors) {
      if (
        Array.isArray(data.validationErrors) &&
        data.validationErrors.length > 0
      ) {
        return data.validationErrors.join("\\n");
      } else if (
        typeof data.validationErrors === "object" &&
        Object.keys(data.validationErrors).length > 0
      ) {
        return Object.values(data.validationErrors).join("\\n");
      }
    }
    if (data.message && typeof data.message === "string") {
      return data.message;
    }
  }
  if (error && error.message && typeof error.message === "string") {
    return error.message;
  }
  return defaultMessage;
};

// "YYYY.MM.DD HH:MM:SS 까지" 형태를 Date로 변환
const parseKSTDateString = (
  kstDateStringWithSuffix?: string | null
): Date | null => {
  if (!kstDateStringWithSuffix) return null;
  try {
    let parsableDateStr = kstDateStringWithSuffix
      .replace(/부터|까지/g, "")
      .trim()
      .replace(/\./g, "-"); // YYYY-MM-DD HH:MM:SS
    const d = new Date(parsableDateStr);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
};

// 접수 마감 여부: 잔여석 0이거나 접수 종료 시간이 지난 경우
const isApplicationClosed = (lesson: any): boolean => {
  if (!lesson) return true;
  if (lesson.remaining === 0) return true;
  const end = parseKSTDateString(lesson.receiptId);
  return end ? new Date().getTime() > end.getTime() : false;
};

export default function MyPage() {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [profilePw, setProfilePw] = useState("");
  const [enrollments, setEnrollments] = useState<MypageEnrollDto[]>([]);
  const [payments, setPayments] = useState<MypagePaymentDto[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [passwordCriteriaMet, setPasswordCriteriaMet] = useState(
    initialPasswordCriteria
  );
  const [newPasswordStrength, setNewPasswordStrength] = useState(0);
  const [isPasswordTooltipVisible, setIsPasswordTooltipVisible] =
    useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelTargetEnrollId, setCancelTargetEnrollId] = useState<
    number | null
  >(null);

  // Payment module state
  const [currentPaymentData, setCurrentPaymentData] =
    useState<KISPGPaymentInitResponseDto | null>(null);
  const [currentPaymentEnrollId, setCurrentPaymentEnrollId] = useState<
    number | null
  >(null);
  const paymentFrameRef = useRef<KISPGPaymentFrameRef>(null);

  // Tab management with URL sync
  const initialTabFromQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTabFromQuery) {
      return initialTabFromQuery;
    }
    return "수영장_신청정보"; // Default tab
  });

  // Data loading flags to prevent unnecessary reloads
  const [dataLoaded, setDataLoaded] = useState({
    profile: false,
    enrollments: false,
    payments: false,
  });

  // Handle tab change with URL update
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);

    // Update URL without page reload - remove tab parameter for default tab
    const newUrl = new URL(window.location.href);
    if (newTab === "회원정보_수정") {
      newUrl.searchParams.delete("tab");
    } else {
      newUrl.searchParams.set("tab", newTab);
    }

    // Use replaceState to avoid creating new history entries
    window.history.replaceState({}, "", newUrl.toString());
  };

  async function fetchEnrollments(forceRefresh = false) {
    if (dataLoaded.enrollments && !forceRefresh) {
      return;
    }

    try {
      const enrollmentsApiResponse = await mypageApi.getEnrollments();
      if (
        enrollmentsApiResponse &&
        Array.isArray(enrollmentsApiResponse.content)
      ) {
        const rawEnrollments =
          (enrollmentsApiResponse.content as MypageEnrollDto[]) || [];

        // '활성' 상태를 명확히 정의합니다 (취소/환불된 상태 제외).
        const activeStatuses = ["PAID", "PAYMENT_PENDING"];

        // 활성 신청 내역에 대해 "강습ID_시작일" 형태의 고유 키를 생성합니다.
        // 이를 통해 다른 기간의 동일 강습을 구분할 수 있습니다.
        const activeEnrollmentKeys = new Set(
          rawEnrollments
            .filter(
              (e) => !e.renewal && activeStatuses.includes(e.status || "")
            )
            .map((e) => `${e.lesson.lessonId}_${e.lesson.startDate}`)
        );

        // 재수강 카드와 활성 신청 카드를 비교하여 필터링합니다.
        const filteredEnrollments = rawEnrollments.filter((e) => {
          // 재수강 카드의 경우,
          if (e.renewal) {
            // 동일한 기간의 활성 신청 내역이 존재하면 숨깁니다.
            const renewalKey = `${e.lesson.lessonId}_${e.lesson.startDate}`;
            return !activeEnrollmentKeys.has(renewalKey);
          }
          // 재수강 카드가 아니면 항상 표시합니다.
          return true;
        });

        // 정렬: 1. 취소 가능(PAID) 우선, 2. 최신 강습 순
        const sortedEnrollments = filteredEnrollments.sort((a, b) => {
          const isACancellable = a.status === "PAID";
          const isBCancellable = b.status === "PAID";

          // 취소 가능 여부로 정렬 (가능한 것이 위로)
          if (isACancellable !== isBCancellable) {
            return isACancellable ? -1 : 1;
          }

          // 강습 시작일로 정렬 (최신순)
          const dateA = new Date(a.lesson.startDate).getTime();
          const dateB = new Date(b.lesson.startDate).getTime();
          return dateB - dateA;
        });

        setEnrollments(sortedEnrollments);
        setDataLoaded((prev) => ({ ...prev, enrollments: true }));
      } else {
        console.warn(
          "⚠️ Enrollments API response is not in the expected format or content is missing/not an array:",
          enrollmentsApiResponse
        );
        setEnrollments([]);
      }
    } catch (error) {
      console.error("❌ [Mypage] Failed to load enrollments:", error);
      toaster.create({
        title: "오류",
        description: "수강 신청 정보를 불러오는데 실패했습니다.",
        type: "error",
      });
      setEnrollments([]);
    }
  }

  // Separate function for fetching payments
  async function fetchPayments() {
    if (dataLoaded.payments) {
      return;
    }

    try {
      const paymentsApiResponse = await mypageApi.getPayments();

      // API returns paginated response with content array
      if (
        paymentsApiResponse &&
        paymentsApiResponse.content &&
        Array.isArray(paymentsApiResponse.content)
      ) {
        setPayments(paymentsApiResponse.content as MypagePaymentDto[]);
        setDataLoaded((prev) => ({ ...prev, payments: true }));
      } else {
        console.warn(
          "Payments API response is not in expected format:",
          paymentsApiResponse
        );
        setPayments([]);
      }
    } catch (error) {
      console.error("[Mypage] Failed to load payments:", error);
      toaster.create({
        title: "오류",
        description: "결제 정보를 불러오는데 실패했습니다.",
        type: "error",
      });
      setPayments([]);
    }
  }

  useEffect(() => {
    let localUserData: any = null;

    async function fetchUserData() {
      try {
        setIsLoading(true);

        if (typeof window !== "undefined") {
          const authUserStr = localStorage.getItem("auth_user");
          if (authUserStr) {
            try {
              localUserData = JSON.parse(authUserStr);

              setProfile((prevProfile) => {
                if (prevProfile) {
                  return {
                    ...prevProfile,
                    userId: localUserData.username || prevProfile.userId,
                    name: localUserData.name || prevProfile.name,
                    email: localUserData.email || prevProfile.email,
                    phone: localUserData.phone || prevProfile.phone || "",
                    address: localUserData.address || prevProfile.address || "",
                    carNo: localUserData.carNo || prevProfile.carNo || "",
                    gender: prevProfile.gender,
                  };
                } else {
                  return {
                    id: 0, // Placeholder, ensure ProfileDto allows this or handle null better
                    userId: localUserData.username || "",
                    name: localUserData.name || "",
                    email: localUserData.email || "",
                    phone: localUserData.phone || "",
                    address: localUserData.address || "",
                    carNo: localUserData.carNo || "",
                  } as ProfileDto;
                }
              });
            } catch (e) {
              console.error("Error parsing auth_user from localStorage:", e);
            }
          }
        }

        const profileData = await mypageApi.getProfile();

        if (
          profileData &&
          typeof profileData === "object" &&
          profileData.userId
        ) {
          setProfile((prevProfile) => ({
            ...(prevProfile || {}),
            id: profileData.id,
            userId: profileData.userId,
            name: profileData.name,
            phone:
              profileData.phone !== undefined
                ? profileData.phone
                : prevProfile?.phone ?? "",
            address:
              profileData.address !== undefined
                ? profileData.address
                : prevProfile?.address ?? "",
            email:
              profileData.email !== undefined
                ? profileData.email
                : prevProfile?.email ?? "",
            carNo:
              profileData.carNo !== undefined
                ? profileData.carNo
                : prevProfile?.carNo ?? "",
            gender:
              profileData.gender !== undefined
                ? profileData.gender
                : prevProfile?.gender,
          }));
        } else {
          if (localUserData && (!profile || !profile.userId)) {
            setProfile((prevProfile) => {
              if (prevProfile) {
                return {
                  ...prevProfile,
                  userId: localUserData.username || prevProfile.userId,
                  name: localUserData.name || prevProfile.name,
                  email: localUserData.email || prevProfile.email,
                  phone: localUserData.phone || prevProfile.phone || "",
                  address: localUserData.address || prevProfile.address || "",
                  carNo: localUserData.carNo || prevProfile.carNo || "",
                  gender: prevProfile.gender,
                };
              } else {
                return {
                  id: 0, // Placeholder
                  userId: localUserData.username || "",
                  name: localUserData.name || "",
                  email: localUserData.email || "",
                  phone: localUserData.phone || "",
                  address: localUserData.address || "",
                  carNo: localUserData.carNo || "",
                } as ProfileDto;
              }
            });
          }
        }

        // Mark profile data as loaded
        setDataLoaded((prev) => ({ ...prev, profile: true }));

        // Load enrollments if starting on the enrollment tab or no tab specified (default)
        if (initialTabFromQuery === "수영장_신청정보" || !initialTabFromQuery) {
          await fetchEnrollments();
        }

        // Only load payments if we're starting on the payment tab
        if (initialTabFromQuery === "수영장_결제정보") {
          await fetchPayments();
        }
      } catch (error) {
        console.error(
          "[Mypage] Failed to load user data (in catch block):",
          error
        );

        if (
          profile &&
          profile.name &&
          profile.name !== (localUserData?.name || localUserData?.username)
        ) {
          setEnrollments([]);
          setPayments([]);
        } else if (localUserData && (!profile || !profile.userId)) {
          setProfile((prevProfile) => {
            if (prevProfile) {
              return {
                ...prevProfile,
                userId: localUserData.username || prevProfile.userId,
                name: localUserData.name || prevProfile.name,
                email: localUserData.email || prevProfile.email,
                phone: localUserData.phone || prevProfile.phone || "",
                address: localUserData.address || prevProfile.address || "",
                carNo: localUserData.carNo || prevProfile.carNo || "",
                gender: prevProfile.gender,
              };
            } else {
              return {
                id: 0, // Placeholder
                userId: localUserData.username || "",
                name: localUserData.name || "",
                email: localUserData.email || "",
                phone: localUserData.phone || "",
                address: localUserData.address || "",
                carNo: localUserData.carNo || "",
              } as ProfileDto;
            }
          });
          setEnrollments([]);
          setPayments([]);
        } else if (!profile || !profile.userId) {
          setEnrollments([]);
          setPayments([]);
        }

        toaster.create({
          title: "데이터 로딩 중 오류 발생",
          description: getApiErrorMessage(
            error,
            "마이페이지 정보 중 일부를 불러오는데 실패했습니다. 문제가 지속되면 문의해주세요."
          ),
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // Consider dependencies carefully

  // Update activeTab if query param changes after initial load (optional, but good practice)
  useEffect(() => {
    const tabFromQuery = searchParams.get("tab");
    if (tabFromQuery === "수영장_신청정보" && activeTab !== "수영장_신청정보") {
      setActiveTab("수영장_신청정보");
    }
    // Add other conditions if other tabs can also be set via query params
    // else if (tabFromQuery === "비밀번호_변경" && activeTab !== "비밀번호_변경") {
    //   setActiveTab("비밀번호_변경");
    // }
    // else if (tabFromQuery === "수영장_결제정보" && activeTab !== "수영장_결제정보") {
    //   setActiveTab("수영장_결제정보");
    // }
  }, [searchParams, activeTab]);

  const validateNewPasswordCriteria = (password: string) => {
    const criteria = {
      minLength: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      allowedSpecialChar: /[!@#$%^&*()]/.test(password),
      noOtherSpecialChars: /^[a-zA-Z0-9!@#$%^&*()]*$/.test(password),
    };
    setPasswordCriteriaMet(criteria);

    const calculatedStrengthScore = [
      criteria.minLength,
      criteria.lowercase,
      criteria.number,
      criteria.allowedSpecialChar,
    ].filter(Boolean).length;
    setNewPasswordStrength(calculatedStrengthScore);

    return Object.values(criteria).every(Boolean);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPasswordValue = e.target.value;
    setNewPw(newPasswordValue);
    validateNewPasswordCriteria(newPasswordValue);
    if (newPwConfirm) {
      setPasswordsMatch(newPasswordValue === newPwConfirm);
    }
  };

  const handleNewPasswordConfirmChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newConfirmPasswordValue = e.target.value;
    setNewPwConfirm(newConfirmPasswordValue);
    setPasswordsMatch(newPw === newConfirmPasswordValue);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!profilePw.trim()) {
      toaster.create({
        title: "비밀번호 필요",
        description: "회원정보 변경을 위해 현재 비밀번호를 입력해주세요.",
        type: "error",
      });
      return;
    }

    try {
      await mypageApi.updateProfile(profile, profilePw);

      setProfilePw("");

      toaster.create({
        title: "정보 변경 완료",
        description: "회원정보가 성공적으로 변경되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toaster.create({
        title: "정보 변경 실패",
        description: getApiErrorMessage(
          error,
          "회원정보 변경에 실패했습니다. 입력 내용을 확인하거나 비밀번호를 확인해주세요."
        ),
        type: "error",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPw.trim()) {
      toaster.create({
        title: "현재 비밀번호 필요",
        description: "현재 비밀번호를 입력해주세요.",
        type: "error",
      });
      return;
    }

    if (newPw !== newPwConfirm) {
      toaster.create({
        title: "비밀번호 불일치",
        description: "새 비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        type: "error",
      });
      return;
    }

    const isNewPasswordValid = validateNewPasswordCriteria(newPw);
    if (!isNewPasswordValid) {
      toaster.create({
        title: "유효하지 않은 새 비밀번호",
        description:
          "새 비밀번호가 모든 조건을 충족하지 않습니다. 다시 확인해주세요.",
        type: "error",
      });
      setIsPasswordTooltipVisible(true);
      return;
    }

    try {
      await mypageApi.changePassword({
        currentPw,
        newPw,
      });

      setCurrentPw("");
      setNewPw("");
      setNewPwConfirm("");

      toaster.create({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      toaster.create({
        title: "비밀번호 변경 실패",
        description: getApiErrorMessage(
          error,
          "비밀번호 변경 중 오류가 발생했습니다. 현재 비밀번호를 확인하거나 입력값을 확인해주세요."
        ),
        type: "error",
      });
    }
  };

  const passwordTooltipContent = useMemo(
    () => (
      <VStack align="start" gap={0.5}>
        <PasswordTooltipChecklistItem
          label="8자 이상"
          isMet={passwordCriteriaMet.minLength}
        />
        <PasswordTooltipChecklistItem
          label="영문 소문자 포함"
          isMet={passwordCriteriaMet.lowercase}
        />
        <PasswordTooltipChecklistItem
          label="숫자 포함"
          isMet={passwordCriteriaMet.number}
        />
        <PasswordTooltipChecklistItem
          label="특수문자 (!@#$%^&*()) 포함"
          isMet={passwordCriteriaMet.allowedSpecialChar}
        />
        <PasswordTooltipChecklistItem
          label="다른 종류의 특수문자 사용 불가"
          isMet={passwordCriteriaMet.noOtherSpecialChars}
        />
      </VStack>
    ),
    [passwordCriteriaMet]
  );

  // Event Handlers for LessonCardActions
  const handleGoToPayment = async (enrollId: number) => {
    try {
      setIsLoading(true);

      // enrollId로 KISPG 결제 초기화 API 호출
      const paymentInitData = await swimmingPaymentService.initKISPGPayment(
        enrollId
      );

      // 결제 데이터 설정 및 결제창 표시
      setCurrentPaymentData(paymentInitData);
      setCurrentPaymentEnrollId(enrollId);

      // 잠시 후 결제창 트리거 (DOM이 준비된 후)
      setTimeout(() => {
        if (paymentFrameRef.current) {
          paymentFrameRef.current.triggerPayment();
        }
      }, 100);
    } catch (error) {
      console.error("결제 초기화 실패:", error);
      toaster.create({
        title: "결제 초기화 실패",
        description: getApiErrorMessage(
          error,
          "결제를 시작할 수 없습니다. 다시 시도해주세요."
        ),
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCancel = async (enrollId: number) => {
    if (!enrollId) {
      toaster.create({
        title: "경고",
        description: "잘못된 강습 정보입니다.",
        type: "warning",
      });
      return;
    }

    try {
      setIsLoading(true);
      await mypageApi.cancelEnrollment(enrollId);
      toaster.create({
        title: "성공",
        description: "취소 요청이 접수되었습니다.",
        type: "success",
      });
      await refreshEnrollmentData();
    } catch (error: any) {
      console.error("[Mypage] Failed to request cancellation:", error);
      toaster.create({
        title: "오류",
        description: `취소 요청 중 오류가 발생했습니다: ${getApiErrorMessage(
          error,
          ""
        )}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeDialogCancellation = async () => {
    if (cancelTargetEnrollId === null) return;
    try {
      setIsLoading(true);
      await mypageApi.cancelEnrollment(cancelTargetEnrollId);
      toaster.create({
        title: "성공",
        description: "취소 요청이 접수되었습니다. 관리자 확인 후 처리됩니다.",
        type: "success",
      });
      await fetchEnrollments();
    } catch (error: any) {
      console.error("[Mypage] Failed to request cancellation:", error);
      toaster.create({
        title: "오류",
        description: `취소 요청 중 오류가 발생했습니다: ${getApiErrorMessage(
          error,
          ""
        )}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
      setIsCancelDialogOpen(false);
      setCancelTargetEnrollId(null);
    }
  };

  const handleRenewLesson = async (enrollment: MypageEnrollDto) => {
    if (!enrollment || !enrollment.lesson) {
      toaster.create({
        title: "오류",
        description: "재수강할 강습 정보가 없습니다.",
        type: "error",
      });
      return;
    }

    const { lesson } = enrollment;

    // Logic is copied from LessonCard.tsx's handleApplyClick
    toaster.create({
      title: "재수강 신청",
      description: "신청 정보 확인 페이지로 이동합니다.",
      type: "info",
      duration: 1500,
    });

    const queryParams = new URLSearchParams({
      lessonId: lesson.lessonId.toString(),
      lessonTitle: lesson.title,
      lessonPrice: lesson.price.toString(),
      lessonStartDate: lesson.startDate,
      lessonEndDate: lesson.endDate,
      lessonTime: lesson.timeSlot || "",
      lessonDays: lesson.days || "",
      lessonTimePrefix: lesson.timePrefix || "",
      isRenewal: "true", // Add a flag to indicate this is a renewal
    });

    router.push(`/application/confirm?${queryParams.toString()}`);
  };

  // Function to refresh enrollment data (useful after payment completion)
  const refreshEnrollmentData = async () => {
    setDataLoaded((prev) => ({ ...prev, enrollments: false }));
    await fetchEnrollments(true); // Force refresh
  };

  // Function to refresh payment data
  const refreshPaymentData = async () => {
    setDataLoaded((prev) => ({ ...prev, payments: false }));
    await fetchPayments();
  };

  return (
    <Container maxW="1600px" py={8}>
      <Heading as="h1" mb={8} fontSize="3xl">
        마이페이지
      </Heading>

      <Tabs.Root
        value={activeTab}
        onValueChange={(details) => handleTabChange(details.value)}
        variant="line"
        colorPalette="blue"
      >
        <Tabs.List mb={6}>
          <Tabs.Trigger
            value="수영장_신청정보"
            onClick={() => {
              // Load enrollments data when tab is clicked
              if (!dataLoaded.enrollments) {
                fetchEnrollments();
              }
            }}
          >
            수영장 신청정보
          </Tabs.Trigger>
          <Tabs.Trigger
            value="수영장_결제정보"
            onClick={() => {
              // Load payments data when tab is clicked
              if (!dataLoaded.payments) {
                fetchPayments();
              }
            }}
          >
            수영장 결제정보
          </Tabs.Trigger>
          <Tabs.Trigger value="회원정보_수정">회원정보 수정</Tabs.Trigger>
          <Tabs.Trigger value="비밀번호_변경">비밀번호 변경</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="수영장_신청정보">
          {isLoading ? (
            <Box textAlign="center" p={8}>
              <Text>로딩 중...</Text>
            </Box>
          ) : enrollments && enrollments.length > 0 ? (
            <Grid templateColumns="repeat(auto-fill, minmax(360px, 1fr))">
              {enrollments.map((enroll) => {
                // Prepare data for LessonCard from enroll.lesson
                const closedForDisplay = isApplicationClosed(enroll.lesson);
                const lessonDataForCard: LessonDTO = {
                  id: enroll.lesson.lessonId,
                  title: enroll.lesson.title,
                  name: enroll.lesson.name, // Make sure this field exists or is mapped
                  startDate: formatDate(enroll.lesson.startDate), // Use formatDate
                  endDate: formatDate(enroll.lesson.endDate), // Use formatDate
                  timeSlot: enroll.lesson.timeSlot, // from enroll.lesson
                  timePrefix: enroll.lesson.timePrefix, // from enroll.lesson
                  days: enroll.lesson.days, // from enroll.lesson
                  capacity: enroll.lesson.capacity, // from enroll.lesson
                  remaining: closedForDisplay ? 0 : enroll.lesson.remaining, // close -> 0
                  price: enroll.lesson.price, // from enroll.lesson
                  reservationId: enroll.lesson.reservationId, // from enroll.lesson
                  receiptId: enroll.lesson.receiptId, // from enroll.lesson
                  instructor: enroll.lesson.instructor, // from enroll.lesson
                  location: enroll.lesson.location, // from enroll.lesson
                };

                return (
                  <LessonCard
                    key={enroll.enrollId ?? `renewal-${enroll.lesson.lessonId}`}
                    lesson={lessonDataForCard}
                    context="mypage" // Set context to "mypage"
                    enrollment={enroll} // Pass the full enrollment object
                    onGoToPayment={handleGoToPayment}
                    onRequestCancel={handleRequestCancel}
                    onRenewLesson={handleRenewLesson}
                  />
                );
              })}
            </Grid>
          ) : (
            <Box textAlign="center" p={8}>
              <Text>신청한 수영장 강습 정보가 없습니다.</Text>
            </Box>
          )}
          <Box textAlign="center" p={8}>
            <Button
              colorPalette="orange"
              size="md"
              px={8}
              onClick={() => router.push("/sports/swimming/lesson")}
            >
              강습 목록으로 이동
            </Button>
          </Box>
        </Tabs.Content>

        <Tabs.Content value="수영장_결제정보">
          {isLoading ? (
            <Box textAlign="center" p={8}>
              <Text>로딩 중...</Text>
            </Box>
          ) : payments && payments.length > 0 ? (
            <Box py={4}>
              {/* 카드 형태로 결제 정보 표시 - 더 많은 정보를 깔끔하게 보여주기 위해 */}
              <Grid
                templateColumns="repeat(auto-fill, minmax(500px, 1fr))"
                gap={6}
              >
                {payments.map((payment) => {
                  // Determine badge color and label using the centralized config
                  const statusInfo =
                    displayStatusConfig[payment.status as UiDisplayStatus] ||
                    displayStatusConfig["FAILED"]; // Fallback to a default

                  return (
                    <Box
                      key={payment.paymentId}
                      p={6}
                      borderWidth="1px"
                      borderRadius="lg"
                      bg="white"
                      shadow="sm"
                      _hover={{ shadow: "md" }}
                    >
                      <VStack align="stretch" gap={4}>
                        {/* 헤더: 결제 상태와 금액 */}
                        <Flex justify="space-between" align="center">
                          <Badge
                            colorPalette={statusInfo.colorPalette}
                            variant={statusInfo.badgeVariant}
                            size="lg"
                          >
                            {statusInfo.label}
                          </Badge>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="blue.600"
                          >
                            {payment.finalAmount.toLocaleString()}원
                          </Text>
                        </Flex>

                        {/* 강습 정보 */}
                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" mb={2}>
                            {payment.lessonTitle}
                          </Text>
                          <VStack align="stretch" gap={1} fontSize="sm">
                            <Flex justify="space-between">
                              <Text color="gray.600">강습 기간:</Text>
                              <Text>
                                {formatDate(payment.lessonStartDate)} ~{" "}
                                {formatDate(payment.lessonEndDate)}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text color="gray.600">강습 시간:</Text>
                              <Text>{payment.lessonTime}</Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text color="gray.600">장소:</Text>
                              <Text>{payment.locationName}</Text>
                            </Flex>
                          </VStack>
                        </Box>

                        {/* 결제 상세 정보 */}
                        <Box>
                          <Text fontSize="md" fontWeight="semibold" mb={2}>
                            결제 내역
                          </Text>
                          <VStack align="stretch" gap={1} fontSize="sm">
                            <Flex justify="space-between">
                              <Text color="gray.600">강습비:</Text>
                              <Text>
                                {payment.lessonPrice.toLocaleString()}원
                              </Text>
                            </Flex>
                            {payment.usesLocker && (
                              <Flex justify="space-between">
                                <Text color="gray.600">사물함비:</Text>
                                <Text>
                                  {payment.lockerFee.toLocaleString()}원
                                </Text>
                              </Flex>
                            )}
                            {payment.discountType &&
                              payment.discountPercentage > 0 && (
                                <Flex justify="space-between">
                                  <Text color="gray.600">할인:</Text>
                                  <Text color="red.500">
                                    -{payment.discountPercentage}% (
                                    {payment.discountType})
                                  </Text>
                                </Flex>
                              )}
                            <Box
                              borderTop="1px"
                              borderColor="gray.200"
                              pt={2}
                              mt={2}
                            >
                              <Flex justify="space-between" fontWeight="bold">
                                <Text>최종 결제 금액:</Text>
                                <Text color="blue.600">
                                  {payment.finalAmount.toLocaleString()}원
                                </Text>
                              </Flex>
                            </Box>
                          </VStack>
                        </Box>

                        {/* 결제 정보 */}
                        <Box>
                          <Text fontSize="md" fontWeight="semibold" mb={2}>
                            결제 정보
                          </Text>
                          <VStack align="stretch" gap={1} fontSize="sm">
                            <Flex justify="space-between">
                              <Text color="gray.600">결제 ID:</Text>
                              <Text>{payment.paymentId}</Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text color="gray.600">신청 ID:</Text>
                              <Text>{payment.enrollId}</Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text color="gray.600">결제일:</Text>
                              <Text>
                                {payment.paidAt
                                  ? new Date(payment.paidAt).toLocaleDateString(
                                      "ko-KR",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : "-"}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text color="gray.600">할인 유형:</Text>
                              <Text>
                                {getMembershipLabel(payment.membershipType)}
                              </Text>
                            </Flex>
                            {payment.usesLocker && (
                              <Flex justify="space-between">
                                <Text color="gray.600">사물함 사용:</Text>
                                <Badge colorPalette="blue" size="sm">
                                  사용함
                                </Badge>
                              </Flex>
                            )}
                          </VStack>
                        </Box>
                      </VStack>
                    </Box>
                  );
                })}
              </Grid>
            </Box>
          ) : (
            <Box textAlign="center" p={8}>
              <Text>결제 내역이 없습니다.</Text>
            </Box>
          )}
        </Tabs.Content>
        <Tabs.Content value="회원정보_수정">
          {isLoading ? (
            <Box textAlign="center" p={8}>
              <Text>로딩 중...</Text>
            </Box>
          ) : profile ? (
            <Box
              as="form"
              onSubmit={handleProfileUpdate}
              py={4}
              maxW="672px"
              mx="auto"
            >
              <Fieldset.Root>
                <Fieldset.Content>
                  <Field.Root>
                    <Field.Label>이름</Field.Label>
                    <Input
                      value={profile.name || ""}
                      readOnly
                      bg="gray.100"
                      placeholder="이름"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>아이디</Field.Label>
                    <Input
                      value={profile.userId || ""}
                      readOnly
                      bg="gray.100"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>핸드폰 번호</Field.Label>
                    <Input
                      value={profile.phone || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      placeholder="핸드폰 번호를 입력해주세요 (ex: 123-1234-1234)"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>주소</Field.Label>
                    <Input
                      value={profile.address || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                      placeholder="주소를 입력해주세요"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>이메일</Field.Label>
                    <Input
                      value={profile.email || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      placeholder="이메일을 입력해주세요"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>차량번호</Field.Label>
                    <Input
                      value={profile.carNo || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, carNo: e.target.value })
                      }
                      placeholder="차량번호를 입력해주세요"
                    />
                  </Field.Root>

                  <Field.Root mt={4}>
                    <Field.Label>본인 확인을 위한 비밀번호</Field.Label>
                    <Input
                      type="password"
                      value={profilePw}
                      onChange={(e) => setProfilePw(e.target.value)}
                      placeholder="회원정보 변경을 위해 현재 비밀번호를 입력해주세요"
                      required
                    />
                  </Field.Root>
                </Fieldset.Content>

                <Box textAlign="center" mt={4}>
                  <Button type="submit" colorPalette="orange" size="md" px={8}>
                    정보변경
                  </Button>
                </Box>
              </Fieldset.Root>
            </Box>
          ) : (
            <Box textAlign="center" p={8}>
              <Text>사용자 정보를 불러올 수 없습니다.</Text>
            </Box>
          )}
        </Tabs.Content>

        <Tabs.Content value="비밀번호_변경">
          <Box
            as="form"
            onSubmit={handlePasswordChange}
            py={4}
            maxW="672px"
            mx="auto"
          >
            <Fieldset.Root>
              <Fieldset.Content>
                <Box p={4} bg="gray.50" borderRadius="md" mb={4}>
                  <Text fontSize="sm">
                    <strong>현재 비밀번호를 입력하세요.</strong>
                    <br />
                    안전을 위해 새 비밀번호를 설정해주세요.
                    <br />
                    비밀번호는 최소 6자 이상이며, 영문+숫자+특수문자를 포함해야
                    합니다.
                  </Text>
                </Box>

                <Field.Root>
                  <Field.Label>아이디</Field.Label>
                  <Input value={profile?.userId || ""} readOnly bg="gray.100" />
                </Field.Root>

                <Field.Root>
                  <Field.Label>현재 비밀번호</Field.Label>
                  <PasswordInput
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="현재 비밀번호를 입력해주세요"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>새 비밀번호</Field.Label>
                  <Stack w="full">
                    <Tooltip
                      content={passwordTooltipContent}
                      open={isPasswordTooltipVisible}
                      positioning={{ placement: "bottom-start" }}
                      contentProps={{
                        bg: "white",
                        color: "gray.800",
                        _dark: {
                          bg: "gray.700",
                          color: "whiteAlpha.900",
                        },
                        mt: 2,
                        p: 3,
                        fontSize: "sm",
                        borderRadius: "md",
                        boxShadow: "md",
                        zIndex: "tooltip",
                      }}
                    >
                      <PasswordInput
                        value={newPw}
                        onChange={handleNewPasswordChange}
                        onFocus={() => setIsPasswordTooltipVisible(true)}
                        onBlur={() => setIsPasswordTooltipVisible(false)}
                        placeholder="새로운 비밀번호를 입력해주세요"
                      />
                    </Tooltip>
                    {newPw.length > 0 && (
                      <PasswordStrengthMeter
                        value={newPasswordStrength}
                        max={4}
                      />
                    )}
                  </Stack>
                </Field.Root>

                <Field.Root
                  invalid={!passwordsMatch && newPwConfirm.length > 0}
                >
                  <Field.Label>새 비밀번호 확인</Field.Label>
                  <PasswordInput
                    value={newPwConfirm}
                    onChange={handleNewPasswordConfirmChange}
                    placeholder="새로운 비밀번호를 한번 더 입력해주세요"
                  />
                  {!passwordsMatch && newPwConfirm.length > 0 && (
                    <Field.ErrorText>
                      비밀번호가 일치하지 않습니다.
                    </Field.ErrorText>
                  )}
                </Field.Root>
              </Fieldset.Content>

              <Box textAlign="center" mt={4}>
                <Button type="submit" colorPalette="orange" size="md" px={8}>
                  정보변경
                </Button>
              </Box>
            </Fieldset.Root>
          </Box>
        </Tabs.Content>
      </Tabs.Root>

      {/* KISPG 결제창 - 기존 강의 신청 페이지와 동일한 방식 */}
      {currentPaymentData && currentPaymentEnrollId && (
        <KISPGPaymentFrame
          ref={paymentFrameRef}
          paymentData={currentPaymentData as any}
          enrollId={currentPaymentEnrollId}
          onPaymentComplete={async (success, data) => {
            if (success) {
              toaster.create({
                title: "결제 완료",
                description: "결제가 성공적으로 완료되었습니다!",
                type: "success",
                duration: 3000,
              });

              // 🎯 결제 완료 후 데이터 리프레시 (강제 리프레시)
              await refreshEnrollmentData();
              await refreshPaymentData();

              // 신청정보 탭으로 이동 (URL도 업데이트)
              handleTabChange("수영장_신청정보");
            } else {
              toaster.create({
                title: "결제 실패",
                description: data?.message || "결제 중 오류가 발생했습니다.",
                type: "error",
                duration: 5000,
              });
            }

            // 결제 데이터 초기화
            setCurrentPaymentData(null);
            setCurrentPaymentEnrollId(null);
          }}
          onPaymentClose={() => {
            // 결제 데이터 초기화
            setCurrentPaymentData(null);
            setCurrentPaymentEnrollId(null);

            toaster.create({
              title: "결제 창 닫기",
              description: "결제가 취소되었습니다.",
              type: "info",
              duration: 2000,
            });
          }}
        />
      )}

      <Dialog.Root
        open={isCancelDialogOpen}
        onOpenChange={(open) => !open && setIsCancelDialogOpen(false)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="sm">
              <Dialog.Header>
                <Dialog.Title>강습 취소 확인</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton
                    onClick={() => setIsCancelDialogOpen(false)}
                    position="absolute"
                    top="2"
                    right="2"
                  />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Text>정말로 이 강습의 취소를 요청하시겠습니까?</Text>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  취소 요청 후에는 되돌릴 수 없습니다.
                </Text>
              </Dialog.Body>
              <Dialog.Footer mt={4}>
                <Button
                  variant="outline"
                  onClick={() => setIsCancelDialogOpen(false)}
                  mr={3}
                >
                  닫기
                </Button>
                <Button colorPalette="red" onClick={executeDialogCancellation}>
                  취소 요청
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Container>
  );
}
