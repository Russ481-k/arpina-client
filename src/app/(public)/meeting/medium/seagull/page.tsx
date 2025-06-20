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
    "/images/contents/seagull_img01.jpg",
    "/images/contents/seagull_img02.jpg",
    "/images/contents/seagull_img03.jpg",
  ];

  const meetingRoomRows = [
    {
      columns: [
        { header: "규모", content: "180㎡" },
        { header: "사이즈", content: "가로 8m * 세로 22.5.m * 높이 3m" },
        { header: "스크린", content: "200Inch" },
        { header: "정원", content: "100명" },
        { header: "표준요금", content: "990,000원" },
      ],
    },
  ];

  const floorImage = {
    src: "/images/contents/seagull_floor_img.jpg",
    alt: "시걸 평면도",
  };

  const floorInfoItems = [
    {
      label: "위치",
      value: "시걸 (8층)",
    },
    {
      label: "면적",
      value: "180㎡",
    },
    {
      label: "사이즈",
      value: "가로 8m * 세로 22.5.m * 높이 3m",
    },
    {
      label: "문의",
      value: "051-731-9800",
    },
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="시걸 Seagull"
        titleHighlight="시걸"
        description="시걸룸은 해운대 바다 풍경을 일부 조망할 수 있는 차분하고 품격 있는 비즈니스 공간입니다. 3m의 높은 층고와 최대 100명까지 수용 가능한 넉넉한 규모를 갖춘 세미나실로, 기업 간담회, 워크숍, 소규모 국제회의 등 다양한 비즈니스 행사를 안정적으로 운영하실 수 있습니다. 
새롭게 전자교탁이 설치되고, 세미나 테이블과 의자가 교체되어 보다 쾌적하고 효율적인 회의 환경을 제공합니다. 세련된 분위기 속에서 한층 완성도 높은 비즈니스 시간을 경험해보시기 바랍니다. 
※ 시걸룸이 있는 8층 중앙에 위치한 야외 옥상정원에서는 회의 중간 여유로운 휴식과 함께, 도심과 바다를 아우르는 탁 트인 조망을 경험하실 수 있습니다."
        images={images}
        showReservation={false}
      />
      <Box mt={{ base: "20px", md: "30px", lg: "50px", "2xl": "100px" }}>
        <HeadingH4>회의실안내 (8층 시걸)</HeadingH4>
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
