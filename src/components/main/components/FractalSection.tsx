"use client";

import { Box, Flex, Text, Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { MutableRefObject, useRef } from "react";
import FractalCanvas from "./FractalCanvas";
import CounselCard from "./card/CounselCard";
import { useColorMode } from "@/components/ui/color-mode";

interface FractalSectionProps {
  mousePosition: MutableRefObject<{ x: number; y: number }>;
}

const FractalSection = ({ mousePosition }: FractalSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Flex
      display={{ base: "none", lg: "flex" }}
      flex="0 0 45%"
      h="100%"
      justifyContent="center"
      alignItems="center"
      position="relative"
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="fractal-cutout" clipPathUnits="objectBoundingBox">
            <motion.path
              initial={{
                d: "M0,0 L1,0 L1,1 L0.05,1 C 0.02,1 0.02,0.98 0,0.98 L0,0 Z",
              }}
              animate={{
                d: "M0,0 L1,0 L1,1 L0.6,1 C 0.5,1 0.5,0.92 0.4,0.92 S 0.25,0.85 0,0.85 L0,0 Z",
              }}
              transition={{
                duration: 1.2,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.5,
              }}
            />
          </clipPath>
        </defs>
      </svg>
      <Box
        position="absolute"
        bottom={0}
        left={0}
        zIndex={2}
        p={{
          base: "1rem 1rem 2.5rem 1.5rem",
          md: "1.5rem 1.5rem 4rem 2.5rem",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <Heading
            color={isDark ? "whiteAlpha.800" : "blackAlpha.800"}
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="bold"
            letterSpacing="widest"
            lineHeight="1"
          >
            REVEAL YOURSELF
          </Heading>
          <Text
            color={isDark ? "whiteAlpha.800" : "blackAlpha.800"}
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="bold"
            mt={2}
            letterSpacing="wide"
          >
            TRANSFORM YOUR LIFE
          </Text>
        </motion.div>
      </Box>
      <Box
        ref={containerRef}
        w="full"
        h="full"
        position="relative"
        borderRadius="4xl"
        zIndex={3}
        style={{
          clipPath: "url(#fractal-cutout)",
        }}
      >
        <FractalCanvas
          mousePosition={mousePosition}
          containerRef={containerRef}
        />
      </Box>
      <CounselCard />
    </Flex>
  );
};

export default FractalSection;
