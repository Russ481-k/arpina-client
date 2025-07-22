"use client";

import { Box, Button, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { motion, Variants } from "framer-motion";
import { ChevronRightIcon } from "lucide-react";
import NoticeCard from "./card/NoticeCard";

const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionBox = motion(Box);

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

const MainContent = () => {
  return (
    <Box position="relative" w="full" h="60vh">
      <Flex
        flex={{ base: 1, lg: "0 0 55%" }}
        h="100%"
        justifyContent="center"
        direction="column"
        alignItems="flex-start"
        pr={{ lg: 8 }}
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
            color="rgb(41, 125, 131)"
            variants={itemVariants}
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
            <Box mt={6}>
              <Button
                bg="rgb(41, 125, 131)"
                color="white"
                borderRadius="full"
                pl={6}
                pr={1}
                py={0}
                cursor="none"
              >
                <Text>자가진단 하러가기</Text>
                <Box bg="white" borderRadius="full" ml={1} p={1}>
                  <Icon as={ChevronRightIcon} color="rgb(41, 125, 131)" />
                </Box>
              </Button>
            </Box>
          </MotionText>
        </MotionBox>
      </Flex>
      <NoticeCard />
    </Box>
  );
};

export default MainContent;
