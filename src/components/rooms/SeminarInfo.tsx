import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { PeopleIcon, AreaIcon } from "@/components/icons/EstimateIcons";
import { CartItem } from "@/types/estimate";
import { ShoppingCart, Check } from "lucide-react";
import { ImageSwiper } from "@/components/common/ImageSwiper";
import { useEstimateContext } from "@/contexts/EstimateContext";

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
  const { cart, removeFromCart } = useEstimateContext();
  const isInCart = cart.some((item) => item.productId === name);

  const handleToggleCart = () => {
    if (isInCart) {
      removeFromCart(name);
    } else {
      addToCart({
        id: name,
        productId: name,
        type: "seminar",
        name: name,
        quantity: 1,
        checkInDate: new Date(),
        checkOutDate: new Date(),
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
              fontSize={{ base: "2xl", lg: "4xl" }}
              fontWeight="700"
              mb={2}
              color="#373636"
            >
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
            <Text
              fontSize={{ base: "2xl", lg: "4xl" }}
              fontWeight="700"
              color="#FAB20B"
            >
              ₩{price.toLocaleString()}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
