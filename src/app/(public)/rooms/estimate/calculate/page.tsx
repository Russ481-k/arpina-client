"use client";

import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Box, Flex } from "@chakra-ui/react";
import {
  EstimateProvider,
  useEstimateContext,
} from "@/contexts/EstimateContext";
import { EstimateStepper } from "@/components/rooms/estimate/EstimateStepper";

const EstimateView = () => {
  const { step } = useEstimateContext();
  return (
    <Flex direction={{ base: "column", lg: "row" }} align="flex-start">
      <Box flex="1" m={0}>
        <EstimateStepper step={step} />
      </Box>
    </Flex>
  );
};

export default function EstimatePage() {
  return (
    <PageContainer>
      <EstimateProvider>
        <EstimateView />
      </EstimateProvider>
    </PageContainer>
  );
}
