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
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { mypageApi, ProfileDto } from "@/lib/api/mypageApi";
import { MypageEnrollDto, MypagePaymentDto } from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "@/components/ui/password-input";
import { Tooltip } from "@/components/ui/tooltip";
import { CheckCircle2Icon, XCircleIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

const initialPasswordCriteria = {
  minLength: false,
  uppercase: false,
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

  const [passwordCriteriaMet, setPasswordCriteriaMet] = useState(
    initialPasswordCriteria
  );
  const [newPasswordStrength, setNewPasswordStrength] = useState(0);
  const [isPasswordTooltipVisible, setIsPasswordTooltipVisible] =
    useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

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
                  return null;
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
                return null;
              }
            });
          }
        }

        const enrollmentsData = await mypageApi.getEnrollments();
        setEnrollments(enrollmentsData as MypageEnrollDto[]);

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
              return null;
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
  }, []); // profile is used in catch block, but effect is for initial load.

  const validateNewPasswordCriteria = (password: string) => {
    const criteria = {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
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
          label="영문 대문자 포함"
          isMet={passwordCriteriaMet.uppercase}
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

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" mb={8} fontSize="3xl">
        마이페이지
      </Heading>

      <Tabs.Root
        defaultValue="회원정보_수정"
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
                  <Button type="submit" colorScheme="orange" size="md" px={8}>
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
                        max={5}
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
                <Button type="submit" colorScheme="orange" size="md" px={8}>
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
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }} // Adjusted for more info
              gap={6}
              py={4}
            >
              {enrollments.map((enroll) => (
                <GridItem key={enroll.enrollId}>
                  <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    h="100%"
                  >
                    <Box
                      p={4}
                      display="flex"
                      flexDirection="column"
                      justifyContent="space-between"
                      h="100%"
                    >
                      <VStack gap={2} align="stretch" mb={4}>
                        <Flex justify="space-between" align="center">
                          <Text fontWeight="bold" fontSize="md">
                            {enroll.lesson.title}
                          </Text>
                          <Badge
                            colorScheme={
                              enroll.status === "PAID"
                                ? "green"
                                : enroll.status === "UNPAID"
                                ? "orange"
                                : enroll.status === "PAYMENT_TIMEOUT"
                                ? "red"
                                : enroll.status === "CANCELED_UNPAID"
                                ? "gray"
                                : "gray"
                            }
                          >
                            {/* More descriptive status mapping */}
                            {enroll.status === "PAID"
                              ? "결제완료"
                              : enroll.status === "UNPAID"
                              ? "결제대기"
                              : enroll.status === "PAYMENT_TIMEOUT"
                              ? "결제시간초과"
                              : enroll.status === "CANCELED_UNPAID"
                              ? "미결제취소"
                              : enroll.status.toUpperCase()}
                          </Badge>
                        </Flex>
                        <Box borderBottomWidth="1px" my={1} />
                        <Text fontSize="sm">
                          신청일:{" "}
                          {new Date(
                            enroll.applicationDate
                          ).toLocaleDateString()}
                        </Text>
                        <Text fontSize="sm">
                          강습 기간: {enroll.lesson.period}
                        </Text>
                        <Text fontSize="sm">
                          강습 시간: {enroll.lesson.time}
                        </Text>
                        <Text fontSize="sm">
                          금액: {enroll.lesson.price.toLocaleString()}원
                        </Text>
                        {enroll.usesLocker && (
                          <Text fontSize="sm" color="teal.600">
                            사물함 사용
                          </Text>
                        )}
                        {enroll.isRenewal && (
                          <Text fontSize="sm" color="purple.600">
                            재등록 강습
                          </Text>
                        )}
                        {enroll.status === "UNPAID" &&
                          enroll.paymentExpireDt && (
                            <Text fontSize="sm" color="red.500">
                              결제 마감:{" "}
                              {new Date(
                                enroll.paymentExpireDt
                              ).toLocaleString()}
                            </Text>
                          )}
                        {enroll.cancelStatus &&
                          enroll.cancelStatus !== "NONE" && (
                            <Text fontSize="sm" color="gray.500">
                              취소 상태: {enroll.cancelStatus}
                              {enroll.cancelReason &&
                                ` (${enroll.cancelReason})`}
                            </Text>
                          )}
                      </VStack>

                      <VStack gap={3} alignSelf="flex-end" w="100%" mt="auto">
                        {enroll.canAttemptPayment && enroll.paymentPageUrl && (
                          <Link href={enroll.paymentPageUrl} passHref>
                            <Button
                              as="a"
                              colorScheme="green"
                              size="sm"
                              w="100%"
                            >
                              <ExternalLinkIcon />
                              결제하기
                            </Button>
                          </Link>
                        )}
                        {/* Basic Renewal Button Placeholder - Logic needs refinement based on next lesson ID availability */}
                        {/* This assumes renewalWindow and a mechanism to get the *next* lessonId are available */}
                        {/* For now, let's check if renewalWindow is present and dates are valid for a simple demo */}
                        {enroll.renewalWindow &&
                          new Date(enroll.renewalWindow.open) <= new Date() &&
                          new Date(enroll.renewalWindow.close) >= new Date() &&
                          enroll.status === "PAID" && (
                            /* Typically renew from a paid lesson */ <Button
                              colorScheme="blue"
                              size="sm"
                              w="100%"
                              // onClick={() => handleRenewal(enroll.SOME_NEXT_LESSON_ID_FIELD, enroll.usesLocker)} // handleRenewal would call swimmingPaymentService
                              // disabled // For now, until next lesson ID logic is clear
                              onClick={() =>
                                toaster.create({
                                  title: "재등록 준비중",
                                  description:
                                    "재등록 기능은 현재 준비 중입니다.",
                                  type: "info",
                                })
                              }
                            >
                              재등록 신청 (준비중)
                            </Button>
                          )}
                      </VStack>
                    </Box>
                  </Box>
                </GridItem>
              ))}
            </Grid>
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
                          colorScheme={
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
    </Container>
  );
}
