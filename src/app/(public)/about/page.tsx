"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { Card } from "@chakra-ui/react";
import { FaLightbulb, FaUsers, FaChartLine, FaHandshake } from "react-icons/fa";
import { useColors } from "@/styles/theme";

export default function AboutPage() {
  const colors = useColors();

  const features = [
    {
      icon: FaLightbulb,
      title: "혁신적인 아이디어",
      description:
        "창의적인 아이디어를 실현할 수 있는 환경을 제공합니다. 새로운 기술과 서비스를 개발하고 시장에 도입할 수 있는 기회를 제공합니다.",
    },
    {
      icon: FaUsers,
      title: "전문가 네트워크",
      description:
        "다양한 분야의 전문가들과 함께 일할 수 있는 기회를 제공합니다. 멘토링과 네트워킹을 통해 성장할 수 있습니다.",
    },
    {
      icon: FaChartLine,
      title: "성장 기회",
      description:
        "지속적인 성장과 발전을 위한 다양한 프로그램과 리소스를 제공합니다. 시장 진출과 투자 유치를 위한 지원을 제공합니다.",
    },
    {
      icon: FaHandshake,
      title: "파트너십",
      description:
        "다양한 기업과의 파트너십을 통해 시장 진출 기회를 제공합니다. 글로벌 네트워크를 구축할 수 있는 기회를 제공합니다.",
    },
  ];

  return (
    <Container maxW="container.xl" py={16} bg={colors.bg}>
      <VStack gap={12} align="stretch">
        <Box textAlign="center">
          <Heading
            as="h1"
            size="2xl"
            mb={4}
            bgGradient="linear(to-r, blue.500, purple.500)"
            bgClip="text"
          >
            부산창업가꿈 해운대
          </Heading>
          <Text fontSize="xl" color={colors.text.primary}>
            혁신적인 스타트업을 위한 최고의 환경을 제공합니다
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={8}>
          {features.map((feature, index) => (
            <Card.Root
              key={index}
              bg={colors.cardBg}
              borderWidth="1px"
              borderColor={colors.border}
              boxShadow="lg"
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: "xl",
                transition: "all 0.2s",
              }}
            >
              <Card.Body gap={4}>
                <Icon
                  as={feature.icon}
                  w={10}
                  h={10}
                  color={colors.primary.default}
                  mb={4}
                />
                <Heading size="md" color={colors.text.primary}>
                  {feature.title}
                </Heading>
                <Text color={colors.text.primary}>{feature.description}</Text>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>

        <Card.Root
          bg={colors.cardBg}
          borderWidth="1px"
          borderColor={colors.border}
          boxShadow="lg"
        >
          <Card.Body gap={6}>
            <Heading size="lg" color={colors.text.primary}>
              우리의 비전
            </Heading>
            <Text fontSize="lg" color={colors.text.primary}>
              부산창업가꿈 해운대는 혁신적인 스타트업을 위한 최고의 환경을
              제공합니다. 우리는 창의적인 아이디어를 실현하고, 전문가 네트워크를
              구축하며, 지속적인 성장과 발전을 위한 다양한 프로그램과 리소스를
              제공합니다.
            </Text>
            <Text fontSize="lg" color={colors.text.primary}>
              우리는 스타트업이 성공적으로 시장에 진출하고, 글로벌 네트워크를
              구축할 수 있도록 지원합니다. 부산창업가꿈 해운대와 함께 미래를
              만들어가세요.
            </Text>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  );
}
