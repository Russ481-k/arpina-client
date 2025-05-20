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
  Field,
  Fieldset,
  Table,
} from "@chakra-ui/react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import {
  mypageApi,
  ProfileDto,
  EnrollDto,
  PaymentDto,
} from "@/lib/api/mypageApi";
import { toaster } from "@/components/ui/toaster";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "@/components/ui/password-input";
import { Tooltip } from "@/components/ui/tooltip";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";

const initialPasswordCriteria = {
  minLength: false,
  uppercase: false,
  lowercase: false,
  number: false,
  specialChar: false,
};

// Helper component for individual checklist item in tooltip
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

// Helper function to extract detailed error messages from API responses
const getApiErrorMessage = (error: any, defaultMessage: string): string => {
  // Check for Axios-like error structure (most common from API calls)
  if (error && error.response && error.response.data) {
    const data = error.response.data;
    // Prioritize validationErrors if they exist and are not empty
    if (data.validationErrors) {
      if (
        Array.isArray(data.validationErrors) &&
        data.validationErrors.length > 0
      ) {
        return data.validationErrors.join("\\n"); // Join if it's an array of messages
      } else if (
        typeof data.validationErrors === "object" &&
        Object.keys(data.validationErrors).length > 0
      ) {
        return Object.values(data.validationErrors).join("\\n"); // Join values if it's an object of messages
      }
    }
    // Fallback to general message from API response
    if (data.message && typeof data.message === "string") {
      return data.message;
    }
  }
  // Fallback for other types of errors (e.g., network error, or error.message is more direct)
  if (error && error.message && typeof error.message === "string") {
    return error.message;
  }
  return defaultMessage; // Ultimate fallback to a provided default message
};

