"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import MeetingSeatInfo from "@/components/contents/MeetingSeatInfo";
import MeetingFloorInfo from "@/components/contents/MeetingFloorInfo";
import HeadingH4 from "@/components/contents/HeadingH4";
import ApTable02 from "@/components/contents/ApTable02";
import { Box, Text } from "@chakra-ui/react";

export default function ParticipantsPage() {
  const images = [
    "/images/contents/garam_img01.jpg",
    "/images/contents/garam_img02.jpg",
  ];

  const meetingRoomRows = [
    {
      columns: [
        { header: "규모", content: "85.95㎡" },
        { header: "사이즈", content: "가로 7.56m * 세로 11.37m * 높이 2.7m" },
        { header: "스크린", content: "80Inch" },
        { header: "정원", content: "30명" },
        { header: "표준요금", content: "440,000원" },
      ],
    },
  ];

  const floorImage01 = {
    src: "/images/contents/garam_floor_img.jpg",
    alt: "가람 평면도",
  };
  const floorImage02 = {
    src: "/images/contents/nuri_floor_img.jpg",
    alt: "누리 평면도",
  };

  const floorInfoItems01 = [
    {
      label: "위치",
      value: "가람 (1층)",
    },
    {
      label: "면적",
      value: "85.95㎡",
    },
    {
      label: "사이즈",
      value: "가로 7.56m * 세로 11.37m * 높이 2.7m",
    },
    {
      label: "문의",
      value: "051-731-9800",
    },
  ];
  const floorInfoItems02 = [
    {
      label: "위치",
      value: "누리 (1층)",
    },
    {
      label: "면적",
      value: "85.95㎡",
    },
    {
      label: "사이즈",
      value: "가로 7.56m * 세로 11.37m * 높이 2.7m",
    },
    {
      label: "문의",
      value: "051-731-9800",
    },
  ];
  return (
    <PageContainer>
      <InfoTopBox
        title="가람/누리 GARAM&NURI"
        titleHighlight="가람/누리"
        description="아르피나 1층에 위치한 가람 및 누리 회의실은 기업 및 각종 단체의 중 · 소규모 세미나, 간담회 등에 적합한 공간으로, 쾌적하고 조용한 환경 속에서 성공적인 행사 진행을 위한 최적의 조건을 제공합니다."
        images={images}
        showReservation={false}
      />
      <Box mt={{ base: "20px", md: "30px", lg: "50px", "2xl": "100px" }}>
        <HeadingH4>회의실안내 (1층 가람/누리)</HeadingH4>
        <Text
          mt="10px"
          mb={{ base: 4, md: 10, lg: 25 }}
          color="#FAB20B"
          fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
          fontWeight="medium"
        >
          출장뷔페 및 외부 음식물 반입금지
        </Text>
        <ApTable02 rows={meetingRoomRows} />
      </Box>
      <MeetingSeatInfo />
      <MeetingFloorInfo
        floorImage={floorImage01}
        infoItems={floorInfoItems01}
      />
      <MeetingFloorInfo
        floorImage={floorImage02}
        infoItems={floorInfoItems02}
      />
    </PageContainer>
  );
}
