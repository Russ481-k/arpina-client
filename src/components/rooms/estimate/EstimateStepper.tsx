"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import { useEstimateContext } from "@/contexts/EstimateContext";
import {
  Box,
  Button,
  Heading,
  HStack,
  Text,
  VStack,
  SimpleGrid,
  Image,
  Flex,
  Tabs,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { EstimateService } from "@/types/estimate";
import { EstimateCalendar } from "@/components/rooms/EstimateCalendar";
import { Seminars, rooms } from "@/data/estimateData";
import { SeminarInfo } from "@/components/rooms/SeminarInfo";
import { RoomInfo } from "@/components/rooms/RoomInfo";
import { Check } from "lucide-react";
import { LuBedDouble, LuBuilding } from "react-icons/lu";
import { EstimateCart } from "./EstimateCart";

const MotionBox = motion(Box);

const steps = [
  { id: 1, name: "서비스 선택" },
  { id: 2, name: "날짜 선택" },
  { id: 3, name: "항목 선택" },
];

const StepperIndicator = () => {
  const { step } = useEstimateContext();

  return (
    <HStack justify="center" mb={12} gap={4}>
      {steps.map((s, index) => (
        <React.Fragment key={s.id}>
          <VStack>
            <Flex
              w={10}
              h={10}
              rounded="full"
              align="center"
              justify="center"
              position="relative"
              bg={step >= s.id ? "blue.500" : "gray.200"}
              color={step >= s.id ? "white" : "gray.500"}
              transition="background-color 0.3s"
            >
              {s.id}
            </Flex>
            <Text
              fontSize="sm"
              fontWeight={step === s.id ? "bold" : "normal"}
              color={step === s.id ? "blue.600" : "gray.500"}
            >
              {s.name}
            </Text>
          </VStack>
          {index < steps.length - 1 && (
            <Box
              flex={1}
              h="2px"
              bg={step > s.id ? "blue.500" : "gray.200"}
              transition="background-color 0.3s"
              mx={-2}
              mb={7}
            />
          )}
        </React.Fragment>
      ))}
    </HStack>
  );
};

const ServiceSelectionStep = ({ handleNext }: { handleNext: () => void }) => {
  const { selectedServices, toggleService } = useEstimateContext();

  const services: {
    id: EstimateService;
    name: string;
    description: string;
    imageUrl: string;
  }[] = [
    {
      id: "seminar",
      name: "세미나실 이용",
      description: "워크샵, 회의 등을 위한 공간을 예약합니다.",
      imageUrl: "/images/meeting/sub_visual.png",
    },
    {
      id: "room",
      name: "객실 이용",
      description: "편안한 숙박을 위한 객실을 예약합니다.",
      imageUrl: "/images/contents/twin_img01.jpg",
    },
  ];

  return (
    <Box>
      <VStack mb={10} gap={2}>
        <Heading size="xl" as="h2">
          어떤 서비스를 이용하시겠어요?
        </Heading>
        <Text fontSize="lg" color="gray.600">
          원하는 서비스를 선택하세요. (중복 선택 가능)
        </Text>
      </VStack>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={8}>
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          return (
            <Box
              key={service.id}
              p={0}
              borderWidth="2px"
              borderRadius="lg"
              borderColor={isSelected ? "#2E3192" : "gray.200"}
              onClick={() => toggleService(service.id)}
              position="relative"
              transition="all 0.2s"
              overflow="hidden"
              cursor="pointer"
              _hover={{
                borderColor: isSelected ? "#2E3192" : "gray.300",
                transform: "translateY(-4px)",
                shadow: "lg",
              }}
            >
              <Image
                src={service.imageUrl}
                alt={service.name}
                width="100%"
                height="200px"
                objectFit="cover"
              />
              <HStack justify="space-between" p={6}>
                <Box>
                  <Heading size="md" mb={1}>
                    {service.name}
                  </Heading>
                  <Text color="gray.600">{service.description}</Text>
                </Box>
                <Box>
                  {isSelected && (
                    <Check
                      size={32}
                      color="white"
                      style={{
                        backgroundColor: "#2E3192",
                        borderRadius: "50%",
                        padding: "4px",
                      }}
                    />
                  )}
                </Box>
              </HStack>
            </Box>
          );
        })}
      </SimpleGrid>
      <Button
        w="full"
        size="lg"
        variant="subtle"
        colorPalette="blue"
        onClick={handleNext}
        disabled={selectedServices.length === 0}
      >
        다음
      </Button>
    </Box>
  );
};

