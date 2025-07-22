import { Box, Flex, Heading, Icon, HStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { IoArrowForward } from "react-icons/io5";
import { LuActivity, LuAlbum } from "react-icons/lu";
import { motion, Variants } from "framer-motion";
import { useColorMode } from "@/components/ui/color-mode";

const buttonsData = [
  {
    id: "personal",
    title: "개인상담",
    href: "/self-diagnosis",
    description: "내 마음을 살피는 첫걸음",
  },
  {
    id: "apply",
    title: "상담신청",
    href: "/counseling-apply",
    description: "나를 더 잘 알기 위한 심리검사",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const arrowVariants: Variants = {
  initial: { x: 0 },
  hover: { x: 4, transition: { type: "spring", stiffness: 300 } },
};

const MotionFlex = motion(Flex);
const MotionHStack = motion(HStack);

const StaticButton = ({ button }: { button: (typeof buttonsData)[0] }) => {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <MotionFlex
      as="button"
      onClick={() => router.push(button.href)}
      flex={1}
      p={4}
      align="center"
      justify="space-between"
      gap={2}
      borderRadius="xl"
      cursor="pointer"
      bg={isDark ? "whiteAlpha.100" : "blackAlpha.50"}
      border="1px solid"
      borderColor={isDark ? "whiteAlpha.200" : "blackAlpha.100"}
      backdropFilter="blur(10px)"
      variants={itemVariants}
      initial="initial"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              stopColor={isDark ? "hsl(184, 51%, 70%)" : "hsl(184, 51%, 40%)"}
            />
            <stop
              offset="50%"
              stopColor={isDark ? "hsl(204, 51%, 75%)" : "hsl(204, 51%, 45%)"}
            />
            <stop
              offset="100%"
              stopColor={isDark ? "hsl(224, 51%, 80%)" : "hsl(224, 51%, 50%)"}
            />
          </linearGradient>
        </defs>
      </svg>
      <Flex align="center" gap={3}>
        {button.id === "personal" ? (
          <LuActivity
            size={32}
            fill="transparent"
            stroke="url(#icon-gradient)"
            strokeWidth={2}
          />
        ) : (
          <LuAlbum
            size={32}
            fill="transparent"
            stroke="url(#icon-gradient)"
            strokeWidth={2}
          />
        )}
        <Box textAlign="left">
          <Heading
            size="md"
            fontWeight="bold"
            color={isDark ? "whiteAlpha.900" : "blackAlpha.900"}
          >
            {button.title}
          </Heading>
          <Heading
            size="xs"
            fontWeight="normal"
            color={isDark ? "whiteAlpha.800" : "blackAlpha.800"}
          >
            {button.description}
          </Heading>
        </Box>
      </Flex>
      <motion.div variants={arrowVariants}>
        <Icon
          as={IoArrowForward}
          w={6}
          h={6}
          color={isDark ? "whiteAlpha.800" : "blackAlpha.800"}
        />
      </motion.div>
    </MotionFlex>
  );
};

const InteractiveButtons = () => {
  return (
    <MotionHStack
      gap={4}
      w="full"
      justify="center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {buttonsData.map((button) => (
        <StaticButton key={button.id} button={button} />
      ))}
    </MotionHStack>
  );
};

export default InteractiveButtons;
