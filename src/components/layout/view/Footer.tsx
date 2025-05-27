import { Box, Container, Text, Link, Flex, Image } from "@chakra-ui/react";

export function Footer() {
  const topMenuItems = [
    { label: "창업기업 소개", href: "/enterprise/participants" },
    { label: "찾아오시는 길", href: "/about/location" },
  ];

  return (
    <Box as="footer" bg="white" color="#333333" py={0} mt="auto">
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          pt={7}
          mb={9}
        >
          <Image src="/images/logo/logo4.png" alt="아르피나 푸터 로고" />
          <Flex gap={5} mb={{ base: 4, md: 0 }} align="center">
            {topMenuItems.map((item, index) => (
              <Flex key={index} align="center">
                <Link
                  href={item.href}
                  fontSize="md"
                  fontWeight="300"
                  color="#333333"
                  _hover={{ textDecoration: "none", color: "gray.300" }}
                >
                  {item.label}
                </Link>
              </Flex>
            ))}
          </Flex>
          {/* <Box position="relative">
            <Flex
              as="button"
              align="center"
              gap={1}
              color="white"
              fontSize="14px"
              _hover={{ color: "gray.300" }}
              transition="color 0.2s"
            >
              패밀리사이트
            </Flex>
          </Box> */}
        </Flex>

        <Box pb={9}>
          <Text fontSize="md" color="white/70" mb={2} fontWeight="500">
            (48089) 부산 해운대구 해운대해변로 35 (우동)
          </Text>
          <Flex gap={0} color="white/70" fontSize="md" align="center">
            <Text>TEL : 051-740-3220</Text>
            <Text mx={2} color="whiteAlpha.400">
              ·
            </Text>
            <Text>FAX : 051-740-3220</Text>
            <Text mx={2} color="whiteAlpha.400">
              ·
            </Text>
          </Flex>
        </Box>
        <Box borderTop="1px solid" borderColor="white/20" py={6}>
          <Text fontSize="sm" color="#657580">
            Copyright (c) 2025 Busan Youth Hostel Arpina. All Rights Reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
