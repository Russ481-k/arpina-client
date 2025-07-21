import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useColorMode } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import InteractiveButtons from "./InteractiveButtons";

// 뉴런 노드 타입 정의
interface NeuronNode {
  id: number;
  theta: number;
  phi: number;
  x: number;
  y: number;
  z: number;
  rotatedX: number;
  rotatedY: number;
  rotatedZ: number;
  screenX: number;
  screenY: number;
  scale: number;
  alpha: number;
}

// 뉴런계(Galaxy) 타입 정의
interface Galaxy {
  id: number;
  nodes: NeuronNode[];
  currentRadius: number;
  baseRotation: { x: number; y: number; z: number };
  rotationVelocity: { x: number; y: number; z: number };
}

// --- Animation Helper Functions ---

const updateGalaxies = (
  galaxies: Galaxy[],
  mouseRotation: { x: number; y: number },
  maxRadius: number,
  growthSpeed: number,
  canvasWidth: number,
  canvasHeight: number,
  FOCAL_LENGTH: number
) => {
  galaxies.forEach((galaxy) => {
    galaxy.currentRadius = (galaxy.currentRadius + growthSpeed) % maxRadius;
    galaxy.baseRotation.x += galaxy.rotationVelocity.x;
    galaxy.baseRotation.y += galaxy.rotationVelocity.y;
    galaxy.baseRotation.z += galaxy.rotationVelocity.z;

    const totalRotX = mouseRotation.x + galaxy.baseRotation.x;
    const totalRotY = mouseRotation.y + galaxy.baseRotation.y;
    const totalRotZ = galaxy.baseRotation.z;

    const cosX = Math.cos(totalRotX),
      sinX = Math.sin(totalRotX);
    const cosY = Math.cos(totalRotY),
      sinY = Math.sin(totalRotY);
    const cosZ = Math.cos(totalRotZ),
      sinZ = Math.sin(totalRotZ);

    const phase = galaxy.currentRadius / maxRadius;
    let overallAlpha = 0;
    if (phase < 0.7) {
      overallAlpha = 1;
    } else {
      overallAlpha = 1 - (phase - 0.7) / 0.3;
    }

    galaxy.nodes.forEach((node) => {
      const r = galaxy.currentRadius;
      node.x = r * Math.sin(node.theta) * Math.cos(node.phi);
      node.y = r * Math.sin(node.theta) * Math.sin(node.phi);
      node.z = r * Math.cos(node.theta);

      const x1 = node.x * cosZ - node.y * sinZ,
        y1 = node.x * sinZ + node.y * cosZ;
      const y2 = y1 * cosX - node.z * sinX,
        z2 = y1 * sinX + node.z * cosX;
      node.rotatedX = x1 * cosY - z2 * sinY;
      node.rotatedY = y2;
      node.rotatedZ = x1 * sinY + z2 * cosY;

      node.scale = FOCAL_LENGTH / (FOCAL_LENGTH + node.rotatedZ);
      node.screenX = canvasWidth / 2 + node.rotatedX * node.scale;
      node.screenY = canvasHeight / 2 + node.rotatedY * node.scale;
      node.alpha =
        Math.max(0, 1 - Math.abs(node.rotatedZ) / FOCAL_LENGTH) * overallAlpha;
    });
  });
};

