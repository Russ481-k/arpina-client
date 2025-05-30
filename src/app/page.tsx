"use client";

import { Box, Flex, Heading, Text, Image, Tabs, Link } from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { getScrollbarStyle } from "@/styles/scrollbar";
import { useUserStyles } from "@/styles/theme";
import Layout from "@/components/layout/view/Layout";
import { useColorMode } from "@/components/ui/color-mode";
import { useMenu } from "@/lib/hooks/useMenu";
import { sortMenus } from "@/lib/api/menu";
import { useMemo, useState, useRef, useEffect } from "react";
import { STYLES } from "@/styles/theme-tokens";
import type { Styles } from "@/styles/theme";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { useRouter } from "next/navigation";

export default function Home() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { menus } = useMenu();
  const [activeSlide, setActiveSlide] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const router = useRouter();
  const treeMenus = useMemo(() => {
    try {
      // API 응답이 성공했는지 확인
      if (!menus?.success) {
        console.error("Menu API call was not successful");
        return [];
      }

      // data 배열이 존재하는지 확인
      const menuData = menus.data;
      if (!menuData || !Array.isArray(menuData)) {
        console.error("Menu data is not an array:", menuData);
        return [];
      }

      // 메뉴 데이터를 정렬해서 반환
      return sortMenus(menuData);
    } catch (error) {
      console.error("Error processing menu data:", error);
      return [];
    }
  }, [menus]);
  const styles = useUserStyles(STYLES as Styles);
  return (
    <Layout menus={treeMenus} currentPage="홈">
      <Global styles={getScrollbarStyle(isDark)} />
      <Global
        styles={{
          "@font-face": {
            fontFamily: "Tenada",
            src: "url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2210-2@1.0/Tenada.woff2') format('woff2')",
            fontWeight: "normal",
            fontStyle: "normal",
          },
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
          "@keyframes marquee": {
            "0%": {
              transform: "translateX(0)",
            },
            "100%": {
              transform: "translateX(-100%)",
            },
          },
          ".mflox-txt": {
            whiteSpace: "nowrap",
            width: "100%",
            marginTop: "20px",
            color: "rgba(46, 49, 146, 0.05)",
            fontSize: "180px",
            fontWeight: "bold",
            fontFamily: "Tenada",
            lineHeight: "1",
            overflow: "hidden",
            position: "relative",
            "& span": {
              display: "inline-block",
              animation: "marquee 40s linear infinite",
              whiteSpace: "nowrap",
            },
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
          ".notice-item": {
            padding: "28px",
            display: "flex",
            alignItems: "center",
            gap: "28px",
            borderRadius: "50px",
            border: "1px solid",
            transition: "all 0.3s ease-out",
            "&:hover": {
              color: "#fff",
              "& .notice-title": {
                color: "#fff",
              },
              "& .notice-date": {
                color: "#fff",
              },
            },
          },
          ".notice-item.notice": {
            borderColor: "#2E3192",
            "&:hover": {
              backgroundColor: "#2E3192",
              "& .notice-cate": {
                backgroundColor: "#fff",
                color: "#2E3192",
              },
            },
            "& .notice-cate": {
              backgroundColor: "#2E3192",
            },
          },
          ".notice-item.promotion": {
            borderColor: "#FAB20B",
            "&:hover": {
              backgroundColor: "#FAB20B",
              "& .notice-cate": {
                backgroundColor: "#fff",
                color: "#FAB20B",
              },
            },
            "& .notice-cate": {
              color: "#fff",
              backgroundColor: "#FAB20B",
            },
          },
          ".notice-item.related": {
            borderColor: "#0C8EA4",
            "&:hover": {
              backgroundColor: "#0C8EA4",
              "& .notice-cate": {
                backgroundColor: "#fff",
                color: "#0C8EA4",
              },
            },
            "& .notice-cate": {
              backgroundColor: "#0C8EA4",
            },
          },
          ".notice-cate": {
            flexShrink: 0,
            width: "130px",
            textAlign: "center",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "50px",
            fontSize: "16px",
            fontWeight: "800",
          },
          ".notice-title": {
            color: "#232323",
            fontSize: "24px",
            fontWeight: "700",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          },
          ".notice-date": {
            marginLeft: "auto",
            color: "#808080",
            fontSize: "20px",
            fontWeight: "700",
          },
        }}
      />
      <Box
        as="main"
        id="mainContent"
        pt={100}
        fontFamily="'Paperlogy', sans-serif"
        lineHeight="1"
      >
        <Box className="msec01" mb={"45px"}>
          <Box w={"100%"} maxW={"1600px"} mx="auto" my={0}>
            <Heading
              as="h3"
              mb={6}
              fontSize="40px"
              fontWeight="bold"
              color={"#444445"}
              lineHeight={"1"}
              fontFamily="'Paperlogy', sans-serif"
            >
              당신의 새로운 여정이 시작 되는곳
            </Heading>
            <Flex className="msec01-box" gap={5}>
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
                          src="/images/contents/msec01_sld_img01.png"
                          alt="새로운 여정의 시작"
                          w="100%"
                          h="100%"
                          objectFit="cover"
                        />
                      </Box>
                    </Box>
                  </SwiperSlide>
                </Swiper>
              </Box>
              <Box
                backgroundColor="#2E3192"
                borderRadius="20px"
                w="480px"
                overflow="hidden"
              >
                <Box w="100%" h="100%">
                  이미지 영역
                </Box>
              </Box>
            </Flex>
          </Box>
        </Box>
        <Text className="mflox-txt">
          <span>Busan Youth Hostel Arpina Busan Youth Hostel Arpina</span>
        </Text>

        <Box className="msec02" mb={"80px"}>
          <Box w={"100%"} maxW={"1600px"} mx="auto" my={0}>
            <Flex gap={5}>
              <Box flex="1" minW="0">
                <Heading
                  as="h3"
                  fontSize="40px"
                  fontWeight="bold"
                  color={"#333333"}
                  lineHeight={"1"}
                  fontFamily="'Paperlogy', sans-serif"
                  mb={6}
                >
                  공지사항
                </Heading>
                <Tabs.Root
                  defaultValue="all"
                  colorPalette="purple"
                  variant="subtle"
                >
                  <Tabs.List
                    borderBottom="0"
                    style={{
                      display: "flex",
                      gap: "20px",
                      marginTop: "-65px",
                      paddingLeft: "160px",
                    }}
                  >
                    <Tabs.Trigger
                      value="all"
                      fontSize="lg"
                      fontWeight="semibold"
                      color="#5F5F5F"
                      transition="all 0.2s"
                      cursor="pointer"
                      _active={{
                        color: "#fff",
                        bg: "#2E3192",
                        borderRadius: "35px",
                      }}
                    >
                      전체
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="notice"
                      fontSize="lg"
                      fontWeight="semibold"
                      color="#5F5F5F"
                      transition="all 0.2s"
                      cursor="pointer"
                      _active={{
                        color: "#2E3192",
                        bg: "rgba(46, 49, 146, 0.05)",
                        borderBottom: "2px solid #2E3192",
                      }}
                    >
                      공지
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="promotion"
                      fontSize="lg"
                      fontWeight="semibold"
                      color="#5F5F5F"
                      transition="all 0.2s"
                      cursor="pointer"
                      _active={{
                        color: "#2E3192",
                        bg: "rgba(46, 49, 146, 0.05)",
                        borderBottom: "2px solid #2E3192",
                      }}
                    >
                      홍보
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="related"
                      fontSize="lg"
                      fontWeight="semibold"
                      color="#5F5F5F"
                      transition="all 0.2s"
                      cursor="pointer"
                      _active={{
                        color: "#2E3192",
                        bg: "rgba(46, 49, 146, 0.05)",
                        borderBottom: "2px solid #2E3192",
                      }}
                    >
                      유관기관홍보
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="all">
                    <Box>
                      <Flex
                        className="mnotice-list"
                        flexDirection={"column"}
                        gap={5}
                      >
                        <Link href="..." className="notice-item notice">
                          <Box as="span" className="notice-cate">
                            공지
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item related">
                          <Box as="span" className="notice-cate">
                            유관기관 홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item promotion">
                          <Box as="span" className="notice-cate">
                            홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item notice">
                          <Box as="span" className="notice-cate">
                            공지
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item related">
                          <Box as="span" className="notice-cate">
                            유관기관 홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                      </Flex>
                    </Box>
                  </Tabs.Content>
                  <Tabs.Content value="notice">
                    <Box>
                      <Flex
                        className="mnotice-list"
                        flexDirection={"column"}
                        gap={5}
                      >
                        <Link href="..." className="notice-item notice">
                          <Box as="span" className="notice-cate">
                            공지
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item notice">
                          <Box as="span" className="notice-cate">
                            공지
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item notice">
                          <Box as="span" className="notice-cate">
                            공지
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item notice">
                          <Box as="span" className="notice-cate">
                            공지
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item notice">
                          <Box as="span" className="notice-cate">
                            공지
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                      </Flex>
                    </Box>
                  </Tabs.Content>
                  <Tabs.Content value="promotion">
                    <Box>
                      <Flex
                        className="mnotice-list"
                        flexDirection={"column"}
                        gap={5}
                      >
                        <Link href="..." className="notice-item promotion">
                          <Box as="span" className="notice-cate">
                            홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item promotion">
                          <Box as="span" className="notice-cate">
                            홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item promotion">
                          <Box as="span" className="notice-cate">
                            홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item promotion">
                          <Box as="span" className="notice-cate">
                            홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item promotion">
                          <Box as="span" className="notice-cate">
                            홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                      </Flex>
                    </Box>
                  </Tabs.Content>
                  <Tabs.Content value="related">
                    <Box>
                      <Flex
                        className="mnotice-list"
                        flexDirection={"column"}
                        gap={5}
                      >
                        <Link href="..." className="notice-item related ">
                          <Box as="span" className="notice-cate">
                            유관기관홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item related ">
                          <Box as="span" className="notice-cate">
                            유관기관홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item related ">
                          <Box as="span" className="notice-cate">
                            유관기관홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item related ">
                          <Box as="span" className="notice-cate">
                            유관기관홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                        <Link href="..." className="notice-item related ">
                          <Box as="span" className="notice-cate">
                            유관기관홍보
                          </Box>
                          <Box as="span" className="notice-title">
                            23년 및 24년 상,하반기 DBR 선착순 무료 배포 (학생관
                            105호 취업지원센터)
                          </Box>
                          <Box as="span" className="notice-date">
                            2025.05.29
                          </Box>
                        </Link>
                      </Flex>
                    </Box>
                  </Tabs.Content>
                </Tabs.Root>
              </Box>
              <Box w="460px" flexShrink={0}>
                <Heading
                  as="h3"
                  fontSize="40px"
                  fontWeight="bold"
                  color={"#333333"}
                  lineHeight={"1"}
                  fontFamily="'Paperlogy', sans-serif"
                  mb={6}
                >
                  배너존
                </Heading>
                <Box borderRadius="20px" overflow="hidden">
                  <Link href="...">
                    <Image
                      src="/images/contents/msec02_bnr_img01.jpg"
                      alt="부산 유스호스텔 아르피나 배너"
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  </Link>
                </Box>
              </Box>
            </Flex>
          </Box>
        </Box>

        <Box className="msec03" mb={"80px"}>
          <Box w={"100%"} maxW={"1600px"} mx="auto" my={0}>
            <Box className="mapply-box">
              <Box position="relative">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  loop={true}
                >
                  <SwiperSlide>
                    <Box>
                      <Flex
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        mb={4}
                      >
                        <Text
                          color={"#444445"}
                          fontSize="40px"
                          fontWeight="800"
                        >
                          수영
                        </Text>
                        <Link
                          href="..."
                          display={"flex"}
                          alignItems={"center"}
                          gap={2}
                          bg={"#F1F2F3"}
                          border={"1px solid #F1F2F3"}
                          borderRadius={"40px"}
                          px={8}
                          py={4}
                          color={"#333"}
                          fontSize="30px"
                          fontWeight="500"
                          _hover={{
                            backgroundColor: "#fff",
                            borderColor: "#333",
                            transition: "all 0.3s ease-in-out",
                          }}
                        >
                          수영장 신청 바로가기
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="35"
                            height="35"
                            viewBox="0 0 35 35"
                            fill="none"
                          >
                            <path
                              d="M17.4984 2.91748C25.5484 2.91748 32.0817 9.45081 32.0817 17.5008C32.0817 25.5508 25.5484 32.0841 17.4984 32.0841C9.44837 32.0841 2.91504 25.5508 2.91504 17.5008C2.91504 9.45081 9.44837 2.91748 17.4984 2.91748ZM17.4984 16.0425H11.665V18.9591H17.4984V23.3341L23.3317 17.5008L17.4984 11.6675V16.0425Z"
                              fill="#333333"
                            />
                          </svg>
                        </Link>
                      </Flex>
                      <Box>
                        <Image
                          borderRadius="50px"
                          overflow="hidden"
                          src="/images/contents/mapply_img01.jpg"
                          alt="수영장이미지"
                          w="100%"
                          objectFit="cover"
                        />
                      </Box>
                    </Box>
                  </SwiperSlide>
                </Swiper>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
