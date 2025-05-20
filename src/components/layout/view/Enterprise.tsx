"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { memo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { enterpriseApi } from "@/lib/api/enterpriseApi";

import { useUserStyles } from "@/styles/theme";
import { STYLES } from "@/styles/theme-tokens";
import { Styles } from "@/styles/theme";

import ContentsHeading from "@/components/layout/ContentsHeading";
import { TopInfoBox } from "@/components/layout/TopInfoBox";
import { PageContainer } from "@/components/layout/PageContainer";
import Image from "next/image";
import { Enterprise } from "@/app/cms/enterprise/types";

export const EnterpriseView = memo(() => {
  const styles = useUserStyles(STYLES as Styles);

  const [years, setYears] = useState<number[]>([]);

  // 연도 목록을 동적으로 구성 (예시: 2023~2025)
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // 연도별 입주기업 데이터 fetch
  const {
    data: enterprisesResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["enterprises", selectedYear],
    queryFn: async () => {
      const response = await enterpriseApi.getEnterprises({
        year: selectedYear,
      });

      // Use type assertion to handle the actual response structure
      const responseData = response as any;
      const enterprises = responseData.data?.content || [];

      const uniqueYears = [
        ...new Set(
          enterprises.map((enterprise: Enterprise) => enterprise.year)
        ),
      ] as number[];
      setYears(uniqueYears);
      return response;
    },
  });

  // Use type assertion to handle the actual response structure
  const responseData = enterprisesResponse as any;
  const enterprises: Enterprise[] = responseData?.data?.content || [];

  return (
    <Box as="main" id="mainContent" fontFamily={styles.fonts.body}>
      <PageContainer>
        <ContentsHeading title="입주현황" />
        <TopInfoBox
          title="청년의 도전을 응원하는 창업의 출발점"
          highlightText="부산창업가꿈 4호점"
          fullText="해운대 부산창업가꿈 4호점"
          description="해운대 청년들을 위한 창업 거점 공간으로, 공유오피스와 창업 지원
        프로그램을 제공합니다.지역 자원을 활용한 창업 기회를 넓히고,
        청년들이 직접 일자리를 만들어 갈 수 있도록 지원합니다. 지속 가능한
        창업 생태계 조성을 통해 지역과 함께 성장하는 것을 목표로 합니다."
          imageSrc="/images/contents/intro_img01.png"
          imageAlt="입주현황 이미지"
          imageOrder={-1}
        />

        <Box mt={8}>
          {/* 연도 탭 */}
          <Flex gap={4} mb={6}>
            {years.map((year) => (
              <Button
                key={year}
                variant="ghost"
                color={selectedYear === year ? "#1A73E8" : "#222"}
                fontWeight={selectedYear === year ? 700 : 600}
                fontSize="1.1em"
                borderBottom={
                  selectedYear === year ? "2px solid #1A73E8" : "none"
                }
                borderRadius={0}
                _hover={{ color: "#1A73E8", textDecoration: "none" }}
                onClick={() => setSelectedYear(year)}
                px={2}
              >
                {year}년
              </Button>
            ))}
          </Flex>
          <Box className="status-list-box">
            {isLoading ? (
              <Flex justify="center" align="center" minH="200px">
                <Text color="#888">로딩 중...</Text>
              </Flex>
            ) : isError ? (
              <Flex justify="center" align="center" minH="200px">
                <Text color="red.500">데이터를 불러오지 못했습니다.</Text>
              </Flex>
            ) : enterprises.length === 0 ? (
              <Flex justify="center" align="center" minH="200px">
                <Text color="#888">해당 연도의 입주기업이 없습니다.</Text>
              </Flex>
            ) : (
              <Flex flexWrap="wrap" gap={6}>
                {enterprises.map((enterprise, index) => (
                  <Box
                    key={enterprise.id}
                    width={{
                      base: "100%",
                      md: "calc(50% - 16px)",
                      lg: "calc(20% - 25px)",
                    }}
                    minW="220px"
                    maxW="260px"
                    h="auto"
                    p="35px 25px"
                    border="1px solid #E0E0E0"
                    borderRadius="20px"
                    bg="#fff"
                    boxShadow="sm"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    mb={4}
                  >
                    <Image
                      src={enterprise.image || ""}
                      loader={() => enterprise.image || ""}
                      alt={enterprise.name}
                      width={85}
                      height={85}
                      style={{ objectFit: "contain", borderRadius: 50 }}
                    />
                    <Text
                      color="#666"
                      fontWeight="300"
                      fontSize="1em"
                      mt={3}
                      mb={1}
                      textAlign="center"
                    >
                      {enterprise.description}
                    </Text>
                    <Text
                      color="#292E40"
                      fontSize="1.2em"
                      fontWeight="600"
                      mb={2}
                      textAlign="center"
                    >
                      {enterprise.name}
                    </Text>
                    <Box w="100%" mt={2}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        gap={2}
                        backgroundColor="#F7F8FB"
                        borderRadius="15px"
                        p={2}
                        color="#666"
                        fontWeight="500"
                        fontSize="sm"
                      >
                        <Box display="flex" gap={2}>
                          <Text w="50px" color="#0D344E" fontWeight="600">
                            대표자
                          </Text>
                          {enterprise.representative || "-"}
                        </Box>
                        <Box display="flex" gap={2}>
                          <Text w="50px" color="#0D344E" fontWeight="600">
                            설립일
                          </Text>
                          {enterprise.established || "-"}
                        </Box>
                        <Box display="flex" gap={2}>
                          <Text w="50px" color="#0D344E" fontWeight="600">
                            업종
                          </Text>
                          {enterprise.businessType || "-"}
                        </Box>
                      </Box>
                      {enterprise.detail && (
                        <Text
                          mt={2}
                          p={2}
                          color="#666"
                          fontSize="md"
                          fontWeight="500"
                        >
                          {enterprise.detail}
                        </Text>
                      )}
                    </Box>
                  </Box>
                ))}
              </Flex>
            )}
          </Box>
        </Box>
      </PageContainer>
    </Box>
  );
});

EnterpriseView.displayName = "EnterpriseView";

export default EnterpriseView;
