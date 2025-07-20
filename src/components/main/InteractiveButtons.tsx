import { Box, Text, Flex, Heading, Icon } from "@chakra-ui/react";
import { motion, useAnimation } from "framer-motion";
import { useRef, useEffect } from "react";
import { IoArrowForward } from "react-icons/io5";
import { useColorMode } from "@/components/ui/color-mode";

const MotionBox = motion(Box);

const buttons = [
  {
    id: "personal",
    title: "개인상담",
    description: "전문 상담사와 1:1로 만나 마음의 어려움을 나눠보세요.",
  },
  {
    id: "group",
    title: "집단상담",
    description: "또래 친구들과 함께 공감하고 성장하는 집단 프로그램",
  },
  {
    id: "apply",
    title: "심리상담신청",
    description: "온라인으로 간편하게 상담을 예약하고 일정을 확인하세요.",
  },
];

const buttonVariants = {
  initial: { y: 0 },
  hover: {
    y: -10,
    scale: 1.05,
    transition: { type: "spring" as const, stiffness: 300, damping: 15 },
  },
};

const InteractiveButton = ({
  button,
  onElementHover,
  isLit,
}: {
  button: any;
  onElementHover: (element: HTMLDivElement | null, id: string | null) => void;
  isLit: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const borderControls = useAnimation();
  const fillControls = useAnimation();

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
      key={button.id}
      w="400px"
      p="1px" // for border gradient
      borderRadius="2xl"
      position="relative"
      bg="transparent"
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      onHoverStart={() => onElementHover(ref.current, button.id)}
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
      <Flex
        p={6}
        borderRadius="2xl"
        bg={isDark ? "rgba(26, 32, 44, 0.8)" : "rgba(255, 255, 255, 0.8)"}
        backdropFilter="blur(2px)"
        boxShadow="0 8px 32px 0 rgba(100, 100, 150, 0.1)"
        cursor="pointer"
        h="full"
        position="relative"
        overflow="hidden"
        justifyContent="space-between"
        alignItems="center"
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
          justifyContent="space-between"
          w="full"
          h="full"
          alignItems="center"
        >
          <Box>
            <Heading
              size="md"
              fontWeight="bold"
              color={isDark ? "rgba(255, 255, 255, 0.9)" : "#3D4A82"}
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
              {button.title}
            </Heading>
            <Text
              mt={2}
              color={isDark ? "rgba(255, 255, 255, 0.7)" : "#5E7FDC"}
              fontWeight="medium"
              w="80%"
              whiteSpace="pre-wrap"
            >
              {button.description}
            </Text>
          </Box>
          <Icon
            as={IoArrowForward}
            w={8}
            h={8}
            color={isDark ? "rgba(255, 255, 255, 0.7)" : "#5E7FDC"}
          />
        </Flex>
      </Flex>
    </MotionBox>
  );
};

const InteractiveButtons = ({
  onElementHover,
  fullyLitButtonId,
}: {
  onElementHover: (element: HTMLDivElement | null, id: string | null) => void;
  fullyLitButtonId: string | null;
}) => {
  return (
    <Flex direction="row" gap={8} justifyContent="center" alignItems="center">
      {buttons.map((button) => (
        <InteractiveButton
          key={button.id}
          button={button}
          onElementHover={onElementHover}
          isLit={fullyLitButtonId === button.id}
        />
      ))}
    </Flex>
  );
};

export default InteractiveButtons;
