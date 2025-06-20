"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import MeetingSeatInfo from "@/components/contents/MeetingSeatInfo";
import MeetingFloorInfo from "@/components/contents/MeetingFloorInfo";
import HeadingH4 from "@/components/contents/HeadingH4";
import ApTable02 from "@/components/contents/ApTable02";
import { Box, Text } from "@chakra-ui/react";

export default function ParticipantsPage() {
  const images = ["/images/contents/ocean_img01.jpg"];

  const meetingRoomRows = [
    {
      columns: [
        { header: "규모", content: "59.28㎡" },
        { header: "사이즈", content: "가로 7.8m * 세로 7.8m * 높이 2.7m" },
        { header: "스크린", content: "80Inch" },
        { header: "정원", content: "20명" },
        { header: "표준요금", content: "220,000원" },
      ],
    },
  ];

  const floorImage = {
    src: "/images/contents/ocean_floor_img.jpg",
    alt: "오션 평면도",
  };

  const floorInfoItems = [
    {
      label: "위치",
      value: "오션 (2층)",
    },
    {
      label: "면적",
      value: "59.28㎡",
    },
    {
      label: "사이즈",
      value: "가로 7.8m * 세로 7.8m * 높이 2.7m",
    },
    {
      label: "문의",
      value: "051-731-9800",
    },
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="오션 Ocean"
        titleHighlight="오션"
        description="아르피나 2층에 위치한 오션 회의실은 기업 및 각종 단체의 소규모 세미나와 간담회에 적합한 공간으로, 쾌적하고 집중도 높은 환경을 제공하여 원활한 행사 운영을 지원합니다."
        images={images}
        showReservation={false}
      />
      <Box mt={{ base: "20px", md: "30px", lg: "50px", "2xl": "100px" }}>
        <HeadingH4>회의실안내 (2층 오션)</HeadingH4>
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
