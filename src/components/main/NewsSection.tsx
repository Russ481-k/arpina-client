import {
  Box,
  Heading,
  Text,
  LinkBox,
  LinkOverlay,
  Flex,
} from "@chakra-ui/react";
import { motion, useAnimation } from "framer-motion";
import { useRef, useEffect } from "react";
import { useColorMode as useThemeColorMode } from "@/components/ui/color-mode";

const MotionBox = motion(Box);

const newsItems = [
  { id: 1, title: "2024년 2학기 개인상담 신청 안내", date: "2024.08.01" },
  {
    id: 2,
    title: "신입생 대상 '슬기로운 대학생활' 집단상담 모집",
    date: "2024.07.25",
  },
  {
    id: 3,
    title: "대인관계 향상 프로그램 '너와 나의 연결고리' 후기",
    date: "2024.07.18",
  },
  { id: 4, title: "여름방학 중 상담센터 운영 시간 안내", date: "2024.07.10" },
];

const NewsItem = ({
  title,
  date,
  onElementHover,
  isLit,
}: {
  title: string;
  date: string;
  onElementHover: (element: HTMLDivElement | null, id: string | null) => void;
  isLit: boolean;
}) => {
  const { colorMode } = useThemeColorMode();
  const isDark = colorMode === "dark";
  const borderControls = useAnimation();
  const fillControls = useAnimation();
  const textColor = isDark ? "rgba(255, 255, 255, 0.7)" : "#5E7FDC";
  const headingColor = isDark ? "rgba(255, 255, 255, 0.9)" : "#3D4A82";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLit) {
      borderControls.start({
        opacity: 1,
        transition: { duration: 0.3, delay: 0.2 },
      });
      fillControls.start({
        scale: 3,
        transition: { duration: 0.4, ease: "easeOut" },
      });
    } else {
      borderControls.start({ opacity: 0, transition: { duration: 0.3 } });
      fillControls.start({
        scale: 0,
        transition: { duration: 0.4, ease: "easeIn" },
      });
    }
  }, [isLit, borderControls, fillControls]);

  return (
    <MotionBox
      ref={ref}
      w="full"
      p="1px"
      borderRadius="2xl"
      position="relative"
      bg="transparent"
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => onElementHover(ref.current, title)}
      onHoverEnd={() => onElementHover(null, null)}
    >
      <MotionBox
        className="gradient-border"
        position="absolute"
        inset="0"
        borderRadius="2xl"
        bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
        initial={{ opacity: 0 }}
        animate={borderControls}
        zIndex={-1}
      />
      <LinkBox
        as="div"
        p={6}
        borderRadius="2xl"
        bg={isDark ? "rgba(26, 32, 44, 0.8)" : "rgba(255, 255, 255, 0.8)"}
        backdropFilter="blur(2px)"
        boxShadow="0 8px 32px 0 rgba(100, 100, 150, 0.1)"
        h="full"
        position="relative"
        overflow="hidden"
      >
        <MotionBox
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient={`radial(circle, ${
            isDark ? "rgba(0, 123, 255, 0.3)" : "rgba(173, 216, 230, 0.4)"
          } 0%, transparent 70%)`}
          transformOrigin="center"
          initial={{ scale: 0 }}
          animate={fillControls}
          zIndex={0}
        />
        <Flex
          position="relative"
          zIndex={1}
          direction="column"
          align="start"
          gap={1}
          minHeight="2.5em"
        >
          <Flex align="center">
            <Heading
              size="sm"
              as="h3"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              w="full"
              color={headingColor}
              transition="all 0.3s ease-in-out"
              style={{
                background: isLit
                  ? "linear-gradient(to right, #007bff, #6c5ce7)"
                  : "none",
                backgroundClip: isLit ? "text" : "initial",
                WebkitBackgroundClip: isLit ? "text" : "initial",
                WebkitTextFillColor: isLit ? "transparent" : "initial",
              }}
            >
              <LinkOverlay href="#">{title}</LinkOverlay>
            </Heading>
            {/* <Icon as={FiArrowUpRight} ml={2} color={textColor} /> */}
          </Flex>
          <Text fontSize="xs" color={textColor}>
            {date}
          </Text>
        </Flex>
      </LinkBox>
    </MotionBox>
  );
};

const NewsSection = ({
  onElementHover,
  fullyLitButtonId,
}: {
  onElementHover: (element: HTMLDivElement | null, id: string | null) => void;
  fullyLitButtonId: string | null;
}) => {
  const { colorMode } = useThemeColorMode();
  const isDark = colorMode === "dark";
  const headingColor = isDark ? "blue.300" : "blue.600";
  const borderColor = isDark ? "gray.700" : "gray.200";

  return (
    <Box w="100%" maxW="350px">
      <Heading size="lg" mb={4} color={headingColor}>
        상담센터 소식
      </Heading>
      <Flex direction="column" gap={2}>
        {newsItems.map((item) => (
          <NewsItem
            key={item.id}
            title={item.title}
            date={item.date}
            onElementHover={onElementHover}
            isLit={fullyLitButtonId === item.title}
          />
        ))}
      </Flex>
    </Box>
  );
};

export default NewsSection;
