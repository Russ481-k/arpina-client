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
    "/images/contents/clover_img01.png",
    "/images/contents/clover_img02.png",
    "/images/contents/clover_img03.png",
  ];

  const meetingRoomRows = [
    {
      columns: [
        { header: "규모", content: "173㎡" },
        { header: "사이즈", content: "가로 7.9m * 세로 21.9m * 높이 2.7m" },
        { header: "스크린", content: "100Inch" },
        { header: "정원", content: "80명" },
        { header: "표준요금", content: "770,000원" },
      ],
    },
  ];

  const floorImage = {
    src: "/images/contents/clover_floor_img.jpg",
    alt: "클로버 평면도",
  };

  const floorInfoItems = [
    {
      label: "위치",
      value: "클로버 (8층)",
    },
    {
      label: "면적",
      value: "173㎡",
    },
    {
      label: "사이즈",
      value: "가로 7.9m * 세로 21.9m * 높이 2.7m",
    },
    {
      label: "문의",
      value: "051-731-9800",
    },
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="클로버 clover"
        titleHighlight="클로버"
        description="클로버룸은 아늑하고 모던한 인테리어에 첨단 회의 설비를 갖춘 다목적 비즈니스 공간입니다. 국제회의, 기업 간담회, 세미나 등 다양한 목적의 행사를 품격 있게 연출할 수 있으며, 세심하게 구성된 실내 분위기가 한층 더 집중도 높은 시간을 선사합니다. 
※ 클로버룸이 있는 8층 중앙에 위치한 야외 옥상정원에서는 회의 중간 여유로운 휴식과 함께, 도심과 바다를 아우르는 탁 트인 조망을 경험하실 수 있습니다."
        images={images}
        showReservation={true}
      />
      <Box mt={{ base: "20px", md: "30px", lg: "50px", "2xl": "100px" }}>
        <HeadingH4>회의실안내 (8층 클로버)</HeadingH4>
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
      <MeetingFloorInfo floorImage={floorImage} infoItems={floorInfoItems} />
    </PageContainer>
  );
}
