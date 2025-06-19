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
    "/images/contents/jasmine_img01.jpg",
    "/images/contents/jasmine_img02.jpg",
    "/images/contents/jasmine_img03.jpg",
  ];

  const meetingRoomRows = [
    {
      columns: [
        { header: "규모", content: "138.84㎡" },
        { header: "사이즈", content: "가로 7.8m * 세로 18m * 높이 2.7m" },
        { header: "스크린", content: "100Inch" },
        { header: "정원", content: "50명" },
        { header: "표준요금", content: "660,000원" },
      ],
    },
  ];

  const floorImage = {
    src: "/images/contents/jasmine_floor_img.jpg",
    alt: "자스민 평면도",
  };

  const floorInfoItems = [
    {
      label: "위치",
      value: "자스민 (8층)",
    },
    {
      label: "면적",
      value: "138.84㎡",
    },
    {
      label: "사이즈",
      value: "가로 7.8m * 세로 18m * 높이 2.7m",
    },
    {
      label: "문의",
      value: "051-731-9800",
    },
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="자스민 jasmine"
        titleHighlight="자스민"
        description="국제회의 및 학회부터 소규모 교육과 워크숍까지! <br />
다양한 규모의 회의실을 갖추어 성공적인 비즈니스를 지원합니다."
        images={images}
        showReservation={false}
      />
      <Box mt={{ base: "20px", md: "30px", lg: "50px", "2xl": "100px" }}>
        <HeadingH4>회의실안내 (8층 자스민)</HeadingH4>
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
