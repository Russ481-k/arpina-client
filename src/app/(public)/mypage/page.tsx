"use client"; // 클라이언트 컴포넌트로 전환

import React, { useState, useEffect, useMemo } from "react";
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
  specialChar: false,
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

  // Determine initial tab based on query parameter
  const initialTabFromQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTabFromQuery === "수영장_신청정보") {
      return "수영장_신청정보";
    }
    // Add other potential tab values from query if needed
    // else if (initialTabFromQuery === "비밀번호_변경") {
    //   return "비밀번호_변경";
    // }
    // else if (initialTabFromQuery === "수영장_결제정보") {
    //   return "수영장_결제정보";
    // }
    return "회원정보_수정"; // Default tab
  });

  async function fetchEnrollments() {
    try {
      const enrollmentsApiResponse = await mypageApi.getEnrollments();
      if (
        enrollmentsApiResponse &&
        Array.isArray(enrollmentsApiResponse.content)
      ) {
        setEnrollments(enrollmentsApiResponse.content as MypageEnrollDto[]);
      } else {
        console.warn(
          "Enrollments API response is not in the expected format or content is missing/not an array:",
          enrollmentsApiResponse
        );
        setEnrollments([]);
      }
    } catch (error) {
      console.error("[Mypage] Failed to load enrollments:", error);
      toaster.create({
        title: "오류",
        description: "수강 신청 정보를 불러오는데 실패했습니다.",
        type: "error",
      });
      setEnrollments([]);
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

        await fetchEnrollments(); // Call the new function to load enrollments
        const paymentsData = await mypageApi.getPayments();
        setPayments(paymentsData as MypagePaymentDto[]);
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
      specialChar: /[^A-Za-z0-9]/.test(password),
    };
    setPasswordCriteriaMet(criteria);
    const strengthScore = Object.values(criteria).filter(Boolean).length;
    setNewPasswordStrength(strengthScore);
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
          label="특수문자 포함"
          isMet={passwordCriteriaMet.specialChar}
        />
      </VStack>
    ),
    [passwordCriteriaMet]
  );

  // Event Handlers for LessonCardActions
  const handleGoToPayment = (paymentPageUrl: string) => {
    if (paymentPageUrl) {
      if (paymentPageUrl.startsWith("http")) {
        window.location.href = paymentPageUrl;
      } else {
        router.push(paymentPageUrl);
      }
    } else {
      toaster.create({
        title: "오류",
        description: "결제 페이지 정보를 찾을 수 없습니다.",
        type: "error",
      });
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

  const handleRenewLesson = async (lessonId: number) => {
    if (!lessonId) {
      toaster.create({
        title: "경고",
        description: "잘못된 강습 정보입니다.",
        type: "warning",
      });
      return;
    }
    if (
      window.confirm(
        "이 강습을 재등록 하시겠습니까? 현재 사물함 사용 여부는 재등록 시 유지되지 않으며, 결제 페이지에서 다시 선택해야 합니다."
      )
    ) {
      try {
        setIsLoading(true);
        const renewalResponse = await swimmingPaymentService.renewalLesson({
          lessonId,
          carryLocker: false,
        });
        if (renewalResponse && renewalResponse.paymentPageUrl) {
          toaster.create({
            title: "정보",
            description:
              "재등록 신청이 시작되었습니다. 결제 페이지로 이동합니다.",
            type: "info",
          });
          handleGoToPayment(renewalResponse.paymentPageUrl);
        } else {
          toaster.create({
            title: "오류",
            description:
              "재등록 절차를 시작하지 못했습니다. 관리자에게 문의해주세요.",
            type: "error",
          });
        }
      } catch (error: any) {
        console.error("[Mypage] Failed to renew lesson:", error);
        toaster.create({
          title: "오류",
          description: `재등록 중 오류가 발생했습니다: ${getApiErrorMessage(
            error,
            "관리자에게 문의해주세요."
          )}`,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" mb={8} fontSize="3xl">
        마이페이지
      </Heading>

      <Tabs.Root
        value={activeTab}
        onValueChange={(details) => setActiveTab(details.value)}
        variant="line"
        colorPalette="blue"
      >
        <Tabs.List mb={6}>
          <Tabs.Trigger value="회원정보_수정">회원정보 수정</Tabs.Trigger>
          <Tabs.Trigger value="비밀번호_변경">비밀번호 변경</Tabs.Trigger>
          <Tabs.Trigger value="수영장_신청정보">수영장 신청정보</Tabs.Trigger>
          <Tabs.Trigger value="수영장_결제정보">수영장 결제정보</Tabs.Trigger>
        </Tabs.List>

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

        <Tabs.Content value="수영장_신청정보">
          {isLoading ? (
            <Box textAlign="center" p={8}>
              <Text>로딩 중...</Text>
            </Box>
          ) : enrollments && enrollments.length > 0 ? (
            <>
              <Grid
                templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
                gap={6}
                py={4}
              >
                {enrollments.map((enroll) => {
                  // Prepare data for LessonCard from enroll.lesson
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
                    remaining: enroll.lesson.remaining, // from enroll.lesson
                    price: enroll.lesson.price, // from enroll.lesson
                    reservationId: enroll.lesson.reservationId, // from enroll.lesson
                    receiptId: enroll.lesson.receiptId, // from enroll.lesson
                    instructor: enroll.lesson.instructor, // from enroll.lesson
                    location: enroll.lesson.location, // from enroll.lesson
                  };

                  return (
                    <GridItem
                      key={enroll.enrollId}
                      display="flex"
                      flexDirection="column"
                      h="100%"
                    >
                      <LessonCard
                        lesson={lessonDataForCard}
                        context="mypage" // Set context to "mypage"
                        enrollment={enroll} // Pass the full enrollment object
                        onGoToPayment={handleGoToPayment}
                        onRequestCancel={handleRequestCancel}
                        onRenewLesson={handleRenewLesson}
                      />
                    </GridItem>
                  );
                })}
              </Grid>
              <Button
                colorPalette="orange"
                size="md"
                px={8}
                onClick={() => router.push("/sports/swimming/lesson")}
              >
                강습 목록으로 이동
              </Button>
            </>
          ) : (
            <Box textAlign="center" p={8}>
              <Text>신청한 수영장 강습 정보가 없습니다.</Text>
            </Box>
          )}
        </Tabs.Content>

        <Tabs.Content value="수영장_결제정보">
          {isLoading ? (
            <Box textAlign="center" p={8}>
              <Text>로딩 중...</Text>
            </Box>
          ) : payments && payments.length > 0 ? (
            <Box overflowX="auto" py={4}>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>결제 ID</Table.ColumnHeader>
                    <Table.ColumnHeader>신청 ID</Table.ColumnHeader>
                    <Table.ColumnHeader>결제일</Table.ColumnHeader>
                    <Table.ColumnHeader>결제 금액</Table.ColumnHeader>
                    <Table.ColumnHeader>환불 금액</Table.ColumnHeader>
                    <Table.ColumnHeader>상태</Table.ColumnHeader>
                    <Table.ColumnHeader>환불일</Table.ColumnHeader>
                    <Table.ColumnHeader>거래 ID</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {payments.map((payment) => (
                    <Table.Row key={payment.paymentId}>
                      <Table.Cell>{payment.paymentId}</Table.Cell>
                      <Table.Cell>{payment.enrollId}</Table.Cell>
                      <Table.Cell>
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString()
                          : "-"}
                      </Table.Cell>
                      <Table.Cell>
                        {payment.paid_amt.toLocaleString()}원
                      </Table.Cell>
                      <Table.Cell>
                        {payment.refunded_amt.toLocaleString()}원
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorPalette={
                            payment.status === "SUCCESS"
                              ? "green"
                              : payment.status === "CANCELED"
                              ? "red"
                              : payment.status === "PARTIAL_REFUNDED"
                              ? "orange"
                              : payment.status === "REFUND_REQUESTED"
                              ? "yellow"
                              : payment.status === "FAILED"
                              ? "purple" // Or another distinct color
                              : "gray"
                          }
                        >
                          {payment.status === "SUCCESS"
                            ? "결제완료"
                            : payment.status === "CANCELED"
                            ? "취소됨"
                            : payment.status === "PARTIAL_REFUNDED"
                            ? "부분환불"
                            : payment.status === "REFUND_REQUESTED"
                            ? "환불요청"
                            : payment.status === "FAILED"
                            ? "결제실패"
                            : payment.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {payment.refund_dt
                          ? new Date(payment.refund_dt).toLocaleDateString()
                          : "-"}
                      </Table.Cell>
                      <Table.Cell>{payment.tid || "-"}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          ) : (
            <Box textAlign="center" p={8}>
              <Text>결제 내역이 없습니다.</Text>
            </Box>
          )}
        </Tabs.Content>
      </Tabs.Root>

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
