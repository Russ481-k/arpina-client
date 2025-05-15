"use client";

import {
  Box,
  Container,
  Heading,
  Highlight,
  Text,
  Link,
  Icon,
} from "@chakra-ui/react";
import { useColors, useStyles } from "@/styles/theme";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { Enterprise } from "@/app/cms/enterprise/types";
import { useQuery } from "@tanstack/react-query";
import { enterpriseApi } from "@/lib/api/enterpriseApi";
import { EnterpriseListApiResponse } from "@/app/cms/enterprise/types";
import Image from "next/image";

export function EnterpriseSection() {
  // Use useStyles directly with colors, which returns the full Styles object
  const colors = useColors();
  const stylesObj = useStyles(colors);

  // Access only the fonts property that we need
  const { fonts } = stylesObj;

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);

  const swiperRef = useRef<{ swiper: SwiperType }>(null);

  const { data: enterprisesResponse } = useQuery<EnterpriseListApiResponse>({
    queryKey: ["enterprises"],
    queryFn: () => enterpriseApi.getEnterprises(),
  });

  const handlePlayPause = () => {
    if (swiperRef.current) {
      if (isPlaying) {
        swiperRef.current.swiper.autoplay.stop();
      } else {
        swiperRef.current.swiper.autoplay.start();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentSlide(swiper.realIndex);
  };

  useEffect(() => {
    // Swiper 버튼의 :after 가상 요소 숨기기
    const style = document.createElement("style");
    style.innerHTML = `
      .swiper-button-prev::after,
      .swiper-button-next::after {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Use the property from the ACTUAL API response structure
    if (enterprisesResponse?.data?.content) {
      setEnterprises(enterprisesResponse.data.content);
    }
  }, [enterprisesResponse]);

  return (
    <Box
      as="section"
      id="enterpriseSection"
      bg="#F4F8FF"
      p="50px 0"
      fontFamily={fonts.body}
    >
      <Container
        maxW="1600px"
        m="0 auto"
        pl={{
          base: "15px",
          md: "20px",
          lg: "30px",
        }}
        pr={{
          base: "15px",
          md: "20px",
          lg: "30px",
        }}
      >
        <Box
          display="flex"
          flexDirection={{
            base: "column",
            lg: "row",
          }}
          alignItems={{
            base: "flex-start",
            lg: "center",
          }}
          gap={{
            base: 5,
            lg: 0,
          }}
          justifyContent="space-between"
          mb={5}
        >
          <Heading
            as="h3"
            lineHeight="1"
            fontSize={{
              base: "1.25em",
              md: "1.3em",
              lg: "1.4em",
            }}
            color="#007ACD"
            fontWeight="700"
            fontFamily={fonts.body}
          >
            <Highlight
              query="혁신을 만드는 창업가꿈 4호 입주기업"
              styles={{
                color: "#0D344E",
                display: "block",
                fontSize: {
                  base: "1.6em",
                  lg: "1.7em",
                  xl: "2.4em",
                },
                marginTop: "10px",
                whiteSpace: "normal",
              }}
            >
              Introduction to Resident Enterprises 혁신을 만드는 창업가꿈 4호
              입주기업
            </Highlight>
          </Heading>

          <Box
            display="flex"
            alignItems="center"
            gap="20px"
            alignSelf="flex-end"
          >
            <Box
              alignItems="center"
              gap="10px"
              display={{
                base: "none",
                lg: "flex",
              }}
            >
              <Text color="#0D344E" fontSize="16px" fontWeight="500">
                {currentSlide + 1}
              </Text>
              <Box
                as="div"
                className="swiper-pagination"
                style={{
                  width: "120px",
                  position: "relative",
                  height: "4px",
                  backgroundColor: "#E2E8F0",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              />
              <Text color="#B1B1B1" fontSize="16px" fontWeight="500">
                {enterprises.length}
              </Text>
            </Box>
            <Box display="flex" alignItems="center" gap="10px">
              <Box
                className="swiper-button-prev"
                style={{
                  position: "static",
                  margin: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "41px",
                  borderRadius: "10px",
                  border: "1px solid #333",
                }}
              >
                <Icon style={{ width: "24px", height: "24px" }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="14"
                    viewBox="0 0 16 14"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_15_134)">
                      <path
                        d="M1.1979 7.55214C1.05236 7.40526 0.970703 7.20684 0.970703 7.00006C0.970703 6.79328 1.05236 6.59486 1.1979 6.44798L6.40623 1.23964C6.47776 1.16288 6.56401 1.10132 6.65984 1.05862C6.75567 1.01592 6.85912 0.992961 6.96402 0.99111C7.06892 0.989258 7.17312 1.00855 7.2704 1.04785C7.36768 1.08714 7.45604 1.14562 7.53023 1.21981C7.60442 1.294 7.6629 1.38237 7.70219 1.47965C7.74149 1.57692 7.76078 1.68112 7.75893 1.78602C7.75708 1.89092 7.73412 1.99437 7.69142 2.0902C7.64872 2.18604 7.58716 2.27229 7.5104 2.34381L3.6354 6.21881L14.25 6.21881C14.4572 6.21881 14.6559 6.30112 14.8024 6.44763C14.9489 6.59414 15.0312 6.79286 15.0312 7.00006C15.0312 7.20726 14.9489 7.40597 14.8024 7.55248C14.6559 7.699 14.4572 7.78131 14.25 7.78131L3.6354 7.78131L7.5104 11.6563C7.6484 11.8044 7.72353 12.0003 7.71996 12.2027C7.71639 12.4051 7.63439 12.5982 7.49126 12.7413C7.34812 12.8845 7.15501 12.9665 6.95261 12.97C6.75021 12.9736 6.55433 12.8985 6.40623 12.7605L1.1979 7.55214Z"
                        fill="#0D344E"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_15_134">
                        <rect
                          width="12.5"
                          height="15"
                          fill="white"
                          transform="translate(0.5 13.25) rotate(-90)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </Icon>
              </Box>
              <button
                className="swiper-play-pause"
                onClick={handlePlayPause}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#2C65FD",
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="41"
                  viewBox="0 0 40 41"
                  fill="none"
                >
                  <circle cx="20" cy="20.5" r="20" fill="#0D344E" />
                  {isPlaying ? (
                    <>
                      <path
                        d="M19.2002 27.7C19.2002 28.5837 18.4838 29.3 17.6001 29.3C16.7164 29.3 16 28.5837 16 27.7V14.9001C16 14.0164 16.7164 13.3 17.6001 13.3C18.4838 13.3 19.2002 14.0164 19.2002 14.9001V27.7ZM25.5996 27.7004C25.5996 28.5839 24.8834 29.3 24 29.3C23.1166 29.3 22.4004 28.5839 22.4004 27.7004V14.8997C22.4004 14.0162 23.1166 13.3 24 13.3C24.8834 13.3 25.5996 14.0162 25.5996 14.8997V27.7004Z"
                        fill="white"
                      />
                    </>
                  ) : (
                    <path d="M8 5V19L19 12L8 5Z" fill="white" />
                  )}
                </svg>
              </button>
              <div
                className="swiper-button-next"
                style={{
                  position: "static",
                  margin: "0",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "41px",
                  borderRadius: "10px",
                  border: "1px solid #333",
                }}
              >
                <Icon style={{ width: "24px", height: "24px" }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="21"
                    viewBox="0 0 25 21"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_87_1711)">
                      <path
                        d="M23.3826 11.3829C23.6154 11.1479 23.7461 10.8305 23.7461 10.4996C23.7461 10.1688 23.6154 9.85129 23.3826 9.61627L15.0492 1.28294C14.9348 1.16013 14.7968 1.06162 14.6435 0.993303C14.4901 0.924984 14.3246 0.888248 14.1568 0.885286C13.9889 0.882326 13.8222 0.913198 13.6666 0.976066C13.5109 1.03894 13.3695 1.13251 13.2509 1.25121C13.1322 1.36991 13.0386 1.5113 12.9757 1.66694C12.9128 1.82259 12.882 1.9893 12.8849 2.15714C12.8879 2.32498 12.9246 2.4905 12.9929 2.64384C13.0613 2.79717 13.1598 2.93517 13.2826 3.04961L19.4826 9.2496L2.49925 9.2496C2.16773 9.2496 1.84978 9.3813 1.61536 9.61572C1.38094 9.85014 1.24925 10.1681 1.24925 10.4996C1.24925 10.8311 1.38094 11.1491 1.61536 11.3835C1.84978 11.6179 2.16773 11.7496 2.49925 11.7496L19.4826 11.7496L13.2826 17.9496C13.0618 18.1866 12.9416 18.5 12.9473 18.8238C12.953 19.1476 13.0842 19.4566 13.3132 19.6856C13.5422 19.9147 13.8512 20.0458 14.175 20.0516C14.4989 20.0573 14.8123 19.9371 15.0492 19.7163L23.3826 11.3829Z"
                        fill="#333333"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_87_1711">
                        <rect
                          width="20"
                          height="24"
                          fill="white"
                          transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 24.5 20.5)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </Icon>
              </div>
            </Box>
          </Box>
        </Box>

        <Swiper
          ref={swiperRef}
          modules={[Autoplay, Pagination, Navigation]}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{
            type: "progressbar",
            el: ".swiper-pagination",
            clickable: true,
          }}
          navigation={{
            prevEl: ".swiper-button-prev",
            nextEl: ".swiper-button-next",
          }}
          onSlideChange={handleSlideChange}
          breakpoints={{
            400: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            769: {
              slidesPerView: 3,
              spaceBetween: 10,
            },
            1000: {
              slidesPerView: 4,
              spaceBetween: 15,
            },
            1400: {
              slidesPerView: 5,
              spaceBetween: 25,
            },
          }}
          style={
            {
              "--swiper-pagination-color": "#2C65FD",
              "--swiper-pagination-bullet-size": "8px",
              "--swiper-pagination-bullet-horizontal-gap": "6px",
              "--swiper-navigation-color": "#2C65FD",
              "--swiper-navigation-size": "24px",
              "--swiper-pagination-progressbar-size": "4px",
              "--swiper-pagination-progressbar-bg-color": "#E2E8F0",
              "--swiper-pagination-progressbar-swiper-pagination-bg-color":
                "#2C65FD",
            } as React.CSSProperties
          }
        >
          {enterprises.map((enterprise: Enterprise, index: number) => (
            <SwiperSlide key={index}>
              <Link
                href={`/enterprise/participants`}
                style={{
                  textDecoration: "none",
                  display: "block",
                  width: "100%",
                }}
                _hover={{
                  "& > div > div:first-of-type": {
                    transform: "translateY(7px)",
                    transition: "transform 0.3s ease-out",
                  },
                }}
              >
                <Box
                  position="relative"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  gap="15px"
                  backgroundColor="#fff"
                  borderRadius="20px"
                  width="100%"
                  padding="25px 10px"
                >
                  <Box position="absolute" top={4} right={4}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      viewBox="0 0 25 25"
                      fill="none"
                    >
                      <path
                        d="M16.0826 9.98225L7.54951 18.6617L6.12334 17.2595L14.6565 8.58011L7.07098 8.64457L7.05399 6.64465L18.0536 6.55117L18.147 17.5508L16.1471 17.5678L16.0826 9.98225Z"
                        fill="#2C65FD"
                      />
                    </svg>
                  </Box>
                  <Image
                    src={enterprise.image || ""}
                    loader={() => enterprise.image || ""}
                    alt={enterprise.name}
                    width={75}
                    height={75}
                    objectFit="contain"
                  />
                  <Text
                    color="#666"
                    fontWeight="300"
                    fontSize={{
                      base: "0.9em",
                      md: "1em",
                      lg: "1.1em",
                    }}
                  >
                    {enterprise.description}
                  </Text>
                  <Text
                    color="#292E40"
                    fontSize={{
                      base: "1.2em",
                      md: "1.4em",
                      lg: "1.5625em",
                    }}
                    fontWeight="600"
                  >
                    {enterprise.name}
                  </Text>
                </Box>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </Box>
  );
}
