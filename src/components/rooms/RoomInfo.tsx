import React from "react";
import {
  Box,
  Flex,
  Text,
  Image,
  Icon,
  Button,
  List,
  Em,
  Highlight,
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { BedIcon, AreaIcon, CheckIcon, CartIcon } from "@/components/icons";

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
  onQuantityChange: (delta: number) => void;
  quantity: number;
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
  onQuantityChange,
  quantity,
}: RoomInfoProps) => {
  const swiperRef = React.useRef<any>(null);

  return (
    <Box mt={6}>
      <Flex alignItems="flex-start" gap={7} className="e-info-box">
        {/* Left Swiper slider */}
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
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={image.src}
                  alt={`${name} ${index + 1}`}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Navigation buttons */}
          <Flex
            position="absolute"
            bottom="10px"
            right="10px"
            zIndex={2}
            gap={2}
          >
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

        {/* Right content */}
        <Box flex="1">
          <Flex
            justifyContent="space-between"
            gap={4}
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
                  <Icon as={BedIcon} />
                  {bedType}
                </Flex>
                <Flex gap={2} color="#6B6B6B" fontSize="sm">
                  <Icon as={AreaIcon} color="#2E3192" />
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
                  <List.Item
                    key={index}
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
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
              <Icon as={CartIcon} />
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

          {/* Room selection form */}
          <Box className="room-select-form" mt={4}>
            <Text
              fontSize={{ base: "16px", md: "18px" }}
              fontWeight="600"
              color="#373636"
              flex="1"
            >
              {name} {roomType}
            </Text>
            <Box className="quantity-control">
              <Button
                onClick={() => onQuantityChange(-1)}
                disabled={quantity === 0}
              >
                -
              </Button>
              <Text className="quantity">{quantity}</Text>
              <Button onClick={() => onQuantityChange(1)}>+</Button>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};
