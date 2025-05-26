"use client";

import { Box, List, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

// 리스트 아이템 스타일을 위한 공통 컴포넌트
interface StyledListItemProps {
  children: ReactNode;
  color?: string;
  isNested?: boolean;
}

const StyledListItem = ({
  children,
  color = "#393939",
  isNested = false,
}: StyledListItemProps) => (
  <List.Item
    _marker={{ fontSize: "0" }}
    color={color}
    fontSize="lg"
    style={{
      display: "flex",
      flexFlow: "row wrap",
      alignItems: "center",
      marginTop: "10px",
    }}
    _before={{
      content: '"·"',
      alignSelf: "flex-start",
      marginRight: "10px",
    }}
  >
    {children}
    {isNested && <List.Root ps="3" w={"100%"} />}
  </List.Item>
);

// 이용안내 데이터 (계층 구조)
interface GuideItem {
  text: string;
  subItems?: string[];
}

const guideItems: GuideItem[] = [
  {
    text: "상기요금은 정상요금이며 부가세 포함입니다.",
  },
  {
    text: "체크인 오후 3:00부터 체크아웃 오전 11:00까지",
  },
  {
    text: "자세한 상담은 051-731-9800 예약실로 문의하여 주시길 바랍니다.",
  },
  {
    text: "객실 내 발생되는 음식물 쓰레기 및 재활용 쓰레기는 3층 복도 끝 세탁실 옆 재활용 분리수거함에 분리수거 바랍니다.",
  },
  {
    text: "객실 레이트 체크아웃 관련",
    subItems: [
      "적용내용 : 15:00까지, 요청일 1박이용요금 50% 적용",
      "입실 당일 또는 퇴실일 오전 프론트(740-3201) 협의 후 가능",
    ],
  },
];

const OperGuide: React.FC = () => {
  return (
    <Box
      className="oper-guide"
      style={{
        backgroundColor: "#F7F8FB",
        borderRadius: "20px",
        marginTop: "60px",
        padding: "20px",
      }}
    >
      <Text color="#393939" fontSize="2xl" fontWeight="medium">
        - 이용안내
      </Text>
      <List.Root>
        {guideItems.map((item, index) => (
          <StyledListItem key={`guide-${index}`} isNested={!!item.subItems}>
            {item.text}
            {item.subItems && (
              <List.Root ps="3" w={"100%"}>
                {item.subItems.map((subItem, subIndex) => (
                  <StyledListItem
                    key={`sub-${index}-${subIndex}`}
                    color="#838383"
                  >
                    {subItem}
                  </StyledListItem>
                ))}
              </List.Root>
            )}
          </StyledListItem>
        ))}
      </List.Root>
      <Text mt="10px" color="#FAB20B" fontWeight="semibold" fontSize="lg">
        객실 판매 상황에 따라 거절 될수 있음.
      </Text>
    </Box>
  );
};

export default OperGuide;
