"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import ApTable03 from "@/components/contents/ApTable03";
import { Box } from "@chakra-ui/react";
import InfoBoxList01 from "@/components/contents/InfoBoxList01";

export default function FeePage() {
  const tableRows = [
    // Header rows
    {
      isHeader: true,
      columns: [
        { header: "구 분", rowSpan: 2, width: "11%" },
        { header: "종 목", rowSpan: 2, colSpan: 2, width: "22%" },
        { header: "이 용 기 간", colSpan: 4, width: "44%" },
        { header: "비 고", rowSpan: 2, width: "auto" },
      ],
    },
    {
      isHeader: true,
      columns: [
        { header: "1개월", width: "11%" },
        { header: "3개월(10% DC)", width: "11%" },
        { header: "6개월(15% DC)", width: "11%" },
        { header: "12개월(20% DC)", width: "11%" },
      ],
    },
    // Body rows
    {
      isHeader: false,
      columns: [
        { content: "단일<br/>종목", rowSpan: 3 },
        { content: "수영", rowSpan: 2 },
        { content: "매일강습" },
        { content: "115,000" },
        { content: "310,000" },
        { content: "586,000" },
        { content: "1,104,000" },
        {
          content:
            "06시~22시<br/>* 평일 자유수영 제한 09~12시<br/>* 주말 운영시간 07~17시<br/>(제한 시간대 없음)",
          rowSpan: 2,
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "자유수영" },
        { content: "95,000" },
        { content: "256,000" },
        { content: "484,000" },
        { content: "912,000" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "골프" },
        { content: "연습장" },
        { content: "200,000" },
        { content: "570,000" },
        { content: "1,080,000" },
        { content: "2,040,000" },
        { content: "이용시간(회원대상)<br/>15시 이전(100분) / 이후(80분)" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "부대<br/>시설" },
        { content: "사물함" },
        { content: "골프" },
        { content: "10,000" },
        { content: "30,000" },
        { content: "60,000" },
        { content: "100,000" },
        { content: " " },
      ],
    },
  ];
  const infoItems01 = [
    "할인율의 경우 단일종목 골프(연습장)는 3개월 5%, 6개월 10%, 12개월 15%의 할인이 적용됩니다.",
    "환불은 탈회신청서 제출일을 기준으로 환불 처리되며, 위약금은 이용 개시일 전후 회원의 귀책 사유로 계약 해지시 총 결제금액(전체금액)의 10% 및 고객께서 이용하신 일 수에 해당하는 금액을 공제한 후 환불 처리됩니다.",
  ];

  return (
    <PageContainer>
      <Box>
        <ApTable03
          rows={tableRows}
          className="ap-table03"
          visuallyHiddenText="스포츠 요금표로 구분,종목,이용기간(1개월,3개월(10% DC),6개월(15% DC),12개월(20% DC)),비고 정보제공"
        />
        <InfoBoxList01 items={infoItems01} />
      </Box>
    </PageContainer>
  );
}
