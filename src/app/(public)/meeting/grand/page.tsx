"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import MeetingRoomInfo from "@/components/contents/MeetingRoomInfo";
import MeetingSeatInfo from "@/components/contents/MeetingSeatInfo";
import MeetingFloorInfo from "@/components/contents/MeetingFloorInfo";

export default function ParticipantsPage() {
  const images = [
    "/images/contents/grand_img01.jpg",
    "/images/contents/grand_img02.jpg",
    "/images/contents/grand_img03.jpg",
  ];

  const meetingRoomData = {
    size: "543.15㎡",
    dimensions: "가로 20.715m * 세로 26.22.m * 높이 4m",
    screen: "200Inch",
    capacity: "250명",
    price: "1,980,000원",
  };

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
        description="대규모 국제회의와 학회, 기업 연수까지 소화 가능한 그랜드볼룸은 아르피나 최대 규모의 회의실로, 음향·조명·빔프로젝터 등 고급 기자재를 완비해 품격 있는 행사를 연출하실 수 있습니다."
        images={images}
        showReservation={false}
      />
      <MeetingRoomInfo
        title="회의실안내 (2층 그랜드 볼룸)"
        subtitle="출장뷔페 및 외부 음식물 반입금지"
        data={meetingRoomData}
      />
      <MeetingSeatInfo />
      <MeetingFloorInfo floorImage={floorImage} infoItems={floorInfoItems} />
    </PageContainer>
  );
}
