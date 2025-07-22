"use client";

import { Box, Button, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import {
  motion,
  Variants,
  useTransform,
  MotionValue,
  useMotionTemplate,
} from "framer-motion";
import { ChevronRightIcon } from "lucide-react";
import NoticeCard from "./card/NoticeCard";
import { useState, useEffect, useRef } from "react";

const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

interface MainContentProps {
  mouse: {
    x: MotionValue<number>;
    y: MotionValue<number>;
  };
}

const mainTitle = "울산과학대학교";
const subTitle = "학생상담센터";
const description =
  "울산과학대학교 학생상담센터는 학생들의 심리적 건강과 성장을 지원하기 위해 전문 상담사와 함께 개인 및 집단 상담을 제공합니다.";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const typingContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const typingLetterVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const MainContent = ({ mouse }: MainContentProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [dimensions, setDimensions] = useState<{
    el: DOMRect | null;
    win: { width: number; height: number };
  }>({ el: null, win: { width: 0, height: 0 } });
  const [gradientStyle, setGradientStyle] = useState("");
  const [isOverflowVisible, setOverflowVisible] = useState(false);
  const [isButtonHovered, setButtonHovered] = useState(false);

  useEffect(() => {
    const measure = () => {
      setDimensions({
        el: headingRef.current?.getBoundingClientRect() || null,
        win: { width: window.innerWidth, height: window.innerHeight },
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const gradientX = useTransform(
    mouse.x,
    (normX) => normX * dimensions.win.width - (dimensions.el?.left || 0)
  );
  const gradientY = useTransform(
    mouse.y,
    (normY) => normY * dimensions.win.height - (dimensions.el?.top || 0)
  );

  const baseColor = { r: 41, g: 125, b: 131 };
  const hue = useTransform(mouse.x, [0, 1], [200, 240]);
  const lightness = useTransform(mouse.y, [0, 1], [0.3, 0.4]);

  const background = useMotionTemplate`radial-gradient(circle at ${gradientX}px ${gradientY}px, hsl(${hue}, 90%, ${useTransform(
    lightness,
    (l) => l * 100
  )}%), rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 1) 70%)`;

  useEffect(() => {
    // Set the initial value on mount
    setGradientStyle(background.get());

    // Subscribe to subsequent changes
    const unsubscribe = background.on("change", (latest) => {
      setGradientStyle(latest);
    });
    return () => unsubscribe();
  }, [background]);

  const rotateX = useTransform(mouse.y, [0, 1], [8, -8]);
  const rotateY = useTransform(mouse.x, [0, 1], [-8, 8]);

  return (
    <Box position="relative" w="full" h="70vh">
      <Flex
        flex={{ base: 1, lg: "0 0 55%" }}
        h="100%"
        justifyContent="center"
        direction="column"
        alignItems="flex-start"
        pr={{ lg: 8 }}
        style={{ perspective: "800px" }}
      >
        <MotionBox
          w="full"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-start"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <MotionHeading
            as="h1"
            fontSize={{ base: "6xl", md: "7xl", lg: "8xl" }}
            fontWeight="900"
            lineHeight="1.1"
            variants={itemVariants}
          >
            <motion.span
              variants={typingContainerVariants}
              style={{ display: "inline-block" }}
            >
              {mainTitle.split("").map((char, i) => (
                <motion.span key={i} variants={typingLetterVariants}>
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </MotionHeading>
          <MotionHeading
            as="h2"
            fontSize={{ base: "7xl", md: "8xl", lg: "9xl" }}
            fontWeight="900"
            lineHeight="1"
            bgGradient={gradientStyle}
            bgClip="text"
            color="transparent"
            variants={itemVariants}
            ref={headingRef}
            style={{ rotateX, rotateY }}
          >
            <motion.span
              variants={typingContainerVariants}
              style={{ display: "inline-block" }}
            >
              {subTitle.split("").map((char, i) => (
                <motion.span key={i} variants={typingLetterVariants}>
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </MotionHeading>
          <MotionText
            mt={6}
            fontSize={{ base: "lg", md: "xl" }}
            maxW="2xl"
            variants={itemVariants}
          >
            <motion.span
              variants={{
                ...typingContainerVariants,
                visible: { transition: { staggerChildren: 0.015 } },
              }}
              style={{ display: "inline-block" }}
            >
              {description.split("").map((char, i) => (
                <motion.span key={i} variants={typingLetterVariants}>
                  {char}
                </motion.span>
              ))}
            </motion.span>
            <MotionBox mt={6} variants={itemVariants}>
              <MotionFlex
                display="inline-flex"
                bg="rgb(41, 125, 131)"
                color="white"
                borderRadius="full"
                align="center"
                py={0}
                pr={1}
                overflow={isOverflowVisible ? "visible" : "hidden"}
                cursor="none"
                variants={{
                  hidden: { width: "44px" },
                  visible: {
                    width: "210px",
                    x: 0,
                    transition: { duration: 0.6, ease: "easeInOut" },
                  },
                  hover: {
                    width: "210px",
                    x: 5,
                    transition: { type: "spring", stiffness: 300, damping: 15 },
                  },
                }}
                animate={isButtonHovered ? "hover" : "visible"}
                onHoverStart={() => setButtonHovered(true)}
                onHoverEnd={() => setButtonHovered(false)}
                onAnimationComplete={(definition) => {
                  if (definition === "visible") {
                    setOverflowVisible(true);
                  }
                }}
              >
                <Box
                  flex={1}
                  pl={6}
                  py={2}
                  whiteSpace="nowrap"
                  overflow="visible"
                >
                  <motion.div
                    style={{ display: "inline-block" }}
                    animate={isButtonHovered ? "hover" : "visible"}
                    variants={{
                      visible: {
                        clipPath: "inset(0 0% 0 0)",
                        transition: {
                          duration: 0.3,
                          ease: "easeInOut",
                        },
                      },
                      hover: {
                        transition: { staggerChildren: 0.05 },
                      },
                    }}
                  >
                    {"자가진단 하러가기".split("").map((char, index) => (
                      <motion.span
                        key={index}
                        style={{ display: "inline-block" }}
                        variants={{
                          hover: { y: [0, -5, 0] },
                          visible: { y: 0 },
                        }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut",
                        }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </motion.div>
                </Box>
                <motion.div
                  style={{ display: "flex" }}
                  variants={{
                    hidden: { scale: 0 },
                    visible: {
                      scale: 1,
                      transition: { delay: 0.3, duration: 0.4 },
                    },
                  }}
                >
                  <Box bg="white" borderRadius="full" ml={1} p={1}>
                    <Icon as={ChevronRightIcon} color="rgb(41, 125, 131)" />
                  </Box>
                </motion.div>
              </MotionFlex>
            </MotionBox>
          </MotionText>
        </MotionBox>
      </Flex>
      <NoticeCard />
    </Box>
  );
};

export default MainContent;
