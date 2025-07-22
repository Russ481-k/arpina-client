"use client";

import { Box, Flex, Text, VStack, Button, Icon, Badge } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useColorMode } from "@/components/ui/color-mode";
import { useEffect, useMemo, useState } from "react";
import { LuPlus, LuChevronRight } from "react-icons/lu";
import { useRouter } from "next/navigation";

const CounselCard = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const notices = useMemo(
    () => [
      {
        id: "mlst",
        category: "심리검사",
        title: "MLST 검사로 알아보는 나만의 학습전략",
        target: "청소년/성인",
        status: "모집중",
        description:
          "학습과 관련된 성격, 행동, 동기 등을 종합적으로 분석하여, 효과적인 학습 전략을 제공합니다.",
      },
      {
        id: "group-summer",
        category: "집단상담",
        title: "여름방학 맞이 집단상담 프로그램",
        target: "청소년",
        status: "마감임박",
        description:
          "또래 관계 증진 및 사회성 향상을 위한 즐거운 집단 활동에 여러분을 초대합니다.",
      },
      {
        id: "peer-counselor",
        category: "또래상담",
        title: "또래상담사 '나눔' 신규 상담사 모집",
        target: "청소년",
        status: "마감",
        description:
          "상담에 관심이 있고 친구들을 돕고 싶은 따뜻한 마음을 가진 또래 상담사를 모집합니다.",
      },
      {
        id: "operating-hours",
        category: "센터소식",
        title: "학생상담센터 운영시간 단축 변경 안내",
        target: "전체",
        status: "공지",
        description:
          "센터 내부 워크샵으로 인해 금일 운영 시간이 오후 4시까지로 단축됩니다. 이용에 참고 바랍니다.",
      },
    ],
    []
  );

  const [noticeIndex, setNoticeIndex] = useState(0);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setNoticeIndex((prevIndex) => (prevIndex + 1) % notices.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, notices.length]);

  const cardVariants = {
    initial: {
      width: "220px",
      height: "120px",
      backgroundColor: isDark
        ? "rgba(0, 0, 0, 0.2)"
        : "rgba(255, 255, 255, 0.3)",
    },
    hover: {
      width: "320px",
      height: "400px",
      backgroundColor: isDark
        ? "rgba(0, 0, 0, 0.5)"
        : "rgba(255, 255, 255, 0.6)",
    },
  };

  const transition = { duration: 0.4, ease: "easeInOut" };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "모집중":
        return "green";
      case "마감임박":
        return "orange";
      case "마감":
        return "red";
      default:
        return "gray";
    }
  };

  const TextWithClamp = ({
    children,
    lines,
    ...props
  }: {
    children: React.ReactNode;
    lines: number;
    [key: string]: any;
  }) => (
    <Text
      {...props}
      display="-webkit-box"
      overflow="hidden"
      textOverflow="ellipsis"
    >
      {children}
    </Text>
  );

  const CardHeader = () => (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      w="full"
      p={2}
      position="absolute"
      top={0}
      zIndex={1}
    >
      <Text fontSize="xl" fontWeight="bold" ml={2}>
        상담 신청
      </Text>
      <motion.div
        animate={{ rotate: isHovered ? 45 : 0 }}
        transition={transition as any}
      >
        <Box bg="rgb(41, 125, 131)" borderRadius="full" color="white" p={1}>
          <LuPlus size={24} />
        </Box>
      </motion.div>
    </Flex>
  );

  const CardBody = () => (
    <Box w="full" px={3} position="absolute" top="44px">
      <AnimatePresence mode="wait">
        <motion.div
          key={noticeIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Box justifyContent="space-between" alignItems="center">
            <Badge
              colorScheme={getStatusColor(notices[noticeIndex].status)}
              size="sm"
              mb={1}
            >
              {notices[noticeIndex].status}
            </Badge>
            <TextWithClamp
              lines={1}
              fontSize="sm"
              fontWeight="medium"
              textOverflow="ellipsis"
            >
              {notices[noticeIndex].title}
            </TextWithClamp>
          </Box>
        </motion.div>
      </AnimatePresence>
    </Box>
  );

  const ExpandedBody = () => (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            position: "absolute",
            top: "50px",
            left: 0,
            right: 0,
            bottom: "50px",
            padding: "0 4px 0 16px",
          }}
        >
          <VStack
            align="stretch"
            gap={2}
            h="full"
            overflowY="auto"
            pr={3}
            css={{
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": {
                background: isDark
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.2)",
                borderRadius: "24px",
              },
            }}
          >
            {notices.map((notice) => (
              <Box
                key={notice.id}
                p={3}
                borderRadius="md"
                _hover={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                }}
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Badge variant="outline" colorScheme="teal" size="sm">
                    {notice.category}
                  </Badge>
                  <Badge colorScheme={getStatusColor(notice.status)} size="sm">
                    {notice.status}
                  </Badge>
                </Flex>
                <TextWithClamp lines={1} fontWeight="bold" mt={2}>
                  {notice.title}
                </TextWithClamp>
                <TextWithClamp
                  lines={2}
                  fontSize="xs"
                  mt={1}
                  color={isDark ? "whiteAlpha.700" : "blackAlpha.700"}
                >
                  {notice.description}
                </TextWithClamp>
              </Box>
            ))}
          </VStack>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const CardFooter = () => (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.3, ...transition } as any}
          style={{ position: "absolute", bottom: "8px", right: "8px" }}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push("/counsel")}
          >
            More <Icon as={LuChevronRight} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        position: "absolute",
        bottom: "7%",
        right: "2%",
        zIndex: 4,
      }}
    >
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate={isHovered ? "hover" : "initial"}
        transition={transition as any}
        style={{
          position: "relative",
          borderRadius: "1.5rem",
          backdropFilter: "blur(5px) saturate(180%)",
          boxShadow: "0 8px 12px 0 rgba(31, 38, 135, 0.20)",
          border: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.18)" : "rgba(209, 213, 219, 0.3)"
          }`,
          overflow: "hidden",
        }}
      >
        <Box
          color={isDark ? "whiteAlpha.800" : "blackAlpha.800"}
          w="full"
          h="full"
        >
          <CardHeader />
          {isHovered ? <ExpandedBody /> : <CardBody />}
          <CardFooter />
        </Box>
      </motion.div>
    </motion.div>
  );
};

export default CounselCard;
