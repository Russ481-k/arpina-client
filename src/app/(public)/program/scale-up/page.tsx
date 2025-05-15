"use client";

import {
  Box,
  Heading,
  Text,
  Highlight,
  Image,
  Flex,
  Button,
  Table,
  Link,
} from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";

import ContentsHeading from "@/components/layout/ContentsHeading";
import { PageContainer } from "@/components/layout/PageContainer";

export default function EducationPage() {
  const programInfo = [
    {
      title: "운영대상",
      content: ["주거공간 입주청년, 오피스 입주기업, 지역주민"],
    },
    {
      title: "운영기간",
      content: ["2025년 3월 ~ 12월"],
    },
    {
      title: "운영방식",
      content: ["월 1회, 1회 2시간 / 총 8명 내외"],
    },
    {
      title: "장소",
      content: ["부산 해운대 창업가꿈 4호점 교육공간"],
    },
  ];

  const programStructure = [
    {
      prgname: "스타트업 탐방",
      content: "우수 스타트업 CEO 특강, 성장 요인 분석, 창업 현장 방문 및 Q&A",
    },
    {
      prgname: "벤처CEO 모닝캠퍼스",
      content: "벤처 CEO들과의 토크, 창업/투자 실전 사례 공유, 세미나",
    },
  ];

  // 테이블 셀 스타일 객체 정의
  const tableStyles = {
    headerCell: {
      color: "#2C65FD",
      fontWeight: "600",
      fontSize: "2xl",
      borderBottom: "2px solid #D0D0D0",
      py: 5,
    },
    nameCell: {
      color: "#4B4B4B",
      fontWeight: "600",
      fontSize: "2xl",
      borderBottom: "2px solid #D0D0D0",
      py: 5,
    },
    contentCell: {
      color: "#4B4B4B",
      fontWeight: "500",
      fontSize: "lg",
      borderBottom: "2px solid #D0D0D0",
      py: 5,
    },
  };

  return (
    <PageContainer>
      <Box mb={10}>
        <ContentsHeading title="Scale UP" />
        <Flex
          id="prgTItle"
          direction={{ base: "column", lg: "row" }}
          wrap="wrap"
          align="center"
          justify="center"
          gap={{ base: 5, lg: 8 }}
          mb="60px"
          bg="#F4F7FF"
          p={{ base: 4, lg: 8 }}
          borderRadius="3xl"
        >
          <Box width={{ base: "100%", lg: "calc(100% - 350px)" }}>
            <Text fontSize="xl" color="#424242">
              스타트업 스케일업을 위한 집중형 성장 지원 프로그램
            </Text>
            <Heading as="h3" size="4xl" mb={4}>
              <Highlight query="Scale UP" styles={{ color: "#4CCEC6" }}>
                부산 창업가꿈 해운대 운영프로그램 Scale UP
              </Highlight>
            </Heading>
            <Text fontSize="xl" color="#424242">
              ‘스케일업’은 스타트업 성장단계에서 가장 중요한 비즈니스 확장,
              IR역량, 브랜드 구축, 판로 확대를 집중적으로 지원하는
              프로그램입니다. 현장 경험과 네트워킹, 발표 역량 강화를 중심으로
              구성됩니다.
            </Text>
          </Box>

          <Flex
            flex="1"
            display={{ base: "none", lg: "flex" }}
            width={{ lg: "300px" }}
            justifyContent="center"
            alignItems="center"
          >
            <Image
              src="/images/contents/scaleup_img01.png"
              alt="Scale UP 프로그램 이미지"
              width="auto"
              maxWidth="100%"
              height="auto"
              objectFit="cover"
            />
          </Flex>
        </Flex>

        <Link
          href="/files/운영프로그램 원고.hwp"
          download="2025년 운영프로그램.hwp"
          _hover={{ textDecoration: "none" }}
        >
          <Button
            bg="#2C65FD"
            color="white"
            size="lg"
            px={8}
            py={6}
            mb="60px"
            fontSize="lg"
            fontWeight="600"
            borderRadius="md"
            _hover={{ bg: "#1a4fd0" }}
            _active={{ bg: "#0d3fb0" }}
          >
            2025년 운영프로그램.hwp
            <LuDownload />
          </Button>
        </Link>

        <Box className="prg-info-box" mb="60px">
          <Box as="ul" className="prg-info-list" listStyleType="none" p={0}>
            {programInfo.map((item, index) => (
              <Box
                as="li"
                key={index}
                mb={index < programInfo.length - 1 ? 5 : 0}
              >
                <Text
                  as="p"
                  fontWeight="600"
                  fontSize="2xl"
                  mb={5}
                  color="#0D344E"
                  className="tit"
                >
                  {item.title}
                </Text>
                <Box className="txt" fontSize="lg" color="#424242">
                  {Array.isArray(item.content) ? (
                    <Box as="ul" listStyleType="none">
                      {item.content.map((contentItem, contentIndex) => (
                        <Box
                          as="li"
                          key={contentIndex}
                          mb={
                            item.content.length > 1 &&
                            contentIndex < item.content.length - 1
                              ? 1
                              : 0
                          }
                          position="relative"
                          pl={4}
                          _before={{
                            content: "",
                            display: "block",
                            position: "absolute",
                            left: 0,
                            top: "12px",
                            width: "4px",
                            height: "4px",
                            bg: "#4CCEC6",
                          }}
                        >
                          {contentItem}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    item.content
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box className="prg-comp-box">
          <Flex
            as="p"
            fontWeight="600"
            fontSize="2xl"
            mb={4}
            color="#000"
            className="prg-comp-tit"
            flexFlow="row wrap"
            alignItems="center"
            gap={3}
            _before={{
              content: "",
              width: "30px",
              height: "30px",
              backgroundImage: "url('/images/contents/oper_pgr_ico01.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            프로그램 구성
          </Flex>

          <Box overflowX="auto">
            <Table.Root
              size="lg"
              className="prg-comp-tbl"
              borderTop="2px solid #0D344E"
            >
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader {...tableStyles.headerCell}>
                    프로그램명
                  </Table.ColumnHeader>
                  <Table.ColumnHeader {...tableStyles.headerCell}>
                    교육 내용
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {programStructure.map((item, index) => (
                  <Table.Row key={index}>
                    <Table.Cell {...tableStyles.nameCell}>
                      {item.prgname}
                    </Table.Cell>
                    <Table.Cell {...tableStyles.contentCell}>
                      {item.content}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}
