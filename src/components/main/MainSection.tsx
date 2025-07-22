"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useCallback, useEffect, useRef } from "react";
import { useColors } from "@/styles/theme";
import CustomCursor from "./components/CustomCursor";
import MainContent from "./components/MainContent";
import FractalSection from "./components/FractalSection";

const MainSection = () => {
  const mousePosition = useRef({ x: 0.5, y: 0.5 });
  const colors = useColors();

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    mousePosition.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [handleGlobalMouseMove]);

  return (
    <Box
      as="main"
      id="mainContent"
      fontFamily="'Paperlogy', sans-serif"
      lineHeight="1.2"
      mx="auto"
      cursor="none"
      bg={colors.bg}
      h="calc(100vh - 100px)"
      overflow="hidden"
    >
      <Flex
        w="full"
        h="100%"
        justifyContent="space-between"
        alignItems="center"
        px={{ base: 4, md: 8, lg: 16 }}
      >
        <MainContent />
        <FractalSection mousePosition={mousePosition} />
      </Flex>
      <CustomCursor />
    </Box>
  );
};

export default MainSection;
