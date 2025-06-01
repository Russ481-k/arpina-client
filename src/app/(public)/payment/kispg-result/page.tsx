"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Text,
  Button,
  Flex,
  Spinner,
  Heading,
  VStack,
  Container,
  Icon,
} from "@chakra-ui/react";
import { MdCheckCircle, MdError, MdInfo } from "react-icons/md";
import { mypageApi } from "@/lib/api/mypageApi";
import { toaster } from "@/components/ui/toaster";
import { useColors } from "@/styles/theme";

type PaymentResult = "SUCCESS" | "FAILED" | "PROCESSING" | "UNKNOWN";

const KISPGResultPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentResult, setPaymentResult] = useState<PaymentResult>("UNKNOWN");
  const [resultMessage, setResultMessage] = useState<string>("");
  const [enrollId, setEnrollId] = useState<number | null>(null);
  const [isPopup, setIsPopup] = useState(false);

  const colors = useColors();
  const primaryText = colors.text.primary;
  const secondaryText = colors.text.secondary;
  const primaryDefault = colors.primary.default;
  const successColor = colors.accent.success || "#22c55e";
  const errorColor = colors.accent.delete.default;
  const warningColor = colors.accent.warning.default;

  // Extract string values from color objects if they're objects
  const getColorValue = (colorValue: any): string => {
    if (typeof colorValue === "string") return colorValue;
    if (colorValue && typeof colorValue === "object" && colorValue.default) {
      return colorValue.default;
    }
    return "#000000"; // fallback
  };

  const successColorStr = getColorValue(successColor);
  const errorColorStr = getColorValue(errorColor);
  const warningColorStr = getColorValue(warningColor);
  const primaryDefaultStr = getColorValue(primaryDefault);

  useEffect(() => {
    // 팝업 감지
    if (window.opener) {
      setIsPopup(true);
    }
  }, []);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Extract parameters from URL
        const resultCd = searchParams.get("resultCd");
        const resultMsg = searchParams.get("resultMsg");
        const tid = searchParams.get("tid");
        const amt = searchParams.get("amt");
        const payMethod = searchParams.get("payMethod");
        const mbsReserved = searchParams.get("mbsReserved"); // This should contain enrollId
        const moid = searchParams.get("moid"); // Alternative: extract from moid

        console.log("KISPG Return Params:", {
          resultCd,
          resultMsg,
          tid,
          amt,
          payMethod,
          mbsReserved,
          moid,
        });

        // Try to extract enrollId from mbsReserved or moid
        let enrollIdFromParam: number | null = null;

        // First try mbsReserved (format: "temp_12")
        if (mbsReserved) {
          const parts = mbsReserved.split("_");
          if (parts.length >= 2 && !isNaN(parseInt(parts[1]))) {
            enrollIdFromParam = parseInt(parts[1]);
          }
        }

        // If not found, try moid (format: "temp_12_timestamp")
        if (!enrollIdFromParam && moid) {
          const parts = moid.split("_");
          if (parts.length >= 2 && !isNaN(parseInt(parts[1]))) {
            enrollIdFromParam = parseInt(parts[1]);
          }
        }

        console.log("EnrollId extraction:", {
          mbsReserved,
          moid,
          extractedEnrollId: enrollIdFromParam,
        });

        if (!enrollIdFromParam) {
          throw new Error("신청 정보를 찾을 수 없습니다.");
        }

        setEnrollId(enrollIdFromParam);

        // 결제 결과 처리
        let finalResult: PaymentResult = "UNKNOWN";
        let finalMessage = "";
        let paymentData: any = {
          resultCd,
          resultMsg,
          tid,
          amt,
          payMethod,
          enrollId: enrollIdFromParam,
        };

        if (resultCd === "0000") {
          // Payment successful - in the new flow, enrollment is created after payment success
          finalResult = "SUCCESS";
          finalMessage =
            "결제가 성공적으로 완료되었습니다. 수강신청이 처리되었습니다.";
          setPaymentResult("SUCCESS");
          setResultMessage(finalMessage);

          // 팝업이 아닌 경우만 토스터 표시
          if (!window.opener) {
            toaster.create({
              title: "결제 완료",
              description: "수영 강습 결제 및 신청이 완료되었습니다.",
              type: "success",
              duration: 5000,
            });
          }
        } else {
          // Payment failed - no enrollment to cancel in the new flow
          finalResult = "FAILED";
          finalMessage = resultMsg || "결제에 실패했습니다.";
          setPaymentResult("FAILED");
          setResultMessage(finalMessage);

          console.log("Payment failed - no enrollment created:", {
            resultCd,
            resultMsg,
            enrollIdFromParam,
          });
        }

        // 팝업인 경우 부모 창에 메시지 전송
        if (window.opener) {
          const messageData = {
            type: "KISPG_PAYMENT_RESULT",
            success: finalResult === "SUCCESS",
            enrollId: enrollIdFromParam,
            data: {
              ...paymentData,
              result: finalResult,
              message: finalMessage,
            },
          };

          console.log("Sending postMessage to parent:", messageData);

          // 부모 창에 메시지 전송
          window.opener.postMessage(messageData, window.location.origin);

          // 결제 성공/실패 상관없이 3초 후 자동 창 닫기 (팝업인 경우)
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      } catch (error: any) {
        console.error("Payment result processing error:", error);
        setPaymentResult("FAILED");
        setResultMessage(error.message || "결제 처리 중 오류가 발생했습니다.");

        // 팝업이 아닌 경우만 토스터 표시
        if (!window.opener) {
          toaster.create({
            title: "오류",
            description: error.message || "결제 처리 중 오류가 발생했습니다.",
            type: "error",
          });
        }

        // 팝업인 경우 에러도 부모 창에 전송
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "KISPG_PAYMENT_RESULT",
              success: false,
              enrollId: enrollId || 0,
              data: {
                error: error.message,
                result: "FAILED",
              },
            },
            window.location.origin
          );

          // 에러인 경우에도 3초 후 자동으로 창 닫기
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      } finally {
        setIsProcessing(false);
      }
    };

    processPaymentResult();
  }, [searchParams]);

  const handleGoToMyPage = () => {
    if (isPopup && window.opener) {
      // 부모 창을 마이페이지로 이동시키고 팝업 닫기
      window.opener.location.href = "/mypage?tab=수영장_신청정보";
      window.close();
    } else {
      router.push("/mypage?tab=수영장_신청정보");
    }
  };

  const handleGoToLessons = () => {
    if (isPopup && window.opener) {
      // 부모 창을 강습 목록으로 이동시키고 팝업 닫기
      window.opener.location.href = "/sports/swimming/lesson";
      window.close();
    } else {
      router.push("/sports/swimming/lesson");
    }
  };

  const handleRetryPayment = () => {
    if (isPopup && window.opener) {
      // 팝업 닫기 (부모 창에서 재시도하도록)
      window.close();
    } else if (enrollId) {
      router.push("/sports/swimming/lesson");
    } else {
      router.push("/sports/swimming/lesson");
    }
  };

  const handleClosePopup = () => {
    window.close();
  };

  if (isProcessing) {
    return (
      <Container maxW="600px" py={16}>
        <Flex direction="column" align="center" justify="center" minH="50vh">
          <Spinner size="xl" color={primaryDefaultStr} />
          <Text mt={4} color={primaryText} fontSize="lg">
            결제 결과를 처리하고 있습니다...
          </Text>
          <Text mt={2} color={secondaryText} fontSize="sm">
            잠시만 기다려 주세요.
          </Text>
        </Flex>
      </Container>
    );
  }

  const getResultIcon = () => {
    switch (paymentResult) {
      case "SUCCESS":
        return (
          <Icon as={MdCheckCircle} w={16} h={16} color={successColorStr} />
        );
      case "FAILED":
        return <Icon as={MdError} w={16} h={16} color={errorColorStr} />;
      case "PROCESSING":
        return <Icon as={MdInfo} w={16} h={16} color={warningColorStr} />;
      default:
        return <Icon as={MdInfo} w={16} h={16} color={warningColorStr} />;
    }
  };

  const getResultTitle = () => {
    switch (paymentResult) {
      case "SUCCESS":
        return "결제 완료";
      case "FAILED":
        return "결제 실패";
      case "PROCESSING":
        return "결제 처리 중";
      default:
        return "결제 상태 확인";
    }
  };

  const getResultColor = () => {
    switch (paymentResult) {
      case "SUCCESS":
        return successColorStr;
      case "FAILED":
        return errorColorStr;
      case "PROCESSING":
        return warningColorStr;
      default:
        return primaryText;
    }
  };

  return (
    <Container maxW="600px" py={16}>
      <Flex direction="column" align="center" justify="center" minH="50vh">
        <VStack gap={6} textAlign="center">
          {getResultIcon()}

          <Heading size="lg" color={getResultColor()} fontWeight="bold">
            {getResultTitle()}
          </Heading>

          <Text fontSize="md" color={primaryText} maxW="400px" lineHeight="1.6">
            {resultMessage}
          </Text>

          {isPopup && (
            <Text fontSize="sm" color={secondaryText}>
              3초 후 자동으로 창이 닫힙니다.
            </Text>
          )}

          <VStack gap={3} w="full" maxW="300px">
            {paymentResult === "SUCCESS" && (
              <>
                <Button
                  bg={successColorStr}
                  color="white"
                  _hover={{ bg: successColorStr, opacity: 0.8 }}
                  size="lg"
                  w="full"
                  onClick={handleGoToMyPage}
                >
                  내 신청 내역 확인
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  w="full"
                  onClick={handleGoToLessons}
                >
                  다른 강습 보기
                </Button>
                {isPopup && (
                  <Button
                    variant="ghost"
                    size="sm"
                    w="full"
                    onClick={handleClosePopup}
                  >
                    창 닫기
                  </Button>
                )}
              </>
            )}

            {paymentResult === "FAILED" && (
              <>
                <Button
                  bg={primaryDefaultStr}
                  color="white"
                  _hover={{ bg: primaryDefaultStr, opacity: 0.8 }}
                  size="lg"
                  w="full"
                  onClick={handleRetryPayment}
                >
                  {isPopup ? "창 닫고 다시 시도" : "다시 결제하기"}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  w="full"
                  onClick={handleGoToLessons}
                >
                  강습 목록으로
                </Button>
              </>
            )}

            {(paymentResult === "PROCESSING" ||
              paymentResult === "UNKNOWN") && (
              <>
                <Button
                  bg={primaryDefaultStr}
                  color="white"
                  _hover={{ bg: primaryDefaultStr, opacity: 0.8 }}
                  size="lg"
                  w="full"
                  onClick={handleGoToMyPage}
                >
                  내 신청 내역 확인
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  w="full"
                  onClick={handleGoToLessons}
                >
                  강습 목록으로
                </Button>
                {isPopup && (
                  <Button
                    variant="ghost"
                    size="sm"
                    w="full"
                    onClick={handleClosePopup}
                  >
                    창 닫기
                  </Button>
                )}
              </>
            )}
          </VStack>
        </VStack>
      </Flex>
    </Container>
  );
};

export default KISPGResultPage;
