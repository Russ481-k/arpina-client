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
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";

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
}

export default function InfoTopBox({
  title,
  titleHighlight,
  description,
  images,
  buttonOnClick,
  showReservation = true, // 기본값은 true로 설정
}: InfoTopBoxProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  // 고정값 설정
  const phoneNumber = "051-731-9800";
  const buttonText = "CLICK!";

  return (
    <Box className="info-top-box">
      <Flex justifyContent="space-between" alignItems="center" gap="5.9375%">
        <Box width="51.25%">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading
              as="h3"
              style={{
                position: "relative",
                paddingLeft: "50px",
                color: "#838383",
                fontSize: "2xl",
                fontWeight: "light",
                lineHeight: "1.1",
              }}
              _before={{
                content: '""',
                position: "absolute",
                borderRadius: "3px",
                width: "10px",
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
                  fontSize: "5xl",
                  fontWeight: "bold",
                }}
              >
                {title}
              </Highlight>
            </Heading>
            <Box
              style={{
                color: "#373636",
                fontSize: "28px",
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              <Text>문의 및 예약</Text>
              <Text>{phoneNumber}</Text>
            </Box>
          </Flex>
          <Text
            style={{
              marginTop: "95px",
              color: "#393939",
              fontSize: "32px",
              fontWeight: "semibold",
              lineHeight: "1.2",
            }}
          >
            {description}
          </Text>
          {showReservation && (
            <Box className="info-res-box">
              <Text
                display="flex"
                alignItems="center"
                justifyContent="center"
                mt="60px"
                mb="15px"
                color="#393939"
                fontSize="3xl"
                fontWeight="semibold"
              >
                지금 바로 <Mark color="#2E3192">실시간</Mark> 예약하러 가기 !
                <Image src="/images/contents/top_info_icon01.png" alt="" />
              </Text>
              <Button
                size="lg"
                rounded="2xl"
                colorPalette="gray"
                variant="subtle"
                w="100%"
                py={5}
                fontSize="3xl"
                fontWeight="bold"
                lineHeight="1"
                onClick={buttonOnClick}
              >
                {buttonText}
              </Button>
            </Box>
          )}
        </Box>
        <Box width="42.8125%">
          {/* 메인 슬라이더 */}
          <Swiper
            modules={[Navigation, Thumbs]}
            spaceBetween={10}
            navigation={true}
            thumbs={{
              swiper: thumbsSwiper ? thumbsSwiper : null,
            }}
            style={{ width: "100%", height: "400px", marginBottom: "10px" }}
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
            style={{ width: "100%", height: "80px" }}
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
