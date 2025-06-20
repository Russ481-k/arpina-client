"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Icon,
  Highlight,
  List,
  Em,
  Collapsible,
  Grid,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import InfoBoxList01 from "@/components/contents/InfoBoxList01";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import React from "react";

// SVG Icons as components
const PeopleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M11.9449 11.6115C13.4449 11.6115 14.6115 10.3893 14.6115 8.88932C14.6115 7.38932 13.3893 6.22266 11.8893 6.22266C10.3893 6.22266 9.22266 7.44488 9.22266 8.88932C9.22266 10.3893 10.4449 11.6115 11.9449 11.6115ZM11.8893 7.33377C11.9449 7.33377 11.9449 7.33377 11.8893 7.33377C12.7782 7.33377 13.5004 8.05599 13.5004 8.94488C13.5004 9.83377 12.7782 10.5004 11.8893 10.5004C11.0004 10.5004 10.3338 9.77821 10.3338 8.94488C10.3338 8.05599 11.056 7.33377 11.8893 7.33377Z"
      fill="#6B6B6B"
    />
    <path
      d="M20.1673 11.2778C19.1118 10.3334 17.7229 9.83339 16.2784 9.88895H15.834C15.7229 10.3334 15.5562 10.7223 15.334 11.0556C15.6673 11.0001 15.9451 11.0001 16.2784 11.0001C17.334 10.9445 18.3895 11.2778 19.2229 11.8889V15.8889H20.334V11.4445L20.1673 11.2778Z"
      fill="#6B6B6B"
    />
    <path
      d="M15.0004 6.33312C15.2782 5.66645 16.056 5.33312 16.7782 5.61089C17.4449 5.88867 17.7782 6.66645 17.5004 7.38867C17.2782 7.88867 16.7782 8.22201 16.2782 8.22201C16.1671 8.22201 16.0004 8.22201 15.8893 8.16645C15.9449 8.44423 15.9449 8.72201 15.9449 8.94423V9.27756C16.056 9.27756 16.1671 9.33312 16.2782 9.33312C17.6671 9.33312 18.7782 8.22201 18.7782 6.88867C18.7782 5.49978 17.6671 4.38867 16.3338 4.38867C15.4449 4.38867 14.6671 4.83312 14.2227 5.61089C14.5004 5.77756 14.7782 5.99978 15.0004 6.33312Z"
      fill="#6B6B6B"
    />
    <path
      d="M8.66602 11.1103C8.44379 10.777 8.27713 10.3881 8.16602 9.94364H7.72157C6.27713 9.88809 4.88824 10.3881 3.83268 11.277L3.66602 11.4436V15.8881H4.77713V11.8881C5.66602 11.277 6.66602 10.9436 7.72157 10.9992C8.0549 10.9992 8.38824 11.0548 8.66602 11.1103Z"
      fill="#6B6B6B"
    />
    <path
      d="M7.72187 9.27768C7.83298 9.27768 7.9441 9.27768 8.05521 9.22212V8.88879C8.05521 8.61101 8.05521 8.33323 8.11076 8.11101C7.99965 8.16657 7.83298 8.16657 7.72187 8.16657C6.99965 8.16657 6.38854 7.55545 6.38854 6.83323C6.38854 6.11101 6.99965 5.4999 7.72187 5.4999C8.27743 5.4999 8.77743 5.83323 8.99965 6.33323C9.22187 6.05545 9.55521 5.77768 9.83298 5.55545C9.11076 4.38879 7.61076 3.9999 6.4441 4.72212C5.27743 5.44434 4.88854 6.94434 5.61076 8.11101C6.05521 8.83323 6.83298 9.27768 7.72187 9.27768Z"
      fill="#6B6B6B"
    />
    <path
      d="M16.4991 14.6113L16.388 14.4446C15.2769 13.2224 13.7214 12.5002 12.0547 12.5557C10.388 12.5002 8.77691 13.2224 7.6658 14.4446L7.55469 14.6113V18.8335C7.55469 19.3335 7.94358 19.7779 8.49913 19.7779H15.6102C16.1102 19.7779 16.5547 19.3335 16.5547 18.8335V14.6113H16.4991ZM15.388 18.6668H8.6658V15.0002C9.55469 14.1113 10.7769 13.6668 12.0547 13.6668C13.2769 13.6113 14.4991 14.1113 15.388 15.0002V18.6668Z"
      fill="#6B6B6B"
    />
  </svg>
);

const AreaIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M18.1776 11.373C18.3633 11.373 18.5413 11.4467 18.6726 11.578C18.8039 11.7093 18.8776 11.8873 18.8776 12.073V17.947C18.9046 18.759 18.8067 19.292 18.4436 19.627C18.1056 19.938 17.6157 20.027 16.9806 19.993H3.14365C2.49965 19.961 1.99965 19.7 1.76765 19.173C1.61365 18.826 1.54165 18.416 1.54165 17.945V12.072C1.54165 11.8863 1.6154 11.7083 1.74667 11.577C1.87795 11.4458 2.056 11.372 2.24165 11.372C2.4273 11.372 2.60535 11.4458 2.73662 11.577C2.8679 11.7083 2.94165 11.8863 2.94165 12.072V17.945C2.94298 18.1777 2.96632 18.365 3.01165 18.507L3.04765 18.605L3.04465 18.595C3.04565 18.582 3.07465 18.587 3.17665 18.593H17.0166C17.2617 18.607 17.4176 18.593 17.4726 18.592L17.4766 18.591C17.4636 18.538 17.4886 18.321 17.4766 17.969V12.072C17.4766 11.98 17.4948 11.8889 17.53 11.8039C17.5653 11.7189 17.6169 11.6417 17.682 11.5767C17.7471 11.5117 17.8244 11.4601 17.9095 11.425C17.9945 11.3899 18.0856 11.3719 18.1776 11.372M10.4336 0C10.6976 0 10.9336 0.104 11.1556 0.297L19.7806 8.436C19.8487 8.49885 19.9035 8.57458 19.9421 8.65879C19.9806 8.743 20.0021 8.83402 20.0052 8.92658C20.0083 9.01915 19.993 9.1114 19.9602 9.19801C19.9274 9.28463 19.8778 9.36387 19.8141 9.43115C19.7505 9.49843 19.6741 9.55241 19.5895 9.58997C19.5048 9.62753 19.4135 9.64791 19.3209 9.64995C19.2284 9.65198 19.1363 9.63562 19.0501 9.60181C18.9638 9.568 18.8852 9.51742 18.8186 9.453L10.4016 1.509L1.15765 9.474C1.01708 9.59534 0.834076 9.65586 0.648884 9.64227C0.463691 9.62867 0.291485 9.54206 0.170149 9.4015C0.0488123 9.26093 -0.0117155 9.07793 0.00188086 8.89273C0.0154772 8.70754 0.102084 8.53534 0.242649 8.414L9.68865 0.277L9.77465 0.213C9.98865 0.079 10.2026 0.001 10.4346 0.001"
      fill="#6B6B6B"
    />
    <path
      d="M6 17V11.9645H6.96651L7.08083 12.7574H7.11201C7.3545 12.4966 7.62125 12.2803 7.91224 12.1087C8.20323 11.9302 8.52194 11.841 8.86836 11.841C9.30485 11.841 9.64781 11.9302 9.89723 12.1087C10.1536 12.2803 10.3406 12.5343 10.4584 12.8707C10.7494 12.5686 11.0404 12.3215 11.3314 12.1293C11.6293 11.9371 11.9584 11.841 12.3187 11.841C12.9145 11.841 13.3545 12.0332 13.6386 12.4176C13.9296 12.8021 14.0751 13.3513 14.0751 14.0652V17H12.8903V14.23C12.8903 13.7357 12.8106 13.3822 12.6513 13.1693C12.4919 12.9565 12.2494 12.8501 11.9238 12.8501C11.5427 12.8501 11.1132 13.1076 10.6351 13.6224V17H9.43995V14.23C9.43995 13.7357 9.36374 13.3822 9.21132 13.1693C9.06582 12.9565 8.82679 12.8501 8.49423 12.8501C8.09931 12.8501 7.66628 13.1076 7.19515 13.6224V17H6ZM12.3187 11.2849V10.8112C12.6582 10.5915 12.9527 10.3959 13.2021 10.2243C13.4515 10.0458 13.6455 9.88101 13.7841 9.72998C13.9226 9.57208 13.9919 9.41075 13.9919 9.246C13.9919 9.08124 13.9469 8.95423 13.8568 8.86499C13.7667 8.77574 13.6282 8.73112 13.4411 8.73112C13.3095 8.73112 13.1778 8.76888 13.0462 8.84439C12.9215 8.91991 12.8072 9.02632 12.7032 9.16362L12.2148 8.68993C12.4088 8.47712 12.6166 8.30892 12.8383 8.18535C13.06 8.06178 13.3095 8 13.5866 8C13.9954 8 14.3106 8.10297 14.5323 8.30892C14.761 8.50801 14.8753 8.76545 14.8753 9.08124C14.8753 9.27345 14.8164 9.45538 14.6986 9.627C14.5878 9.79863 14.4423 9.96339 14.2621 10.1213C14.0889 10.2723 13.9088 10.4165 13.7217 10.5538H15V11.2849H12.3187Z"
      fill="#6B6B6B"
    />
  </svg>
);

const BedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M6.02941 3H17.1471C17.8885 2.99996 18.6021 3.2828 19.1422 3.79083C19.6823 4.29885 20.0082 4.99379 20.0535 5.73388L20.0588 5.91176V9.46306C20.6361 9.62662 21.1488 9.96454 21.5267 10.4306C21.9046 10.8966 22.1293 11.4681 22.1701 12.0667L22.1765 12.2647V20.2059C22.1764 20.4071 22.1 20.6008 21.9626 20.7478C21.8253 20.8948 21.6372 20.9842 21.4365 20.9979C21.2357 21.0116 21.0373 20.9486 20.8812 20.8217C20.7251 20.6947 20.6231 20.5132 20.5956 20.3139L20.5882 20.2059V17.8235H2.58824V20.2059C2.58823 20.3978 2.51873 20.5832 2.3926 20.7278C2.26647 20.8724 2.09223 20.9665 1.90212 20.9926L1.79412 21C1.60222 21 1.41681 20.9305 1.27219 20.8044C1.12757 20.6782 1.03351 20.504 1.00741 20.3139L1 20.2059V12.2647C1 10.9316 1.89576 9.80824 3.11765 9.462V5.91176C3.11761 5.17028 3.40045 4.45672 3.90847 3.91663C4.4165 3.37653 5.11143 3.05059 5.85153 3.00529L6.02941 3ZM19.2647 10.9412H3.91176C3.5841 10.941 3.26803 11.0624 3.02472 11.2819C2.7814 11.5013 2.62814 11.8032 2.59459 12.1292L2.58824 12.2647V16.2353H20.5882V12.2647C20.5881 11.9372 20.4666 11.6214 20.2472 11.3783C20.0278 11.1352 19.726 10.9821 19.4002 10.9486L19.2647 10.9412ZM17.1471 4.58824H6.02941C5.70175 4.58809 5.38568 4.70948 5.14237 4.92894C4.89905 5.14839 4.74579 5.4503 4.71224 5.77624L4.70588 5.91176V9.35294H6.29412C6.29412 9.07212 6.40567 8.80281 6.60424 8.60424C6.80281 8.40567 7.07212 8.29412 7.35294 8.29412H9.47059C9.72993 8.29415 9.98024 8.38937 10.174 8.5617C10.3678 8.73403 10.4917 8.9715 10.522 9.22906L10.5294 9.35294H12.6471C12.6471 9.07212 12.7586 8.80281 12.9572 8.60424C13.1558 8.40567 13.4251 8.29412 13.7059 8.29412H15.8235C16.0829 8.29415 16.3332 8.38937 16.527 8.5617C16.7208 8.73403 16.8446 8.9715 16.8749 9.22906L16.8824 9.35294H18.4706V5.91176C18.4707 5.5841 18.3493 5.26803 18.1299 5.02472C17.9104 4.7814 17.6085 4.62814 17.2826 4.59459L17.1471 4.58824Z"
      fill="#2E3192"
    />
  </svg>
);

// 체크마크 아이콘 추가
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M13.3333 4L6 11.3333L2.66667 8"
      stroke="#2E3192"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    viewBox="0 0 50 50"
    fill="none"
  >
    <path
      d="M35.4173 37.4994C33.1048 37.4994 31.2507 39.3535 31.2507 41.666C31.2507 42.7711 31.6896 43.8309 32.471 44.6123C33.2524 45.3937 34.3123 45.8327 35.4173 45.8327C36.5224 45.8327 37.5822 45.3937 38.3636 44.6123C39.145 43.8309 39.584 42.7711 39.584 41.666C39.584 40.561 39.145 39.5011 38.3636 38.7197C37.5822 37.9383 36.5224 37.4994 35.4173 37.4994ZM2.08398 4.16602V8.33268H6.25065L13.7507 24.1452L10.9173 29.2494C10.6048 29.8327 10.4173 30.5202 10.4173 31.2494C10.4173 32.3544 10.8563 33.4142 11.6377 34.1956C12.4191 34.977 13.4789 35.416 14.584 35.416H39.584V31.2494H15.459C15.3209 31.2494 15.1884 31.1945 15.0907 31.0968C14.993 30.9991 14.9382 30.8667 14.9382 30.7285C14.9382 30.6244 14.959 30.541 15.0007 30.4785L16.8757 27.0827H32.3965C33.959 27.0827 35.334 26.2077 36.0423 24.9369L43.5007 11.4577C43.6465 11.1243 43.7507 10.7702 43.7507 10.416C43.7507 9.86348 43.5312 9.33358 43.1405 8.94288C42.7498 8.55218 42.2199 8.33268 41.6673 8.33268H10.8548L8.89648 4.16602M14.584 37.4994C12.2715 37.4994 10.4173 39.3535 10.4173 41.666C10.4173 42.7711 10.8563 43.8309 11.6377 44.6123C12.4191 45.3937 13.4789 45.8327 14.584 45.8327C15.6891 45.8327 16.7489 45.3937 17.5303 44.6123C18.3117 43.8309 18.7507 42.7711 18.7507 41.666C18.7507 40.561 18.3117 39.5011 17.5303 38.7197C16.7489 37.9383 15.6891 37.4994 14.584 37.4994Z"
      fill="url(#paint0_linear_1208_3651)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_1208_3651"
        x1="22.9173"
        y1="4.16602"
        x2="22.9173"
        y2="45.8327"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#0C8EA4" />
        <stop offset="1" stopColor="#2E3192" stopOpacity="0.8" />
      </linearGradient>
    </defs>
  </svg>
);

