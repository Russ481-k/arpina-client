"use client";

import {
  VStack,
  Heading,
  Text,
  HStack,
  Button,
  Icon,
  Box,
  Center,
} from "@chakra-ui/react";
// import { CheckCircleIcon } from "lucide-react"; // No longer needed
import NextLink from "next/link";
import Image from "next/image"; // Added import

export const Step4Complete = () => (
  <VStack gap={8} align="center" w="full" textAlign="center" py={10}>
    <Heading size="xl" color="gray.700">
      가입완료
    </Heading>

    <Box my={6}>
      <Image
        src="/images/signup/signup_success.png"
        alt="회원가입 완료"
        width={518}
        height={246}
        style={{ objectFit: "contain" }}
      />
    </Box>

    <VStack gap={2} maxW="xl" w="full">
      <Text fontSize="lg" fontWeight="semibold">
        회원가입이 성공적으로 완료되었습니다.
      </Text>
      <Text fontSize="md" color="gray.600">
        안녕하세요, [사용자이름]님!{" "}
      </Text>
      <Text fontSize="md" color="gray.600">
        {" "}
        아르피나 홈페이지에 오신 것을 환영합니다.{" "}
      </Text>
      <Text fontSize="md" color="gray.600">
        {/* Generic welcome message, can be personalized if user name is available */}
        이제 다양한 아르피나의 서비스를 로그인 후 자유롭게 이용하실 수 있습니다.
      </Text>
    </VStack>

    <HStack mt={6} gap={4}>
      <NextLink href="/login" passHref legacyBehavior>
        <Button
          as="a"
          bg="#2E3192"
          color="white"
          _hover={{ bg: "#1A365D" }}
          px={8}
          size="lg"
        >
          로그인
        </Button>
      </NextLink>
      <NextLink href="/" passHref legacyBehavior>
        <Button
          as="a"
          variant="outline"
          borderColor="#2E3192"
          color="#2E3192"
          _hover={{ bg: "#2E3192", color: "white" }}
          px={8}
          size="lg"
        >
          홈으로
        </Button>
      </NextLink>
    </HStack>
  </VStack>
);
