"use client";

import {
  Box,
  VStack,
  Text,
  Checkbox,
  Separator,
  Textarea,
} from "@chakra-ui/react";
import { AgreementItem } from "./AgreementItem";
import { StepHeader } from "./StepHeader";

// Define Agreement type locally as it's a prop for Step1Terms
interface Agreement {
  id: string;
  label: string;
  isRequired: boolean;
  isChecked: boolean;
  details?: string;
}

interface Step1TermsProps {
  onMasterAgree: (agreed: boolean) => void;
  allAgreed: boolean;
  agreements: Agreement[];
  onAgreementChange: (id: string, isChecked: boolean) => void;
  mainFlowSteps: number;
  currentProgressValue: number;
}

export const Step1Terms = ({
  onMasterAgree,
  allAgreed,
  agreements,
  onAgreementChange,
  mainFlowSteps,
  currentProgressValue,
}: Step1TermsProps) => (
  <VStack gap={4} align="stretch" w="full">
    <StepHeader
      title="개인정보동의서"
      currentStep={1}
      totalSteps={mainFlowSteps}
      currentProgressValue={currentProgressValue}
    />
    <Checkbox.Root
      checked={allAgreed}
      onChange={(e: any) => onMasterAgree(e.target.checked)}
      variant="subtle"
      colorPalette="orange"
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control mr={2} />
      <Checkbox.Label fontWeight="bold" fontSize="lg">
        아래의 사항에 대해 전체 동의합니다.
      </Checkbox.Label>
    </Checkbox.Root>
    <Separator my={4} />
    {agreements.map((agreement) => (
      <AgreementItem
        key={agreement.id}
        title={agreement.label}
        isRequired={agreement.isRequired}
        isChecked={agreement.isChecked}
        onChange={(isChecked: boolean) =>
          onAgreementChange(agreement.id, isChecked)
        }
      >
        {agreement.details && (
          <Textarea
            value={agreement.details}
            readOnly
            border="1px solid"
            borderColor="gray.200"
            p={3}
            borderRadius="md"
            mt={2}
            fontSize="sm"
            h="120px"
            w="full"
            overflowY="auto"
            bg="gray.50"
            resize="none"
          />
        )}
      </AgreementItem>
    ))}
  </VStack>
);
