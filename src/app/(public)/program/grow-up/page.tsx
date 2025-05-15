"use client";

import { Box, Text, Flex, Button, Table, Link } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
import ContentsHeading from "@/components/layout/ContentsHeading";
import { TopInfoBox } from "@/components/layout/TopInfoBox";
import { PageContainer } from "@/components/layout/PageContainer";

export default function EducationPage() {
  const programInfo = [
    {
      title: "운영대상",
      content: ["주거공간 입주청년, 오피스 입주기업"],
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
      prgname: "노무교육",
      content: "노동법 이해, 근로환경 개선, 노무관리, 직장 내 괴롭힘 예방 등",
    },
    {
      prgname: "세무회계 교육",
      content: "노동법 이해, 근로환경 개선, 노무관리, 직장 내 괴롭힘 예방 등",
    },
    {
      prgname: "지식재산권 기본 이해",
      content: "특허/상표/디자인 출원 절차 및 침해 사례 대응, 사업화 연계 방안",
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
      <ContentsHeading title="Grow up" />
      <TopInfoBox
        title="예비 창업자 및 초기 창업자를 위한 실전형 창업 역량 강화 프로그램"
        highlightText="Grow up"
        fullText="부산 창업가꿈 해운대 운영프로그램 Grow up"
        description="창업에 필요한 기본적인 지식과 실무 역량을 갖추고, 성공적인 창업을
        위한 기반을 마련하는 프로그램입니다."
        imageSrc="/images/contents/growup_img01.png"
        imageAlt="Grow up 프로그램 이미지"
      />

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
                          content: '""',
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
            content: '""',
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
    </PageContainer>
  );
}
