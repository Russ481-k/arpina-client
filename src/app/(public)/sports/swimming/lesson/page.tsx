"use client";

import { 
  Box, 
  Flex, 
  Text, 
  Heading, 
  Button, 
  Grid, 
  GridItem, 
  Checkbox,
  HStack,
  CloseButton,
  Image,
  Input,
  Field,
  Fieldset
} from "@chakra-ui/react";
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import ContentsHeading from "@/components/layout/ContentsHeading";
import { TopInfoBox } from "@/components/layout/TopInfoBox";
import { useLessons } from "@/lib/hooks/useSwimming";
import { useEnrollLesson } from "@/lib/hooks/useSwimming";
import { LessonDTO } from "@/types/swimming";

// 수영 강습 목록 컴포넌트
const SwimmingLessonList = () => {
  // 필터 상태
  const [filter, setFilter] = useState({
    status: "all",     // 전체, 접수중, 접수종료, 수강종료
    month: 5 as number | "all",  // 4, 5, 6월 또는 "all"
    timeType: "all",   // all, 오전, 오후, 저녁
    timeSlot: null     // 특정 시간대
  });
  
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API로부터 강습 데이터 가져오기
  const { data: lessonsData, isLoading: lessonsLoading, error: lessonsError } = useLessons({
    page: 0,
    size: 50,
    // 필터 상태에 따라 API 파라미터 구성
    ...(filter.status !== "all" && { status: filter.status }),
    ...(filter.month !== "all" && { month: filter.month })
  });

  // 신청 처리 함수
  const enrollMutation = useEnrollLesson();
  const handleApply = (lessonId: number) => {
    // 강습 신청 API 호출
    enrollMutation.mutate({ lessonId });
    
    // 신청 후 신청 확인 페이지로 이동하는 로직은 여기서 구현
    // 예: router.push('/sports/swimming/lesson/confirm')
    console.log(`강습 ID: ${lessonId} 신청하기`);
  };

  // API 응답에서 받은, 또는 로컬 더미 데이터
  const lessons = lessonsData?.data?.content || [
    // 더미 데이터 유지 (API 연결 전 테스트용)
    { 
      id: 1, 
      title: "수영 강습 프로그램", 
      name: "힐링수영반",
      startDate: "25년05월01일", 
      endDate: "25년05월30일", 
      timeSlot: "06:00~06:50", 
      timePrefix: "오전", 
      days: "(월,화,수,목,금)",
      capacity: 15, 
      remaining: 11, 
      price: 105000,
      status: "접수중",
      reservationId: "2025.04.17 13:00:00부터",
      receiptId: "2025.04.20 18:00:00까지",
      instructor: "성인(온라인)",
      location: "아르피나 수영장"
    },
    // ... 기존 더미 데이터
  ];

  // 필터 옵션들
  const statusOptions = [
    { label: "상태 전체선택", value: "all" },
    { label: "접수대기", value: "waiting" },
    { label: "접수중", value: "open" },
    { label: "수강중", value: "ongoing" },
    { label: "수강종료", value: "closed" }
  ];
  
  const monthOptions = [
    { label: "월별 전체선택", value: "all" },
    { label: "2025년 04월", value: 4 },
    { label: "2025년 05월", value: 5 },
    { label: "2025년 06월", value: 6 }
  ];

  const timeTypeOptions = [
    { label: "시간 전체선택", value: "all" },
    { label: "오전시간 전체선택", value: "morning" },
    { label: "오후시간 전체선택", value: "afternoon" }
  ];

  const timeSlots = [
    { label: "06:00~06:50", value: "06:00-06:50", type: "morning" },
    { label: "07:00~07:50", value: "07:00-07:50", type: "morning" },
    { label: "08:00~08:50", value: "08:00-08:50", type: "morning" },
    { label: "09:00~09:50", value: "09:00-09:50", type: "morning" },
    { label: "10:00~10:50", value: "10:00-10:50", type: "morning" },
    { label: "11:00~11:50", value: "11:00-11:50", type: "morning" },
    { label: "13:00~13:50", value: "13:00-13:50", type: "afternoon" },
    { label: "14:00~14:50", value: "14:00-14:50", type: "afternoon" },
    { label: "15:00~15:50", value: "15:00-15:50", type: "afternoon" },
    { label: "16:00~16:50", value: "16:00-16:50", type: "afternoon" },
    { label: "17:00~17:50", value: "17:00-17:50", type: "afternoon" },
    { label: "18:00~18:50", value: "18:00-18:50", type: "afternoon" },
    { label: "19:00~19:50", value: "19:00-19:50", type: "afternoon" },
    { label: "20:00~20:50", value: "20:00-20:50", type: "afternoon" },
    { label: "21:00~21:50", value: "21:00-21:50", type: "afternoon" }
  ];

  // 필터 선택 핸들러
  const handleFilterChange = (type: string, value: any) => {
    const currentFilterValue = filter[type as keyof typeof filter];
    let newFilterLabel = "";
    let shouldDeselect = false;

    // Determine new label and if current action is a deselect
    if (type === "status") {
      newFilterLabel = statusOptions.find(option => option.value === value)?.label || "";
      if (currentFilterValue === value) shouldDeselect = true;
    } else if (type === "month") {
      newFilterLabel = monthOptions.find(option => option.value === value)?.label || "";
      if (currentFilterValue === value) shouldDeselect = true;
    } else if (type === "timeType") {
      newFilterLabel = timeTypeOptions.find(option => option.value === value)?.label || "";
      if (currentFilterValue === value) shouldDeselect = true;
    } else if (type === "timeSlot") {
      newFilterLabel = timeSlots.find(option => option.value === value)?.label || "";
      if (currentFilterValue === value) shouldDeselect = true;
    }

    if (shouldDeselect) {
      // Action: Deselecting the currently active filter by clicking it again
      setFilter(prev => ({
        ...prev,
        [type]: type === 'month' ? 5 : (type === 'timeSlot' ? null : 'all'),
        ...(type === 'timeSlot' && !selectedFilters.some(sf => timeTypeOptions.find(tto => tto.label === sf && tto.value !== "all")) && { timeType: 'all' }),
      }));
      setSelectedFilters(prevFilters => prevFilters.filter(label => label !== newFilterLabel));
    } else {
      // Action: Selecting a new filter or changing selection within a category
      const newInternalFilterState: Partial<typeof filter> = { [type]: value };
      
      // Handle timeSlot selection - don't change timeType unless we're deselecting all slots
      if (type === "timeSlot") {
        const selectedSlotObject = timeSlots.find(s => s.value === value);
        // Don't update the timeType - we just want to add this specific time slot
      } else if (type === "timeType" && (value === "all" || value === "morning" || value === "afternoon")) {
        newInternalFilterState.timeSlot = null; 
      }

      setFilter(prev => ({
        ...prev,
        ...newInternalFilterState
      }));

      setSelectedFilters(prevFilters => {
        let updatedFilters = [...prevFilters];

        if (type === "status") {
          updatedFilters = updatedFilters.filter(label => !statusOptions.map(opt => opt.label).includes(label));
        } else if (type === "month") {
          updatedFilters = updatedFilters.filter(label => !monthOptions.map(opt => opt.label).includes(label));
        } else if (type === "timeType") {
          const currentValTimeType = value; // e.g., "morning", "afternoon", "all"
          // Remove all other timeType tags
          updatedFilters = updatedFilters.filter(label => 
            !timeTypeOptions.some(opt => opt.value !== currentValTimeType && opt.label === label)
          );
          // Remove all specific timeSlot tags when a general timeType is chosen
          updatedFilters = updatedFilters.filter(label => !timeSlots.map(slot => slot.label).includes(label));
          
          if (value === "all" || value === "morning" || value === "afternoon") {
            setFilter(prev => ({ ...prev, timeSlot: null }));
          }
        } else if (type === "timeSlot") {
          const selectedSlotObject = timeSlots.find(s => s.value === value);
          // Don't remove other timeSlot tags
          
          // Only remove the specific slot we're toggling if needed
          // Don't remove the parent category selection ("오전시간 전체선택" or "오후시간 전체선택")
          
          // Remove "시간 전체선택" tag if present
          updatedFilters = updatedFilters.filter(label => label !== timeTypeOptions[0].label);

          // Don't automatically select or remove the parent category
        }

        if (newFilterLabel && !updatedFilters.includes(newFilterLabel)) {
          updatedFilters.push(newFilterLabel);
        }
        return updatedFilters;
      });
    }
  };

  // 필터 제거 핸들러
  const removeFilter = (filterLabel: string) => {
    setSelectedFilters(prev => prev.filter(label => label !== filterLabel));
    
    // 해당 필터 초기화
    if (statusOptions.some(option => option.label === filterLabel)) {
      setFilter(prev => ({ ...prev, status: "all" }));
    } else if (monthOptions.some(option => option.label === filterLabel)) {
      setFilter(prev => ({ ...prev, month: 5 }));
    } else if (timeTypeOptions.some(option => option.label === filterLabel)) {
      setFilter(prev => ({ ...prev, timeType: "all" }));
    } else {
      // For time slots, we need to preserve other selected filters
      const timeSlotToRemove = timeSlots.find(slot => slot.label === filterLabel);
      if (timeSlotToRemove) {
        setFilter(prev => ({ ...prev, timeSlot: null }));
      }
    }
  };

  // 필터링된 강습 목록
  const filteredLessons = lessons.filter((lesson: LessonDTO) => {
    // 신청 가능한 강습만 보기 필터
    if (showAvailableOnly && lesson.remaining === 0) {
      return false;
    }
    
    // 상태 필터링
    if (filter.status !== "all") {
      const statusMap: Record<string, string> = {
        "waiting": "접수대기",
        "open": "접수중",
        "ongoing": "수강중",
        "closed": "접수마감"
      };
      if (lesson.status !== statusMap[filter.status]) {
        return false;
      }
    }
    
    // 월 필터링
    if (filter.month !== "all") {
      const month = parseInt(lesson.startDate.match(/\d+월/)?.[0]?.replace('월', '') || "0");
      if (month !== filter.month) {
        return false;
      }
    }
    
    // 시간대 필터링
    if (filter.timeType !== "all") {
      if (filter.timeType === "morning" && lesson.timePrefix !== "오전") {
        return false;
      }
      if (filter.timeType === "afternoon" && lesson.timePrefix !== "오후") {
        return false;
      }
    }
    
    // 특정 시간 필터링
    if (filter.timeSlot) {
      const timeSlotValue = filter.timeSlot as string;
      const timeRange = timeSlotValue.replace('-', '~');
      if (lesson.timeSlot !== timeRange) {
        return false;
      }
    }
    
    return true;
  });

  // 로딩 상태 표시
  if (lessonsLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg">강습 정보를 불러오는 중입니다...</Text>
      </Box>
    );
  }

  // 에러 상태 표시
  if (lessonsError) {
    return (
      <Box textAlign="center" py={10} color="red.500">
        <Text fontSize="lg">강습 정보를 불러오는데 문제가 발생했습니다.</Text>
        <Text mt={2}>다시 시도해주세요.</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* 상단 정보 바 */}
      <Flex 
        justify="space-between" 
        align="center" 
        width="100%" 
        maxW="1600px" 
        height="35px" 
        mb={6}
      >
        <Flex align="center" gap="15px" width="247px" height="35px">
          <Text 
            fontFamily="'Paperlogy', sans-serif" 
            fontWeight="500" 
            fontSize="21px" 
            lineHeight="25px" 
            letterSpacing="-0.05em" 
            color="#373636"
          >
            신청정보 <Text as="span" color="#2E3192" fontWeight="700">14</Text>건이 있습니다
          </Text>
        </Flex>

        <Flex align="center" gap="15px" width="316px" height="35px">
          <Text 
            fontFamily="'Paperlogy', sans-serif" 
            fontWeight="700" 
            fontSize="27px" 
            lineHeight="32px" 
            letterSpacing="-0.05em" 
            color="#373636"
          >
            신청 가능한 강습 보기
          </Text>
          <Box 
            position="relative" 
            width="60px"
            height="30px"
            borderRadius="33.3333px"
            bg={showAvailableOnly ? "#2E3192" : "#ccc"}
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            cursor="pointer"
            transition="background-color 0.2s"
          >
            <Box 
              position="absolute"
              width="23.33px"
              height="23.33px"
              left={showAvailableOnly ? "33.34px" : "3.31px"}
              top="3.31px"
              bg="white"
              borderRadius="50%"
              transition="left 0.2s"
            />
          </Box>
        </Flex>
      </Flex>
      
      {/* 카테고리 선택 헤더 */}
      <Box 
        className="category-header" 
        onClick={() => setCategoryOpen(!categoryOpen)} 
        mb={4}
        width="1600px"
        maxW="100%"
        padding="0px 20px"
      >
        <Flex 
          justify="space-between" 
          align="center" 
          padding="0px" 
          width="100%"
          height="60px"
          bg="#F7F8FB"
          borderRadius="10px"
        >
          <Flex align="center" gap="10px" width="466px" height="30px">
            <Box width="30px" height="30px" position="relative">
              <Box 
                position="absolute" 
                left="3.75px" 
                top="3.75px" 
                width="22.5px"
                height="22.5px"
              >
                <Image
                  src="/images/swimming/icon1.png"
                  alt="카테고리 아이콘"
                  width={22.5}
                  height={22.5}
                />
              </Box>
            </Box>
            <Text 
              fontFamily="'Paperlogy', sans-serif"
              fontWeight="700"
              fontSize="27px"
              lineHeight="30px"
              display="flex"
              alignItems="center"
              letterSpacing="-0.05em"
              color="#373636"
              width="386px"
              height="30px"
            >
              출력하실 카테고리를 선택해주세요
            </Text>
            <Box position="relative" width="30px" height="30px">
              <Box
                as="div"
                width="30px"
                height="30px"
                position="relative"
              >
                <Image 
                  src="/images/swimming/icon6.png"
                  alt="토글 아이콘"
                  width={12.5}
                  height={6.25}
                  style={{
                    position: 'absolute',
                    left: '8.75px',
                    top: '11.25px'
                  }}
                />
              </Box>
            </Box>
          </Flex>
          
          <Flex justify="flex-end" align="center" gap="10px" width="154px" height="30px">
            <Text
              fontFamily="'Paperlogy', sans-serif"
              fontWeight="500"
              fontSize="23px"
              lineHeight="28px"
              display="flex"
              alignItems="center"
              letterSpacing="-0.05em"
              color="#373636"
              width="114px"
              height="30px"
            >
              선택 초기화
            </Text>
            <Box width="30px" height="30px" position="relative">
              <Box 
                position="absolute" 
                left="2.5px"
                top="2.5px"
                width="25px"
                height="25px"
              >
                <Image 
                  src="/images/swimming/icon7.png"
                  alt="초기화 아이콘"
                  width={25}
                  height={25}
                  style={{
                    position: 'absolute',
                    left: '2.5px',
                    top: '2.5px'
                  }}
                />
              </Box>
            </Box>
          </Flex>
        </Flex>
      </Box>

      {categoryOpen && (
        <Flex 
          direction="column" 
          align="flex-start" 
          gap="5px" 
          width="1600px" 
          maxW="100%"
          mb={6}
        >
          {/* 상태 필터 탭 */}
          <Box 
            width="100%" 
            height="109px" 
            padding="20px" 
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            gap="10px"
            bg="#EFEFEF"
            borderRadius="10px"
          >
            <Flex align="center" gap="10px" width="80px" height="28px">
              <Box width="28px" height="28px" position="relative">
                <Box 
                  position="absolute" 
                  left="1.17px" 
                  top="4.93px" 
                  width="25.67px"
                  height="18.15px"
                >
                  <Image
                    src="/images/swimming/icon2.png"
                    alt="상태 아이콘"
                    width={25.67}
                    height={18.15}
                  />
                </Box>
              </Box>
              <Text 
                fontFamily="'Paperlogy', sans-serif"
                fontWeight="600"
                fontSize="21px"
                lineHeight="25px"
                display="flex"
                alignItems="center"
                letterSpacing="-0.05em"
                color="#373636"
                width="42px"
                height="28px"
              >
                상태
              </Text>
            </Flex>
            
            <Flex align="center" width="468px" height="31px" gap="10px" justifyContent="center">
              <Flex 
                justify="center" 
                align="center" 
                padding="5px 12px" 
                width="118px" 
                height="31px" 
                bg={selectedFilters.includes(statusOptions[0].label) ? "#2E3192" : "white"}
                borderRadius="20px" 
                onClick={() => handleFilterChange("status", "all")}
                cursor="pointer"
              >
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  lineHeight="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  letterSpacing="-0.05em"
                  color={selectedFilters.includes(statusOptions[0].label) ? "white" : "#838383"}
                  width="94px"
                  height="21px"
                  textAlign="center"
                >
                  상태 전체선택
                </Text>
              </Flex>
              <Flex 
                justify="center" 
                align="center" 
                padding="5px 12px" 
                width="85px" 
                height="31px" 
                bg={selectedFilters.includes(statusOptions[1].label) ? "#2E3192" : "white"}
                borderRadius="20px" 
                onClick={() => handleFilterChange("status", "waiting")}
                cursor="pointer"
              >
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  lineHeight="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  letterSpacing="-0.05em"
                  color={selectedFilters.includes(statusOptions[1].label) ? "white" : "#838383"}
                  width="61px"
                  height="21px"
                  textAlign="center"
                >
                  접수대기
                </Text>
              </Flex>
              <Flex 
                justify="center" 
                align="center" 
                padding="5px 12px" 
                width="70px" 
                height="31px" 
                bg={selectedFilters.includes(statusOptions[2].label) ? "#2E3192" : "white"}
                borderRadius="20px" 
                onClick={() => handleFilterChange("status", "open")}
                cursor="pointer"
              >
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  lineHeight="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  letterSpacing="-0.05em"
                  color={selectedFilters.includes(statusOptions[2].label) ? "white" : "#838383"}
                  width="46px"
                  height="21px"
                  textAlign="center"
                >
                  접수중
                </Text>
              </Flex>
              <Flex 
                justify="center" 
                align="center" 
                padding="5px 12px" 
                width="70px" 
                height="31px" 
                bg={selectedFilters.includes(statusOptions[3].label) ? "#2E3192" : "white"}
                borderRadius="20px" 
                onClick={() => handleFilterChange("status", "ongoing")}
                cursor="pointer"
              >
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  lineHeight="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  letterSpacing="-0.05em"
                  color={selectedFilters.includes(statusOptions[3].label) ? "white" : "#838383"}
                  width="46px"
                  height="21px"
                  textAlign="center"
                >
                  수강중
                </Text>
              </Flex>
              <Flex 
                justify="center" 
                align="center" 
                padding="5px 12px" 
                width="85px" 
                height="31px" 
                bg={selectedFilters.includes(statusOptions[4].label) ? "#2E3192" : "white"}
                borderRadius="20px" 
                onClick={() => handleFilterChange("status", "closed")}
                cursor="pointer"
              >
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  lineHeight="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  letterSpacing="-0.05em"
                  color={selectedFilters.includes(statusOptions[4].label) ? "white" : "#838383"}
                  width="61px"
                  height="21px"
                  textAlign="center"
                >
                  수강종료
                </Text>
              </Flex>
            </Flex>
          </Box>

          {/* 월별 필터 탭 */}
          <Box 
            width="100%" 
            height="109px" 
            padding="20px" 
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            gap="10px"
            bg="#EFEFEF"
            borderRadius="10px"
          >
            <Flex align="center" gap="10px" width="392px" height="28px">
              <Box width="28px" height="28px" position="relative">
                <Box 
                  position="absolute" 
                  left="2.33px" 
                  top="1.17px" 
                  width="24.5px"
                  height="24.5px"
                >
                  <Image
                    src="/images/swimming/icon3.png"
                    alt="월별 아이콘"
                    width={24.5}
                    height={24.5}
                  />
                </Box>
              </Box>
              <Text 
                fontFamily="'Paperlogy', sans-serif"
                fontWeight="600"
                fontSize="21px"
                lineHeight="25px"
                display="flex"
                alignItems="center"
                letterSpacing="-0.05em"
                color="#373636"
                width="42px"
                height="28px"
              >
                월별
              </Text>
              <Text 
                fontFamily="'Paperlogy', sans-serif"
                fontWeight="500"
                fontSize="13px"
                lineHeight="16px"
                display="flex"
                alignItems="center"
                letterSpacing="-0.05em"
                color="#838383"
                width="302px"
                height="19px"
              >
                (조회 가능 기간은 현재 기준 전후 1개월까지입니다)
              </Text>
            </Flex>
            
            <Flex align="center" width="501px" height="31px" gap="10px" justifyContent="center">
              <Flex 
                justify="center" 
                align="center" 
                padding="5px 12px" 
                width="118px" 
                height="31px" 
                bg={selectedFilters.includes(monthOptions[0].label) ? "#2E3192" : "white"}
                borderRadius="20px" 
                onClick={() => handleFilterChange("month", "all")}
                cursor="pointer"
              >
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  lineHeight="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  letterSpacing="-0.05em"
                  color={selectedFilters.includes(monthOptions[0].label) ? "white" : "#838383"}
                  width="94px"
                  height="21px"
                  textAlign="center"
                >
                  월별 전체선택
                </Text>
              </Flex>
              <Flex 
                justify="center" 
                align="center" 
                padding="5px 12px" 
                width="125px" 
                height="31px" 
                bg={selectedFilters.includes(monthOptions[1].label) ? "#2E3192" : "white"}
                borderRadius="20px" 
                onClick={() => handleFilterChange("month", 4)}
                cursor="pointer"
              >
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  lineHeight="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  letterSpacing="-0.05em"
                  color={selectedFilters.includes(monthOptions[1].label) ? "white" : "#838383"}
                  width="101px"
                  height="21px"
                  textAlign="center"
                >
                  2025년 04월
                </Text>
              </Flex>
              <Flex 
                justify="center" 
                align="center" 
                padding="5px 12px" 
                width="114px" 
                height="31px" 
                bg={selectedFilters.includes(monthOptions[2].label) ? "#2E3192" : "white"}
                borderRadius="20px" 
                onClick={() => handleFilterChange("month", 5)}
                cursor="pointer"
              >
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  lineHeight="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  letterSpacing="-0.05em"
                  color={selectedFilters.includes(monthOptions[2].label) ? "white" : "#838383"}
                  width="90px"
                  height="21px"
                  textAlign="center"
                >
                  2025년 5월
                </Text>
              </Flex>
              <Flex 
                justify="center" 
                align="center" 
                padding="5px 12px" 
                width="114px" 
                height="31px" 
                bg={selectedFilters.includes(monthOptions[3].label) ? "#2E3192" : "white"}
                borderRadius="20px" 
                onClick={() => handleFilterChange("month", 6)}
                cursor="pointer"
              >
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  lineHeight="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  letterSpacing="-0.05em"
                  color={selectedFilters.includes(monthOptions[3].label) ? "white" : "#838383"}
                  width="90px"
                  height="21px"
                  textAlign="center"
                >
                  2025년 6월
                </Text>
              </Flex>
            </Flex>
          </Box>

          {/* 시간 필터 탭 */}
          <Box 
            width="100%" 
            height="191px" 
            padding="20px" 
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            gap="10px"
            bg="#EFEFEF"
            borderRadius="10px"
          >
            <Flex align="center" gap="10px" width="80px" height="28px">
              <Box width="28px" height="28px" position="relative">
                <Box 
                  position="absolute" 
                  left="2.33px" 
                  top="2.33px" 
                  width="23.33px"
                  height="23.33px"
                >
                  <Image
                    src="/images/swimming/icon4.png"
                    alt="시간 아이콘"
                    width={23.33}
                    height={23.33}
                  />
                </Box>
              </Box>
              <Text 
                fontFamily="'Paperlogy', sans-serif"
                fontWeight="600"
                fontSize="21px"
                lineHeight="25px"
                display="flex"
                alignItems="center"
                letterSpacing="-0.05em"
                color="#373636"
                width="42px"
                height="28px"
              >
                시간
              </Text>
            </Flex>
            
            <Flex align="flex-start" width="434px" height="31px" gap="10px" justifyContent="center">
              <Flex 
                justify="center" 
                align="center" 
                padding="5px 12px" 
                width="118px" 
                height="31px" 
                bg={selectedFilters.includes(timeTypeOptions[0].label) ? "#2E3192" : "white"}
                borderRadius="20px" 
                onClick={() => handleFilterChange("timeType", "all")}
                cursor="pointer"
              >
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  lineHeight="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  letterSpacing="-0.05em"
                  color={selectedFilters.includes(timeTypeOptions[0].label) ? "white" : "#838383"}
                  width="94px"
                  height="21px"
                  textAlign="center"
                >
                  시간 전체선택
                </Text>
              </Flex>
              <Flex 
                justify="center" 
                align="center" 
                padding="5px 12px" 
                width="148px" 
                height="31px" 
                bg={selectedFilters.includes(timeTypeOptions[1].label) ? "#2E3192" : "white"}
                borderRadius="20px" 
                onClick={() => handleFilterChange("timeType", "morning")}
                cursor="pointer"
              >
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  lineHeight="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  letterSpacing="-0.05em"
                  color={selectedFilters.includes(timeTypeOptions[1].label) ? "white" : "#838383"}
                  width="124px"
                  height="21px"
                  textAlign="center"
                >
                  오전시간 전체선택
                </Text>
              </Flex>
              <Flex 
                justify="center" 
                align="center" 
                padding="5px 12px" 
                width="148px" 
                height="31px" 
                bg={selectedFilters.includes(timeTypeOptions[2].label) ? "#2E3192" : "white"}
                borderRadius="20px" 
                onClick={() => handleFilterChange("timeType", "afternoon")}
                cursor="pointer"
              >
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  lineHeight="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  letterSpacing="-0.05em"
                  color={selectedFilters.includes(timeTypeOptions[2].label) ? "white" : "#838383"}
                  width="124px"
                  height="21px"
                  textAlign="center"
                >
                  오후시간 전체선택
                </Text>
              </Flex>
            </Flex>

            <Flex align="center" flexWrap="wrap" gap="10px" width="910px" height="31px">
              {timeSlots.slice(0, 6).map((slot) => {
                const isSelected = filter.timeSlot === slot.value || 
                  selectedFilters.includes(slot.label) || 
                  (selectedFilters.includes(timeTypeOptions[0].label)) ||
                  (selectedFilters.includes(timeTypeOptions[1].label) && slot.type === "morning");

                return (
                  <Flex 
                    key={slot.value}
                    justifyContent="center" 
                    alignItems="center" 
                    padding="5px 12px" 
                    gap={isSelected ? "5px" : "0px"}
                    width="139px" 
                    height="31px" 
                    bg={isSelected ? "#2E3192" : "white"}
                    borderRadius="20px" 
                    onClick={() => handleFilterChange("timeSlot", slot.value)}
                    cursor="pointer"
                  >
                    {isSelected && (
                      <Box width="21px" height="21px" position="relative">
                        <Image
                          src="/images/swimming/checkicon.png"
                          alt="체크 아이콘"
                          width={15.75}
                          height={15.75}
                          position="absolute"
                          top="2.63px"
                          left="2.63px"
                        />
                      </Box>
                    )}
                    <Text 
                      fontFamily="'Paperlogy', sans-serif"
                      fontWeight="600"
                      fontSize="15px"
                      lineHeight="21px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      letterSpacing="-0.05em"
                      color={isSelected ? "#FFFFFF" : "#838383"}
                      width={isSelected ? "115px" : "100%"}
                      height="21px"
                      textAlign="center"
                    >
                      {slot.label}
                    </Text>
                  </Flex>
                );
              })}
            </Flex>

            <Flex align="center" flexWrap="wrap" gap="10px" width="1331px" height="31px">
              {timeSlots.slice(6).map((slot) => {
                const isSelected = filter.timeSlot === slot.value || 
                  selectedFilters.includes(slot.label) || 
                  (selectedFilters.includes(timeTypeOptions[0].label)) ||
                  (selectedFilters.includes(timeTypeOptions[2].label) && slot.type === "afternoon");
                
                return (
                  <Flex 
                    key={slot.value}
                    justifyContent="center" 
                    alignItems="center" 
                    padding="5px 12px" 
                    gap={isSelected ? "5px" : "0px"}
                    width="139px" 
                    height="31px" 
                    bg={isSelected ? "#2E3192" : "white"}
                    borderRadius="20px" 
                    onClick={() => handleFilterChange("timeSlot", slot.value)}
                    cursor="pointer"
                  >
                    {isSelected && (
                      <Box width="21px" height="21px" position="relative">
                        <Image
                          src="/images/swimming/checkicon.png"
                          alt="체크 아이콘"
                          width={15.75}
                          height={15.75}
                          position="absolute"
                          top="2.63px"
                          left="2.63px"
                        />
                      </Box>
                    )}
                    <Text 
                      fontFamily="'Paperlogy', sans-serif"
                      fontWeight="600"
                      fontSize="15px"
                      lineHeight="21px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      letterSpacing="-0.05em"
                      color={isSelected ? "#FFFFFF" : "#838383"}
                      width={isSelected ? "115px" : "100%"}
                      height="21px"
                      textAlign="center"
                    >
                      {slot.label}
                    </Text>
                  </Flex>
                );
              })}
            </Flex>
          </Box>
          
          {/* 필터 태그 영역 - 통합된 구성으로 변경 */}
          {selectedFilters.length > 0 && (
            <Box 
              width="100%" 
              padding="20px" 
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="flex-start"
              gap="10px"
              bg="#F7F8FB"
              borderRadius="10px"
              mt="5px"
            >
              <Flex align="center" gap="10px" width="auto" height="28px">
                <Box width="28px" height="28px" position="relative">
                  <Box 
                    position="absolute" 
                    left="3.76px"
                    top="2.5px"
                    width="22.5px"
                    height="25px"
                  >
                    <Image
                      src="/images/swimming/icon5.png"
                      alt="필터 아이콘"
                      width={21.5}
                      height={23.5}
                    />
                  </Box>
                </Box>
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="600"
                  fontSize="21px"
                  lineHeight="25px"
                  display="flex"
                  alignItems="center"
                  letterSpacing="-0.05em"
                  color="#373636"
                >
                  필터
                </Text>
                <Text 
                  fontFamily="'Paperlogy', sans-serif"
                  fontWeight="500"
                  fontSize="13px"
                  lineHeight="16px"
                  display="flex"
                  alignItems="center"
                  letterSpacing="-0.05em"
                  color="#838383"
                >
                  (선택하신 카테고리가 표시됩니다)
                </Text>
              </Flex>
              
              <Box>
                {selectedFilters.map((filter) => (
                  <Box 
                    key={filter} 
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    margin="0 8px 8px 0"
                    width="165px"
                    height="31px"
                    padding="5px 12px"
                    borderRadius="20px"
                    bg="#FFFFFF"
                    border="1px solid #eee"
                    gap="5px"
                  >
                    <Text
                      fontFamily="'Paperlogy', sans-serif"
                      fontWeight="600"
                      fontSize="15px"
                      lineHeight="21px"
                      color="#373636"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      textAlign="center"
                    >
                      {filter}
                    </Text>
                    <Box 
                      onClick={() => removeFilter(filter)}
                      cursor="pointer"
                      color="#666"
                      fontWeight="bold"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Image
                        src="/images/swimming/icon8.png"
                        alt="카테고리 아이콘"
                        width={16.3}
                        height={16.3}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Flex>
      )}

      {/* 강습 목록 그리드 */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} justifyItems="center">
        {filteredLessons.map((lesson: LessonDTO) => (
          <GridItem key={lesson.id}>
            <Box className="swimming-card">
              {/* 접수 상태 배지 */}
              <Box className="status-badge">
                <Box
                  display="inline-block"
                  py="4px"
                  px="12px"
                  borderRadius="md"
                  border={lesson.status === "접수중" ? "1px solid #2D3092" : "none"}
                  fontSize="14px"
                  fontWeight="600"
                  color="white"
                  bg={
                    lesson.status === "접수중" ? "#2D3092" : 
                    lesson.status === "수강중" ? "#4CBB17" : 
                    lesson.status === "접수마감" ? "#888888" : 
                    "gray.400"
                  }
                >
                  {lesson.status}
                </Box>
              </Box>

              {/* 잔여석 표시 */}
              <Box className="remaining-badge">
                <Text 
                  fontSize="32px" 
                  fontWeight="700" 
                  color={
                    lesson.remaining > 0 && lesson.status === "접수중" ? "#76B947" : 
                    lesson.remaining === 0 ? "#FF5A5A" : 
                    lesson.status === "수강중" ? "#FF5A5A" : 
                    "#888888"
                  }
                  lineHeight="1"
                >
                  {lesson.remaining}
                  <Text as="span" fontSize="18px" color="#666" fontWeight="400">/{lesson.capacity}</Text>
                </Text>
                <Text fontSize="12px" color="#666" fontWeight="400" mt="2px">
                  잔여:{lesson.remaining > 0 ? 4 : 0}
                </Text>
              </Box>

              {/* 카드 내용 */}
              <Box className="card-body">
                {/* 기간, 제목, 강습 시간을 하나의 영역으로 묶기 */}
                <Flex direction="column" gap="41px">
                  {/* 기간 및 제목 */}
                  <Box>
                    <Text fontSize="14px" color="#666" fontWeight="400" mb={2}>
                      {lesson.startDate} ~ {lesson.endDate}
                    </Text>
                    <Text fontWeight="700" color="#333" fontSize="18px">
                      {lesson.title}
                    </Text>
                  </Box>

                  {/* 수영 이미지 */}
                  <Box className="swimmer-image">
                    <Image 
                      src="/images/swimming/swimmer.png" 
                      alt="수영하는 사람" 
                      width={175}
                      height={85}
                      style={{
                        objectFit: "contain",
                        opacity: 0.7
                      }}
                    />
                  </Box>

                  {/* 강습 시간 */}
                  <Box position="relative" zIndex="1">
                    <Text color="#0C8EA4" fontWeight="700" fontSize="14px">
                      강습시간
                    </Text>
                    <Text color="#FAB20B" fontWeight="600" fontSize="16px">
                      {lesson.days} {lesson.timePrefix}{lesson.timeSlot}
                    </Text>
                  </Box>
                </Flex>

                {/* 접수기간, 강습대상, 교육장소 */}
                <Box className="info-box" mt="18px">
                  <Flex mb={2}>
                    <Text fontWeight="600" color="#333" w="70px">접수기간</Text>
                    <Text fontWeight="400" color="#666">
                      {lesson.reservationId}<br/>
                      {lesson.receiptId}
                    </Text>
                  </Flex>
                  <Flex mb={2}>
                    <Text fontWeight="600" color="#333" w="70px">강습대상</Text>
                    <Text fontWeight="400" color="#666">{lesson.instructor}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="600" color="#333" w="70px">교육장소</Text>
                    <Text fontWeight="400" color="#666">{lesson.location}</Text>
                  </Flex>
                </Box>

                {/* 신청하기 버튼 */}
                <Button
                  className="apply-button"
                  bgColor={
                    lesson.status === "접수중" ? "#2D3092" : 
                    lesson.status === "접수마감" ? "#888888" : 
                    "#888888"
                  }
                  color="white"
                  height="41px"
                  borderRadius="10px"
                  _hover={{
                    bgColor: lesson.status === "접수중" ? "#1f2366" : "#888888"
                  }}
                  disabled={lesson.status !== "접수중"}
                  onClick={() => handleApply(lesson.id)}
                >
                  {lesson.status === "접수중" ? "신청하기" : 
                   lesson.status === "접수마감" ? "D-12" : "신청마감"}
                </Button>
              </Box>
            </Box>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

// 수영장 신청 가이드 컴포넌트
const SwimmingGuide = () => {
  return (
    <Flex 
      direction="row" 
      align="flex-start" 
      padding="0px" 
      gap="60px" 
      width="1600px" 
      height="374px" 
      position="relative"
      mb={10}
    >
      {/* Left side image */}
      <Box 
        width="235.88px" 
        height="374px" 
        flex="none" 
        order={0} 
        flexGrow={0}
        position="relative"
      >
        <Image
          src="/images/swimming/guide-image.png"
          alt="수영장 가이드 이미지"
          width={235.9}
          height={373.97}
          position="absolute"
          left="0px"
          top="0px"
        />
      </Box>

      {/* Right side content */}
      <Flex 
        direction="column" 
        align="flex-start" 
        padding="0px" 
        gap="15px" 
        width="1303px" 
        height="374px" 
        flex="none" 
        order={1} 
        flexGrow={0}
      >
        {/* 수영장 온라인 신청 순서 - Title */}
        <Text 
          width="290px" 
          height="35px" 
          fontFamily="'Paperlogy', sans-serif" 
          fontStyle="normal" 
          fontWeight="700" 
          fontSize="30px" 
          lineHeight="35px" 
          display="flex" 
          alignItems="center" 
          letterSpacing="-0.05em" 
          color="#00636F" 
          flex="none" 
          order={0} 
          flexGrow={0}
        >
          수영장 온라인 신청 순서
        </Text>

        {/* 수영장 온라인 신청 순서 - Content Box */}
        <Flex 
          direction="column" 
          align="flex-start" 
          padding="20px" 
          gap="5px" 
          width="1250px" 
          height="119px" 
          bg="#F7F8FB" 
          borderRadius="10px" 
          flex="none" 
          order={1} 
          flexGrow={0}
        >
          <Text 
            width="100%" 
            height="16px" 
            fontFamily="'Paperlogy', sans-serif" 
            fontStyle="normal" 
            fontWeight="500" 
            fontSize="14px" 
            lineHeight="16px" 
            display="flex" 
            alignItems="center" 
            letterSpacing="-0.05em" 
            color="#373636" 
            flex="none" 
            order={0} 
            alignSelf="stretch" 
            flexGrow={0}
          >
            1. 신청시각이 되면, 신청하기 버튼이 활성화 됩니다
          </Text>
          <Text 
            width="100%" 
            height="16px" 
            fontFamily="'Paperlogy', sans-serif" 
            fontStyle="normal" 
            fontWeight="500" 
            fontSize="14px" 
            lineHeight="16px" 
            display="flex" 
            alignItems="center" 
            letterSpacing="-0.05em" 
            color="#373636" 
            flex="none" 
            order={1} 
            alignSelf="stretch" 
            flexGrow={0}
          >
            2. 원하는 강습 일정과 시간을 확인 후 신청해 주세요
          </Text>
          <Text 
            width="100%" 
            height="16px" 
            fontFamily="'Paperlogy', sans-serif" 
            fontStyle="normal" 
            fontWeight="500" 
            fontSize="14px" 
            lineHeight="16px" 
            display="flex" 
            alignItems="center" 
            letterSpacing="-0.05em" 
            color="#373636" 
            flex="none" 
            order={2} 
            alignSelf="stretch" 
            flexGrow={0}
          >
            3. 사물함 신청시 추가 옵션을 확인 해주세요 (추가 : 5,000원)
          </Text>
          <Text 
            width="100%" 
            height="16px" 
            fontFamily="'Paperlogy', sans-serif" 
            fontStyle="normal" 
            fontWeight="500" 
            fontSize="14px" 
            lineHeight="16px" 
            display="flex" 
            alignItems="center" 
            letterSpacing="-0.05em" 
            color="#373636" 
            flex="none" 
            order={3} 
            alignSelf="stretch" 
            flexGrow={0}
          >
            4. 신청 후 1시간 내에 마이페이지에서 결제 후 확정 됩니다
          </Text>
        </Flex>

        {/* 수영장 온라인 신청 가이드 - Title */}
        <Text 
          width="315px" 
          height="35px" 
          fontFamily="'Paperlogy', sans-serif" 
          fontStyle="normal" 
          fontWeight="700" 
          fontSize="30px" 
          lineHeight="35px" 
          display="flex" 
          alignItems="center" 
          letterSpacing="-0.05em" 
          color="#00636F" 
          flex="none" 
          order={2} 
          flexGrow={0}
        >
          수영장 온라인 신청 가이드
        </Text>

        {/* 수영장 온라인 신청 가이드 - Content Box */}
        <Flex 
          direction="column" 
          align="flex-start" 
          padding="20px" 
          gap="5px" 
          width="1250px" 
          height="140px" 
          bg="#F7F8FB" 
          borderRadius="10px" 
          flex="none" 
          order={3} 
          flexGrow={0}
        >
          <Text 
            width="100%" 
            height="16px" 
            fontFamily="'Paperlogy', sans-serif" 
            fontStyle="normal" 
            fontWeight="500" 
            fontSize="14px" 
            lineHeight="16px" 
            display="flex" 
            alignItems="center" 
            letterSpacing="-0.05em" 
            color="#373636" 
            flex="none" 
            order={0} 
            alignSelf="stretch" 
            flexGrow={0}
          >
            • 원하는 강습 일정과 시간을 확인 후 신청해 주세요 (금액 : 60,000원)
          </Text>
          <Text 
            width="100%" 
            height="16px" 
            fontFamily="'Paperlogy', sans-serif" 
            fontStyle="normal" 
            fontWeight="500" 
            fontSize="14px" 
            lineHeight="16px" 
            display="flex" 
            alignItems="center" 
            letterSpacing="-0.05em" 
            color="#373636" 
            flex="none" 
            order={1} 
            alignSelf="stretch" 
            flexGrow={0}
          >
            • 신규등록 : 매월 25일 ~ 말일 까지
          </Text>
          <Text 
            width="100%" 
            height="16px" 
            fontFamily="'Paperlogy', sans-serif" 
            fontStyle="normal" 
            fontWeight="500" 
            fontSize="14px" 
            lineHeight="16px" 
            display="flex" 
            alignItems="center" 
            letterSpacing="-0.05em" 
            color="#373636" 
            flex="none" 
            order={2} 
            alignSelf="stretch" 
            flexGrow={0}
          >
            • 재등록 : 매월 18일 ~ 22일 까지 (마이페이지를 통해 재등록 가능)
          </Text>
          <Text 
            width="100%" 
            height="16px" 
            fontFamily="'Paperlogy', sans-serif" 
            fontStyle="normal" 
            fontWeight="500" 
            fontSize="14px" 
            lineHeight="16px" 
            display="flex" 
            alignItems="center" 
            letterSpacing="-0.05em" 
            color="#373636" 
            flex="none" 
            order={3} 
            alignSelf="stretch" 
            flexGrow={0}
          >
            • 수영장 온라인 신규 신청은 회원가입 후 신청 가능합니다
          </Text>
          <Text 
            width="100%" 
            height="16px" 
            fontFamily="'Paperlogy', sans-serif" 
            fontStyle="normal" 
            fontWeight="500" 
            fontSize="14px" 
            lineHeight="16px" 
            display="flex" 
            alignItems="center" 
            letterSpacing="-0.05em" 
            color="#373636" 
            flex="none" 
            order={4} 
            alignSelf="stretch" 
            flexGrow={0}
          >
            • 만 19세 이상만 온라인 신청 가능합니다
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default function SwimmingLessonPage() {
  return (
    <PageContainer>
      <ContentsHeading title="1차메뉴" />
      
      <SwimmingGuide />
      <SwimmingLessonList />
    </PageContainer>
  );
}
