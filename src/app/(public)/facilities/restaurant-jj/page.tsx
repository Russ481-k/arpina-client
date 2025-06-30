"use client";

import { Box } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import ApTable01 from "@/components/contents/ApTable01";
import HeadingH4 from "@/components/contents/HeadingH4";
import ApTable02 from "@/components/contents/ApTable02";

export default function ParticipantsPage() {
  const images = [
    "/images/contents/jj_img01.jpg",
    "/images/contents/jj_img02.jpg",
    "/images/contents/jj_img03.jpg",
    "/images/contents/jj_img04.jpg",
    "/images/contents/jj_img05.jpg",
    "/images/contents/jj_img06.jpg",
  ];

  const tableRows01 = [
    {
      header: "위치",
      content: "아르피나 프론트 맞은편 오른쪽 끝",
    },
    {
      header: "면적",
      content: "약 120평",
    },
    {
      header: "좌석 수",
      content: "총 240석",
    },
    {
      header: "동시 수용 인원",
      content: "회차별 식사 로테이션(3,4회 기준), 약 700 ~ 800명 수용 가능",
    },

    {
      header: "특징",
      content: (
        <>
          야외운동장: 1,350㎡ (약 408평) <br />
          실내연습장: 134㎡ (약 40.5평, 우천 시 이용 가능)
        </>
      ),
    },
    {
      header: "운영시간",
      content: (
        <>
          고출력 음향기기를 사용하지 않는 간단한 연회행사가 가능 (배식대 사이의
          공간을 행사진행 공간으로 이용가능) <br />
          고정 뷔페 베이 4곳 구성
        </>
      ),
    },
  ];

  const tableRows02 = [
    {
      columns: [
        { header: "구분", content: "성인" },
        { header: "요금", content: "14,000원 (부가세 포함)" },
        { header: "비고", content: "기본 요금" },
      ],
    },
    {
      columns: [
        { header: "구분", content: "초·중·고등학생" },
        { header: "요금", content: "11,000원" },
        { header: "비고", content: "할인 적용" },
      ],
    },
    {
      columns: [
        { header: "구분", content: "미취학 아동" },
        { header: "요금", content: "5,500원" },
        { header: "비고", content: "" },
      ],
    },
    {
      columns: [
        { header: "구분", content: "영유아" },
        { header: "요금", content: "무료" },
        { header: "비고", content: "" },
      ],
    },
    {
      columns: [
        { header: "구분", content: "외국인 (영유아 제외)" },
        { header: "요금", content: "14,000원 (부가세 포함)" },
        { header: "비고", content: "동일 요금 적용" },
      ],
    },
  ];

  const tableRows03 = [
    {
      header: "1베이",
      content: "메인 식사 메뉴 (단체 맞춤식단 포함)",
    },
    {
      header: "2베이",
      content: "샐러드, 과일 / 아침엔 빵, 잼, 토스터",
    },
    {
      header: "3베이",
      content: "커피, 차, 쿠키, 정수대",
    },
    {
      header: "4베이",
      content: "고기류 한식 또는 중식",
    },
    {
      header: "식기/위생 관리",
      content: "모든 그릇은 전용 타올로 깨끗이 정리 후 셋업",
    },
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="대식당(제이엔제이) J&J"
        titleHighlight="대식당(제이엔제이)"
        description="아르피나 프론트 오른편 끝에 위치한 대식당 ‘제이앤제이’는 총 240석 규모의 뷔페형 식당으로, 사전 예약제로 운영됩니다. 단체 손님과 행사 진행에 적합한 쾌적하고 편안한 식사 공간을 제공합니다."
        images={images}
        showReservation={false}
        descriptionStyle={{
          textAlign: "justify",
          lineHeight: "1.3",
        }}
      />
      <Box mt="100px">
        <HeadingH4>제이엔제이 공간 안내</HeadingH4>
        <ApTable01 rows={tableRows01} />
      </Box>
      <Box mt="100px">
        <HeadingH4>이용요금 안내 (2025년 1월 1일 기준)</HeadingH4>
        <ApTable02 rows={tableRows02} />
      </Box>
      <Box mt="100px">
        <HeadingH4>메뉴 및 베이 구성</HeadingH4>
        <ApTable01 rows={tableRows03} />
      </Box>
    </PageContainer>
  );
}
