import {
  Box,
  Flex,
  Image,
  Icon,
  Text,
  Em,
  List,
  Highlight,
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import React from "react";
import {
  AreaIcon,
  BedIcon,
  CartIcon,
  CheckIcon,
} from "@/components/icons/EstimateIcons";
import { CartItem } from "@/types/estimate";

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
  roomQuantities: Record<string, number>;
  addToCart: (item: CartItem) => void;
}

export const RoomInfo = ({
  name,
  roomType,
  bedType,
  area,
  weekdayPrice,
  weekendPrice,
  images,
  amenities,
  roomQuantities,
  addToCart,
}: RoomInfoProps) => {
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
          <Box
            onClick={() =>
              addToCart({
                id: name,
                checkInDate: new Date(),
                checkOutDate: new Date(),
                productId: name,
                type: "room",
                name: name,
                quantity: roomQuantities[name] || 1,
              })
            }
            cursor="pointer"
          >
            <CartIcon />
          </Box>
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
