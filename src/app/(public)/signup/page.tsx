"use client";

import { useState } from "react";
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

import { StepIndicator } from "./components/StepIndicator";
import { AgreementItem } from "./components/AgreementItem";
import { Step1Terms } from "./components/Step1Terms";
import { Step2Identity } from "./components/Step2Identity";
import { Step3UserInfo } from "./components/Step3UserInfo";
import { Step4Complete } from "./components/Step4Complete";

const MAIN_FLOW_STEPS = 3; // Steps for the primary signup flow (excluding completion)
const COMPLETION_STEP = 4; // The final "complete" step
const HEADER_HEIGHT = "60px"; // Replace with your actual header height

// Helper for styling the "STEP X/Y" indicator
// const StepIndicator = ({
//   current,
//   total,
// }: {
//   current: number;
//   total: number;
// }) => (
//   <Box
//     border="1px solid"
//     borderColor="blue.500"
//     color="blue.500"
//     borderRadius="full"
//     px={3}
//     py={1}
//     fontSize="sm"
//     fontWeight="bold"
//     display="inline-block"
//     mb={4}
//   >
//     STEP {current}/{total}
//   </Box>
// );

// AgreementItem component
// const AgreementItem = ({
//   title,
//   isRequired,
//   isChecked,
//   onChange,
//   children,
// }: {
//   title: string;
//   isRequired: boolean;
//   isChecked: boolean;
//   onChange: (isChecked: boolean) => void;
//   children?: React.ReactNode;
// }) => (
//   <VStack align="start" w="full" gap={2}>
//     <Flex justify="space-between" align="center" w="full" cursor="pointer">
//       <HStack>
//         <Checkbox.Root
//           checked={isChecked}
//           onChange={(e: any) => onChange(e.target.checked)}
//         >
//           <Checkbox.HiddenInput />
//           <Checkbox.Control mr={2} />
//         </Checkbox.Root>
//         <Text fontWeight="medium">
//           {title}{" "}
//           {isRequired && (
//             <Text as="span" color="orange.500">
//               (필수)
//             </Text>
//           )}
//         </Text>
//       </HStack>
//       {/* Placeholder for expand icon if we add accordion behavior later */}
//       {/* {children && <ChevronDownIcon />} */}
//     </Flex>
//     {children && (
//       <Box pl={8} pb={2}>
//         {children}
//       </Box>
//     )}
//   </VStack>
// );

// Step1Terms component
// const Step1Terms = ({
//   onMasterAgree,
//   allAgreed,
//   agreements,
//   onAgreementChange,
// }: {
//   onMasterAgree: (agreed: boolean) => void;
//   allAgreed: boolean;
//   agreements: {
//     id: string;
//     label: string;
//     isRequired: boolean;
//     isChecked: boolean;
//     details?: string;
//   }[];
//   onAgreementChange: (id: string, isChecked: boolean) => void;
// }) => (
//   <VStack gap={4} align="stretch" w="full">
//     <Heading size="xl" textAlign="center" mb={2}>
//       개인정보동의서
//     </Heading>
//     <Center>
//       <StepIndicator current={1} total={MAIN_FLOW_STEPS} />
//     </Center>
//     <Checkbox.Root
//       checked={allAgreed}
//       onChange={(e: any) => onMasterAgree(e.target.checked)}
//     >
//       <Checkbox.HiddenInput />
//       <Checkbox.Control mr={2} />
//       <Checkbox.Label fontWeight="bold" fontSize="lg">
//         아래의 사항에 대해 전체 동의합니다.
//       </Checkbox.Label>
//     </Checkbox.Root>
//     <Separator my={4} />
//     {agreements.map((agreement) => (
//       <AgreementItem
//         key={agreement.id}
//         title={agreement.label}
//         isRequired={agreement.isRequired}
//         isChecked={agreement.isChecked}
//         onChange={(isChecked) => onAgreementChange(agreement.id, isChecked)}
//       >
//         {agreement.details && (
//           <Box
//             border="1px solid"
//             borderColor="gray.200"
//             p={3}
//             borderRadius="md"
//             mt={2}
//             fontSize="sm"
//             h="100px"
//             overflowY="auto"
//           >
//             <Text whiteSpace="pre-wrap">{agreement.details}</Text>
//           </Box>
//         )}
//       </AgreementItem>
//     ))}
//   </VStack>
// );

// identityOptions - This might be needed by Step2Identity if it were fully implemented
// For now, it's not used by the refactored Step2Identity placeholder
// const identityOptions = [
//   { label: "휴대폰 인증", value: "phone" },
//   { label: "아이핀 인증", value: "ipin" },
// ];

