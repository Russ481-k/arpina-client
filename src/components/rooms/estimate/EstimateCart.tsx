"use client";

import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Separator,
  IconButton,
  useBreakpointValue,
  Drawer,
  Portal,
  CloseButton,
} from "@chakra-ui/react";
import { useEstimateContext } from "@/contexts/EstimateContext";
import { Minus, Plus } from "lucide-react";
import { rooms, Seminars } from "@/data/estimateData";

const getWeekdayWeekendNights = (checkIn: Date, checkOut: Date) => {
  let weekday = 0;
  let weekend = 0;
  for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 0 || day === 6) weekend++;
    else weekday++;
  }
  return { weekday, weekend };
};

const calculateRoomPrice = (
  itemName: string,
  quantity: number,
  checkIn: Date,
  checkOut: Date
) => {
  const room = rooms.find((r) => r.name === itemName);
  if (!room) return 0;

  const { weekday, weekend } = getWeekdayWeekendNights(checkIn, checkOut);
  return (room.weekdayPrice * weekday + room.weekendPrice * weekend) * quantity;
};

const calculateSeminarPrice = (
  itemName: string,
  checkIn: Date,
  checkOut: Date
) => {
  const seminar = Seminars.find((s) => s.name === itemName);
  if (!seminar) return 0;

  const nights = (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24);
  const days = nights + 1;
  return seminar.price * days;
};

const CartContent = () => {
  const { cart, removeFromCart, updateCartItemQuantity, totalAmount } =
    useEstimateContext();

  return (
    <VStack w="full" gap={4} align="stretch">
      <Heading size="md">장바구니</Heading>
      {cart.length === 0 ? (
        <Text>장바구니가 비어 있습니다.</Text>
      ) : (
        <VStack
          gap={4}
          align="stretch"
          separator={<Separator />}
          overflowY="auto"
          maxH="60vh"
          p={4}
        >
          {cart.map((item) => {
            const nights =
              (item.checkOutDate.getTime() - item.checkInDate.getTime()) /
              (1000 * 3600 * 24);
            const days = nights + 1;

            return (
              <Box key={item.id}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">{item.name}</Text>
                  <CloseButton
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  />
                </HStack>
                {item.type === "room" ? (
                  <>
                    <HStack justify="space-between" mt={2}>
                      <Text fontSize="sm" color="gray.500">
                        수량
                      </Text>
                      <HStack>
                        <IconButton
                          aria-label="decrease quantity"
                          size="xs"
                          onClick={() =>
                            updateCartItemQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus />
                        </IconButton>
                        <Text>{item.quantity}</Text>
                        <IconButton
                          aria-label="increase quantity"
                          size="xs"
                          onClick={() =>
                            updateCartItemQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus />
                        </IconButton>
                      </HStack>
                    </HStack>
                    <HStack justify="space-between" mt={2}>
                      <Text fontSize="sm" color="gray.500">
                        {`${nights}박 ${days}일`}
                      </Text>
                      <Text fontSize="sm" fontWeight="bold">
                        ₩
                        {calculateRoomPrice(
                          item.name,
                          item.quantity,
                          item.checkInDate,
                          item.checkOutDate
                        ).toLocaleString()}
                      </Text>
                    </HStack>
                  </>
                ) : (
                  <HStack justify="space-between" mt={2}>
                    <Text fontSize="sm" color="gray.500">
                      {`${nights}박 ${days}일`}
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      ₩
                      {calculateSeminarPrice(
                        item.name,
                        item.checkInDate,
                        item.checkOutDate
                      ).toLocaleString()}
                    </Text>
                  </HStack>
                )}
              </Box>
            );
          })}
        </VStack>
      )}
      <Separator my={4} />
      <HStack justify="space-between">
        <Text fontWeight="bold" fontSize="lg">
          총 금액
        </Text>
        <Text fontWeight="bold" fontSize="lg" color="blue.500">
          ₩{totalAmount.toLocaleString()}
        </Text>
      </HStack>
    </VStack>
  );
};

export const EstimateCart = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  if (isMobile) {
    return (
      <Drawer.Root placement="bottom">
        <Drawer.Trigger asChild>
          <Button
            position="fixed"
            bottom={4}
            left="50%"
            transform="translateX(-50%)"
            colorPalette="blue"
            w="90%"
            py={6}
            boxShadow="lg"
          >
            장바구니 보기
          </Button>
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content roundedTop="l3">
              <Drawer.Header>
                <Drawer.Title>장바구니</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <CartContent />
              </Drawer.Body>
              <Drawer.Footer>
                <Button w="full" colorPalette="blue" size="lg">
                  가견적서 발행
                </Button>
              </Drawer.Footer>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    );
  }

  return (
    <Box
      w="32.5%"
      position="sticky"
      top="80px"
      zIndex={2}
      p={6}
      bg="gray.50"
      borderRadius="lg"
    >
      <CartContent />
      <Button w="full" colorPalette="blue" mt={6} size="lg">
        가견적서 발행
      </Button>
    </Box>
  );
};