export default function MyPage() {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [profilePw, setProfilePw] = useState("");
  const [enrollments, setEnrollments] = useState<EnrollDto[]>([]);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const router = useRouter();

  // State for new password validation
  const [passwordCriteriaMet, setPasswordCriteriaMet] = useState(
    initialPasswordCriteria
  );
  const [newPasswordStrength, setNewPasswordStrength] = useState(0);
  const [isPasswordTooltipVisible, setIsPasswordTooltipVisible] =
    useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // 사용자 프로필 정보 불러오기
  useEffect(() => {
    let localUserData: any = null; // useEffect 스코프 최상단으로 이동

    async function fetchUserData() {
      try {
        setIsLoading(true);

        // localStorage에서 사용자 정보 가져오기
        if (typeof window !== "undefined") {
          const authUserStr = localStorage.getItem("auth_user");
          if (authUserStr) {
            try {
              localUserData = JSON.parse(authUserStr);

              setProfile((prevProfile) => ({
                ...(prevProfile || {}),
                userId: localUserData.username || prevProfile?.userId || "",
                name: localUserData.name || prevProfile?.name || "",
                email: localUserData.email || prevProfile?.email || "",
                // phone, address, carNo는 API 응답을 기다립니다.
                // 만약 localStorage에도 있다면 여기서 채울 수 있습니다.
                phone: prevProfile?.phone || "", // API 응답 전까지는 기존 값 또는 빈 문자열 유지
                address: prevProfile?.address || "",
                carNo: prevProfile?.carNo || "",
              }));
              // setProfile의 비동기적 특성 때문에 바로 다음 줄에서 profile을 console.log하면 이전 값이 나올 수 있습니다.
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
          // API 응답으로 전체 프로필 업데이트 (이름 포함)
          setProfile((prevProfile) => ({
            ...prevProfile,
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
          }));
        } else {
          if (localUserData && (!profile || !profile.userId)) {
            setProfile((prevProfile) => ({
              ...(prevProfile || {}),
              userId: localUserData.username || prevProfile?.userId || "",
              name: localUserData.name || prevProfile?.name || "",
              email: localUserData.email || prevProfile?.email || "",
              phone: localUserData.phone || prevProfile?.phone || "",
              address: localUserData.address || prevProfile?.address || "",
              carNo: localUserData.carNo || prevProfile?.carNo || "",
            }));
          }
        }

        const enrollmentsData = await mypageApi.getEnrollments();
        setEnrollments(enrollmentsData);

        const paymentsData = await mypageApi.getPayments();
        setPayments(paymentsData);
      } catch (error) {
        console.error(
          "[Mypage] Failed to load user data (in catch block):",
          error
        );

        // profile 상태가 이전에 getProfile API 호출로 성공적으로 설정되었다면 (즉, name이 '윤수빈'으로 이미 설정된 상태라면)
        // enrollments나 payments 호출 실패 시 localStorage 값으로 name을 덮어쓰지 않도록 한다.
        if (
          profile &&
          profile.name &&
          profile.name !== (localUserData?.name || localUserData?.username)
        ) {
          // 이 경우, enrollments, payments 로딩 실패에 대한 메시지만 표시하고
          // profile.name 등 핵심 정보는 유지한다.
          // 필요하다면 enrollments, payments를 빈 배열로 설정할 수 있다.
          setEnrollments([]); // 에러 발생 시 빈 배열로 초기화
          setPayments([]); // 에러 발생 시 빈 배열로 초기화
        } else if (localUserData && (!profile || !profile.userId)) {
          // getProfile 자체가 실패했거나, profile이 초기화되지 않은 경우 localStorage 정보로 fallback
          setProfile((prevProfile) => ({
            ...(prevProfile || {}),
            userId: localUserData.username || prevProfile?.userId || "",
            name: localUserData.name || prevProfile?.name || "", // 이 시점에서는 localUserData.name이 username일 수 있음
            email: localUserData.email || prevProfile?.email || "",
            phone: localUserData.phone || prevProfile?.phone || "",
            address: localUserData.address || prevProfile?.address || "",
            carNo: localUserData.carNo || prevProfile?.carNo || "",
          }));
          setEnrollments([]);
          setPayments([]);
        } else if (!profile || !profile.userId) {
          // localUserData도 없고 profile도 제대로 설정 안된 최악의 경우
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
  }, []);

  // Password validation logic (adapted from Step3UserInfo)
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

  // 회원정보 수정 핸들러
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // 비밀번호가 입력되지 않은 경우
    if (!profilePw.trim()) {
      toaster.create({
        title: "비밀번호 필요",
        description: "회원정보 변경을 위해 현재 비밀번호를 입력해주세요.",
        type: "error",
      });
      return;
    }

    try {
      // 프로필 정보와 현재 비밀번호를 별도로 전송
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

  // 비밀번호 변경 핸들러
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
      setIsPasswordTooltipVisible(true); // Show tooltip if validation fails on submit
      return;
    }

    try {
      await mypageApi.changePassword({
        currentPw,
        newPw,
      });

      // 필드 초기화
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

  // Password tooltip content
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

        {/* 회원정보 수정 */}
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

        {/* 비밀번호 변경 */}
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

        {/* 수영장 신청정보 */}
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
                lg: "repeat(4, 1fr)",
              }}
              gap={6}
              py={4}
            >
              {enrollments.map((enrollment, index) => (
                <GridItem key={index}>
                  <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
                    <Box p={4}>
                      <Flex direction="column" gap={2}>
                        <Flex justify="space-between" align="center">
                          <Text fontWeight="bold" fontSize="md">
                            {enrollment.lesson?.title || "수영장 강습 프로그램"}
                          </Text>
                          <Badge
                            colorScheme={
                              enrollment.status === "PAID" ? "green" : "red"
                            }
                          >
                            {enrollment.status === "PAID"
                              ? "승인완료"
                              : "승인취소"}
                          </Badge>
                        </Flex>
                        <Box borderBottomWidth="1px" my={2} />
                        <Text fontSize="sm">
                          강습시간:{" "}
                          {enrollment.lesson?.time || "오전 06:00 - 06:50"}
                        </Text>
                        <Text fontSize="sm">
                          강습일정:{" "}
                          {enrollment.lesson?.period ||
                            "25년 05월 01일 ~ 25년 05월 30일"}
                        </Text>
                        <Text fontSize="sm">
                          결제금액:{" "}
                          {enrollment.lesson?.price
                            ? `${enrollment.lesson.price.toLocaleString()}원`
                            : "65,000원"}
                        </Text>
                        <Text fontSize="sm">
                          결제/취소 시간: {new Date().toLocaleString()}
                        </Text>
                      </Flex>
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

        {/* 수영장 결제정보 */}
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
                    <Table.ColumnHeader>번호</Table.ColumnHeader>
                    <Table.ColumnHeader>강습일정</Table.ColumnHeader>
                    <Table.ColumnHeader>강습시간</Table.ColumnHeader>
                    <Table.ColumnHeader>결제/취소 시간</Table.ColumnHeader>
                    <Table.ColumnHeader>결제금액</Table.ColumnHeader>
                    <Table.ColumnHeader>결제상태</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {Array.isArray(payments) ? (
                    payments.map((payment, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>9999</Table.Cell>
                        <Table.Cell>25년 05월 01일 ~ 25년 05월 30일</Table.Cell>
                        <Table.Cell>
                          (월,화,수,목,금) 오전 06:00 - 06:50
                        </Table.Cell>
                        <Table.Cell>2025.04.18 13:00:00</Table.Cell>
                        <Table.Cell>65,000원</Table.Cell>
                        <Table.Cell>
                          <Badge
                            colorScheme={
                              payment.status === "SUCCESS" ? "green" : "red"
                            }
                          >
                            {payment.status === "SUCCESS"
                              ? "승인완료"
                              : "승인취소"}
                          </Badge>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan={6} textAlign="center">
                        결제 내역이 없습니다.
                      </Table.Cell>
                    </Table.Row>
                  )}
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
