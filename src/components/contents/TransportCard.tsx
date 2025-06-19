"use client";

import { Box, Text, Flex, Image, useBreakpointValue } from "@chakra-ui/react";
import MapButton from "./MapButton";

interface TransportCardProps {
  iconSrc: string;
  title: string;
  borderColor: string;
  iconColor: string;
  mapUrl: string;
  buttonBgColor: string;
  buttonHoverColor: string;
  fromLocation?: string;
}

export default function TransportCard({
  iconSrc,
  title,
  borderColor,
  iconColor,
  mapUrl,
  buttonBgColor,
  buttonHoverColor,
  fromLocation = "현재위치",
}: TransportCardProps) {
  // 반응형 값들
  const maxWidth = useBreakpointValue({
    base: "calc(50% - 5px)",
    md: "calc(50% - 15px)",
    lg: "calc(25% - 15px)",
  });
  const padding = useBreakpointValue({ base: 3, md: 4, lg: 5 });
  const fontSize = useBreakpointValue({ base: "lg", md: "xl" });
  const imageSize = useBreakpointValue({
    base: "40px",
    md: "50px",
    lg: "60px",
  });
  const marginBottom = useBreakpointValue({ base: 3, md: 4, lg: 5 });

  return (
    <Box
      flex="1 1 0"
      bg="#fff"
      border={`3px solid ${borderColor}`}
      borderRadius="20px"
      p={padding}
      display="flex"
      flexDirection="column"
      alignItems="center"
      maxW={maxWidth}
      color="#3A3A3A"
      fontSize={fontSize}
    >
      <Image
        src={iconSrc}
        alt={title}
        borderRadius="xl"
        w={imageSize}
        h={imageSize}
        mb={marginBottom}
      />
      <Text fontWeight="700" mb={1}>
        {title}
      </Text>
      <Flex direction="column" align="center" mb={marginBottom}>
        {fromLocation}
        <Box as="span" border="1px dashed #3A3A3A" w="1px" h="33px" />
        아르피나
      </Flex>
      <MapButton
        url={mapUrl}
        bgColor={buttonBgColor}
        hoverColor={buttonHoverColor}
      />
    </Box>
  );
}
