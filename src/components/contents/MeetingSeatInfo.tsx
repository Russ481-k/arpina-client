"use client";

import {
  Box,
  Flex,
  Heading,
  Image,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import HeadingH4 from "./HeadingH4";

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
  // 반응형 폰트 크기 설정

  const seatTitleFontSize = useBreakpointValue({
    base: "sm", // sm 이하: 2단계 줄임 (3xl -> xl)
    md: "lg", // md: 1단계 줄임 (3xl -> 2xl)
    lg: "3xl", // lg: 원래 크기 (3xl)
  });

  return (
    <Box
      className="mr-seat-box"
      mt={{ base: "20px", md: "30px", lg: "50px", "2xl": "100px" }}
    >
      <HeadingH4>{title}</HeadingH4>

      <Flex className="mr-seat-list" justifyContent="space-between" gap="10px">
        {seats.map((seat, index) => (
          <Box key={index} textAlign="center">
            <Image
              src={seat.imageSrc}
              alt={seat.alt}
              borderRadius="20px"
              border="2px solid #838383"
            />
            <Text
              mt={4}
              color="#393939"
              fontSize={seatTitleFontSize}
              fontWeight="semibold"
            >
              {seat.title}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
