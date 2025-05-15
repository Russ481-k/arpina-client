"use client";

import { Box, Text, Flex, Button, Table, Link } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
import { PageContainer } from "@/components/layout/PageContainer";
import ContentsHeading from "@/components/layout/ContentsHeading";
import { TopInfoBox } from "@/components/layout/TopInfoBox";

export default function EducationPage() {
  const programInfo = [
    {
      title: "운영대상",
      content: ["주거공간 입주청년, 오피스 입주기업, 지역 주민"],
    },
    {
      title: "운영기간",
      content: ["2025년 3월 ~ 12월"],
    },
    {
      title: "운영방식",
      content: ["월 1회 또는 격월 / 총 8명 내외"],
    },
    {
      title: "장소",
      content: ["부산 해운대 창업가꿈 4호점 교육공간"],
    },
  ];

  const programStructure = [
    {
      prgname: "경제 재무 관리",
      content:
        "수입·지출 흐름 이해 및 목표 설정. 자산운용, 투자 기초, 보험 및 세금 이해",
    },
    {
      prgname: "문화체험",
      content:
        "전시 및 테크 클래스 등 다양한 문화활동 참여. 기술 트렌드 체험 및 청년 네트워킹 ",
    },
    {
      prgname: "홈트레이닝",
      content:
        "운동 루틴 교육 및 건강 습관 정립. 스트레칭, 유산소 및 근력 운동 중심",
    },
    {
      prgname: "퍼스널 브랜딩",
      content:
        "자기소개서, SNS 활용, 이미지 전략. 자기표현력 및 발표력 향상 훈련",
    },
    {
      prgname: "스피치 커뮤니케이션",
      content:
        "스피치 기본 구조 및 비언어적 표현 훈련. 자신감 있는 발표 스킬 향상",
    },
    {
      prgname: "토요 브런치 & 심리상담",
      content:
        "매주 토요일 운영 / 브런치 모임과 연계한 심층 상담. 자존감 회복, 대인관계 분석, 스트레스 관리 등",
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
      <ContentsHeading title="갓생 클래스" />

      <TopInfoBox
        title="청년 창업가 및 예비 창업자들을 위한 라이프코칭형 자기계발 프로그램"
        highlightText="갓생 클래스"
        fullText="부산 창업가꿈 해운대 운영프로그램 갓생 클래스"
        description="'갓생클래스'는 창업 준비생 및 지역 주민들을 대상으로, 경제 지식,
        건강한 생활 습관, 자기 표현력, 커뮤니케이션 능력 등을 종합적으로
        향상시키기 위해 구성된 실용형 라이프 트레이닝 프로그램입니다."
        imageSrc="/images/contents/gsClass_img01.png"
        imageAlt="갓생클래스 프로그램 이미지"
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
