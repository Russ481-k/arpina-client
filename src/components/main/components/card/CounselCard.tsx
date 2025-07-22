"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useColorMode } from "@/components/ui/color-mode";
import { useEffect, useMemo, useState } from "react";
import { LuPlus } from "react-icons/lu";
import styles from "../css/CounselCard.module.css";

const CounselCard = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const notices = useMemo(
    () => [
      { date: "2025-07-21", title: "MLST 검사로 알아보는 나만의 학습전략" },
      { date: "2025-07-20", title: "여름방학 맞이 집단상담 프로그램 안내" },
      { date: "2025-07-19", title: "또래상담사 '나눔' 신규 상담사 모집 공고" },
      { date: "2025-07-18", title: "학생상담센터 운영시간 변경 안내 (단축)" },
    ],
    []
  );

  const [noticeIndex, setNoticeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNoticeIndex((prevIndex) => (prevIndex + 1) % notices.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [notices.length]);

  return (
    <motion.div
      style={{
        position: "absolute",
        bottom: "2%",
        right: "2%",
        zIndex: 4,
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <Box
        w={{ base: "180px", md: "200px" }}
        h={{ base: "100px", md: "120px" }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        borderRadius="2xl"
        backdropFilter="blur(2px) saturate(150%)"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.20)"
        border="1px solid"
        borderColor={
          isDark ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.3)"
        }
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
          height={8}
          px={1}
          mb={2}
          w="full"
        >
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color={isDark ? "whiteAlpha.800" : "blackAlpha.800"}
            ml={2}
          >
            공지사항
          </Text>
          <Box bg="rgb(41, 125, 131)" borderRadius="full" color="white">
            <LuPlus size={24} />
          </Box>
        </Flex>
        <Box
          px={3}
          flexGrow={1}
          position="relative"
          overflow="hidden"
          textAlign="left"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={noticeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                width: "100%",
              }}
            >
              <Text
                fontSize={{ base: "2xs", md: "xs" }}
                color={isDark ? "whiteAlpha.500" : "blackAlpha.500"}
              >
                {notices[noticeIndex].date}
              </Text>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                color={isDark ? "whiteAlpha.800" : "blackAlpha.800"}
                mt={1}
                className={styles.noticeTitle}
              >
                {notices[noticeIndex].title}
              </Text>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </motion.div>
  );
};

export default CounselCard;
