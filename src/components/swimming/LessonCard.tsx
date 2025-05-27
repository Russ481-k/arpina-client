"use client";

import { LessonDTO } from "@/types/swimming";
import { MypageEnrollDto } from "@/types/api";
import { Box, Text, Button, Flex, Image } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toaster } from "../ui/toaster";
import LessonCardActions from "./LessonCardActions";

interface LessonCardProps {
  lesson: LessonDTO & { applicationStartDate?: string };
  context?: "listing" | "mypage";
  enrollment?: MypageEnrollDto;
  onGoToPayment?: (paymentPageUrl: string) => void;
  onRequestCancel?: (enrollId: number) => void;
  onRenewLesson?: (lessonId: number) => void;
}

// Helper function to calculate time remaining
const calculateTimeRemaining = (targetDate: string) => {
  const now = new Date().getTime();
  const targetTime = new Date(targetDate).getTime();
  const difference = targetTime - now;

  if (difference <= 0) {
    return null; // Or some indicator that time is up
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

export const LessonCard: React.FC<LessonCardProps> = React.memo(
  ({
    lesson,
    context = "listing",
    enrollment,
    onGoToPayment,
    onRequestCancel,
    onRenewLesson,
  }) => {
    const router = useRouter();
    const [timeRemaining, setTimeRemaining] = useState(() =>
      lesson.applicationStartDate
        ? calculateTimeRemaining(lesson.applicationStartDate)
        : null
    );
    const [isCountingDown, setIsCountingDown] = useState(
      !!(lesson.applicationStartDate && timeRemaining)
    );

    useEffect(() => {
      if (!lesson.applicationStartDate || lesson.status !== "접수대기") {
        setIsCountingDown(false);
        return;
      }

      const interval = setInterval(() => {
        const remaining = calculateTimeRemaining(lesson.applicationStartDate!);
        setTimeRemaining(remaining);
        if (!remaining) {
          setIsCountingDown(false);
          clearInterval(interval);
          // Potentially trigger a re-fetch or state update to change lesson status if needed
          // For now, it will just stop counting and button state will change via isCountingDown
        }
      }, 1000);

      return () => clearInterval(interval);
    }, [lesson.applicationStartDate, lesson.status]);

    const occupiedSpots = Math.max(0, lesson.capacity - lesson.remaining);

    const handleApplyClick = () => {
      if (isCountingDown || lesson.status !== "접수중" || !lesson.id) {
        toaster.create({
          title: "신청 불가",
          description: isCountingDown
            ? "아직 접수 시작 전입니다."
            : "현재 이 강습은 신청할 수 없습니다.",
          type: "warning",
          duration: 3000,
          closable: true,
        });
        return;
      }

      toaster.create({
        title: "신청 페이지 이동",
        description: "신청 정보 확인 페이지로 이동합니다.",
        type: "info",
        duration: 1500,
      });

      const queryParams = new URLSearchParams({
        lessonId: lesson.id.toString(),
        lessonTitle: lesson.title,
        lessonPrice: lesson.price.toString(),
        lessonStartDate: lesson.startDate, // Assuming this is the actual lesson start, not application start
        lessonEndDate: lesson.endDate,
        lessonTime: lesson.timeSlot,
        lessonDays: lesson.days,
        lessonTimePrefix: lesson.timePrefix,
      });

      router.push(`/application/confirm?${queryParams.toString()}`);
    };

    let buttonContent: React.ReactNode;
    let buttonDisabled = false;
    let buttonBgColor = "#888888"; // Default to disabled/non-actionable color

    if (isCountingDown && timeRemaining) {
      buttonContent = `접수시작: ${
        timeRemaining.days > 0 ? `${timeRemaining.days}일 ` : ""
      }${String(timeRemaining.hours).padStart(2, "0")}:${String(
        timeRemaining.minutes
      ).padStart(2, "0")}:${String(timeRemaining.seconds).padStart(2, "0")}`;
      buttonDisabled = true;
      buttonBgColor = "#orange.400"; // A color to indicate countdown/waiting
    } else if (lesson.status === "접수중") {
      buttonContent = "신청하기";
      buttonDisabled = false;
      buttonBgColor = "#2D3092";
    } else if (lesson.status === "접수마감") {
      buttonContent = "접수마감";
      buttonDisabled = true;
    } else if (lesson.status === "수강중") {
      buttonContent = "수강중";
      buttonDisabled = true;
    } else if (lesson.status === "접수대기" && !isCountingDown) {
      // This case means countdown finished or applicationStartDate was in the past but status is still 대기
      buttonContent = "접수시작전"; // Or some other appropriate label
      buttonDisabled = true;
      // Potentially refresh data here as status might be stale
    } else {
      buttonContent = "신청불가"; // Default for other unhandled statuses
      buttonDisabled = true;
    }

    return (
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
              lesson.status === "접수중"
                ? "#2D3092"
                : lesson.status === "수강중"
                ? "#4CBB17"
                : lesson.status === "접수마감"
                ? "#888888"
                : lesson.status === "접수대기"
                ? "#orange.500" // Color for 접수대기
                : "gray.400"
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
              lesson.remaining > 0 && lesson.status === "접수중" // Color based on actual available spots and status
                ? "#76B947" // Green if spots available and open for registration
                : lesson.status === "접수중" && lesson.remaining === 0 // If open but full
                ? "#FF5A5A" // Red
                : lesson.status === "수강중" // If ongoing
                ? "#FF5A5A" // Red (assuming this means no longer available for new registration)
                : "#888888" // Gray for other states like 마감, 대기
            }
            lineHeight="1"
          >
            {occupiedSpots} {/* Display occupied spots */}
            <Text as="span" fontSize="18px" color="#666" fontWeight="400">
              /{lesson.capacity}
            </Text>
          </Text>
          <Text fontSize="12px" color="#666" fontWeight="400" mt="2px">
            잔여:
            {lesson.remaining} {/* Display actual available spots */}
          </Text>
        </Box>

        {/* 카드 내용 */}
        <Box className="card-body">
          <Flex direction="column" gap="41px">
            <Box>
              <Text fontSize="14px" color="#666" fontWeight="400" mb={2}>
                {lesson.startDate} ~ {lesson.endDate}
              </Text>
              <Text fontWeight="700" color="#333" fontSize="18px">
                {lesson.title}
              </Text>
            </Box>
            <Box className="swimmer-image">
              <Image
                src="/images/swimming/swimmer.png"
                alt="수영하는 사람"
                width={175}
                height={85}
                style={{
                  objectFit: "contain",
                  opacity: 0.7,
                }}
              />
            </Box>
            <Box position="relative" zIndex="1">
              <Text color="#0C8EA4" fontWeight="700" fontSize="14px">
                강습시간
              </Text>
              <Text color="#FAB20B" fontWeight="600" fontSize="16px">
                {lesson.days} {lesson.timePrefix}
                {lesson.timeSlot}
              </Text>
            </Box>
          </Flex>
          <Box className="info-box" mt="18px">
            <Flex mb={2}>
              <Text fontWeight="600" color="#333" w="70px">
                접수기간
              </Text>
              <Text fontWeight="400" color="#666">
                {/* Display applicationStartDate and potentially an applicationEndDate if available */}
                {
                  lesson.applicationStartDate
                    ? `${new Date(
                        lesson.applicationStartDate
                      ).toLocaleDateString("ko-KR")} 부터`
                    : lesson.reservationId || "확인 중" // Fallback to existing fields or a placeholder
                }
                {lesson.receiptId && (
                  <>
                    <br />
                    {lesson.receiptId}
                  </>
                )}
                {/* This seems to be used for something else, keep if needed*/}
              </Text>
            </Flex>
            <Flex mb={2}>
              <Text fontWeight="600" color="#333" w="70px">
                강습대상
              </Text>
              <Text fontWeight="400" color="#666">
                성인(온라인)
              </Text>
            </Flex>
            <Flex>
              <Text fontWeight="600" color="#333" w="70px">
                교육장소
              </Text>
              <Text fontWeight="400" color="#666">
                {lesson.location}
              </Text>
            </Flex>
          </Box>
          {context === "mypage" && enrollment ? (
            <LessonCardActions
              enrollment={enrollment}
              lesson={lesson}
              onRequestCancel={onRequestCancel}
            />
          ) : (
            <Button
              w="100%"
              bgColor={buttonBgColor}
              color="white"
              height="41px"
              borderRadius="10px"
              _hover={{
                bgColor:
                  !buttonDisabled && lesson.status === "접수중"
                    ? "#1f2366"
                    : buttonBgColor,
              }}
              disabled={buttonDisabled}
              onClick={handleApplyClick}
            >
              {buttonContent}
            </Button>
          )}
        </Box>
      </Box>
    );
  }
);

LessonCard.displayName = "LessonCard";