// Step2Identity component
// const Step2Identity = () => (
//   <VStack gap={6} align="center" w="full">
//     <Heading size="xl" textAlign="center" mb={2}>
//       본인인증
//     </Heading>
//     <StepIndicator current={2} total={MAIN_FLOW_STEPS} />
//     <Text>본인인증 내용 (구현 예정)</Text>
//   </VStack>
// );

// Step3UserInfo component
// const Step3UserInfo = () => (
//   <VStack gap={6} align="center" w="full">
//     <Heading size="xl" textAlign="center" mb={2}>
//       정보입력
//     </Heading>
//     <StepIndicator current={3} total={MAIN_FLOW_STEPS} />
//     <Text>정보입력 내용 (구현 예정)</Text>
//   </VStack>
// );

// Step4Complete component
// const Step4Complete = () => (
//   <VStack gap={6} align="center" w="full" textAlign="center">
//     <Heading size="xl">가입완료</Heading>
//     <Text>회원가입이 성공적으로 완료되었습니다.</Text>
//     <HStack>
//       <NextLink href="/login" passHref legacyBehavior>
//         <Button as="a" bg="#2E3192" color="white" _hover={{ bg: "#1A365D" }}>
//           로그인
//         </Button>
//       </NextLink>
//       <NextLink href="/" passHref legacyBehavior>
//         <Button as="a" variant="outline">
//           홈으로
//         </Button>
//       </NextLink>
//     </HStack>
//   </VStack>
// );

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const initialAgreements = [
    {
      id: "terms",
      label: "개인정보 수집 및 이용 동의",
      isRequired: true,
      isChecked: false,
      details: `[필수] 개인정보 수집·이용 동의서 (회원가입용)

아르피나유스호텔은 회원가입 및 서비스 이용을 위해 아래와 같이 개인정보를 수집·이용합니다.

1. 수집 항목
- 이름
- 생년월일
- 성별
- 아이디, 비밀번호
- 휴대전화번호
- 이메일
- 주소 (선택 시 입력 가능)
- 접속 로그, IP 주소, 쿠키 등 서비스 이용 기록

2. 수집 목적
- 회원 가입 및 본인 식별/인증
- 예약/결제 등 서비스 제공
- 공지사항 전달 및 고객 응대
- 법령상 의무 이행 (예: 계약, 세금 신고 등)

3. 보유 및 이용 기간
- 회원 탈퇴 후 지체 없이 파기
- 단, 관계 법령(전자상거래법, 통신비밀보호법 등)에 따라 일정 기간 보존될 수 있음
  - 계약/청약철회/결제/재화공급 기록: 5년
  - 소비자 불만 또는 분쟁처리 기록: 3년
  - 웹사이트 방문 기록(IP 등): 3개월

4. 동의 거부 권리 및 불이익 안내
- 귀하는 개인정보 수집·이용에 대한 동의를 거부할 수 있습니다.
- 단, 회원가입에 필요한 최소한의 정보이므로, 동의하지 않으실 경우 회원가입이 제한될 수 있습니다.

위 내용을 충분히 확인하였으며, 개인정보 수집·이용에 동의합니다.`,
    },
    {
      id: "policy",
      label: "홈페이지 이용약관",
      isRequired: true,
      isChecked: false,
      details: `[아르피나유스호텔 홈페이지 이용약관]

제1조 (목적)
이 약관은 아르피나유스호텔(이하 "회사"라 함)이 제공하는 인터넷 관련 서비스(이하 "서비스")를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.

제2조 (정의)
1. "홈페이지"란 회사가 재화 또는 용역(서비스 포함)을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 운영하는 웹사이트를 말합니다.
2. "이용자"란 홈페이지에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
3. "회원"이란 홈페이지에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 서비스를 계속적으로 이용할 수 있는 자를 말합니다.

제3조 (약관의 게시와 개정)
1. 회사는 본 약관의 내용을 이용자가 쉽게 확인할 수 있도록 홈페이지 초기화면 또는 연결화면에 게시합니다.
2. 회사는 관련 법령(전자상거래법, 약관의 규제에 관한 법률 등)에 위배되지 않는 범위에서 본 약관을 개정할 수 있습니다.
3. 약관이 개정되는 경우 회사는 개정내용과 적용일자를 명시하여 현행 약관과 함께 홈페이지에 최소 7일 이상 공지합니다.

제4조 (서비스의 제공 및 변경)
1. 회사는 다음과 같은 업무를 수행합니다.
  ① 서비스 예약 신청의 접수 및 확인
  ② 행사/이벤트 안내
  ③ 기타 회사가 정하는 서비스
2. 회사는 기술적 사양 변경 등으로 서비스 내용을 변경할 수 있으며, 이 경우 사전에 공지합니다.

제5조 (서비스의 중단)
1. 회사는 시스템 점검, 교체 또는 기타 불가피한 사유가 발생한 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.
2. 제1항에 의한 서비스 중단 시 회사는 사전에 공지하며, 사후 공지가 불가피한 경우에는 지체 없이 이를 이용자에게 통지합니다.

제6조 (회원가입)
1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 입력하고 "가입하기" 버튼을 누름으로써 회원가입을 신청합니다.
2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
  ① 등록 내용에 허위, 기재누락, 오기가 있는 경우
  ② 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우

제7조 (회원의 탈퇴 및 자격상실)
1. 회원은 언제든지 홈페이지를 통해 회원 탈퇴를 요청할 수 있으며, 회사는 즉시 처리합니다.
2. 회사는 회원이 다음 각 호의 사유에 해당하는 경우 회원자격을 제한 또는 상실시킬 수 있습니다.
  ① 타인의 개인정보를 도용한 경우
  ② 홈페이지 운영을 고의로 방해한 경우
  ③ 공공질서 및 미풍양속에 반하는 행위를 한 경우
  ④ 기타 회사가 정한 이용조건을 위반한 경우

제8조 (회원에 대한 통지)
1. 회사는 회원에게 통지를 하는 경우, 회원이 회사에 제출한 전자우편 주소로 할 수 있습니다.
2. 회사는 불특정다수 회원에게 통지하는 경우 1주일 이상 홈페이지에 게시함으로써 개별 통지에 갈음할 수 있습니다.

제9조 (개인정보보호)
1. 회사는 이용자의 개인정보 수집 시 서비스 제공에 필요한 최소한의 정보를 수집합니다.
2. 회사는 수집된 개인정보를 본인의 동의 없이 목적 외로 이용하거나 제3자에게 제공하지 않습니다.
3. 기타 개인정보 보호에 관한 사항은 별도의 '개인정보처리방침'에 따릅니다.

제10조 (회사의 의무)
1. 회사는 관련 법령과 본 약관이 정하는 바에 따라 안정적이고 지속적인 서비스를 제공하는 데 최선을 다합니다.
2. 회사는 이용자의 개인정보를 보호하기 위한 보안 시스템을 구축합니다.

제11조 (이용자의 의무)
이용자는 다음 행위를 하여서는 안 됩니다.
  ① 신청 또는 변경 시 허위내용의 등록
  ② 타인의 정보 도용
  ③ 회사가 게시한 정보의 무단 변경
  ④ 회사의 명예를 손상시키거나 업무를 방해하는 행위

제12조 (저작권의 귀속 및 이용제한)
1. 회사가 작성한 저작물에 대한 저작권은 회사에 귀속합니다.
2. 이용자는 회사의 사전 승낙 없이 홈페이지의 정보를 영리목적으로 사용하거나 제3자에게 이용하게 할 수 없습니다.

제13조 (분쟁해결 및 관할)
1. 본 약관에 명시되지 않은 사항은 관련 법령과 상관례에 따릅니다.
2. 서비스 이용과 관련하여 회사와 이용자 간에 분쟁이 발생한 경우, 관할 법원은 회사 본점 소재지를 관할하는 법원으로 합니다.
`,
    },
    // Add more agreements here if needed
  ];
  const [agreements, setAgreements] = useState(initialAgreements);

  const allRequiredAgreed = agreements
    .filter((a) => a.isRequired)
    .every((a) => a.isChecked);

  const allAgreed = agreements.every((a) => a.isChecked);

  const handleMasterAgreeChange = (isChecked: boolean) => {
    setAgreements(agreements.map((a) => ({ ...a, isChecked })));
  };

  const handleAgreementChange = (id: string, isChecked: boolean) => {
    setAgreements(
      agreements.map((a) => (a.id === id ? { ...a, isChecked } : a))
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && !allRequiredAgreed) {
      alert("필수 약관에 모두 동의해야 다음 단계로 진행할 수 있습니다.");
      return;
    }
    if (currentStep < COMPLETION_STEP) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  let bottomButtonLabel = "다음";
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
                />
              )}
              {currentStep === 3 && (
                <Step3UserInfo
                  mainFlowSteps={MAIN_FLOW_STEPS}
                  currentProgressValue={currentStep}
                />
              )}
              {currentStep === COMPLETION_STEP && <Step4Complete />}
            </Box>

            {currentStep < COMPLETION_STEP && (
              <HStack
                w="full"
                justify={currentStep === 1 ? "flex-end" : "space-between"}
                mt={8}
              >
                {currentStep > 1 && (
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    size="lg"
                    minW="120px"
                  >
                    이전
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={currentStep === 1 && !allRequiredAgreed}
                  bg="#2E3192"
                  color="white"
                  _hover={{ bg: "#1A365D" }}
                  size="lg"
                  minW="120px"
                >
                  {bottomButtonLabel}
                </Button>
              </HStack>
            )}
          </VStack>
        </Container>
      </Flex>
    </Flex>
  );
}
