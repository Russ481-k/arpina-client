"use client";

import {
  Box,
  Text,
  Flex,
  Heading,
  Highlight,
  Button,
  Mark,
  Image,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { usePathname } from "next/navigation";

// Swiper 스타일 임포트
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

interface InfoTopBoxProps {
  title: string;
  titleHighlight: string;
  description: string;
  images: string[];
  buttonOnClick?: () => void;
  showReservation?: boolean; // 실시간 예약 섹션 표시 유무
  downloadInfo?: {
    text: string;
    url: string;
    fileName?: string;
  };
}

export default function InfoTopBox({
  title,
  titleHighlight,
  description,
  images,
  buttonOnClick,
  showReservation = true, // 기본값은 true로 설정
  downloadInfo,
}: InfoTopBoxProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const pathname = usePathname();

  // 라우트 경로에 따른 전화번호 설정
  const getPhoneNumber = () => {
    if (pathname?.includes("/meeting/")) {
      return "051-740-9800"; // 세미나 섹션 전화번호
    } else if (pathname?.includes("/rooms/")) {
      return "051-731-9802"; // 베드룸 섹션 전화번호
    } else if (pathname?.includes("/sports/futsal")) {
      return "051-740-3271"; // 풋살장 섹션 전화번호
    } else {
      return "051-731-9800"; // 기본 전화번호
    }
  };

  const phoneNumber = getPhoneNumber();

  // 다운로드 버튼 클릭 핸들러
  const handleDownload = () => {
    if (downloadInfo?.url) {
      const link = document.createElement("a");
      link.href = downloadInfo.url;
      link.download = downloadInfo.fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 폰트사이즈를 Chakra 토큰 기반으로 변환
  const titleSize = useBreakpointValue({
    base: "lg",
    md: "xl",
    lg: "2xl",
    xl: "4xl",
  });
  const highlightSize = useBreakpointValue({
    base: "xl",
    md: "2xl",
    lg: "3xl",
    xl: "5xl",
  });
  const descSize = useBreakpointValue({
    base: "lg",
    md: "xl",
    lg: "2xl",
    xl: "3xl",
  });
  const btnFontSize = useBreakpointValue({
    base: "md",
    md: "lg",
    lg: "xl",
    xl: "2xl",
  });
  const infoFontSize = useBreakpointValue({
    base: "sm",
    md: "md",
    lg: "lg",
    xl: "2xl",
  });
  const phoneFontSize = useBreakpointValue({
    base: "md",
    md: "lg",
    lg: "xl",
    xl: "2xl",
  });
  const resFontSize = useBreakpointValue({
    base: "md",
    md: "lg",
    lg: "xl",
    xl: "2xl",
  });

  // 고정값 설정
  const buttonText = "CLICK!";

  const flexDir = useBreakpointValue({
    base: "column",
    md: "row",
  });
  const textBoxW = useBreakpointValue({
    base: "100%",
    md: "51.25%",
  });
  const imgBoxW = useBreakpointValue({
    base: "100%",
    md: "42.8125%",
  });
  const gap = useBreakpointValue({ base: "15px", md: "5.9375%" });

  return (
    <Box className="info-top-box">
      <Flex
        justifyContent="space-between"
        alignItems="center"
        gap={gap}
        flexDirection={flexDir}
      >
        <Box width={textBoxW} order={{ base: 2, md: 1 }}>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading
              as="h3"
              style={{
                position: "relative",
                color: "#838383",
                fontWeight: "light",
                lineHeight: "1.1",
              }}
              paddingLeft={{ base: "10px", md: "20px", lg: "50px" }}
              fontSize={titleSize}
              _before={{
                content: '""',
                position: "absolute",
                borderRadius: "3px",
                width: { base: "3px", md: "5px", lg: "10px" },
                height: "100%",
                backgroundColor: "#2E3192",
                left: "0",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <Highlight
                query={titleHighlight}
                styles={{
                  display: "block",
                  color: "#373636",
                  fontWeight: "bold",
                  fontSize: highlightSize,
                }}
              >
                {title}
              </Highlight>
            </Heading>
            <Box
              color="#373636"
              fontWeight="bold"
              textAlign="right"
              fontSize={infoFontSize}
            >
              <Text fontSize={infoFontSize}>문의 및 예약</Text>
              <Text fontSize={phoneFontSize}>{phoneNumber}</Text>
            </Box>
          </Flex>
          <Text
            mt={{ base: "14px", md: "30px", lg: "95px" }}
            color="#393939"
            fontWeight="semibold"
            lineHeight="1.2"
            fontSize={descSize}
            dangerouslySetInnerHTML={{ __html: description }}
          />

          {/* 다운로드 버튼 */}
          {downloadInfo && (
            <Box mt={{ base: "10px", md: "20px", lg: "30px" }}>
              <Button
                size={{ base: "sm", md: "md", lg: "lg" }}
                rounded="xl"
                colorPalette="blue"
                variant="solid"
                w="auto"
                px={{ base: 4, md: 6, lg: 8 }}
                py={{ base: 2, md: 3, lg: 4 }}
                fontWeight="bold"
                lineHeight="1"
                fontSize={btnFontSize}
                onClick={handleDownload}
                backgroundColor="#FAB20B"
                color="white"
                _hover={{
                  backgroundColor: "#E4A30D",
                }}
              >
                {downloadInfo.text}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="25"
                  viewBox="0 0 24 25"
                  fill="none"
                >
                  <path
                    d="M12 16.5L7 11.5L8.4 10.05L11 12.65V4.5H13V12.65L15.6 10.05L17 11.5L12 16.5ZM6 20.5C5.45 20.5 4.97933 20.3043 4.588 19.913C4.19667 19.5217 4.00067 19.0507 4 18.5V15.5H6V18.5H18V15.5H20V18.5C20 19.05 19.8043 19.521 19.413 19.913C19.0217 20.305 18.5507 20.5007 18 20.5H6Z"
                    fill="white"
                  />
                </svg>
              </Button>
            </Box>
          )}

          {showReservation && (
            <Box className="info-res-box">
              <Text
                display="flex"
                alignItems="center"
                justifyContent="center"
                mt={{ base: "10px", md: "20px", lg: "60px" }}
                mb="15px"
                color="#393939"
                fontWeight="semibold"
                fontSize={resFontSize}
              >
                지금 바로 <Mark color="#2E3192">실시간</Mark> 예약하러 가기 !
                <Image src="/images/contents/top_info_icon01.png" alt="" />
              </Text>
              <Button
                size={{ base: "sm", md: "md", lg: "lg" }}
                rounded="2xl"
                colorPalette="gray"
                variant="subtle"
                w="100%"
                py={{ base: 2, md: 3, lg: 5 }}
                fontWeight="bold"
                lineHeight="1"
                fontSize={btnFontSize}
                onClick={buttonOnClick}
              >
                {buttonText}
              </Button>
            </Box>
          )}
        </Box>
        <Box width={imgBoxW} order={{ base: 1, md: 2 }}>
          {/* 메인 슬라이더 */}
          <Swiper
            modules={[Thumbs]}
            spaceBetween={10}
            thumbs={{
              swiper: thumbsSwiper ? thumbsSwiper : null,
            }}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <Box
                  width="100%"
                  height="100%"
                  position="relative"
                  overflow="hidden"
                  borderRadius="2xl"
                >
                  <Image
                    src={image}
                    alt={`${title} 이미지 ${index + 1}`}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 썸네일 슬라이더 */}
          <Swiper
            onSwiper={(swiper) => setThumbsSwiper(swiper)}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[Thumbs]}
            style={{ width: "100%" }}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <Box
                  width="100%"
                  height="100%"
                  position="relative"
                  overflow="hidden"
                  borderRadius="xl"
                  cursor="pointer"
                  opacity={0.6}
                  transition="opacity 0.3s"
                  _hover={{ opacity: 1 }}
                >
                  <Image
                    src={image}
                    alt={`${title} 썸네일 ${index + 1}`}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Flex>
    </Box>
  );
}
