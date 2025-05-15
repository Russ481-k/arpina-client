"use client";

import { VStack, Text, Button, Box, HStack } from "@chakra-ui/react";
import Image from "next/image";
import { StepHeader } from "./StepHeader";

// const identityOptions = [
//   { label: "휴대폰 인증", value: "phone" },
//   { label: "아이핀 인증", value: "ipin" },
// ];

interface Step2IdentityProps {
  mainFlowSteps: number;
  currentProgressValue: number;
}

const ICON_IMAGE_SIZE = 90;

export const Step2Identity = ({
  mainFlowSteps,
  currentProgressValue,
}: Step2IdentityProps) => (
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
      >
        인증하기
      </Button>
    </VStack>

    <Box bg="gray.50" p={5} borderRadius="md" mt={4}>
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
