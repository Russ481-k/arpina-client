"use client";

import { Box, Collapsible, Flex, Heading, Mark, Text } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import { Bold } from "lucide-react";
import { color } from "framer-motion";

export default function ParticipantsPage() {
  const images = [
    "/images/contents/twin_img01.jpg",
    "/images/contents/twin_img02.jpg",
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="트윈 Twin"
        titleHighlight="트윈"
        description="개별 여행객들에게 적합한 트윈은 비즈니스맨을 위한 룸으로 이용되고 있으며, 장애인을 고려하여 마련된 객실과 단체여행객을 인솔하는 지도자를 위한 객실로 구성되어 있습니다."
        images={images}
      />
      <Box className="facility-info-box" mt="100px">
        <Heading
          as="h4"
          mb="60px"
          color="#393939"
          fontSize="60px"
          fontWeight="bold"
          lineHeight="1"
        >
          객실정보에 대해 알려드릴게요
        </Heading>
        <Box className="facility-info-list" borderTop="1px solid #393939">
          <Collapsible.Root borderBottom="1px solid #9E9C9C" py={3}>
            <Collapsible.Trigger w="100%" textAlign="left">
              <Text
                display="flex"
                alignItems="center"
                gap="100px"
                w="100%"
                maxW="1400px"
                margin="0 auto"
                color="#393939"
                fontSize="2xl"
                fontWeight="Bold"
              >
                <Mark color="#EFEFF1" fontSize="70px" fontWeight="extrabold">
                  1
                </Mark>
                체크인과 체크아웃은 언제인가요?
              </Text>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box w="100%" maxW="1400px" margin="0 auto">
                <Text style={{ color: "#393939", fontSize: "24px" }}>
                  체크인은 오후 <Mark variant="text">3:00</Mark> 체크아웃은 오전
                  <Mark variant="text">11:00</Mark>입니다
                </Text>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        </Box>
      </Box>
    </PageContainer>
  );
}
