"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  VStack,
  HStack,
  Text,
  Container,
  Checkbox,
  Fieldset,
  Field,
  Input,
  RadioGroup,
  Separator,
  Icon,
  Center,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/ui/toaster";

import { StepIndicator } from "./components/StepIndicator";
import { AgreementItem } from "./components/AgreementItem";
import { Step1Terms } from "./components/Step1Terms";
import { Step2Identity } from "./components/Step2Identity";
import { Step3UserInfo, Step3UserInfoRef } from "./components/Step3UserInfo";
import { Step4Complete } from "./components/Step4Complete";
import { NicePublicUserDataDto } from "@/lib/api/niceApi";

// Define a type for the data expected from onVerificationSuccess/Fail if not already globally defined
// This should align with the structure passed from Step2Identity
interface NiceVerificationSuccessPayload {
  verificationData: NicePublicUserDataDto;
  verificationKey?: string | null;
}

interface NiceVerificationFailPayload {
  error: any;
  verificationKey?: string | null;
}

// For messages from iframe
interface NiceAuthCallbackBaseMessage {
  source: "nice-auth-callback";
  verificationKey: string | null;
}
interface NiceAuthDuplicateUserMessage extends NiceAuthCallbackBaseMessage {
  type: "DUPLICATE_DI";
  username?: string | null;
}
interface NiceAuthSuccessMessage extends NiceAuthCallbackBaseMessage {
  type: "NICE_AUTH_SUCCESS";
  data: NicePublicUserDataDto;
}
interface NiceAuthFailureMessage extends NiceAuthCallbackBaseMessage {
  type: "NICE_AUTH_FAIL";
  error: string;
  errorCode?: string | null;
  errorDetail?: string | null;
}
type NiceAuthCallbackMessage =
  | NiceAuthDuplicateUserMessage
  | NiceAuthSuccessMessage
  | NiceAuthFailureMessage;

