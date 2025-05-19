"use client";

import { useEffect } from "react";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Input,
  Link,
  VStack,
  HStack,
  Text,
  Fieldset,
  Field,
} from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toaster } from "@/components/ui/toaster";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const reason = searchParams.get("reason");
    const niceUsername = searchParams.get("nice_username");

    if (reason === "duplicate_di") {
      const message = niceUsername
        ? `이미 가입된 계정입니다 (ID: ${decodeURIComponent(
            niceUsername
          )}). 로그인해 주세요.`
        : "이미 가입된 계정입니다. 로그인해 주세요.";

      console.log(
        "Login page: Attempting to show DUPLICATE_DI toast. Message:",
        message
      );

      queueMicrotask(() => {
        toaster.create({
          title: "계정 중복 안내",
          description: message,
          type: "info",
          duration: 7000,
        });
      });
    }
  }, [searchParams, router]);

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      py={{ base: "12", md: "0" }}
      px={{ base: "4", sm: "8" }}
    >
      <VStack gap={{ base: "6", md: "8" }} align="center" w="full" maxW="md">
        <VStack gap="6">
          <Image
            src="/images/logo/login_logo.png"
            alt="logo"
            width={52}
            height={74}
          />
          <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
            로그인이 필요한 서비스입니다
          </Heading>
        </VStack>
        <Box w="full">
          <Fieldset.Root>
            <VStack gap="5">
              <Field.Root id="username-field" w="full">
                <Input
                  id="username"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  size="lg"
                />
              </Field.Root>
              <Field.Root id="password-field" w="full">
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  size="lg"
                />
              </Field.Root>
            </VStack>
            <VStack gap="6" mt="8">
              <Button
                bg="#2E3192"
                color="white"
                _hover={{ bg: "#1A365D" }}
                size="lg"
                fontSize="md"
                w="full"
              >
                로그인
              </Button>
              <HStack gap="3" justify="center" fontSize="sm" w="full">
                <Button
                  variant="outline"
                  size="md"
                  flex={1}
                  borderColor="#2E3192"
                  color="#2E3192"
                  fontWeight="normal"
                  onClick={() => {
                    router.push("/signup");
                  }}
                >
                  회원가입
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  flex={1}
                  borderColor="#2E3192"
                  color="#2E3192"
                  fontWeight="normal"
                  onClick={() => {
                    router.push("/find-credentials");
                  }}
                >
                  아이디/비밀번호 찾기
                </Button>
              </HStack>
            </VStack>
          </Fieldset.Root>
        </Box>
      </VStack>
    </Flex>
  );
}
