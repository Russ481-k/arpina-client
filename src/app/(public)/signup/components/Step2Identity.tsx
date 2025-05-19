"use client";

import React, { useState, useEffect } from "react";
import { VStack, Text, Button, Box, HStack } from "@chakra-ui/react";
import Image from "next/image";
import { StepHeader } from "./StepHeader";
import { useMutation } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";
import {
  niceApi,
  NiceInitiateResponse,
  NicePublicUserDataDto,
} from "@/lib/api/niceApi";

// const identityOptions = [
//   { label: "휴대폰 인증", value: "phone" },
//   { label: "아이핀 인증", value: "ipin" },
// ];

interface Step2IdentityProps {
  mainFlowSteps: number;
  currentProgressValue: number;
  onVerificationSuccess: (data: NiceVerificationSuccessPayload) => void;
  onVerificationFail: (data: NiceVerificationFailPayload) => void;
}

interface NiceVerificationSuccessPayload {
  verificationData: NicePublicUserDataDto;
  verificationKey: string | null;
}

interface NiceVerificationFailPayload {
  error: string;
  errorCode?: string;
  verificationKey: string | null;
}

// NICE 인증 응답 데이터 타입
interface NiceAuthSuccessData {
  name: string; // 이름
  utf8Name?: string; // UTF8 이름
  birthDate: string; // 생년월일(YYYYMMDD)
  gender: string; // 성별
  nationalInfo: string; // 내/외국인 구분
  di: string; // 중복가입 확인값(DI)
  ci: string; // 연계정보(CI)
  mobileNo: string; // 휴대폰번호
  mobileCo: string; // 통신사
  reqSeq: string; // 요청 번호
  resSeq: string; // 응답 번호
  authType: string; // 인증 수단
}

interface NiceAuthFailData {
  errorCode: string; // 에러 코드
  errorMessage: string; // 에러 메시지
  reqSeq: string; // 요청 번호
  authType: string; // 인증 수단
}

// Message types from callback
interface NiceAuthCallbackBaseMessage {
  source: "nice-auth-callback";
  verificationKey: string | null;
}

interface NiceAuthDuplicateUserMessage extends NiceAuthCallbackBaseMessage {
  type: "DUPLICATE_DI";
  username?: string | null;
  di: string;
}

interface NiceAuthSuccessMessage extends NiceAuthCallbackBaseMessage {
  type: "NICE_AUTH_SUCCESS";
  data: NiceAuthSuccessData;
}

interface NiceAuthFailureMessage extends NiceAuthCallbackBaseMessage {
  type: "NICE_AUTH_FAIL";
  error: string;
  errorCode?: string;
  errorDetail?: string;
}

type NiceAuthCallbackMessage =
  | NiceAuthDuplicateUserMessage
  | NiceAuthSuccessMessage
  | NiceAuthFailureMessage;

const ICON_IMAGE_SIZE = 90;

// State to hold the result displayed in this component
interface DisplayAuthResult {
  status: "SUCCESS" | "FAIL" | "ERROR" | "INVALID_CALLBACK";
  message?: string;
  rawData?: any;
  verificationKey?: string | null;
}

