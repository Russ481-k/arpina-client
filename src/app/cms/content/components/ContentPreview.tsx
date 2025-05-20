"use client";

import {
  Box,
  Flex,
  Text,
  Image,
  HStack,
  VStack,
  Grid,
  Container,
  Heading,
  Separator,
  Link,
} from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { useColorMode } from "@/components/ui/color-mode";
import { Content, VisionSection } from "../types";
import { Menu } from "@/types/api";
import Layout from "@/components/layout/view/Layout";
import { LuCalendar, LuEye } from "react-icons/lu";
import { LexicalRenderer } from "./LexicalRenderer";
import { menuKeys, menuApi, sortMenus } from "@/lib/api/menu";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
interface ContentPreviewProps {
  content: Content | null;
  menus?: Menu[];
}

const SAMPLE_CONTENT = {
  author: {
    name: "김영주",
    avatar: "/images/avatar.png",
  },
  date: "2024-03-20",
  views: 1234,
};

export function ContentPreview({ content }: ContentPreviewProps) {
  const colors = useColors();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = isDark ? colors.cardBg : "white";
  const borderColor = isDark ? "gray.700" : "gray.200";

  // 메뉴 목록 가져오기
  const { data: menuResponse, isLoading: isMenusLoading } = useQuery<Menu[]>({
    queryKey: menuKeys.list(""),
    queryFn: async () => {
      const response = await menuApi.getMenus();
      return response.data.data;
    },
  });

  const menus = useMemo(() => {
    try {
      const responseData = menuResponse;
      if (!responseData) return [];

      // API 응답이 배열인 경우
      if (Array.isArray(responseData)) {
        return sortMenus(responseData);
      }

      // API 응답이 객체인 경우 data 필드를 확인
      const menuData = responseData;
      if (!menuData) return [];

      // menuData가 배열인지 확인
      return Array.isArray(menuData) ? sortMenus(menuData) : [menuData];
    } catch (error) {
      console.error("Error processing menu data:", error);
      return [];
    }
  }, [menuResponse]);

  if (!content) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="full"
        gap={4}
        p={8}
        color={colors.text.primary}
      >
        <Text fontSize="lg" fontWeight="medium" textAlign="center">
          컨텐츠를 선택하거나 새 컨텐츠를 추가하세요.
        </Text>
      </Flex>
    );
  }

  const renderSection = (section: VisionSection) => {
    switch (section.type) {
      case "quote":
        return (
          <Box
            p={6}
            bg={colors.cardBg}
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor={colors.primary.default}
            my={4}
          >
            <Text color={colors.text.primary} fontSize="lg" fontStyle="italic">
              {section.content}
            </Text>
          </Box>
        );
      case "list":
        return (
          <Box as="ul" my={4}>
            {section.items?.map((item, index) => (
              <Box as="li" key={index}>
                <Text>{item}</Text>
              </Box>
            ))}
          </Box>
        );
      default:
        return (
          <Box my={4}>
            <LexicalRenderer content={section.content} editable={false} />
          </Box>
        );
    }
  };

  return (
    <Layout currentPage="컨텐츠" isPreview={true} menus={menus}>
      <Container maxW="container.xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* 헤더 섹션 */}
          <Box>
            <Heading as="h1" size="2xl" mb={4}>
              {content.title}
            </Heading>
            <HStack gap={4} color={colors.text.secondary}>
              {content.settings.showAuthor && content.metadata?.author && (
                <HStack>
                  <Box
                    width="32px"
                    height="32px"
                    borderRadius="full"
                    overflow="hidden"
                    bg="gray.200"
                    _dark={{ bg: "gray.700" }}
                  >
                    <Image
                      src={SAMPLE_CONTENT.author.avatar}
                      alt={content.metadata.author}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                  </Box>
                  <Text fontSize="sm">{content.metadata.author}</Text>
                </HStack>
              )}
              {content.settings.showDate && (
                <HStack>
                  <LuCalendar size={16} />
                  <Text fontSize="sm">{SAMPLE_CONTENT.date}</Text>
                </HStack>
              )}
              <HStack>
                <LuEye size={16} />
                <Text fontSize="sm">{SAMPLE_CONTENT.views}</Text>
              </HStack>
            </HStack>
          </Box>

          <Separator />

          {/* 목차 */}
          {content.settings.showTableOfContents && content.sections && (
            <Box>
              <Heading as="h2" size="md" mb={4}>
                목차
              </Heading>
              <Box as="ul" gap={2} listStyleType="none" pl={0}>
                {content.sections.map((section, index) => (
                  <Box as="li" key={index} mb={2}>
                    <Link
                      href={`#section-${index}`}
                      color={colors.primary.default}
                      _hover={{ textDecoration: "underline" }}
                    >
                      {section.title}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* 섹션 컨텐츠 */}
          {content.sections?.map((section, index) => (
            <Box key={index} id={`section-${index}`}>
              <Heading as="h2" size="lg" mb={4}>
                {section.title}
              </Heading>
              {renderSection(section)}
            </Box>
          ))}

          {/* 메인 컨텐츠 */}
          {content.content && (
            <Box>
              <LexicalRenderer content={content.content} editable={false} />
            </Box>
          )}

          {/* 메타데이터 */}
          {content.metadata && (
            <Box
              mt={8}
              p={4}
              bg={bgColor}
              borderRadius="lg"
              borderWidth={1}
              borderColor={borderColor}
            >
              <Heading as="h3" size="md" mb={4}>
                작성자 정보
              </Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                {content.metadata.author && (
                  <Box>
                    <Text fontWeight="bold">작성자</Text>
                    <Text>{content.metadata.author}</Text>
                  </Box>
                )}
                {content.metadata.position && (
                  <Box>
                    <Text fontWeight="bold">직위</Text>
                    <Text>{content.metadata.position}</Text>
                  </Box>
                )}
                {content.metadata.department && (
                  <Box>
                    <Text fontWeight="bold">부서</Text>
                    <Text>{content.metadata.department}</Text>
                  </Box>
                )}
                {content.metadata.contact && (
                  <Box>
                    <Text fontWeight="bold">연락처</Text>
                    <Text>{content.metadata.contact}</Text>
                  </Box>
                )}
              </Grid>
            </Box>
          )}
        </VStack>
      </Container>
    </Layout>
  );
}
