"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Tabs,
  Link,
  Button,
  Collapsible,
} from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { getScrollbarStyle } from "@/styles/scrollbar";
import Layout from "@/components/layout/view/Layout";
import { useColorMode } from "@/components/ui/color-mode";
import { useMenu } from "@/lib/hooks/useMenu";
import { sortMenus } from "@/lib/api/menu";
import { useMemo, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { PopupManager } from "@/components/common/PopupManager";
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

  // 달력 range-picker 상태 및 함수 (calculate/page.tsx 참고)
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [nextMonthDate, setNextMonthDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [selectionMode, setSelectionMode] = useState("checkIn");
  const [selectedRangeText, setSelectedRangeText] = useState("");

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const formatDate = (date) =>
    `${date.year}.${(date.month + 1).toString().padStart(2, "0")}.${date.day
      .toString()
      .padStart(2, "0")}`;
  const isSameDate = (d1, d2) =>
    d1 &&
    d2 &&
    d1.year === d2.year &&
    d1.month === d2.month &&
    d1.day === d2.day;
  const isDateInRange = (date, start, end) => {
    const check = new Date(date.year, date.month, date.day);
    const s = new Date(start.year, start.month, start.day);
    const e = new Date(end.year, end.month, end.day);
    return check >= s && check <= e;
  };
  const handlePrevMonth = () => {
    const newCurrent = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    setCurrentDate(newCurrent);
    setNextMonthDate(
      new Date(newCurrent.getFullYear(), newCurrent.getMonth() + 1, 1)
    );
  };
  const handleNextMonth = () => {
    const newCurrent = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    setCurrentDate(newCurrent);
    setNextMonthDate(
      new Date(newCurrent.getFullYear(), newCurrent.getMonth() + 1, 1)
    );
  };
  const handleDateClick = (day, monthDate) => {
    const dateInfo = {
      year: monthDate.getFullYear(),
      month: monthDate.getMonth(),
      day,
    };
    if (selectionMode === "checkIn") {
      setCheckInDate(dateInfo);
      if (
        checkOutDate &&
        new Date(dateInfo.year, dateInfo.month, dateInfo.day) >
          new Date(checkOutDate.year, checkOutDate.month, checkOutDate.day)
      ) {
        setCheckOutDate(null);
      }
      setSelectionMode("checkOut");
    } else {
      if (
        checkInDate &&
        new Date(dateInfo.year, dateInfo.month, dateInfo.day) <
          new Date(checkInDate.year, checkInDate.month, checkInDate.day)
      )
        return;
      setCheckOutDate(dateInfo);
      setSelectionMode("checkIn");
    }
  };
  function getNightsDays(checkIn, checkOut) {
    if (!checkIn || !checkOut) return null;
    const inDate = new Date(checkIn.year, checkIn.month, checkIn.day);
    const outDate = new Date(checkOut.year, checkOut.month, checkOut.day);
    const diff = outDate.getTime() - inDate.getTime();
    if (diff <= 0) return null;
    const nights = diff / (1000 * 60 * 60 * 24);
    const days = nights + 1;
    return { nights, days };
  }
  function handleApplyDates() {
    if (checkInDate && checkOutDate) {
      const range = getNightsDays(checkInDate, checkOutDate);
      if (range) {
        setSelectedRangeText(
          `${formatDate(checkInDate)} ~ ${formatDate(checkOutDate)} (${
            range.nights
          }박 ${range.days}일)`
        );
        setCalendarOpen(false);
      }
    }
  }
  function handleResetDates() {
    setCheckInDate(null);
    setCheckOutDate(null);
    setSelectionMode("checkIn");
    setSelectedRangeText("");
  }
  // 달력 렌더링 함수
  const renderCalendar = (monthDate, calendarIndex) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
      return daysInPrevMonth - firstDayOfMonth + i + 1;
    });
    const currentMonthDays = Array.from(
      { length: daysInMonth },
      (_, i) => i + 1
    );
    const nextMonthDays = Array.from(
      { length: 42 - (prevMonthDays.length + currentMonthDays.length) },
      (_, i) => i + 1
    );
    return (
      <Box flex="1">
        <Flex justify="space-between" align="center" mb={2}>
          {calendarIndex === 0 ? (
            <Box
              as="button"
              p={1}
              _hover={{ bg: "gray.100" }}
              onClick={handlePrevMonth}
              aria-label="이전 달"
            >
              <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.84306 12.7109L7.50006 18.3679L8.91406 16.9539L3.96406 12.0039L8.91406 7.05389L7.50006 5.63989L1.84306 11.2969C1.65559 11.4844 1.55028 11.7387 1.55028 12.0039C1.55028 12.2691 1.65559 12.5234 1.84306 12.7109Z"
                  fill="#2E3192"
                />
              </svg>
            </Box>
          ) : (
            <Box width="32px" />
          )}
          <Text
            fontWeight="700"
            fontSize="md"
            color="#2E3192"
            textAlign="center"
          >
            {year}년 {month + 1}월
          </Text>
          {calendarIndex === 1 ? (
            <Box
              as="button"
              p={1}
              _hover={{ bg: "gray.100" }}
              onClick={handleNextMonth}
              aria-label="다음 달"
            >
              <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.1569 12.7109L4.49994 18.3679L3.08594 16.9539L8.03594 12.0039L3.08594 7.05389L4.49994 5.63989L10.1569 11.2969C10.3444 11.4844 10.4497 11.7387 10.4497 12.0039C10.4497 12.2691 10.3444 12.5234 10.1569 12.7109Z"
                  fill="#2E3192"
                />
              </svg>
            </Box>
          ) : (
            <Box width="32px" />
          )}
        </Flex>
        <Flex
          justifyContent="space-between"
          color="#373636"
          fontWeight="bold"
          fontSize="sm"
          mb={1}
        >
          {weekDays.map((d, i) => (
            <Box
              key={d}
              w="32px"
              textAlign="center"
              color={i === 0 || i === 6 ? "#2E3192" : "#373636"}
            >
              {d}
            </Box>
          ))}
        </Flex>
        {/* 날짜 셀 */}
        <Flex wrap="wrap">
          {prevMonthDays.map((day, i) => (
            <Box
              key={`prev-${i}`}
              w="32px"
              h="32px"
              textAlign="center"
              lineHeight="32px"
              borderRadius="8px"
              color="#BDBDBD"
              bg="transparent"
              fontSize="sm"
              opacity={0.5}
              cursor="default"
            >
              {day}
            </Box>
          ))}
          {currentMonthDays.map((day, i) => {
            const dateInfo = { year, month, day };
            const isCheckIn = checkInDate && isSameDate(dateInfo, checkInDate);
            const isCheckOut =
              checkOutDate && isSameDate(dateInfo, checkOutDate);
            const isInRange =
              checkInDate &&
              checkOutDate &&
              isDateInRange(dateInfo, checkInDate, checkOutDate);
            return (
              <Box
                key={`current-${i}`}
                w="32px"
                h="32px"
                textAlign="center"
                lineHeight="32px"
                borderRadius="8px"
                fontWeight={
                  isCheckIn || isCheckOut ? "700" : isInRange ? "600" : "500"
                }
                color={
                  isCheckIn || isCheckOut
                    ? "#fff"
                    : isInRange
                    ? "#2E3192"
                    : "#232323"
                }
                bg={
                  isCheckIn || isCheckOut
                    ? "#2E3192"
                    : isInRange
                    ? "#F0F2F7"
                    : "transparent"
                }
                mx={0.5}
                fontSize="sm"
                _hover={{ bg: isCheckIn || isCheckOut ? "#1B2066" : "#E6F0FA" }}
                cursor="pointer"
                onClick={() => handleDateClick(day, monthDate)}
              >
                {day}
              </Box>
            );
          })}
          {nextMonthDays.map((day, i) => (
            <Box
              key={`next-${i}`}
              w="32px"
              h="32px"
              textAlign="center"
              lineHeight="32px"
              borderRadius="8px"
              color="#BDBDBD"
              bg="transparent"
              fontSize="sm"
              opacity={0.5}
              cursor="default"
            >
              {day}
            </Box>
          ))}
        </Flex>
      </Box>
    );
  };

  return (
    <Layout menus={treeMenus} currentPage="홈">
      <Global styles={getScrollbarStyle(isDark)} />
      <PopupManager />
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
          ".mprice-box h3": {
            display: "flex",
            alignItems: "center",
            "&::before": {
              content: "''",
              flexShrink: 0,
              width: "28px",
              height: "35px",
              marginRight: "10px",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='35' viewBox='0 0 28 35' fill='none'%3E%3Cpath d='M25.6499 10.8155C24.8055 10.8683 23.96 11.0203 23.1377 11.2393C20.3762 16.7451 14.4982 18.3757 11.4453 19.1947C11.5228 19.1992 11.6082 19.1992 11.6796 19.1947C15.4531 19.0429 23.1803 17.1569 26.3398 11.9932C26.5668 11.6125 27.1173 10.6952 25.6499 10.8155Z' fill='%2380D4CE'/%3E%3Cpath d='M11.1958 18.6842C13.3791 16.61 17.9921 12.5759 23.1415 11.2415C24.1499 9.10978 24.671 6.92279 24.572 3.75319C24.5199 2.8645 24.3108 2.75362 23.6584 3.18741C18.7922 6.40509 12.0631 15.2806 11.0041 18.7998C10.9047 19.161 11.0092 19.2958 11.39 19.2163C11.4141 19.2091 11.4323 19.1994 11.4494 19.1969C11.0964 19.1923 10.7483 19.1224 11.1958 18.6842Z' fill='%2380D4CE'/%3E%3Cpath d='M23.1403 11.2402C17.9939 12.5747 13.3773 16.6088 11.1946 18.6852C10.7504 19.1212 11.0949 19.1931 11.4479 19.1981C14.4982 18.3767 20.3782 16.7461 23.1403 11.2402Z' fill='%230C8EA4'/%3E%3Cpath d='M0.86523 13.5951C4.47452 13.7204 7.03764 16.1289 8.78687 19.6314C8.87895 19.8168 8.95508 20.1828 8.43367 19.9855C5.3567 18.8775 2.30379 16.7628 0.497751 14.6236C-0.331807 13.7449 -0.0664821 13.5762 0.86523 13.5951Z' fill='%2380CC28'/%3E%3Cpath d='M11.9941 22.2805C8.62134 23.7931 7.12316 27.7385 8.64681 31.0815C10.1735 34.4365 14.1436 35.9226 17.5287 34.4076C20.8945 32.8878 22.3949 28.9473 20.8702 25.5993C19.7543 23.145 17.3104 21.6855 14.7596 21.6855C13.8307 21.6855 12.8917 21.8784 11.9941 22.2805Z' fill='%23FAB20B'/%3E%3Cpath d='M2.12927 8.87683C3.08253 13.2005 5.4209 17.3794 8.04083 19.6553C8.84156 20.3081 8.86787 19.9782 8.86787 19.3299C8.94316 16.3821 8.82563 10.8882 3.35177 8.10874C2.41418 7.62938 1.78838 7.46765 2.12927 8.87683Z' fill='%230C8EA4'/%3E%3Cpath d='M10.3559 19.9575C14.7331 18.1173 23.4272 12.4114 21.4222 0.852378C21.2537 -0.318096 20.7214 -0.0699375 20.2492 0.344397C14.8896 4.74727 10.7488 13.7914 9.63267 19.7069C9.53331 20.1887 9.82214 20.1743 10.3559 19.9575Z' fill='%230C8EA4'/%3E%3Cpath d='M26.9106 13.7853C19.9774 13.6019 12.7594 17.6918 9.81091 19.7246C9.31133 20.1317 9.7905 20.2834 10.0838 20.3579C14.6396 21.49 23.9665 20.1873 27.6978 14.9268C27.9391 14.592 28.5154 13.8239 26.9106 13.7853Z' fill='%2380CC28'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            },
            "& span": {
              position: "relative",
              zIndex: 1,
              "&::before": {
                content: "''",
                position: "absolute",
                left: 0,
                bottom: "-5px",
                width: "100%",
                height: "25px",
                background:
                  "linear-gradient(90deg, rgba(250, 178, 11, 0.30) 0.01%, rgba(128, 212, 206, 0.30) 25%, rgba(128, 204, 40, 0.30) 50%, rgba(12, 142, 164, 0.30) 75%, rgba(46, 49, 146, 0.30) 100%);",
                zIndex: -1,
              },
            },
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
                    <Box
                      as="a"
                      href="https://arpina-cms-bnxm.vercel.app/sports/swimming/lesson"
                      position="relative"
                      w="100%"
                    >
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
                          강습신청바로가기
                        </Text>
                      </Box>
                      <Box position="relative" w="100%">
                        <Image
                          // src="/images/contents/msec01_sld_img01.png"
                          src="/images/contents/msec01_sld_img02.png"
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
                  <Image
                    src="/images/main/main_0.png"
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
                  <Link href="/meeting/estimate">
                    <Image
                      src="/images/main/main_1.png"
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

        <Box className="msec04">
          <Box w={"100%"} maxW={"1600px"} mx="auto" my={0}>
            <Box className="mprice-box">
              <Heading
                as="h3"
                fontSize="40px"
                fontWeight="800"
                color={"#444445"}
                lineHeight={"1"}
                fontFamily="'Paperlogy', sans-serif"
                mb={6}
              >
                <Text as="span">아르피나 단체예약 가견적 산출</Text>
              </Heading>
              <Box className="mprice-wr">
                <Text
                  color="#2E3192"
                  fontSize="xl"
                  fontWeight="500"
                  textAlign="right"
                  mb={4}
                >
                  가견적과 실제금액은 차이가 있을 수 있습니다.
                </Text>
                <Flex
                  className="mprcie-box"
                  backgroundColor="#F7F7F8"
                  borderRadius={"20px"}
                  p={10}
                  flexFlow="row wrap"
                  gap={6}
                  alignItems="flex-start"
                >
                  <Flex flex="3" gap={6}>
                    <Collapsible.Root>
                      <Collapsible.Trigger asChild>
                        <Button
                          variant="outline"
                          size="lg"
                          borderRadius="16px"
                          borderWidth="2px"
                          borderColor="#0C8EA4"
                          bg="#fff"
                          boxShadow="none"
                          px={10}
                          py={7}
                          w="100%"
                          h="72px"
                          minW="340px"
                          display="flex"
                          alignItems="center"
                          justifyContent="flex-start"
                          gap={4}
                          _hover={{ bg: "#F7F8FB", borderColor: "#0C8EA4" }}
                          _active={{ bg: "#F7F8FB", borderColor: "#0C8EA4" }}
                        >
                          <Box
                            as="span"
                            display="flex"
                            alignItems="center"
                            mr={2}
                          >
                            <svg
                              width="28"
                              height="28"
                              fill="none"
                              viewBox="0 0 28 28"
                            >
                              <path
                                d="M7.5 14a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm10.5 0a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm10.5 0a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                                fill="#9E9E9E"
                              />
                            </svg>
                          </Box>
                          <Text
                            color="#9E9E9E"
                            fontWeight="500"
                            fontSize="lg"
                            flex="1"
                            textAlign="left"
                          >
                            필요한 세미나실을 선택해주세요
                          </Text>
                          <Box as="span" ml={2} color="#9E9E9E" fontSize="xl">
                            ▼
                          </Box>
                        </Button>
                      </Collapsible.Trigger>
                      <Collapsible.Content>
                        <Box
                          mt={4}
                          p={0}
                          backgroundColor="#F7F8FB"
                          borderRadius="20px"
                          overflow="hidden"
                          border="1.5px solid #E0E0E0"
                          minW="420px"
                        >
                          <Text
                            fontWeight="700"
                            fontSize="md"
                            color="#0C8EA4"
                            textAlign="center"
                            py={4}
                            borderBottom="1.5px solid #E0E0E0"
                            bg="#fff"
                            borderTopLeftRadius="20px"
                            borderTopRightRadius="20px"
                          >
                            선택하신 연회장 정보가 표시됩니다
                          </Text>
                          <Flex
                            px={6}
                            py={3}
                            alignItems="center"
                            fontWeight="700"
                            color="#0C8EA4"
                            fontSize="md"
                            borderBottom="1.5px solid #E0E0E0"
                          >
                            <Box flex="1">연회장명</Box>
                            <Box w="160px" textAlign="center">
                              이용기간(일)
                            </Box>
                          </Flex>
                          {/* 연회장 리스트 */}
                          {[
                            "누리",
                            "가람",
                            "오션",
                            "그랜드볼룸",
                            "시걸",
                            "자스민",
                            "클로버",
                          ].map((name, idx) => (
                            <Flex
                              key={name}
                              px={6}
                              py={3}
                              alignItems="center"
                              borderBottom={
                                idx === 6 ? "none" : "1.5px solid #E0E0E0"
                              }
                              fontSize="lg"
                              bg="#F7F8FB"
                            >
                              <Box flex="1" color="#444" fontWeight="600">
                                {name}
                              </Box>
                              <Flex
                                w="160px"
                                alignItems="center"
                                justifyContent="center"
                                gap={2}
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  borderColor="#0C8EA4"
                                  color="#0C8EA4"
                                  borderRadius="8px"
                                  minW="36px"
                                  h="36px"
                                  fontSize="2xl"
                                  fontWeight="bold"
                                  px={0}
                                  _hover={{ bg: "#E6F0FA" }}
                                >
                                  –
                                </Button>
                                <Text
                                  fontWeight="700"
                                  fontSize="lg"
                                  w="32px"
                                  textAlign="center"
                                  color="#0C8EA4"
                                >
                                  1
                                </Text>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  borderColor="#0C8EA4"
                                  color="#0C8EA4"
                                  borderRadius="8px"
                                  minW="36px"
                                  h="36px"
                                  fontSize="2xl"
                                  fontWeight="bold"
                                  px={0}
                                  _hover={{ bg: "#E6F0FA" }}
                                >
                                  +
                                </Button>
                              </Flex>
                            </Flex>
                          ))}
                        </Box>
                      </Collapsible.Content>
                    </Collapsible.Root>
                    <Collapsible.Root
                      open={calendarOpen}
                      onOpenChange={setCalendarOpen}
                    >
                      <Collapsible.Trigger asChild>
                        <Button
                          variant="outline"
                          size="lg"
                          borderRadius="16px"
                          borderWidth="2px"
                          borderColor="#2E3192"
                          bg="#fff"
                          boxShadow="none"
                          px={10}
                          py={7}
                          w="100%"
                          h="72px"
                          minW="340px"
                          display="flex"
                          alignItems="center"
                          justifyContent="flex-start"
                          gap={4}
                          _hover={{ bg: "#F7F8FB", borderColor: "#2E3192" }}
                          _active={{ bg: "#F7F8FB", borderColor: "#2E3192" }}
                        >
                          <Box
                            as="span"
                            display="flex"
                            alignItems="center"
                            mr={2}
                          >
                            <svg
                              width="28"
                              height="28"
                              fill="none"
                              viewBox="0 0 28 28"
                            >
                              <rect
                                x="4"
                                y="7"
                                width="20"
                                height="16"
                                rx="3"
                                fill="#9E9E9E"
                              />
                              <rect
                                x="8"
                                y="3"
                                width="2"
                                height="6"
                                rx="1"
                                fill="#9E9E9E"
                              />
                              <rect
                                x="18"
                                y="3"
                                width="2"
                                height="6"
                                rx="1"
                                fill="#9E9E9E"
                              />
                            </svg>
                          </Box>
                          <Text
                            color="#9E9E9E"
                            fontWeight="500"
                            fontSize="lg"
                            flex="1"
                            textAlign="left"
                          >
                            {selectedRangeText
                              ? selectedRangeText
                              : "체크인 날짜 - 체크아웃 날짜를 선택해주세요"}
                          </Text>
                          <Box as="span" ml={2} color="#9E9E9E" fontSize="xl">
                            ▼
                          </Box>
                        </Button>
                      </Collapsible.Trigger>
                      <Collapsible.Content>
                        <Box
                          mt={4}
                          p={0}
                          backgroundColor="#F7F8FB"
                          borderRadius="20px"
                          overflow="hidden"
                          border="1.5px solid #E0E0E0"
                          minW="520px"
                          maxW="600px"
                        >
                          <Flex px={6} py={4} gap={12}>
                            {renderCalendar(currentDate, 0)}
                            {renderCalendar(nextMonthDate, 1)}
                          </Flex>
                          <Box
                            borderTop="1.5px solid #E0E0E0"
                            mt={6}
                            px={6}
                            py={4}
                          >
                            <Flex justifyContent="flex-end" gap={3}>
                              <Button
                                variant="outline"
                                borderColor="#2E3192"
                                color="#2E3192"
                                borderRadius="8px"
                                fontWeight="700"
                                px={6}
                                py={2}
                                _hover={{ bg: "#ECECF6" }}
                                onClick={handleResetDates}
                              >
                                초기화
                              </Button>
                              <Button
                                bg="#2E3192"
                                color="#fff"
                                borderRadius="8px"
                                fontWeight="700"
                                px={6}
                                py={2}
                                _hover={{ bg: "#232366" }}
                                onClick={handleApplyDates}
                                disabled={
                                  !(
                                    checkInDate &&
                                    checkOutDate &&
                                    getNightsDays(checkInDate, checkOutDate)
                                  )
                                }
                              >
                                적용
                              </Button>
                            </Flex>
                          </Box>
                        </Box>
                      </Collapsible.Content>
                    </Collapsible.Root>
                    <Collapsible.Root>
                      <Collapsible.Trigger asChild>
                        <Button
                          variant="outline"
                          size="lg"
                          borderRadius="16px"
                          borderWidth="2px"
                          borderColor="#2E3192"
                          bg="#fff"
                          boxShadow="none"
                          px={10}
                          py={7}
                          w="100%"
                          h="72px"
                          minW="340px"
                          display="flex"
                          alignItems="center"
                          justifyContent="flex-start"
                          gap={4}
                          _hover={{ bg: "#F7F8FB", borderColor: "#2E3192" }}
                          _active={{ bg: "#F7F8FB", borderColor: "#2E3192" }}
                        >
                          <Box
                            as="span"
                            display="flex"
                            alignItems="center"
                            mr={2}
                          >
                            <svg
                              width="28"
                              height="28"
                              fill="none"
                              viewBox="0 0 28 28"
                            >
                              <rect
                                x="3"
                                y="12"
                                width="22"
                                height="10"
                                rx="3"
                                fill="#9E9E9E"
                              />
                              <rect
                                x="7"
                                y="7"
                                width="14"
                                height="7"
                                rx="3"
                                fill="#9E9E9E"
                              />
                            </svg>
                          </Box>
                          <Text
                            color="#9E9E9E"
                            fontWeight="500"
                            fontSize="lg"
                            flex="1"
                            textAlign="left"
                          >
                            날짜 선택 후 필요한 객실을 선택해주세요
                          </Text>
                          <Box as="span" ml={2} color="#9E9E9E" fontSize="xl">
                            ▼
                          </Box>
                        </Button>
                      </Collapsible.Trigger>
                      <Collapsible.Content>
                        <Box
                          mt={4}
                          p={4}
                          backgroundColor="white"
                          borderRadius="10px"
                        >
                          <Text>객실 선택 옵션들이 여기에 표시됩니다.</Text>
                        </Box>
                      </Collapsible.Content>
                    </Collapsible.Root>
                  </Flex>
                  <Text
                    width="100%"
                    fontWeight="900"
                    fontSize="4xl"
                    color="#444445"
                    textAlign="right"
                  >
                    ₩ 정보 입력 후 확인가능
                  </Text>
                </Flex>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