// 타입 정의 추가
interface SeminarImage {
  src: string;
}

interface SeminarInfoProps {
  name: string;
  location: string;
  maxPeople: number;
  area: string;
  price: number;
  images: SeminarImage[];
}

// 객실 정보를 위한 인터페이스 추가
interface RoomImage {
  src: string;
}

interface RoomInfoProps {
  name: string;
  roomType: string;
  bedType: string;
  area: string;
  weekdayPrice: number;
  weekendPrice: number;
  images: RoomImage[];
  amenities: string[];
}

// Seminar information component
// 타입 명시
const SeminarInfo = ({
  name,
  location,
  maxPeople,
  area,
  price,
  images,
}: SeminarInfoProps) => {
  // Swiper ref
  const swiperRef = React.useRef<any>(null);
  return (
    <Flex className="e-info-box" alignItems="flex-start" gap={7} mt={6}>
      {/* 왼쪽 Swiper 슬라이더 */}
      <Box
        flexShrink={0}
        w="210px"
        borderRadius="10px"
        overflow="hidden"
        position="relative"
      >
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            prevEl: `.seminar-swiper-prev-${name}`,
            nextEl: `.seminar-swiper-next-${name}`,
          }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          style={{ borderRadius: "20px" }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {images.map((image: SeminarImage, index: number) => (
            <SwiperSlide key={index}>
              <Box position="relative">
                <Image
                  src={image.src}
                  alt={`${name} ${index + 1}`}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* 커스텀 네비게이션 버튼 */}
        <Flex
          position="absolute"
          bg="rgba(0,0,0,0.35)"
          borderRadius="full"
          bottom="10px"
          right="10px"
          overflow="hidden"
          zIndex={2}
        >
          <Box
            as="button"
            className={`seminar-swiper-prev-${name}`}
            w="32px"
            h="32px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="rgba(0,0,0,0.35)"
            _hover={{ bg: "rgba(0,0,0,0.55)" }}
            border="none"
            cursor="pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10.5 13L6 8L10.5 3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
          <Box
            as="button"
            className={`seminar-swiper-next-${name}`}
            w="32px"
            h="32px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            _hover={{ bg: "rgba(0,0,0,0.55)" }}
            border="none"
            cursor="pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M5.5 3L10 8L5.5 13"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        </Flex>
      </Box>

      {/* Right text box */}
      <Flex
        justifyContent="space-between"
        gap={4}
        flex="1"
        borderTop="1px solid #373636"
        borderBottom="1px solid #373636"
        px={5}
        py={3}
      >
        <Box>
          <Text fontSize="4xl" fontWeight="700" mb={2} color="#373636">
            {name}
          </Text>
          <Text color="#2E3192" fontSize="lg" mb={2}>
            {location}
          </Text>
          <Flex gap={5}>
            <Flex gap={2} color="#6B6B6B" fontSize="sm">
              <Icon>
                <PeopleIcon />
              </Icon>
              최대 {maxPeople}명
            </Flex>
            <Flex gap={2} color="#6B6B6B" fontSize="sm">
              <Icon>
                <AreaIcon />
              </Icon>
              {area}㎡
            </Flex>
          </Flex>
        </Box>
        <Flex
          flexDirection="column"
          alignItems="flex-end"
          justifyContent="space-between"
        >
          <Icon>
            <CartIcon />
          </Icon>
          <Text fontSize="4xl" fontWeight="700" color="#FAB20B">
            ₩{price.toLocaleString()}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

// 객실 정보 컴포넌트
const RoomInfo = ({
  name,
  roomType,
  bedType,
  area,
  weekdayPrice,
  weekendPrice,
  images,
  amenities,
}: RoomInfoProps) => {
  // Swiper ref
  const swiperRef = React.useRef<any>(null);
  return (
    <Flex className="e-info-box" alignItems="flex-start" gap={7} mt={6}>
      {/* 왼쪽 Swiper 슬라이더 */}
      <Box
        flexShrink={0}
        w="210px"
        borderRadius="10px"
        overflow="hidden"
        position="relative"
      >
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            prevEl: `.room-swiper-prev-${name}`,
            nextEl: `.room-swiper-next-${name}`,
          }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          style={{ borderRadius: "20px" }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {images.map((image: RoomImage, index: number) => (
            <SwiperSlide key={index}>
              <Box position="relative">
                <Image
                  src={image.src}
                  alt={`${name} ${index + 1}`}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* 커스텀 네비게이션 버튼 */}
        <Flex position="absolute" bottom="10px" right="10px" zIndex={2} gap={2}>
          <Box
            as="button"
            className={`room-swiper-prev-${name}`}
            w="32px"
            h="32px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            bg="rgba(0,0,0,0.35)"
            boxShadow="0 2px 8px rgba(0,0,0,0.18)"
            _hover={{ bg: "rgba(0,0,0,0.55)" }}
            border="none"
            cursor="pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10.5 13L6 8L10.5 3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
          <Box
            as="button"
            className={`room-swiper-next-${name}`}
            w="32px"
            h="32px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            bg="rgba(0,0,0,0.35)"
            boxShadow="0 2px 8px rgba(0,0,0,0.18)"
            _hover={{ bg: "rgba(0,0,0,0.55)" }}
            border="none"
            cursor="pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M5.5 3L10 8L5.5 13"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        </Flex>
      </Box>

      {/* Right text box */}
      <Flex
        justifyContent="space-between"
        gap={4}
        flex="1"
        borderTop="1px solid #373636"
        borderBottom="1px solid #373636"
        px={5}
        py={3}
      >
        <Box>
          <Text
            display="flex"
            gap={2}
            alignItems="center"
            fontSize="4xl"
            fontWeight="700"
            mb={2}
            color="#373636"
          >
            {name}
            <Em
              backgroundColor="#FFEDA7"
              borderRadius="5px"
              color="#373636"
              fontSize="2xl"
              fontWeight="700"
              fontStyle="normal"
              px={2}
              py={1}
            >
              {roomType}
            </Em>
          </Text>
          <Flex gap={5}>
            <Flex gap={2} color="#6B6B6B" fontSize="sm">
              <Icon>
                <BedIcon />
              </Icon>
              {bedType}
            </Flex>
            <Flex gap={2} color="#6B6B6B" fontSize="sm">
              <Icon color="#2E3192">
                <AreaIcon />
              </Icon>
              {area}㎡
            </Flex>
          </Flex>
          <List.Root
            display="flex"
            flexFlow="row wrap"
            gap={2}
            mt={6}
            color="#6B6B6B"
            fontSize="sm"
            listStyleType="none"
          >
            {amenities.map((amenity, index) => (
              <List.Item key={index} display="flex" alignItems="center" gap={1}>
                <Icon as={CheckIcon} />
                {amenity}
              </List.Item>
            ))}
          </List.Root>
        </Box>
        <Flex
          flexShrink={0}
          flexDirection="column"
          alignItems="flex-end"
          justifyContent="space-between"
        >
          <Icon>
            <CartIcon />
          </Icon>
          <Box>
            <Text fontSize="4xl" fontWeight="700" color="#373636">
              <Highlight
                query={"₩" + weekdayPrice.toLocaleString()}
                styles={{ color: "#FAB20B" }}
              >
                {`주중 ₩${weekdayPrice.toLocaleString()}`}
              </Highlight>
            </Text>
            <Text fontSize="4xl" fontWeight="700" color="#373636">
              <Highlight
                query={"₩" + weekendPrice.toLocaleString()}
                styles={{ color: "#FAB20B" }}
              >
                {`주말 ₩${weekendPrice.toLocaleString()}`}
              </Highlight>
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

// Seminar data
// 타입 명시
const Seminars: SeminarInfoProps[] = [
  {
    name: "누리",
    location: "1F / 소회의실",
    maxPeople: 10,
    area: "85.95",
    price: 308000,
    images: [
      { src: "/images/contents/seminar01_img01.jpg" },
      { src: "/images/contents/seminar01_img02.jpg" },
    ],
  },
  {
    name: "가람",
    location: "1F / 소회의실",
    maxPeople: 10,
    area: "85.95",
    price: 308000,
    images: [
      { src: "/images/contents/seminar01_img01.jpg" },
      { src: "/images/contents/seminar01_img02.jpg" },
    ],
  },
  {
    name: "오션",
    location: "2F / 소회의실",
    maxPeople: 20,
    area: "59.28",
    price: 154000,
    images: [{ src: "/images/contents/seminar02_img01.jpg" }],
  },
  {
    name: "그랜드볼룸",
    location: "2F / 그랜드볼룸",
    maxPeople: 250,
    area: "543.15",
    price: 1386000,
    images: [
      { src: "/images/contents/seminar03_img01.jpg" },
      { src: "/images/contents/seminar03_img02.jpg" },
      { src: "/images/contents/seminar03_img03.jpg" },
    ],
  },
  {
    name: "시걸",
    location: "8F / 중회의실",
    maxPeople: 100,
    area: "180",
    price: 693000,
    images: [
      { src: "/images/contents/seminar04_img01.jpg" },
      { src: "/images/contents/seminar04_img02.jpg" },
      { src: "/images/contents/seminar04_img03.jpg" },
    ],
  },
  {
    name: "자스민",
    location: "8F / 중회의실",
    maxPeople: 50,
    area: "138.84",
    price: 462000,
    images: [
      { src: "/images/contents/seminar05_img01.jpg" },
      { src: "/images/contents/seminar05_img02.jpg" },
      { src: "/images/contents/seminar05_img03.jpg" },
    ],
  },
  {
    name: "클로버",
    location: "8F / 중회의실",
    maxPeople: 80,
    area: "173",
    price: 462000,
    images: [
      { src: "/images/contents/seminar06_img01.jpg" },
      { src: "/images/contents/seminar06_img02.jpg" },
      { src: "/images/contents/seminar06_img03.jpg" },
    ],
  },
];

// 객실 데이터
const rooms: RoomInfoProps[] = [
  {
    name: "슈페리어 트윈",
    roomType: "2인실",
    bedType: "싱글 1개 & 더블 1개",
    area: "23.1",
    weekdayPrice: 77000,
    weekendPrice: 99000,
    images: [
      { src: "/images/contents/room01_img01.jpg" },
      { src: "/images/contents/room01_img02.jpg" },
    ],
    amenities: [
      "욕조에 딸린 샤워기",
      "평면 TV",
      "거울",
      "냉장고",
      "드레스룸",
      "무료생수",
      "샤워도구",
      "소화기",
      "슬리퍼",
      "암막커튼",
      "에어컨",
      "옷걸이",
      "옷장",
      "타월",
      "헤어드라이어",
      "샤워실",
      "금연",
    ],
  },
  {
    name: "슈페리어 트리플",
    roomType: "3인실",
    bedType: "싱글 3개",
    area: "23.1",
    weekdayPrice: 66000,
    weekendPrice: 99000,
    images: [
      { src: "/images/contents/room02_img01.jpg" },
      { src: "/images/contents/room02_img02.jpg" },
    ],
    amenities: [
      "욕조에 딸린 샤워기",
      "평면 TV",
      "거울",
      "냉장고",
      "드레스룸",
      "무료생수",
      "샤워도구",
      "소화기",
      "슬리퍼",
      "암막커튼",
      "에어컨",
      "옷걸이",
      "옷장",
      "타월",
      "헤어드라이어",
      "샤워실",
      "금연",
    ],
  },
  {
    name: "슈페리어 디럭스",
    roomType: "4인실",
    bedType: "싱글 2개 & 더블 1개",
    area: "23.1",
    weekdayPrice: 77000,
    weekendPrice: 121000,
    images: [
      { src: "/images/contents/room03_img01.jpg" },
      { src: "/images/contents/room03_img02.jpg" },
    ],
    amenities: [
      "평면 TV",
      "거울",
      "냉장고",
      "드레스룸",
      "무료생수",
      "샤워도구",
      "소화기",
      "슬리퍼",
      "암막커튼",
      "에어컨",
      "옷걸이",
      "옷장",
      "타월",
      "헤어드라이어",
      "샤워실",
      "금연",
    ],
  },
  {
    name: "코리안 슈페리어",
    roomType: "5인실",
    bedType: "온돌 1개 & 침구세트 4개",
    area: "23.1",
    weekdayPrice: 77000,
    weekendPrice: 121000,
    images: [
      { src: "/images/contents/room04_img01.jpg" },
      { src: "/images/contents/room04_img02.jpg" },
    ],
    amenities: [
      "평면 TV",
      "거울",
      "냉장고",
      "드레스룸",
      "무료생수",
      "샤워도구",
      "소화기",
      "슬리퍼",
      "암막커튼",
      "에어컨",
      "옷걸이",
      "옷장",
      "타월",
      "헤어드라이어",
      "샤워실",
      "금연",
      "바닥(온돌)난방",
    ],
  },
  {
    name: "패밀리스위트",
    roomType: "5인실",
    bedType: "더블 1개 & 1인 침구세트 3개",
    area: "39.7",
    weekdayPrice: 110000,
    weekendPrice: 165000,
    images: [
      { src: "/images/contents/room05_img01.jpg" },
      { src: "/images/contents/room05_img02.jpg" },
      { src: "/images/contents/room05_img03.jpg" },
      { src: "/images/contents/room05_img04.jpg" },
    ],
    amenities: [
      "욕조에 딸린 샤워기",
      "평면 TV",
      "거울",
      "냉장고",
      "드레스룸",
      "무료생수",
      "샤워도구",
      "소화기",
      "슬리퍼",
      "암막커튼",
      "에어컨",
      "옷걸이",
      "옷장",
      "타월",
      "헤어드라이어",
      "바닥(온돌)난방",
      "샤워실",
      "금연",
    ],
  },
];

// 달력 관련 타입 정의 추가
interface DateInfo {
  year: number;
  month: number;
  day: number;
}

export default function EstimatePage() {
  // 달력 상태 관리 추가
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [nextMonthDate, setNextMonthDate] = React.useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const [checkInDate, setCheckInDate] = React.useState<DateInfo | null>(null);
  const [checkOutDate, setCheckOutDate] = React.useState<DateInfo | null>(null);
  const [selectionMode, setSelectionMode] = React.useState<
    "checkIn" | "checkOut"
  >("checkIn");
  const [selectedRangeText, setSelectedRangeText] = React.useState<string>("");
  // useDisclosure 대신 useState로 Collapsible 상태 제어
  const [isOpen, setIsOpen] = React.useState(false);

  // 캘린더 요일 영문 약어
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // 달력 관련 함수들
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (date: DateInfo) => {
    return `${date.year}.${(date.month + 1)
      .toString()
      .padStart(2, "0")}.${date.day.toString().padStart(2, "0")}`;
  };

  const isSameDate = (date1: DateInfo, date2: DateInfo) => {
    return (
      date1.year === date2.year &&
      date1.month === date2.month &&
      date1.day === date2.day
    );
  };

  const isDateInRange = (date: DateInfo, start: DateInfo, end: DateInfo) => {
    const checkDate = new Date(date.year, date.month, date.day);
    const startDate = new Date(start.year, start.month, start.day);
    const endDate = new Date(end.year, end.month, end.day);

    return checkDate >= startDate && checkDate <= endDate;
  };

  const handlePrevMonth = () => {
    const newCurrentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    setCurrentDate(newCurrentDate);
    setNextMonthDate(
      new Date(newCurrentDate.getFullYear(), newCurrentDate.getMonth() + 1, 1)
    );
  };

  const handleNextMonth = () => {
    const newCurrentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    setCurrentDate(newCurrentDate);
    setNextMonthDate(
      new Date(newCurrentDate.getFullYear(), newCurrentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day: number, monthDate: Date) => {
    const dateInfo: DateInfo = {
      year: monthDate.getFullYear(),
      month: monthDate.getMonth(),
      day: day,
    };

    if (selectionMode === "checkIn") {
      setCheckInDate(dateInfo);
      // 체크인 날짜가 체크아웃 날짜보다 늦으면 체크아웃 날짜 초기화
      if (
        checkOutDate &&
        new Date(dateInfo.year, dateInfo.month, dateInfo.day) >
          new Date(checkOutDate.year, checkOutDate.month, checkOutDate.day)
      ) {
        setCheckOutDate(null);
      }
      // 체크인 선택 후 자동으로 체크아웃 모드로 전환
      setSelectionMode("checkOut");
    } else {
      // 체크아웃 날짜는 체크인 날짜보다 이후여야 함
      if (
        checkInDate &&
        new Date(dateInfo.year, dateInfo.month, dateInfo.day) <
          new Date(checkInDate.year, checkInDate.month, checkInDate.day)
      ) {
        return;
      }
      setCheckOutDate(dateInfo);
      // 체크아웃 선택 후 자동으로 체크인 모드로 전환
      setSelectionMode("checkIn");
    }
  };

  // 달력 렌더링 함수 수정: 네비게이션 위치 및 표시 방식 개선
  const renderCalendar = (
    monthDate: Date,
    calendarIndex: number,
    isMobile: boolean
  ) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    // 이전 달의 마지막 날짜들
    const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
      return daysInPrevMonth - firstDayOfMonth + i + 1;
    });

    // 현재 달의 날짜들
    const currentMonthDays = Array.from(
      { length: daysInMonth },
      (_, i) => i + 1
    );

    // 다음 달의 시작 날짜들
    const nextMonthDays = Array.from(
      { length: 42 - (prevMonthDays.length + currentMonthDays.length) },
      (_, i) => i + 1
    );

    return (
      <Box flex="1">
        {/* 네비게이션 & 월/년 정보 한 줄 배치 */}
        <Flex justify="space-between" align="center" mb={2}>
          {/* 왼쪽 화살표: 첫 번째 달력 또는 모바일에서만 표시 */}
          {calendarIndex === 0 || isMobile ? (
            <Box
              as="button"
              p={1}
              _hover={{ bg: "gray.100" }}
              onClick={handlePrevMonth}
              aria-label="이전 달"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="24"
                viewBox="0 0 12 24"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.84306 12.7109L7.50006 18.3679L8.91406 16.9539L3.96406 12.0039L8.91406 7.05389L7.50006 5.63989L1.84306 11.2969C1.65559 11.4844 1.55028 11.7387 1.55028 12.0039C1.55028 12.2691 1.65559 12.5234 1.84306 12.7109Z"
                  fill="black"
                />
              </svg>
            </Box>
          ) : (
            <Box width="32px" />
          )}
          <Text
            fontWeight="700"
            fontSize="sm"
            color="#2E3192"
            textAlign="center"
          >
            {year}년 {month + 1}월
          </Text>
          {/* 오른쪽 화살표: 두 번째 달력 또는 모바일에서만 표시 */}
          {calendarIndex === 1 || isMobile ? (
            <Box
              as="button"
              p={1}
              borderRadius="md"
              _hover={{ bg: "gray.100" }}
              onClick={handleNextMonth}
              aria-label="다음 달"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="24"
                viewBox="0 0 12 24"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.1569 12.7109L4.49994 18.3679L3.08594 16.9539L8.03594 12.0039L3.08594 7.05389L4.49994 5.63989L10.1569 11.2969C10.3444 11.4844 10.4497 11.7387 10.4497 12.0039C10.4497 12.2691 10.3444 12.5234 10.1569 12.7109Z"
                  fill="black"
                />
              </svg>
            </Box>
          ) : (
            <Box width="32px" />
          )}
        </Flex>
        <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={1}>
          {weekDays.map((day, i) => (
            <Box
              key={i}
              textAlign="center"
              fontWeight="bold"
              color={i === 0 ? "#2E3192" : i === 6 ? "#2E3192" : "#373636"}
              fontSize="xs"
              py={1}
            >
              {day}
            </Box>
          ))}
        </Grid>
        <Grid templateColumns="repeat(7, 1fr)" gap={1} flex="1">
          {/* 이전 달 날짜 */}
          {prevMonthDays.map((day, i) => (
            <Box
              key={`prev-${i}`}
              textAlign="center"
              p={1}
              borderRadius="md"
              color="#BDBDBD"
              bg="transparent"
              fontSize="xs"
              opacity={0.5}
              cursor="default"
            >
              {day}
            </Box>
          ))}
          {/* 현재 달 날짜 */}
          {currentMonthDays.map((day, i) => {
            const dateInfo: DateInfo = {
              year: year,
              month: month,
              day: day,
            };
            const isWeekend =
              (i + firstDayOfMonth) % 7 === 0 ||
              (i + firstDayOfMonth) % 7 === 6;
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;
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
                textAlign="center"
                p={1}
                borderRadius="8px"
                fontWeight="bold"
                fontSize="xs"
                bg={
                  isCheckIn || isCheckOut
                    ? "#2E3192"
                    : isInRange
                    ? "#F0F2F7"
                    : isToday
                    ? "#E6F0FA"
                    : "transparent"
                }
                color={isCheckIn || isCheckOut ? "white" : "#373636"}
                transition="background 0.2s, color 0.2s"
                cursor="pointer"
                _hover={{
                  bg: isCheckIn || isCheckOut ? "#1B2066" : "#E6F0FA",
                }}
                onClick={() => handleDateClick(day, monthDate)}
              >
                {day}
              </Box>
            );
          })}
          {/* 다음 달 날짜 */}
          {nextMonthDays.map((day, i) => (
            <Box
              key={`next-${i}`}
              textAlign="center"
              p={1}
              borderRadius="md"
              color="#BDBDBD"
              bg="transparent"
              fontSize="xs"
              opacity={0.5}
              cursor="default"
            >
              {day}
            </Box>
          ))}
        </Grid>
      </Box>
    );
  };

  const infoItems01 = [
    "하단리스트의 선택할 연회장/객실을 장바구니 버튼을 클릭하여 담습니다.",
    "오른쪽 가견적 산출프로그램에서 담긴 정보를 확인합니다.",
    "담긴 정보의 이용기간 및 수량을 확인 후 선택합니다 (객실은 숙박일정을 먼저 입력 후 선택이 가능합니다)",
    "연회장 및 객실 정보 입력 후 가견적서 발행 바로가기 버튼이 나오면, 클릭하여 가견적서 발행 페이지로 이동합니다",
  ];

  function getNightsDays(checkIn: DateInfo | null, checkOut: DateInfo | null) {
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
        // 객실 이용기간(박)에 nights 값 일괄 반영
        setRoomNights(Array(roomList.length).fill(range.nights));
        setIsOpen(false); // Collapsible 닫기
      }
    }
  }

  function handleResetDates() {
    setCheckInDate(null);
    setCheckOutDate(null);
    setSelectionMode("checkIn");
    setSelectedRangeText("");
  }

  // 연회장/객실 가격적 산출 프로그램 상태 추가
  const hallList = [
    "누리",
    "가람",
    "오션",
    "그랜드볼룸",
    "시걸",
    "자스민",
    "클로버",
  ];
  const roomList = [
    "슈페리얼 트윈",
    "슈페리얼 트리플",
    "슈페리얼 디럭스",
    "코리안 슈페리어",
    "패밀리스위트",
  ];
  const [hallDays, setHallDays] = React.useState(
    Array(hallList.length).fill(0)
  );
  const [roomNights, setRoomNights] = React.useState(
    Array(roomList.length).fill(0)
  );
  const [roomCounts, setRoomCounts] = React.useState(
    Array(roomList.length).fill(0)
  );

  // 핸들러
  const handleHallDay = (idx: number, delta: number) => {
    setHallDays((prev) => {
      const next = [...prev];
      next[idx] = Math.max(0, next[idx] + delta);
      return next;
    });
  };
  const handleRoomNight = (idx: number, delta: number) => {
    setRoomNights((prev) => {
      const next = [...prev];
      next[idx] = Math.max(0, next[idx] + delta);
      return next;
    });
  };
  const handleRoomCount = (idx: number, delta: number) => {
    setRoomCounts((prev) => {
      const next = [...prev];
      next[idx] = Math.max(0, next[idx] + delta);
      return next;
    });
  };

  // 세미나실(연회장) 총 금액 계산
  const seminarTotal = React.useMemo(() => {
    return Seminars.reduce((sum, seminar, idx) => {
      return sum + seminar.price * (hallDays[idx] || 0);
    }, 0);
  }, [Seminars, hallDays]);

  // 주어진 체크인/체크아웃 날짜로부터 평일/주말 박수 계산 함수
  function getWeekdayWeekendNights(
    checkIn: DateInfo | null,
    checkOut: DateInfo | null
  ) {
    if (!checkIn || !checkOut) return { weekday: 0, weekend: 0 };
    const inDate = new Date(checkIn.year, checkIn.month, checkIn.day);
    const outDate = new Date(checkOut.year, checkOut.month, checkOut.day);
    let weekday = 0;
    let weekend = 0;
    for (let d = new Date(inDate); d < outDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 0 || day === 6) weekend++;
      else weekday++;
    }
    return { weekday, weekend };
  }

  // 객실 총 금액 계산 (주말/평일 요금 반영)
  const roomTotal = React.useMemo(() => {
    const { weekday, weekend } = getWeekdayWeekendNights(
      checkInDate,
      checkOutDate
    );
    return rooms.reduce((sum, room, idx) => {
      const nights = roomNights[idx] || 0;
      const count = roomCounts[idx] || 0;
      // 전체 박수 중 평일/주말 비율로 분배
      let weekdayNights = 0;
      let weekendNights = 0;
      if (weekday + weekend > 0 && nights > 0) {
        weekdayNights = Math.round((weekday / (weekday + weekend)) * nights);
        weekendNights = nights - weekdayNights;
      }
      return (
        sum +
        (room.weekdayPrice * weekdayNights +
          room.weekendPrice * weekendNights) *
          count
      );
    }, 0);
  }, [rooms, roomNights, roomCounts, checkInDate, checkOutDate]);

  const totalAmount = seminarTotal + roomTotal;

  return (
    <PageContainer>
      <Heading mb="-50px" color="#373636" fontSize="2xl" fontWeight="700">
        가견적 산출방법
      </Heading>
      <InfoBoxList01 items={infoItems01} />
      <Box
        mt={10}
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
      >
        <Box w="58.75%">
          <Heading
            as="h3"
            borderBottom="3px solid #161515"
            color="#0C8EA4"
            fontSize="50px"
            fontWeight="700"
            lineHeight="1.5"
          >
            연회장 (세미나실)
          </Heading>
          <Box>
            {Seminars.map((Seminar, index) => (
              <SeminarInfo key={index} {...Seminar} />
            ))}
          </Box>

          <Heading
            as="h3"
            borderBottom="3px solid #161515"
            mt={"60px"}
            color="#2E3192"
            fontSize="50px"
            fontWeight="700"
            lineHeight="1.5"
          >
            객실
          </Heading>
          <Collapsible.Root
            open={isOpen}
            onOpenChange={(details) => setIsOpen(details.open)}
            my={10}
          >
            <Collapsible.Trigger
              display="flex"
              alignItems="center"
              gap={2}
              border="5px solid #2E3192"
              borderRadius="md"
              p={7}
              w="100%"
              textAlign="left"
            >
              <Icon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M2 11.7442C2 7.8765 2 5.94214 3.20205 4.74111C4.4041 3.54009 6.33744 3.53906 10.2051 3.53906H14.3077C18.1754 3.53906 20.1097 3.53906 21.3108 4.74111C22.5118 5.94316 22.5128 7.8765 22.5128 11.7442V13.7955C22.5128 17.6632 22.5128 19.5975 21.3108 20.7985C20.1087 21.9996 18.1754 22.0006 14.3077 22.0006H10.2051C6.33744 22.0006 4.40308 22.0006 3.20205 20.7985C2.00103 19.5965 2 17.6632 2 13.7955V11.7442Z"
                    stroke="#575757"
                    stroke-width="1.5"
                  />
                  <path
                    d="M7.12906 3.53846V2M17.3855 3.53846V2M2.51367 8.66667H22.0009"
                    stroke="#575757"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                  <path
                    d="M7.12891 16.3467C7.26832 16.3467 7.4024 16.4024 7.50098 16.501C7.59935 16.5995 7.6552 16.7329 7.65527 16.8721C7.65527 16.9767 7.62361 17.0783 7.56641 17.1641L7.50098 17.2441C7.4024 17.3427 7.26832 17.3984 7.12891 17.3984C7.02452 17.3984 6.9235 17.3666 6.83789 17.3096L6.75781 17.2441C6.65924 17.1456 6.60352 17.0115 6.60352 16.8721C6.60357 16.7678 6.63447 16.6666 6.69141 16.5811L6.75781 16.501C6.85633 16.4025 6.98959 16.3467 7.12891 16.3467ZM12.2578 16.3467C12.3971 16.3468 12.5304 16.4025 12.6289 16.501C12.7274 16.5995 12.7831 16.7328 12.7832 16.8721C12.7832 16.9767 12.7516 17.0783 12.6943 17.1641L12.6289 17.2441C12.5304 17.3425 12.397 17.3983 12.2578 17.3984C12.1533 17.3984 12.0515 17.3667 11.9658 17.3096L11.8857 17.2441C11.7872 17.1456 11.7314 17.0115 11.7314 16.8721C11.7315 16.7328 11.7873 16.5995 11.8857 16.501C11.9843 16.4024 12.1184 16.3467 12.2578 16.3467ZM17.3857 16.3467C17.49 16.3467 17.5912 16.3777 17.6768 16.4346L17.7568 16.501C17.8553 16.5995 17.9111 16.7328 17.9111 16.8721C17.9111 16.9766 17.8804 17.0784 17.8232 17.1641L17.7568 17.2441C17.6583 17.3425 17.525 17.3984 17.3857 17.3984C17.2811 17.3984 17.1795 17.3668 17.0938 17.3096L17.0137 17.2441C16.9151 17.1456 16.8604 17.0115 16.8604 16.8721C16.8604 16.7677 16.8912 16.6667 16.9482 16.5811L17.0137 16.501C17.1122 16.4024 17.2463 16.3467 17.3857 16.3467ZM7.12891 12.2441C7.23342 12.2441 7.3352 12.2749 7.4209 12.332L7.50098 12.3984C7.59935 12.4969 7.65521 12.6303 7.65527 12.7695C7.65527 12.9089 7.59955 13.043 7.50098 13.1416C7.4024 13.2402 7.26831 13.2959 7.12891 13.2959C7.02453 13.2958 6.9235 13.2641 6.83789 13.207L6.75781 13.1416C6.65924 13.043 6.60352 12.9089 6.60352 12.7695C6.60357 12.6652 6.63448 12.5641 6.69141 12.4785L6.75781 12.3984C6.85633 12.2999 6.98959 12.2442 7.12891 12.2441ZM12.2578 12.2441C12.3621 12.2442 12.4633 12.2751 12.5488 12.332L12.6289 12.3984C12.7274 12.4969 12.7831 12.6303 12.7832 12.7695C12.7832 12.9089 12.7275 13.043 12.6289 13.1416C12.5304 13.24 12.397 13.2958 12.2578 13.2959C12.1185 13.2959 11.9843 13.2401 11.8857 13.1416C11.7872 13.043 11.7314 12.9089 11.7314 12.7695C11.7315 12.6651 11.7632 12.5641 11.8203 12.4785L11.8857 12.3984C11.9843 12.2999 12.1184 12.2441 12.2578 12.2441ZM17.3857 12.2441C17.49 12.2442 17.5912 12.2751 17.6768 12.332L17.7568 12.3984C17.8554 12.497 17.9111 12.6302 17.9111 12.7695C17.9111 12.8741 17.8804 12.9758 17.8232 13.0615L17.7568 13.1416C17.6583 13.24 17.525 13.2959 17.3857 13.2959C17.2811 13.2959 17.1795 13.2643 17.0938 13.207L17.0137 13.1416C16.9151 13.043 16.8604 12.9089 16.8604 12.7695C16.8604 12.6652 16.8912 12.5641 16.9482 12.4785L17.0137 12.3984C17.1122 12.2999 17.2463 12.2441 17.3857 12.2441Z"
                    fill="black"
                    stroke="#575757"
                  />
                </svg>
              </Icon>
              <Text color="#9E9E9E" fontSize="xs" fontWeight="600">
                {selectedRangeText
                  ? selectedRangeText
                  : "체크인 날짜와 체크아웃 날짜를 먼저 선택해주세요"}
              </Text>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box p={4} backgroundColor="#F7F8FB">
                <Flex
                  direction={{ base: "column", md: "row" }}
                  gap={4}
                  justify="space-between"
                >
                  {/* 첫 번째 달력 (현재 월) */}
                  <Box display="flex" flexDirection="column" flex="1">
                    {renderCalendar(
                      currentDate,
                      0,
                      typeof window !== "undefined" && window.innerWidth < 768
                    )}
                  </Box>
                  {/* 두 번째 달력 (다음 월) - PC에서만 표시 */}
                  <Box
                    display={{ base: "none", md: "flex" }}
                    flexDirection="column"
                    flex="1"
                  >
                    {renderCalendar(nextMonthDate, 1, false)}
                  </Box>
                </Flex>
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  gap={2}
                  mt={2}
                  py={2}
                  borderTop="1px solid #838383"
                >
                  <Button
                    px={4}
                    py={2}
                    borderRadius="md"
                    bg="#F8F8FA"
                    color="#2E3192"
                    fontWeight="bold"
                    border="1px solid #2E3192"
                    _hover={{ bg: "#E6F0FA" }}
                    onClick={handleResetDates}
                  >
                    날짜 초기화
                  </Button>
                  <Button
                    px={4}
                    py={2}
                    borderRadius="md"
                    bg="#2E3192"
                    color="white"
                    fontWeight="bold"
                    _hover={{ bg: "#1B2066" }}
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
                </Box>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
          <Box>
            {rooms.map((room, index) => (
              <RoomInfo key={index} {...room} />
            ))}
          </Box>
        </Box>
        <Box
          w="32.5%"
          className="esimate-prg-box"
          position="sticky"
          top="80px"
          zIndex={2}
        >
          {/* 연회장/객실 가격적 산출 프로그램 UI */}
          <Box bg="#F7F8FB" borderRadius="2xl" px={10} py={5} mx="auto">
            {/* 상단 타이틀 */}
            <Flex align="center" gap={2} mb={2}>
              <Box as="span">
                <Image
                  src="/images/contents/estimate_ico01.png"
                  alt="estimate_icon01"
                  w="34px"
                  h="40px"
                />
              </Box>
              <Text
                fontWeight="800"
                fontSize="2xl"
                background="linear-gradient(90deg, #0C8EA4 0%, rgba(46, 49, 146, 0.80) 100%)"
                bgClip="text"
                style={{
                  WebkitTextFillColor: "transparent",
                }}
              >
                연회장/객실 가견견적 산출 프로그램
              </Text>
            </Flex>
            <Text
              backgroundColor="#ffffff"
              fontSize="md"
              fontWeight="700"
              color="#0C8EA4"
              mb={3}
              borderRadius="lg"
              p={1}
              textAlign="center"
            >
              선택하신 연회장 정보가 표시됩니다
            </Text>
            {/* 연회장 테이블 */}
            <Box bg="white" borderRadius="lg" p={3} mb={4}>
              <Flex fontWeight="600" color="#0C8EA4" fontSize="sm" mb={2}>
                <Box flex="1">연회장명</Box>
                <Box w="120px" textAlign="center">
                  이용기간(일)
                </Box>
              </Flex>
              {hallList.map((name, idx) => (
                <Flex key={name} align="center" mb={1}>
                  <Box flex="1" fontSize="xl">
                    {name}
                  </Box>
                  <Flex
                    border="1px solid #0C8EA4"
                    borderRadius="md"
                    w="120px"
                    align="center"
                    justify="center"
                    gap={2}
                  >
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="#373636"
                      onClick={() => handleHallDay(idx, -1)}
                    >
                      -
                    </Button>
                    <Text color="#0C8EA4" fontWeight="600" fontSize="sm">
                      {hallDays[idx]}
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="#373636"
                      onClick={() => handleHallDay(idx, 1)}
                    >
                      +
                    </Button>
                  </Flex>
                </Flex>
              ))}
            </Box>
            <Text
              backgroundColor="#ffffff"
              fontSize="md"
              fontWeight="700"
              color="#2E3192"
              mb={3}
              borderRadius="lg"
              p={1}
              textAlign="center"
            >
              선택하신 객실 정보가 표시됩니다
            </Text>
            {/* 객실 테이블 */}
            <Box bg="white" borderRadius="lg" p={3} mb={4}>
              <Flex fontWeight="600" color="#2E3192" fontSize="sm" mb={2}>
                <Box flex="1">객실명</Box>
                <Box w="80px" textAlign="center">
                  이용기간(박)
                </Box>
                <Box w="120px" textAlign="center">
                  수량
                </Box>
              </Flex>
              {roomList.map((name, idx) => (
                <Flex key={name} align="center" mb={1}>
                  <Box flex="1" fontSize="xl">
                    {name}
                  </Box>
                  {/* 이용기간(박): 값만 표시, 버튼 없음 */}
                  <Box
                    w="80px"
                    color="#838383"
                    fontWeight="600"
                    fontSize="sm"
                    textAlign="center"
                  >
                    {roomNights[idx]}
                  </Box>
                  {/* 수량: ± 버튼 */}
                  <Flex
                    border="1px solid #2E3192"
                    borderRadius="md"
                    w="120px"
                    align="center"
                    justify="center"
                    gap={2}
                  >
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="#373636"
                      onClick={() => handleRoomCount(idx, -1)}
                    >
                      -
                    </Button>
                    <Text color="#2E3192" fontWeight="600" fontSize="sm">
                      {roomCounts[idx]}
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="#373636"
                      onClick={() => handleRoomCount(idx, 1)}
                    >
                      +
                    </Button>
                  </Flex>
                </Flex>
              ))}
            </Box>
            {/* 총금액 영역 */}
            <Box
              bg="#FAB20B"
              borderRadius="md"
              p={4}
              mb={3}
              fontWeight="700"
              fontSize="xl"
              color="#2E3192"
            >
              총금액
              <br />
              <Text
                fontSize="4xl"
                color="#000000"
                fontWeight="700"
                textAlign="right"
              >
                {totalAmount > 0
                  ? `₩ ${totalAmount.toLocaleString()}`
                  : "정보 선택 후 확인 가능"}
              </Text>
            </Box>
            {/* 발행 버튼 */}
            <Button
              w="100%"
              bg="#2E3192"
              color="white"
              fontWeight="800"
              fontSize="3xl"
              borderRadius="md"
              py={6}
              _hover={{ bg: "#1B2066" }}
              mt={2}
            >
              가견적서 발행 바로가기
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="31"
                viewBox="0 0 30 31"
                fill="none"
              >
                <path
                  d="M2.50017 16.7498L2.5 14.2499H22.7149L17.7777 9.31268L19.5455 7.54492L27.5005 15.4999L19.5455 23.4549L17.7777 21.687L22.715 16.7499L2.50017 16.7498Z"
                  fill="white"
                />
              </svg>
            </Button>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}
