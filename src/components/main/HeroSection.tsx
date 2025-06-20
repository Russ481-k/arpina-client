"use client";

import {
  Box,
  Flex,
  Image,
  Link,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const flexDirection = useBreakpointValue<"row" | "column">({
    base: "column",
    lg: "row",
  });
  const heroBoxWidth = useBreakpointValue({ base: "100%", lg: "480px" });

  return (
    <>
      <Global
        styles={{
          "@keyframes slideUp": {
            "0%": {
              opacity: 0,
              transform: "translateY(50px)",
            },
            "100%": {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
          ".slide-content": {
            opacity: 0,
            transform: "translateY(50px)",
          },
          ".slide-content.active": {
            animation: "slideUp 0.8s ease-out forwards",
          },
          ".swiper-container::before": {
            content: "''",
            position: "absolute",
            left: 0,
            bottom: 0,
            backgroundColor: "#fff",
            width: "427px",
            height: "82px",
            zIndex: 1,
            pointerEvents: "none",
          },
        }}
      />
      <Box className="msec01" mb={{ base: "25px", md: "45px" }}>
        <Box
          w={"100%"}
          maxW={"1600px"}
          mx="auto"
          my={0}
          px={{ base: 4, md: 0 }}
        >
          <Flex className="msec01-box" gap={5} direction={flexDirection}>
            <Box
              flex="1 1 0"
              position="relative"
              overflow="hidden"
              className="swiper-container"
            >
              <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => {
                  setActiveSlide(swiper.activeIndex);

                  // 모든 슬라이드 컨텐츠에서 active 클래스 제거
                  const allContents =
                    document.querySelectorAll(".slide-content");
                  allContents.forEach((content) => {
                    content.classList.remove("active");
                  });

                  // 현재 활성화된 슬라이드의 컨텐츠에 active 클래스 추가
                  setTimeout(() => {
                    const activeContents = document.querySelectorAll(
                      `.swiper-slide-active .slide-content`
                    );
                    activeContents.forEach((content) => {
                      content.classList.add("active");
                    });
                  }, 50);
                }}
              >
                <SwiperSlide>
                  <Link
                    href="/sports/swimming/lesson"
                    w="100%"
                    position="relative"
                    display="block"
                  >
                    <Box position="relative" w="100%">
                      <Box
                        className={`slide-content ${
                          activeSlide === 0 ? "active" : ""
                        }`}
                        position="absolute"
                        bottom="0"
                        left="0"
                      >
                        <Text
                          py={6}
                          fontSize="30px"
                          fontWeight="semibold"
                          color="#1F2732"
                        >
                          기억에 남을 완벽한 하루, 아르피나
                        </Text>
                      </Box>
                      <Box position="relative" w="100%">
                        <Image
                          src="/images/contents/msec01_sld_img02.png"
                          alt="새로운 여정의 시작"
                          w="100%"
                          h="auto"
                          objectFit="cover"
                        />
                      </Box>
                    </Box>
                  </Link>
                </SwiperSlide>
              </Swiper>
            </Box>
            <Box
              backgroundColor="#2E3192"
              borderRadius="20px"
              w={heroBoxWidth}
              overflow="hidden"
            >
              <Box w="auto" h="auto">
                <Image
                  src="/images/contents/main_0.png"
                  alt="호텔 실시간 예약"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  cursor="pointer"
                  onClick={() => {
                    window.open(
                      "https://hub.hotelstory.com/aG90ZWxzdG9yeQ/rooms?v_Use=MTAwMTg5MA",
                      "_blank"
                    );
                  }}
                />
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>
    </>
  );
}
