import { Box, Flex, Icon, Text, Em, List, Highlight } from "@chakra-ui/react";
import React from "react";
import { AreaIcon, BedIcon, CheckIcon } from "@/components/icons/EstimateIcons";
import { CartItem } from "@/types/estimate";
import { ShoppingCart, Check } from "lucide-react";
import { ImageSwiper } from "@/components/common/ImageSwiper";
import { useEstimateContext } from "@/contexts/EstimateContext";

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
  addToCart,
}: RoomInfoProps) => {
  const { cart, removeFromCart } = useEstimateContext();
  const isInCart = cart.some((item) => item.productId === name);

  const handleToggleCart = () => {
    if (isInCart) {
      removeFromCart(name);
    } else {
      addToCart({
        id: name,
        checkInDate: new Date(),
        checkOutDate: new Date(),
        productId: name,
        type: "room",
        name: name,
        quantity: 1,
      });
    }
  };
  return (
    <Box
      borderWidth="2px"
      borderStyle="solid"
      borderColor={isInCart ? "#2E3192" : "transparent"}
      borderRadius="xl"
      transition="border-color 0.2s ease-in-out"
      p={4}
    >
      <Flex
        className="e-info-box"
        gap={4}
        direction={{ base: "column", xl: "row" }}
      >
        <ImageSwiper images={images} name={name} />

        <Flex
          justifyContent="space-between"
          gap={4}
          flex="1"
          borderTop="1px solid #373636"
          borderBottom="1px solid #373636"
          px={5}
          py={3}
          minW={0}
        >
          <Box>
            <Text
              display="flex"
              gap={2}
              alignItems="center"
              fontSize={{ base: "2xl", lg: "4xl" }}
              fontWeight="700"
              mb={2}
              color="#373636"
            >
              {name}
              <Em
                backgroundColor="#FFEDA7"
                borderRadius="5px"
                color="#373636"
                fontSize={{ base: "lg", lg: "2xl" }}
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
            <Box onClick={handleToggleCart} cursor="pointer">
              {isInCart ? (
                <Check
                  size={32}
                  color="white"
                  style={{
                    backgroundColor: "#2E3192",
                    borderRadius: "50%",
                    padding: "4px",
                  }}
                />
              ) : (
                <ShoppingCart size={40} color="#2E3192" />
              )}
            </Box>
            <Box>
              <Text
                fontSize={{ base: "xl", lg: "4xl" }}
                fontWeight="700"
                color="#373636"
              >
                <Highlight
                  query={"₩" + weekdayPrice.toLocaleString()}
                  styles={{ color: "#FAB20B" }}
                >
                  {`주중 ₩${weekdayPrice.toLocaleString()}`}
                </Highlight>
              </Text>
              <Text
                fontSize={{ base: "xl", lg: "4xl" }}
                fontWeight="700"
                color="#373636"
              >
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
    </Box>
  );
};
