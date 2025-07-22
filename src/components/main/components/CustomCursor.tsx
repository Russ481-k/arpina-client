"use client";

import { Box } from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { useEffect, useRef } from "react";

const CustomCursor = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Box
      ref={cursorRef}
      position="fixed"
      top="0"
      left="0"
      width="16px"
      height="16px"
      borderRadius="50%"
      backgroundColor={
        isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"
      }
      border={
        isDark
          ? "1px solid rgba(255, 255, 255, 0.4)"
          : "1px solid rgba(0, 0, 0, 0.4)"
      }
      transform="translate(-9999px, -9999px)"
      pointerEvents="none"
      zIndex="9999"
      willChange="transform"
      _before={{
        content: '""',
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.1)",
        animation: "pulse 1.5s infinite",
      }}
    />
  );
};

export default CustomCursor;