export const Step2Identity = ({
  mainFlowSteps,
  currentProgressValue,
  onVerificationSuccess,
  onVerificationFail,
}: Step2IdentityProps) => {
  const [authResult, setAuthResult] = useState<DisplayAuthResult | null>(null);
  const [storedReqSeq, setStoredReqSeq] = useState<string | null>(null);

  const initiateNiceMutation = useMutation<NiceInitiateResponse, Error>({
    mutationFn: niceApi.initiateVerification,
    onSuccess: (data) => {
      const { encodeData, reqSeq } = data;
      setStoredReqSeq(reqSeq); // 요청번호 저장

      // 팝업 위치 계산
      const width = 500;
      const height = 550;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      // 팝업 설정
      window.name = "Parent_window";
      const popup = window.open(
        "",
        "popupChk",
        `width=${width},height=${height},top=${top},left=${left},fullscreen=no,menubar=no,status=no,toolbar=no,titlebar=yes,location=no,scrollbar=no`
      );

      if (!popup) {
        console.error("Failed to open NICE popup window");
        toaster.create({
          title: "팝업 차단 감지",
          description: "브라우저의 팝업 차단을 해제해주세요.",
          type: "error",
        });
        setAuthResult({
          status: "ERROR",
          message:
            "팝업 차단이 감지되었습니다. 브라우저 설정에서 팝업 차단을 해제해주세요.",
        });
        return;
      }

      // 폼 생성 및 제출
      const form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute(
        "action",
        "https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb"
      );
      form.setAttribute("target", "popupChk");

      // 필수 파라미터 추가
      const mField = document.createElement("input");
      mField.setAttribute("type", "hidden");
      mField.setAttribute("name", "m");
      mField.setAttribute("value", "checkplusService");
      form.appendChild(mField);

      const encodeDataField = document.createElement("input");
      encodeDataField.setAttribute("type", "hidden");
      encodeDataField.setAttribute("name", "EncodeData");
      encodeDataField.setAttribute("value", encodeData);
      form.appendChild(encodeDataField);

      // 폼 제출
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    },
    onError: (error) => {
      console.error("NICE Auth Initiation Error (Step2Identity):", error);
      toaster.create({
        title: "본인인증 초기화 오류",
        description: error.message || "알 수 없는 에러가 발생했습니다.",
        type: "error",
      });
      setAuthResult({
        status: "ERROR",
        message: `본인인증 초기화 실패: ${error.message || "알 수 없는 에러"}`,
        rawData: error,
      });
    },
  });

  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      // Security: Check the origin of the message
      if (event.origin !== window.location.origin) {
        console.warn("Message received from unexpected origin:", event.origin);
        return;
      }

      const messageData = event.data as NiceAuthCallbackMessage;

      // Check if the message is from our NICE callback
      if (messageData && messageData.source === "nice-auth-callback") {
        console.log(
          "Step2Identity: Received NICE Auth Callback Message:",
          messageData
        );

        switch (messageData.type) {
          case "NICE_AUTH_SUCCESS":
            console.log("Step2Identity: Handling NICE_AUTH_SUCCESS");

            // 요청번호 검증
            if (messageData.data.reqSeq !== storedReqSeq) {
              console.error("Invalid request sequence detected");
              setAuthResult({
                status: "ERROR",
                message: "인증 정보가 일치하지 않습니다. 다시 시도해주세요.",
              });
              return;
            }

            setAuthResult({
              status: "SUCCESS",
              message: `${messageData.data.name}님, 본인인증이 성공적으로 완료되었습니다.`,
              rawData: messageData.data,
              verificationKey: messageData.verificationKey,
            });

            toaster.create({
              title: "본인인증 성공",
              description: "본인인증이 성공적으로 완료되었습니다.",
              type: "success",
            });

            if (onVerificationSuccess) {
              onVerificationSuccess({
                verificationData: {
                  name: messageData.data.name,
                  birthDate: messageData.data.birthDate,
                  gender: messageData.data.gender,
                  mobileNo: messageData.data.mobileNo,
                  di: messageData.data.di,
                  ci: messageData.data.ci,
                  nationalInfo: messageData.data.nationalInfo,
                },
                verificationKey: messageData.verificationKey,
              });
            }
            break;

          case "NICE_AUTH_FAIL":
            console.log(
              "Step2Identity: Handling NICE_AUTH_FAIL",
              messageData.error
            );

            const errorMessage =
              messageData.errorDetail ||
              messageData.error ||
              "알 수 없는 오류가 발생했습니다.";
            setAuthResult({
              status: "FAIL",
              message: `본인인증 실패: ${errorMessage}`,
              rawData: messageData,
              verificationKey: messageData.verificationKey,
            });

            toaster.create({
              title: "본인인증 실패",
              description: errorMessage,
              type: "error",
            });

            if (onVerificationFail) {
              onVerificationFail({
                error: errorMessage,
                errorCode: messageData.errorCode,
                verificationKey: messageData.verificationKey,
              });
            }
            break;

          case "DUPLICATE_DI":
            // 중복 가입 처리는 상위 컴포넌트에서 처리
            console.log(
              "Step2Identity: Received DUPLICATE_DI, parent will handle redirect"
            );
            break;
        }
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => {
      window.removeEventListener("message", handleAuthMessage);
    };
  }, [onVerificationSuccess, onVerificationFail, storedReqSeq]);

  const handleNiceAuthClick = () => {
    setAuthResult(null);
    initiateNiceMutation.mutate();
  };

  return (
    <VStack gap={6} align="stretch" w="full">
      <StepHeader
        title="본인인증"
        currentStep={2}
        totalSteps={mainFlowSteps}
        currentProgressValue={currentProgressValue}
      />
      <VStack gap={3} align="center" py={8}>
        <Image
          src="/images/signup/auth_oneself.png"
          alt="본인인증 아이콘"
          width={ICON_IMAGE_SIZE}
          height={ICON_IMAGE_SIZE}
          priority
        />
        <Text fontSize="lg" fontWeight="semibold" color="gray.700" mt={3}>
          휴대폰인증
        </Text>
        <Button
          bg="#2E3192"
          color="white"
          _hover={{ bg: "#1A365D" }}
          px={12}
          mt={4}
          size="lg"
          minW="180px"
          onClick={handleNiceAuthClick}
          loading={initiateNiceMutation.isPending}
          disabled={initiateNiceMutation.isPending}
          loadingText="처리중..."
        >
          인증하기
        </Button>
        {initiateNiceMutation.isError && !authResult && (
          <Text color="red.500" mt={2} fontSize="sm">
            초기화 실패: {initiateNiceMutation.error?.message}
          </Text>
        )}
      </VStack>

      {authResult && (
        <Box
          mt={4}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          borderColor={
            authResult.status === "SUCCESS" ? "green.300" : "red.300"
          }
          bg={authResult.status === "SUCCESS" ? "green.50" : "red.50"}
        >
          <Text
            fontWeight="bold"
            color={authResult.status === "SUCCESS" ? "green.700" : "red.700"}
          >
            {authResult.message}
          </Text>
        </Box>
      )}

      <Box bg="gray.50" p={5} borderRadius="md" mt={authResult ? 2 : 4}>
        <HStack align="flex-start" gap={3}>
          <VStack align="start" gap={1.5} fontSize="sm" color="gray.600">
            <Text>본인 확인을 위해 최초1회 인증 절차를 진행합니다.</Text>
            <Text>
              인증 과정에서 입력된 정보는 본인 확인 목적 외에는 사용되지 않으며,
              저장되지 않습니다.
            </Text>
            <Text>
              인증에 사용되는 정보는 해당 인증기관에서 직접 수집 및 처리하며,
              서비스 제공자는 이를 저장하거나 별도로 보관하지 않습니다.
            </Text>
            <Text>
              타인의 주민등록번호를 부정하게 사용할 경우, 3년 이하의 징역 또는
              1천만원 이하의 벌금에 처해질 수 있습니다. (관련 법령: 주민등록법,
              제37조제8항)
            </Text>
          </VStack>
        </HStack>
      </Box>
    </VStack>
  );
};
