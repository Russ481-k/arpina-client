"use client";

import { LessonDTO } from "@/types/swimming";
import { MypageEnrollDto } from "@/types/api";
import { Box, Text, Button, Flex, Image } from "@chakra-ui/react";
import React from "react";
import { useRouter } from "next/navigation";
import { toaster } from "../ui/toaster";
import LessonCardActions from "./LessonCardActions";

interface LessonCardProps {
  lesson: LessonDTO;
  context?: "listing" | "mypage";
  enrollment?: MypageEnrollDto;
  onGoToPayment?: (paymentPageUrl: string) => void;
  onRequestCancel?: (enrollId: number) => void;
  onRenewLesson?: (lessonId: number) => void;
}

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

    const occupiedSpots = Math.max(0, lesson.capacity - lesson.remaining);

    const handleApplyClick = () => {
      if (lesson.status !== "접수중" || !lesson.id) {
        toaster.create({
          title: "신청 불가",
          description: "현재 이 강습은 신청할 수 없습니다.",
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
      });

      router.push(`/application/confirm?${queryParams.toString()}`);
    };

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
                : "gray.400" // Default for other statuses like "접수대기"
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
                {lesson.reservationId}
                <br />
                {lesson.receiptId}
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
              bgColor={
                lesson.status === "접수중"
                  ? "#2D3092"
                  : lesson.status === "접수마감" || lesson.status === "수강중"
                  ? "#888888"
                  : "#888888"
              }
              color="white"
              height="41px"
              borderRadius="10px"
              _hover={{
                bgColor: lesson.status === "접수중" ? "#1f2366" : "#888888",
              }}
              disabled={lesson.status !== "접수중"}
              onClick={handleApplyClick}
            >
              {lesson.status === "접수중"
                ? "신청하기"
                : lesson.status === "접수마감"
                ? "접수마감"
                : lesson.status === "수강중"
                ? "수강중"
                : "신청마감"}
            </Button>
          )}
        </Box>
      </Box>
    );
  }
);

LessonCard.displayName = "LessonCard";
