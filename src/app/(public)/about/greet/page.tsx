"use client";

import { Box, Container, Heading, Text, Flex, Image } from "@chakra-ui/react";
// import {
//   FaBuilding,
//   FaUsers,
//   FaLightbulb,
//   FaHandshake,
//   FaChartLine,
// } from "react-icons/fa";
import { useColors } from "@/styles/theme";

export default function VisionPage() {
  const colors = useColors();
  /*
  const cardStyles = {
    bg: colors.cardBg,
    borderWidth: "1px",
    borderColor: colors.border,
    boxShadow: "lg",
    transition: "all 0.3s",
    _hover: {
      transform: "translateY(-4px)",
      boxShadow: "xl",
    },
    overflow: "hidden",
  };

  const iconStyles = {
    w: 10,
    h: 10,
    mb: 3,
    p: 3,
    borderRadius: "xl",
    bg: colors.cardBg,
    boxShadow: "md",
    transition: "all 0.3s",
    _groupHover: {
      transform: "scale(1.1)",
    },
  };

  const infoItemStyles = {
    display: "flex",
    alignItems: "center",
    gap: 3,
    p: 3,
    borderRadius: "lg",
    bg: colors.cardBg,
    mb: 2,
    transition: "all 0.2s",
    _hover: {
      transform: "translateX(4px)",
      bg: colors.cardBg,
    },
  };

  const sectionTitleStyles = {
    fontSize: "xl",
    fontWeight: "bold",
    mb: 4,
    color: colors.text.primary,
    position: "relative",
    _after: {
      content: '""',
      position: "absolute",
      bottom: "-8px",
      left: 0,
      width: "40px",
      height: "3px",
      bg: colors.primary.light,
      borderRadius: "full",
    },
  };
*/
  return (
    <Container maxW="container.xl" py={16}>
      <Box mb={10}>
        <Heading
          as="h3"
          size="6xl"
          mb={10}
          pb={3}
          borderBottom="2px solid #0D344E"
          color="#0D344E"
        >
          인사말
        </Heading>
        <Box className="greet-wr">
          <Box className="greet-tit-box">
            <Box flex="1" maxW={{ base: "100%", md: "400px" }}>
              <Image
                src="/images/contents/greet_logo_img.png"
                alt="부산창업가꿈 로고 이미지"
                width="auto%"
                maxWidth="100%"
                height="auto"
                objectFit="contain"
              />
            </Box>
            <Text fontSize="6xl" color="#0D344E" fontWeight="600" flex="1">
              부산창업가꿈 해운대를 찾아주신 여러분 반갑습니다.
            </Text>
          </Box>
          <Flex
            className="greet-box"
            flexFlow="row-reverse wrap"
            gap="65px"
            alignItems="flex-start"
            justifyContent="space-between"
            mt="100px"
          >
            <Box flex="1" minW={{ base: "100%", lg: "595px" }}>
              <Image
                src="/images/contents/greet_img01.png"
                alt="인사말 이미지"
                width="auto"
                maxWidth="100%"
                height="auto"
                objectFit="cover"
              />
            </Box>
            <Box flex="1" minW={{ base: "100%", lg: "calc(100% - 660px)" }}>
              <Text fontSize="2xl" color="#4B4B4B">
                부저희 부산창업가꿈 해운대는 「도심형 청년창업주거복합공간
                조성사업」을 현 위치였던 세나 국공립 어린이집을 활용하여
                지상3층, 대지면적 약 115평, 연면적 141.56평에 시비 9억원, 구비
                3억원, 운영기관 출자금 3억 3천만원을 포함한 총 15억 3천만원의
                사업예산으로 추진됩니다. <br /> 본 사업은 지난 24년3월, 사단법인
                부산벤처기업협회 운영기관으로 선정된 후, 25년 2월까지 공간조성을
                완료하여, 2025년 2월 26일 드디어 개소하게 되었으며, 향후 2029년
                12월 31일까지 지속되는 사업입니다. <br /> 저희 부산창업가꿈
                해운대의 비전은, 창업전주기를 지원하는 복합문화체험공간을
                지향하며, 도심 속 청년창업가 보육과 동시에, 지역경제 활성화를
                목표로 운영하고자 합니다. 시설의 1층은 문화공간카페로, 2층은
                지역청년공유오피스 및 여성주거공간, 3층은 청년친화주거공간으로
                구성되어 있으며, 이러한 공간을 충분히 활용하여, 신기술체험을
                포함하는 다양한 스킨쉽 프로그램 운영을 통해서, 청년들의
                자립기반강화와, 정주여건개선을 실천하고자 합니다. <br />{" "}
                지역창업생태계 강화, 지역주민 참여를 통한 지역상권 활성화를
                비롯한 여러 가지 기대역할이 저희 부산창업가꿈 해운대에 주어져
                있음을 잘 알고 있으며, 무엇보다도 지역청년이 만족할 수 있는
                스마트한 창업공간, 편안한 주거공간으로서의 기본적 역할 수행에
                우선적으로 힘써 노력할 것을 다짐합니다.
              </Text>
              <Text fontSize="2xl" color="#4B4B4B" fontWeight="600" mt={9}>
                찾아주신 여러분의 적극적인 관심과 참여 부탁드리겠습니다.
                감사합니다.
              </Text>
            </Box>
          </Flex>
        </Box>
      </Box>
      {/*  
      <VStack gap={12} align="stretch">
        <Box textAlign="center">
          <Badge
            colorPalette="blue"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
            mb={4}
          >
            부산창업가꿈 해운대
          </Badge>
          <Heading
            as="h1"
            size="4xl"
            mb={4}
            bgGradient={colors.gradient.primary}
            bgClip="text"
          >
            비전과 목표
          </Heading>
          <Text fontSize="lg" color={colors.text.primary}>
            청년 창업의 새로운 지평을 열어갑니다
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
          <Card.Root {...cardStyles}>
            <Card.Body>
              <VStack align="start" gap={4}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={3}
                  mb={2}
                  role="group"
                >
                  <Icon
                    as={FaLightbulb}
                    color={colors.primary.default}
                    {...iconStyles}
                  />
                  <Heading size="lg">사업 개요</Heading>
                </Box>
                <Text color={colors.text.primary}>
                  부산 해운대구에 위치한 청년 창업 주거 복합단지로, 창업 공간과
                  주거 공간이 통합된 혁신적인 형태의 창업 생태계를 구축합니다.
                </Text>
                <Box w="full">
                  <Box {...infoItemStyles}>
                    <Icon as={FaChartLine} color={colors.primary.default} />
                    <Text fontWeight="medium">위치: 부산 해운대구</Text>
                  </Box>
                  <Box {...infoItemStyles}>
                    <Icon as={FaBuilding} color={colors.primary.default} />
                    <Text fontWeight="medium">규모: 1,000㎡</Text>
                  </Box>
                  <Box {...infoItemStyles}>
                    <Icon as={FaUsers} color={colors.primary.default} />
                    <Text fontWeight="medium">수용인원: 50명</Text>
                  </Box>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root {...cardStyles}>
            <Card.Body>
              <VStack align="start" gap={4}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={3}
                  mb={2}
                  role="group"
                >
                  <Icon
                    as={FaHandshake}
                    color={colors.secondary.default}
                    {...iconStyles}
                  />
                  <Heading size="lg">운영 조직</Heading>
                </Box>
                <Text color={colors.text.primary}>
                  전문적인 운영 조직을 통해 체계적인 창업 지원과 관리 서비스를
                  제공합니다.
                </Text>
                <Box w="full">
                  <Box {...infoItemStyles}>
                    <Icon as={FaUsers} color={colors.secondary.default} />
                    <Text fontWeight="medium">운영기관: 부산창업가꿈</Text>
                  </Box>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        <Box>
          <Heading {...sectionTitleStyles} textAlign="center">
            주요 목표
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            <Card.Root {...cardStyles}>
              <Card.Body>
                <VStack align="start" gap={3}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={3}
                    mb={2}
                    role="group"
                  >
                    <Icon
                      as={FaUsers}
                      color={colors.primary.default}
                      {...iconStyles}
                    />
                    <Heading size="md">청년 창업 지원</Heading>
                  </Box>
                  <Text color={colors.text.primary}>
                    창업 공간과 주거 공간을 통합 제공하여 청년 창업가들의
                    안정적인 창업 환경 조성
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root {...cardStyles}>
              <Card.Body>
                <VStack align="start" gap={3}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={3}
                    mb={2}
                    role="group"
                  >
                    <Icon
                      as={FaBuilding}
                      color={colors.secondary.default}
                      {...iconStyles}
                    />
                    <Heading size="md">창업 생태계 구축</Heading>
                  </Box>
                  <Text color={colors.text.primary}>
                    창업가 간 네트워크 형성과 협력 체계 구축을 통한 지속 가능한
                    창업 생태계 조성
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root {...cardStyles}>
              <Card.Body>
                <VStack align="start" gap={3}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={3}
                    mb={2}
                    role="group"
                  >
                    <Icon
                      as={FaChartLine}
                      color={colors.accent.success.default}
                      {...iconStyles}
                    />
                    <Heading size="md">지역 경제 활성화</Heading>
                  </Box>
                  <Text color={colors.text.primary}>
                    창업 기업의 성장과 일자리 창출을 통한 지역 경제 활성화 기여
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Box>

        <Box>
          <Heading {...sectionTitleStyles} textAlign="center">
            공간 구성
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Card.Root {...cardStyles}>
              <Card.Body>
                <VStack align="start" gap={3}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={3}
                    mb={2}
                    role="group"
                  >
                    <Icon
                      as={FaBuilding}
                      color={colors.primary.default}
                      {...iconStyles}
                    />
                    <Heading size="md">창업 공간</Heading>
                  </Box>
                  <Box w="full">
                    <Box {...infoItemStyles}>
                      <Icon as={FaBuilding} color={colors.primary.default} />
                      <Text fontWeight="medium">공동 작업실</Text>
                    </Box>
                    <Box {...infoItemStyles}>
                      <Icon as={FaUsers} color={colors.primary.default} />
                      <Text fontWeight="medium">미팅룸</Text>
                    </Box>
                    <Box {...infoItemStyles}>
                      <Icon as={FaChartLine} color={colors.primary.default} />
                      <Text fontWeight="medium">창업 지원 센터</Text>
                    </Box>
                  </Box>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root {...cardStyles}>
              <Card.Body>
                <VStack align="start" gap={3}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={3}
                    mb={2}
                    role="group"
                  >
                    <Icon
                      as={FaUsers}
                      color={colors.secondary.default}
                      {...iconStyles}
                    />
                    <Heading size="md">주거 공간</Heading>
                  </Box>
                  <Box w="full">
                    <Box {...infoItemStyles}>
                      <Icon as={FaUsers} color={colors.secondary.default} />
                      <Text fontWeight="medium">원룸형 주거시설</Text>
                    </Box>
                    <Box {...infoItemStyles}>
                      <Icon as={FaBuilding} color={colors.secondary.default} />
                      <Text fontWeight="medium">공용 주방</Text>
                    </Box>
                    <Box {...infoItemStyles}>
                      <Icon as={FaHandshake} color={colors.secondary.default} />
                      <Text fontWeight="medium">휴게 공간</Text>
                    </Box>
                  </Box>
                </VStack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Box>
      </VStack>
      */}
    </Container>
  );
}
