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
    "/images/contents/grand_img01.jpg",
    "/images/contents/grand_img02.jpg",
    "/images/contents/grand_img03.jpg",
  ];

  const meetingRoomRows = [
    {
      columns: [
        { header: "규모", content: "543.15㎡" },
        { header: "사이즈", content: "가로 20.715m * 세로 26.22.m * 높이 4m" },
        { header: "스크린", content: "200Inch" },
        { header: "정원", content: "250명" },
        { header: "표준요금", content: "1,980,000원" },
      ],
    },
  ];

  const floorImage = {
    src: "/images/contents/grand_floor_img.jpg",
    alt: "그랜드 볼룸 평면도",
  };

  const floorInfoItems = [
    {
      label: "위치",
      value: "그랜드볼륨(2층-국제회의실)",
    },
    {
      label: "면적",
      value: "543.15㎡",
    },
    {
      label: "사이즈",
      value: "가로 20.715m * 세로 26.22.m * 높이 4m",
    },
    {
      label: "문의",
      value: "051-731-9800",
    },
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="그랜드 볼룸 Grand Ballroom"
        titleHighlight="그랜드 볼룸"
        description="그랜드볼룸은 아르피나 최대 규모로 250명까지 수용 가능한 규모를 갖춘 회의실로 대규모 국
          제회의와 학회, 기업 연수까지 다양한 형태의 행사가 가능한 회의실로, 음향·조명·빔프로젝터
          등 고급 기자재를 완비해 품격 있는 행사를 연출하실 수 있습니다."
        images={images}
        showReservation={true}
        buttonOnClick={() => router.push("/meeting/estimate")}
        descriptionStyle={{
          textAlign: "justify",
          lineHeight: "1.3",
        }}
      />
      <Box mt={{ base: "20px", md: "30px", lg: "50px", "2xl": "100px" }}>
        <HeadingH4>회의실안내 (2층 그랜드 볼룸)</HeadingH4>
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
