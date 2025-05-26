"use client";

import { Box, Flex, Heading, Image, Text } from "@chakra-ui/react";

interface FloorInfoItem {
  label: string;
  value: string;
}

interface MeetingFloorInfoProps {
  title?: string;
  floorImage: {
    src: string;
    alt: string;
  };
  infoItems: FloorInfoItem[];
}

export default function MeetingFloorInfo({
  title = "그랜드 볼룸 평면도",
  floorImage,
  infoItems,
}: MeetingFloorInfoProps) {
  return (
    <Box className="mr-floor-box" mt="100px">
      <Heading
        as="h4"
        mb="60px"
        color="#393939"
        fontSize="60px"
        fontWeight="bold"
        lineHeight="1"
      >
        {title}
      </Heading>
      <Flex justifyContent="space-between" gap="10px">
        <Image src={floorImage.src} alt={floorImage.alt} />
        <Box style={{ flex: "1 1 0", maxWidth: "750px" }}>
          {infoItems.map((item, index) => (
            <Flex key={index} alignItems="center" gap="50px">
              <Text
                flexShrink={0}
                backgroundColor="#F7F8FB"
                w={"200px"}
                py={4}
                color="#4B4B4B"
                fontSize={"3xl"}
                fontWeight="medium"
                textAlign="center"
                className="title"
              >
                {item.label}
              </Text>
              <Text py={4} color="#4B4B4B" fontSize={"3xl"} fontWeight="medium">
                {item.value}
              </Text>
            </Flex>
          ))}
        </Box>
      </Flex>
    </Box>
  );
}
