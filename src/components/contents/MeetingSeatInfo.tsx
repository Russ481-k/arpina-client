"use client";

import { Box, Flex, Heading, Image, Text } from "@chakra-ui/react";

interface SeatItem {
  imageSrc: string;
  alt: string;
  title: string;
}

interface MeetingSeatInfoProps {
  title?: string;
  seats?: SeatItem[];
}

const defaultSeats: SeatItem[] = [
  {
    imageSrc: "/images/contents/seat_img01.jpg",
    alt: "강의식",
    title: "강의식",
  },
  {
    imageSrc: "/images/contents/seat_img02.jpg",
    alt: "극장식",
    title: "극장식",
  },
  {
    imageSrc: "/images/contents/seat_img03.jpg",
    alt: "좌석배치 정보",
    title: "ㄷ자",
  },
  {
    imageSrc: "/images/contents/seat_img04.jpg",
    alt: "좌석배치 정보",
    title: "H자",
  },
  {
    imageSrc: "/images/contents/seat_img05.jpg",
    alt: "좌석배치 정보",
    title: "T자",
  },
];

export default function MeetingSeatInfo({
  title = "좌석배치 정보",
  seats = defaultSeats,
}: MeetingSeatInfoProps) {
  return (
    <Box className="mr-seat-box" mt="100px">
      <Heading
        as="h4"
        mb="60px"
        color="#393939"
        fontSize="60px"
        fontWeight="bold"
        lineHeight="1"
      >
        {title}
      </Heading>
      <Flex className="mr-seat-list" justifyContent="space-between" gap="10px">
        {seats.map((seat, index) => (
          <Box key={index} textAlign="center">
            <Image
              src={seat.imageSrc}
              alt={seat.alt}
              borderRadius="20px"
              border="2px solid #838383"
            />
            <Text mt={4} color="#393939" fontSize="3xl" fontWeight="semibold">
              {seat.title}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
