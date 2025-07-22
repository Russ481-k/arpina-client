"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { useColors } from "@/styles/theme";
import CustomCursor from "./components/CustomCursor";
import MainContent from "./components/MainContent";
import FractalSection from "./components/FractalSection";
import { useMotionValue, useSpring } from "framer-motion";

const MainSection = () => {
  const mouse = {
    x: useMotionValue(0.5),
    y: useMotionValue(0.5),
  };
  const smoothMouse = {
    x: useSpring(mouse.x, { stiffness: 100, damping: 30, restDelta: 0.001 }),
    y: useSpring(mouse.y, { stiffness: 100, damping: 30, restDelta: 0.001 }),
  };

  const colors = useColors();

  const handleGlobalMouseMove = useCallback(
    (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouse.x.set(clientX / innerWidth);
      mouse.y.set(clientY / innerHeight);
    },
    [mouse.x, mouse.y]
  );

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
        <MainContent mouse={smoothMouse} />
        <FractalSection mouse={mouse} />
      </Flex>
      <CustomCursor />
    </Box>
  );
};

export default MainSection;
