import { Box, Flex, Image, Icon, Text, IconButton } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import React from "react";
import {
  PeopleIcon,
  AreaIcon,
  CartIcon,
} from "@/components/icons/EstimateIcons";
import { CartItem } from "@/types/estimate";

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
  addToCart: (seminar: CartItem) => void;
}

export const SeminarInfo = ({
  name,
  location,
  maxPeople,
  area,
  price,
  images,
  addToCart,
}: SeminarInfoProps) => {
  const swiperRef = React.useRef<any>(null);
  return (
    <Flex className="e-info-box" alignItems="flex-start" gap={7} mt={6}>
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
            onClick={() =>
              addToCart({
                id: name,
                productId: name,
                type: "seminar",
                name: name,
                checkInDate: new Date(),
                checkOutDate: new Date(),
                quantity: 1,
              })
            }
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
          <Box
            onClick={() =>
              addToCart({
                id: name,
                productId: name,
                type: "seminar",
                name: name,
                quantity: 1,
                checkInDate: new Date(),
                checkOutDate: new Date(),
              })
            }
            cursor="pointer"
          >
            <CartIcon />
          </Box>
          <Text fontSize="4xl" fontWeight="700" color="#FAB20B">
            ₩{price.toLocaleString()}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