const DateSelectionStep = ({
  handleNext,
  handlePrev,
}: {
  handleNext: () => void;
  handlePrev: () => void;
}) => {
  const {
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    isDateSelectionValid,
  } = useEstimateContext();

  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [nextMonthDate, setNextMonthDate] = React.useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d;
  });
  const [selectionMode, setSelectionMode] = React.useState<
    "checkIn" | "checkOut"
  >("checkIn");
  const [selectedRangeText, setSelectedRangeText] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(true);

  const handleResetDates = () => {
    setCheckInDate(null);
    setCheckOutDate(null);
    setSelectionMode("checkIn");
    setSelectedRangeText("");
  };

  return (
    <Box>
      <Heading size="xl" as="h2" mb={10} textAlign="center">
        이용하실 날짜를 선택해주세요.
      </Heading>
      <EstimateCalendar
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        nextMonthDate={nextMonthDate}
        setNextMonthDate={setNextMonthDate}
        checkInDate={checkInDate}
        setCheckInDate={setCheckInDate}
        checkOutDate={checkOutDate}
        setCheckOutDate={setCheckOutDate}
        selectionMode={selectionMode}
        setSelectionMode={setSelectionMode}
        selectedRangeText={selectedRangeText}
        setSelectedRangeText={setSelectedRangeText}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onApplyDates={handleNext}
        onResetDates={handleResetDates}
      />
      <HStack mt={8} justify="center">
        <Button onClick={handlePrev} variant="outline">
          이전
        </Button>
        <Button
          onClick={handleNext}
          colorPalette="blue"
          disabled={!isDateSelectionValid}
        >
          다음
        </Button>
      </HStack>
    </Box>
  );
};

const ItemSelectionStep = ({ handlePrev }: { handlePrev: () => void }) => {
  const { selectedServices, addToCart } = useEstimateContext();
  const [roomQuantities, setRoomQuantities] = React.useState<{
    [key: string]: number;
  }>({});

  const handleQuantityChange = (name: string, value: number) => {
    setRoomQuantities((prev) => ({ ...prev, [name]: value }));
  };

  const seminarContent = (
    <VStack gap={4} align="stretch">
      {Seminars.map((seminar) => (
        <Box key={seminar.name} p={4} borderWidth={1} borderRadius="md">
          <SeminarInfo {...seminar} addToCart={addToCart} />
        </Box>
      ))}
    </VStack>
  );

  const roomContent = (
    <VStack gap={4} align="stretch">
      {rooms.map((room) => (
        <Box key={room.name} p={4} borderWidth={1} borderRadius="md">
          <RoomInfo
            {...room}
            addToCart={addToCart}
            roomQuantities={roomQuantities}
          />
        </Box>
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

      <HStack mt={8} justify="center">
        <Button onClick={handlePrev} variant="outline">
          이전
        </Button>
        <Button colorPalette="blue">견적 완료하기</Button>
      </HStack>
    </Box>
  );
};

export const EstimateStepper = ({ step }: { step: number }) => {
  const { setStep } = useEstimateContext();
  const [direction, setDirection] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setDirection(1);
    setStep(step + 1);
  };

  const handlePrev = () => {
    setDirection(-1);
    setStep(step - 1);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ServiceSelectionStep handleNext={handleNext} />;
      case 2:
        return (
          <DateSelectionStep handleNext={handleNext} handlePrev={handlePrev} />
        );
      case 3:
        return <ItemSelectionStep handlePrev={handlePrev} />;
      default:
        return <Text>알 수 없는 단계</Text>;
    }
  };

  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  }, [step]);

  return (
    <Box>
      <StepperIndicator />
      <HStack align="flex-start" gap={8}>
        <Flex
          position="relative"
          overflow="hidden"
          height={height}
          transition="height 0.3s ease-in-out"
          w={step < 3 ? "100%" : "65%"}
        >
          <AnimatePresence initial={false} custom={direction}>
            <MotionBox
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              w="100%"
              position={step < 3 ? "absolute" : "static"}
            >
              <Box ref={ref}>{renderStep()}</Box>
            </MotionBox>
          </AnimatePresence>
        </Flex>
        {step >= 3 && <EstimateCart />}
      </HStack>
    </Box>
  );
};
