"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import MeetingSeatInfo from "@/components/contents/MeetingSeatInfo";
import MeetingFloorInfo from "@/components/contents/MeetingFloorInfo";
import HeadingH4 from "@/components/contents/HeadingH4";
import ApTable02 from "@/components/contents/ApTable02";
import { Box, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function ParticipantsPage() {
  const router = useRouter();
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
        description="자스민룸은 회의와 세미나에 적합한 음향·영상 설비를 갖춘 다목적 비즈니스 공간입니다. 아늑하고 쾌적한 실내 분위기 속에서 기업 간담회, 워크숍, 소규모 국제회의 등 다양한 행사를 효율적으로 운영하실 수 있으며, 창 너머로 보이는 바깥 풍경이 공간에 여유로움을 더합니다. 
※ 자스민룸이 있는 8층 중앙에 위치한 야외 옥상정원에서는 회의 중간 여유로운 휴식과 함께, 도심과 바다를 아우르는 탁 트인 조망을 경험하실 수 있습니다."
        images={images}
        showReservation={true}
        buttonOnClick={() => router.push("/meeting/estimate")}
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
