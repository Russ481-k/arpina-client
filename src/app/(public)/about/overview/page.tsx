"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
  Flex,
  Image,
} from "@chakra-ui/react";
// import {
//   FaGraduationCap,
//   FaUsers,
//   FaChartLine,
//   FaLaptop,
//   FaPalette,
//   FaHandshake,
//   FaRegLightbulb,
//   FaHeartbeat,
//   FaBullseye,
//   FaRegBuilding,
//   FaNetworkWired,
//   FaRegComments,
// } from "react-icons/fa";
import { Card } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { motion } from "framer-motion";

//const MotionBox = motion(Box);
//const MotionCard = motion(Card.Root);

// OverviewBox 컴포넌트 정의
interface InfoItem {
  title: string;
  content: string[] | string;
}

interface OverviewBoxProps {
  title: string;
  imageSrc: string;
  imageAlt: string;
  infoData: InfoItem[];
  mb?: number;
}

const OverviewBox = ({
  title,
  imageSrc,
  imageAlt,
  infoData,
  mb = 0,
}: OverviewBoxProps) => {
  return (
    <Box className="overview-box" mb={mb}>
      <Heading
        as="h3"
        size="6xl"
        mb={10}
        pb={3}
        borderBottom="2px solid #0D344E"
        color="#0D344E"
      >
        {title}
      </Heading>
      <Flex
        className="overview-info"
        direction={{ base: "column", md: "row-reverse" }}
        gap={8}
        alignItems="flex-start"
      >
        <Box flex="1" width={{ base: "100%", md: "500px" }}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            width="auto"
            height="auto"
            maxWidth="100%"
            objectFit="cover"
          />
        </Box>
        <Box flex="1" width={{ base: "100%", md: "calc(100% - 532px)" }}>
          <Box
            as="ul"
            className="overview-detail-list"
            listStyleType="none"
            p={0}
          >
            {infoData.map((item, index) => (
              <Box as="li" key={index} mb={index < infoData.length - 1 ? 5 : 0}>
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
      </Flex>
    </Box>
  );
};

export default function ProgramPage() {
  // 시설 개요 정보
  const facilityOverviewInfo = [
    {
      title: "시설명",
      content: ["부산창업가꿈: 해운대"],
    },
    {
      title: "운영기관",
      content: ["(사)부산벤처기업협회"],
    },
    {
      title: "대상지",
      content: ["부산광역시 해운대구 윗반송로51번길 36"],
    },
    {
      title: "건물 규모",
      content: ["지하 1층, 지상 4층 (연면적 1,200㎡)"],
    },
    {
      title: "공간 구성",
      content: [
        "4층 : 옥외 테라스, 휴식 공간",
        "3층 : 남성주거공용공간, 남성전용6실, 공용주방",
        "2층A : 여성주거공용공간, 여성전용3실, 공용주방",
        "2층B : 공유오피스 8석, 소회의실, 창업 지원 공간",
        "1층 : 미디어아트 카페, 실감형 미디어 아트 공간, 야외테라스",
        "지하 1층 : 창고 및 기계실",
      ],
    },
    {
      title: "주요 시설",
      content: [
        "공유오피스 : 8석 규모의 개방형 사무공간",
        "소회의실 : 4인용 회의 공간",
        "공용주방 : 각 층별 설치",
        "미디어아트 카페 : 실감형 미디어 아트 체험 공간",
        "야외테라스 : 휴식 및 소통 공간",
      ],
    },
  ];

  // 3층 남성주거공간 정보
  const maleResidenceInfo = [
    {
      title: "공용공간 기기",
      content: [
        "식당 : 인덕션, 전자오븐, 식탁&의자, 정수기",
        "세탁실 : 세탁건조기",
        "거실 : 시스템에어컨, 공용TV, 무선공유기, 테이블&의자",
      ],
    },
    {
      title: "전용공간 기기",
      content: [
        "개인실 (화장실포함) : 시스템에어컨, 침대&매트리스, 책상&의자, 옷장",
      ],
    },
  ];

  // 2층 여성 주거 공간
  const femaleResidenceInfo = [
    {
      title: "공용공간 기기",
      content: [
        "세탁실 : 세탁건조기",
        "거실 : 시스템에어컨, 공용TV, 테이블&의자",
      ],
    },
    {
      title: "전용공간 기기",
      content: [
        "개인실 (화장실포함) : 시스템에어컨, 침대&매트리스, 책상&의자, 행거",
      ],
    },
  ];

  // 2층 공유오피스
  const officeInfo = [
    {
      title: "룸1",
      content: [
        "개방형오피스 (탕비실포함) : 시스템에어컨, 8석 책상&의자, 무선공유기, 공기청정기, 프린터, TV",
      ],
    },
    {
      title: "룸2",
      content: ["소형회의실 : 시스템에어컨, TV, 회의테이블&의자, 정수기"],
    },
  ];

  // 1층 미디어아트 카페
  const cafeInfo = [
    {
      title: "카페 기기",
      content: [
        "시스템에어컨, 실내용테이블, 실내용의자, 옥외용테이블, 옥외용의자, 수전시설(씽크대), 냉장고(대/업소용)",
      ],
    },
    {
      title: "미디어아트 기기",
      content: ["시스템에어컨, 빔프로젝터, 콘솔PC, 기타장비"],
    },
    {
      title: "전실 기기",
      content: ["물품비품 보관창고, 기타전실비품"],
    },
  ];

  // OverviewBox 데이터 배열
  const overviewBoxes = [
    {
      title: "시설 개요",
      imageSrc: "/images/contents/overview_img01.png",
      imageAlt: "부산창업가꿈 해운대 시설 개요 이미지",
      infoData: facilityOverviewInfo,
    },
    {
      title: "3층 남성주거공간 및 공용주방",
      imageSrc: "/images/contents/overview_img02.png",
      imageAlt: "3층 남성주거공간 및 공용주방 이미지",
      infoData: maleResidenceInfo,
    },
    {
      title: "2층 여성 주거 공간",
      imageSrc: "/images/contents/overview_img03.png",
      imageAlt: "2층 여성 주거 공간 이미지",
      infoData: femaleResidenceInfo,
    },
    {
      title: "2층 공유오피스",
      imageSrc: "/images/contents/overview_img04.png",
      imageAlt: "2층 공유오피스 이미지",
      infoData: officeInfo,
    },
    {
      title: "1층 미디어아트 카페",
      imageSrc: "/images/contents/overview_img05.png",
      imageAlt: "1층 미디어아트 카페 이미지",
      infoData: cafeInfo,
    },
  ];

  return (
    <Container maxW="container.xl" py={16}>
      <Box className="overview-wr">
        <Box className="overview-list">
          {overviewBoxes.map((box, index) => (
            <OverviewBox
              key={index}
              title={box.title}
              imageSrc={box.imageSrc}
              imageAlt={box.imageAlt}
              infoData={box.infoData}
              mb={index < overviewBoxes.length - 1 ? 20 : 0}
            />
          ))}
        </Box>
      </Box>
    </Container>
  );
}
