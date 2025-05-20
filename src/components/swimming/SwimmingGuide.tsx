"use client";

import { Box, Flex, Text, Image } from "@chakra-ui/react";

const guideTitleStyle = {
  fontFamily: "'Paperlogy', sans-serif",
  fontStyle: "normal",
  fontWeight: "700",
  fontSize: "30px",
  lineHeight: "35px",
  display: "flex",
  alignItems: "center",
  letterSpacing: "-0.05em",
  color: "#00636F",
  flex: "none",
  flexGrow: 0,
};

const guideItemTextStyle = {
  width: "100%",
  height: "16px",
  fontFamily: "'Paperlogy', sans-serif",
  fontStyle: "normal",
  fontWeight: "500",
  fontSize: "14px",
  lineHeight: "16px",
  display: "flex",
  alignItems: "center",
  letterSpacing: "-0.05em",
  color: "#373636",
  flex: "none",
  alignSelf: "stretch",
  flexGrow: 0,
};

export const SwimmingGuide = () => {
  return (
    <Flex
      direction="row"
      align="flex-start"
      padding="0px"
      gap="60px"
      width="1600px"
      height="374px"
      position="relative"
      mb={10}
    >
      {/* Left side image */}
      <Box
        width="235.88px"
        height="374px"
        flex="none"
        order={0}
        flexGrow={0}
        position="relative"
      >
        <Image
          src="/images/swimming/guide-image.png"
          alt="수영장 가이드 이미지"
          width={235.9}
          height={373.97}
          position="absolute"
          left="0px"
          top="0px"
        />
      </Box>

      {/* Right side content */}
      <Flex
        direction="column"
        align="flex-start"
        padding="0px"
        gap="15px"
        width="1303px"
        height="374px"
        flex="none"
        order={1}
        flexGrow={0}
      >
        {/* 수영장 온라인 신청 순서 - Title */}
        <Text {...guideTitleStyle} width="290px" height="35px" order={0}>
          수영장 온라인 신청 순서
        </Text>

        {/* 수영장 온라인 신청 순서 - Content Box */}
        <Flex
          direction="column"
          align="flex-start"
          padding="20px"
          gap="5px"
          width="1250px"
          height="119px"
          bg="#F7F8FB"
          borderRadius="10px"
          flex="none"
          order={1}
          flexGrow={0}
        >
          <Text {...guideItemTextStyle} order={0}>
            1. 신청시각이 되면, 신청하기 버튼이 활성화 됩니다
          </Text>
          <Text {...guideItemTextStyle} order={1}>
            2. 원하는 강습 일정과 시간을 확인 후 신청해 주세요
          </Text>
          <Text {...guideItemTextStyle} order={2}>
            3. 사물함 신청시 추가 옵션을 확인 해주세요 (추가 : 5,000원)
          </Text>
          <Text {...guideItemTextStyle} order={3}>
            4. 신청 후 1시간 내에 마이페이지에서 결제 후 확정 됩니다
          </Text>
        </Flex>

        {/* 수영장 온라인 신청 가이드 - Title */}
        <Text {...guideTitleStyle} width="315px" height="35px" order={2}>
          수영장 온라인 신청 가이드
        </Text>

        {/* 수영장 온라인 신청 가이드 - Content Box */}
        <Flex
          direction="column"
          align="flex-start"
          padding="20px"
          gap="5px"
          width="1250px"
          height="140px"
          bg="#F7F8FB"
          borderRadius="10px"
          flex="none"
          order={3}
          flexGrow={0}
        >
          <Text {...guideItemTextStyle} order={0}>
            • 원하는 강습 일정과 시간을 확인 후 신청해 주세요 (금액 : 60,000원)
          </Text>
          <Text {...guideItemTextStyle} order={1}>
            • 신규등록 : 매월 25일 ~ 말일 까지
          </Text>
          <Text {...guideItemTextStyle} order={2}>
            • 재등록 : 매월 18일 ~ 22일 까지 (마이페이지를 통해 재등록 가능)
          </Text>
          <Text {...guideItemTextStyle} order={3}>
            • 수영장 온라인 신규 신청은 회원가입 후 신청 가능합니다
          </Text>
          <Text {...guideItemTextStyle} order={4}>
            • 만 19세 이상만 온라인 신청 가능합니다
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
