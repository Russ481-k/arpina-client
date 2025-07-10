"use client";

import { RoomInfo } from "@/components/rooms/RoomInfo";
import { SeminarInfo } from "@/components/rooms/SeminarInfo";
import { useEstimateContext } from "@/contexts/EstimateContext";
import { rooms, Seminars } from "@/data/estimateData";
import { Box, HStack, Tabs, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { LuBedDouble, LuBuilding } from "react-icons/lu";

export const ItemSelectionStep = () => {
  const { selectedServices, addToCart } = useEstimateContext();

  const seminarContent = (
    <VStack gap={6} align="stretch">
      {Seminars.map((seminar) => (
        <SeminarInfo key={seminar.name} {...seminar} addToCart={addToCart} />
      ))}
    </VStack>
  );

  const roomContent = (
    <VStack gap={6} align="stretch">
      {rooms.map((room) => (
        <RoomInfo key={room.name} {...room} addToCart={addToCart} />
      ))}
    </VStack>
  );

  return (
    <Box>
      {selectedServices.length > 1 ? (
        <Tabs.Root defaultValue="seminar" variant="subtle" colorPalette="blue">
          <Tabs.List>
            <Tabs.Trigger value="seminar">
              <HStack>
                <LuBuilding /> <Text>세미나실</Text>
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="room">
              <HStack>
                <LuBedDouble /> <Text>객실</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="seminar" pt={6}>
            {seminarContent}
          </Tabs.Content>
          <Tabs.Content value="room" pt={6}>
            {roomContent}
          </Tabs.Content>
        </Tabs.Root>
      ) : (
        <>
          {selectedServices.includes("seminar") && seminarContent}
          {selectedServices.includes("room") && roomContent}
        </>
      )}
    </Box>
  );
};
