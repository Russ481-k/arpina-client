"use client";

import { Box, Flex, Text, Badge } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useColorMode } from "@/components/ui/color-mode";
import { useEffect, useMemo, useState } from "react";
import { LuBell } from "react-icons/lu";

const NoticeCard = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const notices = useMemo(
    () => [
      {
        id: "event-2025-07",
        date: "2025-07-21",
        category: "이벤트",
        title: "여름방학 특별 프로그램 '마음 성장 캠프' 참가자 모집",
        isNew: true,
      },
      {
        id: "important-2025-07-20",
        date: "2025-07-20",
        category: "중요",
        title: "개인정보 처리방침 변경 사전 안내",
        isNew: true,
      },
      {
        id: "maintenance-2025-07-19",
        date: "2025-07-19",
        category: "점검",
        title: "7월 25일(금) 오전 2시 ~ 4시 정기 시스템 점검 안내",
        isNew: false,
      },
      {
        id: "update-2025-07-18",
        date: "2025-07-18",
        category: "업데이트",
        title: "모바일 앱 신규 버전(v2.1.0) 출시 안내",
        isNew: false,
      },
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
        zIndex: 4,
        marginTop: "40px",
        borderRadius: "20px",
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        scale: 1.03,
        boxShadow: "0px 4px 4px rgba(0,0,0,0.1)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Box
        w="full"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
          height={8}
          px={1}
          w="full"
        >
          <Box bg="rgb(41, 125, 131)" borderRadius="full" color="white" p={1}>
            <LuBell size={18} />
          </Box>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color={isDark ? "whiteAlpha.800" : "blackAlpha.800"}
            ml={2}
          >
            공지사항
          </Text>
          <Box
            px={3}
            flexGrow={1}
            position="relative"
            overflow="hidden"
            textAlign="left"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={notices[noticeIndex].id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Badge colorPalette="gray" variant="subtle" size="sm">
                  {notices[noticeIndex].category}
                </Badge>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  color={isDark ? "whiteAlpha.800" : "blackAlpha.800"}
                  title={notices[noticeIndex].title}
                >
                  {notices[noticeIndex].title}
                </Text>
                {notices[noticeIndex].isNew && (
                  <Badge colorPalette="red" variant="subtle" ml={1}>
                    N
                  </Badge>
                )}
              </motion.div>
            </AnimatePresence>
          </Box>
        </Flex>
      </Box>
    </motion.div>
  );
};

export default NoticeCard;