const drawFractalsLayer = (
  ctx: CanvasRenderingContext2D,
  galaxies: Galaxy[],
  MAX_CONNECT_DISTANCE_SQR: number,
  isForeground: boolean,
  isDark: boolean
) => {
  const baseHue = 180;
  const hueRange = 100;
  const lightness = isDark ? "70%" : "60%";

  galaxies.forEach((galaxy) => {
    const nodesToDraw = galaxy.nodes.filter((node) =>
      isForeground ? node.rotatedZ < 0 : node.rotatedZ >= 0
    );

    for (let i = 0; i < nodesToDraw.length; i++) {
      const p1 = nodesToDraw[i];
      if (p1.alpha <= 0) continue;

      for (let j = i + 1; j < nodesToDraw.length; j++) {
        const p2 = nodesToDraw[j];
        if (p2.alpha <= 0) continue;

        const distSqr =
          Math.pow(p1.rotatedX - p2.rotatedX, 2) +
          Math.pow(p1.rotatedY - p2.rotatedY, 2) +
          Math.pow(p1.rotatedZ - p2.rotatedZ, 2);
        if (distSqr < MAX_CONNECT_DISTANCE_SQR) {
          const opacity =
            (1 - distSqr / MAX_CONNECT_DISTANCE_SQR) * p1.alpha * p2.alpha;
          if (opacity > 0) {
            const hue1 = baseHue + (p1.phi / (2 * Math.PI)) * hueRange;
            const hue2 = baseHue + (p2.phi / (2 * Math.PI)) * hueRange;
            const grad = ctx.createLinearGradient(
              p1.screenX,
              p1.screenY,
              p2.screenX,
              p2.screenY
            );
            grad.addColorStop(
              0,
              `hsla(${hue1}, 80%, ${lightness}, ${opacity * 0.8})`
            );
            grad.addColorStop(
              1,
              `hsla(${hue2}, 80%, ${lightness}, ${opacity * 0.8})`
            );
            ctx.strokeStyle = grad;

            ctx.lineWidth = p1.scale * 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.stroke();
          }
        }
      }
    }
    nodesToDraw.forEach((node) => {
      if (node.alpha <= 0) return;
      const hue = baseHue + (node.phi / (2 * Math.PI)) * hueRange;
      ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}, ${node.alpha})`;
      ctx.beginPath();
      ctx.arc(node.screenX, node.screenY, node.scale * 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  });
};

const MainSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const mousePosition = useRef({ x: 0.5, y: 0.5 });

  const { colorMode } = useColorMode();
  const colors = useColors();
  const isDark = colorMode === "dark";

  const galaxies = useMemo(() => {
    const newGalaxies: Galaxy[] = [];
    const maxRadius = 300;

    for (let i = 0; i < 3; i++) {
      const nodes: NeuronNode[] = [];
      const nodeCount = 100;
      for (let j = 0; j < nodeCount; j++) {
        nodes.push({
          id: j,
          theta: Math.acos(2 * Math.random() - 1),
          phi: Math.random() * 2 * Math.PI,
          x: 0,
          y: 0,
          z: 0,
          rotatedX: 0,
          rotatedY: 0,
          rotatedZ: 0,
          screenX: 0,
          screenY: 0,
          scale: 0,
          alpha: 0,
        });
      }
      newGalaxies.push({
        id: i,
        nodes,
        currentRadius: i * (maxRadius / 3),
        baseRotation: {
          x: Math.random() * 2,
          y: Math.random() * 2,
          z: Math.random() * 2,
        },
        rotationVelocity: {
          x: (Math.random() - 0.5) * 0.002,
          y: (Math.random() - 0.5) * 0.002,
          z: (Math.random() - 0.5) * 0.002,
        },
      });
    }
    return newGalaxies;
  }, []);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    mousePosition.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [handleGlobalMouseMove]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    let canvasWidth = 0,
      canvasHeight = 0;
    const FOCAL_LENGTH = 350;
    const MAX_CONNECT_DISTANCE_SQR = 100 * 100;
    const maxRadius = 300;
    const growthSpeed = 0.5;

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvasWidth = rect.width;
      canvasHeight = rect.height;
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(setCanvasSize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    setCanvasSize();

    let mouseRotationX = 0;
    let mouseRotationY = 0;
    let mouseVelocity = { x: 0, y: 0 };
    let lastMousePosition = { x: 0.5, y: 0.5 };
    const dampingFactor = 0.95;

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Calculate mouse velocity
      mouseVelocity.x = mousePosition.current.x - lastMousePosition.x;
      mouseVelocity.y = mousePosition.current.y - lastMousePosition.y;
      lastMousePosition = { ...mousePosition.current };

      // Apply damping to velocity
      mouseVelocity.x *= dampingFactor;
      mouseVelocity.y *= dampingFactor;

      const targetMouseRotX = mousePosition.current.y - 0.5;
      const targetMouseRotY = mousePosition.current.x - 0.5;

      mouseRotationX +=
        (targetMouseRotX - mouseRotationX) * 0.1 + mouseVelocity.y * 0.5;
      mouseRotationY +=
        (targetMouseRotY - mouseRotationY) * 0.1 + mouseVelocity.x * 0.5;

      const mouseRotation = { x: mouseRotationX, y: mouseRotationY };

      updateGalaxies(
        galaxies,
        mouseRotation,
        maxRadius,
        growthSpeed,
        canvasWidth,
        canvasHeight,
        FOCAL_LENGTH
      );
      drawFractalsLayer(ctx, galaxies, MAX_CONNECT_DISTANCE_SQR, false, isDark);
      drawFractalsLayer(ctx, galaxies, MAX_CONNECT_DISTANCE_SQR, true, isDark);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (containerRef.current) resizeObserver.unobserve(containerRef.current);
    };
  }, [galaxies, isDark]);

  return (
    <Box
      as="main"
      id="mainContent"
      fontFamily="'Paperlogy', sans-serif"
      lineHeight="1.2"
      mx="auto"
      cursor="none"
      bg={colors.bg}
      h="calc(100vh - 200px)"
      overflow="hidden"
    >
      <Flex
        w="full"
        h="100%"
        justifyContent="space-between"
        alignItems="center"
        px={{ base: 4, md: 8, lg: 16 }}
      >
        <Flex
          flex={{ base: 1, lg: "0 0 45%" }}
          h="100%"
          justifyContent="center"
          direction="column"
          alignItems="flex-start"
          pr={{ lg: 8 }}
        >
          <Heading
            as="h1"
            fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
            fontWeight="900"
            lineHeight="1.1"
          >
            울산과학대학교{" "}
            <Box as="p" fontSize="8xl" color={isDark ? "gray.400" : "gray.500"}>
              학생상담센터
            </Box>
          </Heading>
          <Text mt={6} fontSize={{ base: "lg", md: "xl" }} maxW="xl">
            울산과학대학교 학생상담센터는 학생들의 심리적 건강과 성장을 지원하기
            위해 전문 상담사와 함께 개인 및 집단 상담을 제공합니다.
          </Text>
          <Box mt={10}>
            <InteractiveButtons />
          </Box>
        </Flex>
        <Flex
          display={{ base: "none", lg: "flex" }}
          flex="0 0 55%"
          h="100%"
          justifyContent="center"
          alignItems="center"
          position="relative"
        >
          <Box
            ref={containerRef}
            w="full"
            h="full"
            position="relative"
            bg={isDark ? "gray.800" : "gray.50"}
            borderRadius="4xl"
          >
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1,
                willChange: "transform",
              }}
            />
          </Box>
          <motion.div
            style={{
              position: "absolute",
              top: "40%",
              left: "10%",
              transform: "translateY(-50%)",
              zIndex: 2,
            }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Flex
              w={{ base: "160px", md: "180px" }}
              h={{ base: "90px", md: "100px" }}
              justifyContent="center"
              alignItems="center"
              borderRadius="xl"
              bg={isDark ? "rgba(255, 255, 255, 0)" : "rgba(255, 255, 255, 0)"}
              backdropFilter="blur(3px) saturate(150%)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.20)"
              border="1px solid"
              borderColor={
                isDark
                  ? "rgba(255, 255, 255, 0.18)"
                  : "rgba(255, 255, 255, 0.3)"
              }
            >
              <Box p={3}>
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  color={isDark ? "whiteAlpha.800" : "blackAlpha.800"}
                >
                  자가진단
                </Text>
                <Text
                  fontSize="sm"
                  color={isDark ? "whiteAlpha.800" : "blackAlpha.800"}
                  mt={2}
                >
                  내 마음을 살피는 첫걸음, 자가진단.
                </Text>
              </Box>
            </Flex>
          </motion.div>
          <motion.div
            style={{
              position: "absolute",
              bottom: "10%",
              right: "10%",
              zIndex: 2,
            }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Flex
              w={{ base: "160px", md: "180px" }}
              h={{ base: "90px", md: "100px" }}
              justifyContent="center"
              alignItems="center"
              borderRadius="xl"
              bg={
                isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)"
              }
              backdropFilter="blur(10px) saturate(150%)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
              border="1px solid"
              borderColor={
                isDark
                  ? "rgba(255, 255, 255, 0.18)"
                  : "rgba(255, 255, 255, 0.3)"
              }
              cursor="pointer"
            >
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="bold"
                color={isDark ? "whiteAlpha.800" : "blackAlpha.800"}
              >
                상담신청
              </Text>
            </Flex>
          </motion.div>
        </Flex>
      </Flex>
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
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </Box>
  );
};

export default MainSection;
