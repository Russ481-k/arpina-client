"use client";

import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";

export default function ParticipantsPage() {
  return (
    <PageContainer>
      <Flex>
        <Box>
          <Box className="location-box"></Box>
        </Box>
        <Box>
          <Text>아르피나 위치</Text>
        </Box>
      </Flex>
    </PageContainer>
  );
}