const MAIN_FLOW_STEPS = 3; // Steps for the primary signup flow (excluding completion)
const COMPLETION_STEP = 4; // The final "complete" step
const HEADER_HEIGHT = "60px"; // Replace with your actual header height

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [niceAuthData, setNiceAuthData] = useState<any | null>(null);
  const [niceAuthKey, setNiceAuthKey] = useState<string | null>(null);
  const step3FormRef = useRef<Step3UserInfoRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState<string | null>(
    null
  );
  const router = useRouter();

  // Define handlers before useEffect that depends on them
  const handleVerificationSuccess = useCallback(
    (result: NiceVerificationSuccessPayload) => {
      setNiceAuthData(result.verificationData);
      setNiceAuthKey(result.verificationKey || null);
    },
    []
  );

  const handleVerificationFail = useCallback(
    (result: NiceVerificationFailPayload) => {
      setNiceAuthData(null);
      setNiceAuthKey(null);
    },
    []
  );

  const handleSignupSuccess = useCallback(
    (username: string) => {
      setRegisteredUsername(username);
      setCurrentStep(COMPLETION_STEP);
      setIsSubmitting(false);
    },
    [setCurrentStep, setIsSubmitting]
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic security: check the origin of the message
      if (event.origin !== window.location.origin) {
        console.warn("Message received from untrusted origin:", event.origin);
        return;
      }

      const messageData = event.data as NiceAuthCallbackMessage;

      // Check if the message is from our NICE callback
      if (messageData && messageData.source === "nice-auth-callback") {
        switch (messageData.type) {
          case "DUPLICATE_DI":
            setNiceAuthData(null);
            setNiceAuthKey(null);
            const usernameParam = messageData.username
              ? encodeURIComponent(messageData.username)
              : "";
            router.push(
              `/login?reason=duplicate_di&nice_username=${usernameParam}`
            );
            break;

          case "NICE_AUTH_SUCCESS":
            handleVerificationSuccess({
              verificationData: messageData.data,
              verificationKey: messageData.verificationKey,
            });
            break;

          case "NICE_AUTH_FAIL":
            handleVerificationFail({
              error: messageData.error,
              verificationKey: messageData.verificationKey,
            });
            toaster.create({
              title: "본인인증 실패",
              description:
                messageData.error || "본인인증 과정 중 오류가 발생했습니다.",
              type: "error",
            });
            break;

          default:
            // Exhaustive check, or handle unknown types if necessary
            const exhaustiveCheck: never = messageData;
            console.warn(
              "SignupPage: Received unknown NICE message type:",
              exhaustiveCheck
            );
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    // Cleanup listener when component unmounts
    return () => {
      window.removeEventListener("message", handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleVerificationSuccess, handleVerificationFail, router]);

  const initialAgreements = [
    {
      id: "terms",
      label: "개인정보 수집 및 이용 동의",
      isRequired: true,
      isChecked: false,
      details: `개인정보 수집 및 이용 동의서
부산도시공사 아르피나는 귀하의 소중한 개인정보를 다음과 같은 목적과 범위 내에서 수집ㆍ이용됩니다.
본 동의는 서비스 이용을 위한 필수사항으로, 아래 내용을 충분히 읽고 동의 여부를 결정해 주시기 바랍니다.
  
1. 수집항목
필수 : 이름, 휴대전화번호, 생년월일, 아이디, 비밀번호, 홈페이지 접속 로그, IP 주소, 쿠키 등 서비스 이용 기록
선택 : 주소
  
2. 수집 및 이용목적
 - 회원가입 및 본인 확인(식별/인증)
 - 예약 및 스포츠센터 이용 결제
 - 공지사항 전달 및 고객 응대
  
3. 보유 및 이용기간
회원 탈퇴 시까지 보유 및 이용되며, 탈퇴 후에는 지체 없이 파기합니다.
단, 아래의 관련 법령에 따라 일정기간 보관할 수 있습니다.
- 계약 또는 청약철회 등 거래에 관한 기록 / 전자상거래 등에서의 소비자 보호에 관한 법률 (5년)
- 대금결제 및 재화 등의 공급에 관한 기록 / 전자상거래 등에서의 소비자 보호에 관한 법률 (5년)
- 소비자의 불만 또는 분쟁처리에 관한 기록 / 전자상거래 등에서 소비자 보호에 관한 법률 (3년)
- 웹 사이트 방문기록(IP 등)               / 통신비밀보호법(3개월)
  
4. 동의 거부 권리 및 불이익 안내
귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다.
단, 위에서 명시한 필수 항목에 대한 동의를 거부하실 경우, 회원가입 및 서비스 이용이 제한될 수 있습니다.`,
    },
    {
      id: "policy",
      label: "홈페이지 이용약관",
      isRequired: true,
      isChecked: false,
      details: `홈페이지 이용약관
  
제1조(목적)
이 약관은 부산도시공사 아르피나(이하 "회사"라 함)가 운영하는 웹사이트 "www.arpina.co.kr"(이하 "홈페이지"라 함)에서 제공하는 서비스 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
  
제2조(정의)
 1. "홈페이지"란 회사가 정보를 이용자에게 제공하기 위하여 구축한 가상의 공간을 의미합니다.
 2. "이용자"란 홈페이지에 접속하여 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
  
제3조(약관의 효력 및 변경)
1. 본 약관은 홈페이지에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
2. 회사는 관련 법령(전자상거래법, 약관의 규제에 관한 법률 등)에 위배되지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 홈페이지를 통해 사전 공지합니다.
3. 변경된 약관은 공지 시 명시된 효력 발생일로부터 적용하며, 약관이 개정되는 경우 회사는 개정 내용과 적용 일자를 명시하여 현행 약관과 함께 홈페이지에 최소 7일이상 공지합니다.
  
제4조(서비스의 제공 및 변경)
1. 회사는 홈페이지를 통해 다음과 같은 서비스를 제공합니다.
 - 서비스 예약 신청의 접수 확인(수영장 강습 접수, 회의장 예약 문의 등)
 - 행사/이벤트 안내
 - 기타 회사가 정하는 서비스
  
제5조(서비스의 중단)
회사는 시스템 점검, 교체, 고장 또는 통신 두절 등의 사유가 발생한 경우 서비스 제공을 일시적으로 중단할 수 있습니다. 이 경우 사전에 공지하되, 불가피한 경우 사후에 통지할 수 있습니다.
  
제6조(회원가입)
1. 이용자는 회사가 정한 절차에 따라 회원가입을 신청하고, "가입하기" 버튼을 누름으로써 회원가입을 신청합니다.
2. 회원가입은 실명으로 이루어져야 하며, 회사는 필요한 경우 실명 확인 조치를 요청할 수 있습니다.
3. 회사는 다음 각 호에 해당하는 경우 회원가입 신청을 거부하거나 취소할 수 있습니다.
   (1) 등록 내용에 허위, 누락, 오기가 있는 경우
   (2) 타인의 명의를 도용하거나 관련 법령을 위반한 경우
   (3) 기타 회원으로 등록하는 것이 회사의 기술상 또는 업무상 현저히 지장이 있다고 판단되는 경우
  
제7조(이용자의 의무)
이용자는 다음 행위를 하여서는 안됩니다.
1. 신청 또는 변경 시 허위 내용의 등록
2. 타인의 정보 도용
3. 홈페이지에 게시된 정보의 무단 변경, 복제, 유통, 상업적 이용
4. 회사 및 제3자의 저작권 등 권리를 침해하거나 업무를 방해하는 행위
5. 기타 법령 또는 공서양속에 반하는 행위
제8조(회사의 의무)
1. 회사는 관련 법령과 본 약관이 정하는 바에 따라 안정적이고 지속적인 서비스를 제공하는데 최선을 다합니다.
2. 회사는 이용자의 개인정보를 보호하기 위한 보안 시스템을 구축합니다.
  
제9조(나이 제한)
1. 홈페이지 회원가입은 만 14세 이상인 자만 가능하며, 만 14세 미만인 경우 법정대리인의 동의 없이는 회원가입이 제한됩니다.
2. 회사는 필요한 경우 회원들의 나이를 확인할 수 있으며, 허위로 정보를 제공한 경우 회원자격을 제한하거나 상실시킬 수 있습니다.
  
제10조(회원 탈퇴 및 자격상실)
1. 회원은 언제든지 홈페이지를 통해 회원 탈퇴를 할 수 있으며, 회사는 지체 없이 처리 합니다.
2. 회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 상실시킬 수 있습니다.
 (1) 회원가입 시 허위 정보를 등록한 경우
 (2) 타인의 홈페이지 이용을 방해하거나 정보를 도용한 경우
 (3) 홈페이지를 이용하여 법령또는 본 약관이 금지하는 행위를 한 경우
 (4) 기타 회원으로서 부적절한 행위를 한 경우
  
제11조(회원에 대한 통지)
1. 회사가 회원에 대해 통지를 하는 경우, 회원이 제공한 전자우편주소 또는 홈페이지 알림 기능을 통해 통지할 수 있습니다.
2. 불특정 다수 회원에 대한 통지의 경우, 홈페이지에 게시함으로써 개별 통지에 갈음할 수 있습니다. 다만, 회원 본인의 권리ㆍ의무에 중대한 영향을 미치는 사항에 대해서는 개별 통지합니다.
  
제12조(저작권 및 이용제한)
1. 홈페이지에 게시된 콘텐츠에 대한 저작권은 회사에 있으며, 이용자는 사전 승낙 없이 이를 복제, 전송, 출판, 배포, 방송 기타 방법으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.
2. 이용자가 홈페이지에 게시한 게시물에 대한 권리와 책임은 게시자 본인에게 있으며, 회사는 이를 홈페이지 홍보 목적으로 사용할 수 있습니다.
  
제13조(개인정보 보호)
회사는 이용자의 개인정보를 보호하기 위해 관련 법령 및 개인정보처리방침에 따릅니다. 자세한 사항은 홈페이지에 게시된 개인정보처리방침을 따릅니다.
  
제14조(면책조항)
1. 회사는 천재지변, 불가항력적 사유로 인해 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.
2. 이용자가 홈페이지를 이용하며 기대하는 수익을 얻지 못하거나 손해를 입는 경우, 회사는 이에 대해 책임을지지 않습니다.
  
제15조(분쟁해결 및 관할법원)
1. 회사와 이용자는 서비스와 관련하여 분쟁이 발생한 경우 원만히 해결하기 위해 성실히 협의합니다.
2. 협의가 이루어지지 않을 경우, 민사소송법에 따라 회사 본사 소재지 관할 법원을 제1심 관할법원으로 합니다.
`,
    },
    // Add more agreements here if needed
  ];
  const [agreements, setAgreements] = useState(initialAgreements);
  const [allAgreed, setAllAgreed] = useState(false);

  const handleMasterAgreeChange = (isChecked: boolean) => {
    setAgreements(agreements.map((a) => ({ ...a, isChecked })));
    setAllAgreed(isChecked);
  };

  const handleAgreementChange = (id: string, isChecked: boolean) => {
    const updatedAgreements = agreements.map((a) =>
      a.id === id ? { ...a, isChecked } : a
    );
    setAgreements(updatedAgreements);
    const allCurrentlyChecked = updatedAgreements.every((a) => a.isChecked);
    setAllAgreed(allCurrentlyChecked);
  };

  const isNextButtonDisabled = () => {
    if (currentStep === 1) {
      return !agreements.filter((a) => a.isRequired).every((a) => a.isChecked);
    }
    if (currentStep === 2) {
      return !niceAuthData || !niceAuthKey; // Disable if NICE auth not done
    }
    // For step 3 (MAIN_FLOW_STEPS), primary disable is via isSubmitting, handled directly in button
    // No specific condition here, but isSubmitting will cover it.
    return false; // Default to not disabled for other cases not covered by isSubmitting
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const allRequiredAgreed = agreements
        .filter((a) => a.isRequired)
        .every((a) => a.isChecked);
      if (!allRequiredAgreed) {
        // Consider using a toaster for this notification
        alert("필수 약관에 모두 동의해주세요.");
        return;
      }
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      if (!niceAuthData || !niceAuthKey) {
        alert("본인인증을 완료해주세요.");
        return;
      }
      setCurrentStep(currentStep + 1);
    } else if (currentStep === MAIN_FLOW_STEPS) {
      // Trigger form submission in Step3UserInfo
      if (step3FormRef.current) {
        // setIsSubmitting(true); // Removed: will be handled by onSubmittingChange via Step3UserInfo
        step3FormRef.current.submitForm();
      }
    }
  };

  let bottomButtonLabel;
  if (currentStep === 1) bottomButtonLabel = "동의하기";
  if (currentStep === MAIN_FLOW_STEPS) bottomButtonLabel = "회원신청";
  if (currentStep === COMPLETION_STEP) bottomButtonLabel = "";

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      mt={HEADER_HEIGHT}
      minH={`calc(100vh - ${HEADER_HEIGHT})`}
    >
      <Box
        w={{ base: "0", md: "50%" }}
        display={{ base: "none", md: "block" }}
        h={{ base: "auto", md: `calc(100vh - ${HEADER_HEIGHT})` }}
        bgImage="url('/images/signup/signup_bg_image.jpg')"
        backgroundSize="cover"
        backgroundPosition="center"
        position={{ base: "relative", md: "sticky" }}
        top={HEADER_HEIGHT}
      />

      <Flex
        w={{ base: "100%", md: "50%" }}
        direction="column"
        alignItems="center"
        justifyContent="flex-start"
        bg="white"
        pt={{ base: 4, md: 8 }}
        pb={{ base: 8, md: 12 }}
        px={{ base: 4, md: 8 }}
        overflowY="auto"
        h={{ base: "auto", md: "100%" }}
      >
        <Container
          maxW="container.md"
          p={{ base: 6, md: 10 }}
          borderRadius="xl"
          boxShadow={{ base: "none", md: "xl" }}
          w="full"
          my={{ base: 0, md: "auto" }}
        >
          <VStack gap={8} w="full">
            <Box w="full">
              {currentStep === 1 && (
                <Step1Terms
                  onMasterAgree={handleMasterAgreeChange}
                  allAgreed={allAgreed}
                  agreements={agreements}
                  onAgreementChange={handleAgreementChange}
                  mainFlowSteps={MAIN_FLOW_STEPS}
                  currentProgressValue={currentStep}
                />
              )}
              {currentStep === 2 && (
                <Step2Identity
                  mainFlowSteps={MAIN_FLOW_STEPS}
                  currentProgressValue={currentStep}
                  onVerificationSuccess={handleVerificationSuccess}
                  onVerificationFail={handleVerificationFail}
                />
              )}
              {currentStep === MAIN_FLOW_STEPS && (
                <Step3UserInfo
                  ref={step3FormRef}
                  mainFlowSteps={MAIN_FLOW_STEPS}
                  currentProgressValue={currentStep}
                  initialAuthData={niceAuthData}
                  authKey={niceAuthKey}
                  onSignupSuccess={handleSignupSuccess}
                  onSubmittingChange={setIsSubmitting}
                />
              )}
              {currentStep === COMPLETION_STEP && (
                <Step4Complete username={registeredUsername} />
              )}
            </Box>

            {currentStep < COMPLETION_STEP && (
              <HStack
                w="full"
                justify={currentStep === 1 ? "flex-end" : "space-between"}
                mt={8}
              >
                {currentStep > 1 && <Box />}
                <Button
                  onClick={handleNext}
                  disabled={isNextButtonDisabled() || isSubmitting}
                  loading={isSubmitting}
                  loadingText="처리중..."
                  colorScheme="blue"
                  bg="#2E3192"
                  color="white"
                  _hover={{ bg: "#1A365D" }}
                  size="lg"
                  minW="120px"
                >
                  {currentStep === MAIN_FLOW_STEPS ? "가입 완료" : "다음"}
                </Button>
              </HStack>
            )}
          </VStack>
        </Container>
      </Flex>
    </Flex>
  );
}
