import {
  Box,
  Heading,
  Text,
  Icon,
  Flex,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { motion, useAnimation } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { useRef, useEffect } from "react";
import { useColorMode } from "@/components/ui/color-mode";

const MotionLinkBox = motion(LinkBox);
const MotionBox = motion(Box);

const menuItems = [
  {
    title: "센터소개",
    description: "학생의 성장을 지원하는 마음의 동반자입니다.",
  },
  {
    title: "자가진단",
    description: "내 마음을 살피는 첫걸음, 자가진단.",
  },
  {
    title: "심리검사신청",
    description: "나를 더 잘 알기 위한 심리검사, 지금 신청하세요.",
  },
  {
    title: "포토갤러리",
    description: "상담센터의 따뜻한 순간들을 사진으로 만나보세요.",
  },
];

const MenuItem = ({
  title,
  description,
  onElementHover,
  isLit,
  activeBorderGradient,
}: {
  title: string;
  description: string;
  onElementHover: (element: HTMLDivElement | null, id: string | null) => void;
  isLit: boolean;
  activeBorderGradient: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const borderControls = useAnimation();
  const fillControls = useAnimation();

  const textColor = isDark ? "rgba(255, 255, 255, 0.7)" : "gray.600";
  const headingColor = isDark ? "rgba(255, 255, 255, 0.9)" : "#3D4A82";

  useEffect(() => {
    if (isLit) {
      borderControls.start({
        opacity: 1,
        transition: { duration: 0.3, delay: 0.2 },
      });
      fillControls.start({
        clipPath: "circle(150% at 100% 50%)",
        transition: { duration: 0.5, ease: "easeOut" },
      });
    } else {
      borderControls.start({ opacity: 0, transition: { duration: 0.3 } });
      fillControls.start({
        clipPath: "circle(0% at 100% 50%)",
        transition: { duration: 0.5, ease: "easeIn" },
      });
    }
  }, [isLit, borderControls, fillControls]);

  return (
    <MotionLinkBox
      ref={ref}
      p="1px"
      borderRadius="2xl"
      position="relative"
      bg="transparent"
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      w="100%"
      onHoverStart={() => onElementHover(ref.current, title)}
      onHoverEnd={() => onElementHover(null, null)}
    >
      <MotionBox
        className="gradient-border"
        position="absolute"
        inset="0"
        borderRadius="2xl"
        bgGradient={activeBorderGradient}
        initial={{ opacity: 0 }}
        animate={borderControls}
        zIndex={0}
      />
      <Flex
        p={6}
        borderRadius="2xl"
        bg={isDark ? "rgba(26, 32, 44, 0.8)" : "rgba(255, 255, 255, 0.8)"}
        backdropFilter="blur(2px)"
        boxShadow="0 8px 32px 0 rgba(100, 100, 150, 0.1)"
        direction="column"
        align="start"
        gap={1}
        h="full"
        position="relative"
        overflow="hidden"
        zIndex={1}
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
          initial={{ clipPath: "circle(0% at 100% 50%)" }}
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
              size="md"
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
              {title}
            </Heading>
            <Icon as={FiArrowUpRight} ml={2} color={textColor} />
          </Flex>
          <Text fontSize="sm" color={textColor}>
            {description}
          </Text>
        </Flex>
      </Flex>
    </MotionLinkBox>
  );
};

const QuickMenu = ({
  onElementHover,
  fullyLitButtonId,
  activeBorderGradient,
}: {
  onElementHover: (element: HTMLDivElement | null, id: string | null) => void;
  fullyLitButtonId: string | null;
  activeBorderGradient: string;
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const headingColor = isDark ? "blue.300" : "blue.600";

  return (
    <Box w="100%" maxW="350px">
      <Heading size="lg" mb={4} color={headingColor}>
        Quick Menu
      </Heading>
      <Flex direction="column" align="stretch" gap={2}>
        {menuItems.map((item) => (
          <MenuItem
            key={item.title}
            title={item.title}
            description={item.description}
            onElementHover={onElementHover}
            isLit={fullyLitButtonId === item.title}
            activeBorderGradient={activeBorderGradient}
          />
        ))}
      </Flex>
    </Box>
  );
};

export default QuickMenu;
