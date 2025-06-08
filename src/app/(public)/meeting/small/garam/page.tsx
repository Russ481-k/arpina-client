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
        description="국제회의 및 학회부터 소규모 교육과 워크숍까지! <br />
다양한 규모의 회의실을 갖추어 성공적인 비즈니스를 지원합니다."
        images={images}
        showReservation={false}
      />
      <Box mt="100px">
        <HeadingH4>회의실안내 (1층 가람/누리)</HeadingH4>
        <Text
          mt="10px"
          mb="60px"
          color="#FAB20B"
          fontSize="3xl"
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
