"use client";

import {
  Box,
  Container,
  SimpleGrid,
  Text,
  VStack,
  Heading,
  Link,
} from "@chakra-ui/react";
import { useColors } from "@/styles/theme";

export function Footer() {
  const colors = useColors();

  return (
    <Box as="footer" bg={colors.bg} py={12}>
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, md: 4 }} gap={8}>
          <VStack align="start" gap={4}>
            <Heading
              as="h2"
              size="md"
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
            >
              부산창업가꿈 해운대
            </Heading>
            <Text color={colors.text.primary}>
              혁신적인 스타트업을 위한 최고의 환경을 제공합니다.
            </Text>
          </VStack>

          <VStack align="start" gap={4}>
            <Heading size="sm">소개</Heading>
            <Link href="/about" color={colors.text.primary}>
              우리 소개
            </Link>
            <Link href="/companies" color={colors.text.primary}>
              입주 기업
            </Link>
            <Link href="/contact" color={colors.text.primary}>
              문의하기
            </Link>
          </VStack>

          <VStack align="start" gap={4}>
            <Heading size="sm">지원</Heading>
            <Link href="/programs" color={colors.text.primary}>
              프로그램
            </Link>
            <Link href="/resources" color={colors.text.primary}>
              리소스
            </Link>
            <Link href="/events" color={colors.text.primary}>
              이벤트
            </Link>
          </VStack>

          <VStack align="start" gap={4}>
            <Heading size="sm">연락처</Heading>
            <Text color={colors.text.primary}>
              부산광역시 해운대구 우동 1234-56
            </Text>
            <Text color={colors.text.primary}>전화: 051-123-4567</Text>
            <Text color={colors.text.primary}>이메일: contact@example.com</Text>
          </VStack>
        </SimpleGrid>

        <Box mt={8} pt={8} borderTop="1px" borderColor={colors.border}>
          <Text color={colors.text.primary} textAlign="center">
            © {new Date().getFullYear()} 부산창업가꿈 해운대. All rights
            reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
