"use client";

import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { EnrollInitiationResponseDto } from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import { formatPhoneNumberForKISPG } from "@/lib/utils/phoneUtils";
import { Box } from "@chakra-ui/react";
import { swimmingPaymentService } from "@/lib/api/swimming";

interface KISPGPaymentFrameProps {
  paymentData: EnrollInitiationResponseDto;
  enrollId: number;
  onPaymentComplete?: (success: boolean, data?: any) => void;
  onPaymentClose?: () => void;
}

export interface KISPGPaymentFrameRef {
  triggerPayment: () => void;
}

const KISPGPaymentFrame = forwardRef<
  KISPGPaymentFrameRef,
  KISPGPaymentFrameProps
>(({ paymentData, enrollId, onPaymentComplete, onPaymentClose }, ref) => {
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
  const [showPaymentFrame, setShowPaymentFrame] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );

  // 범용 enrollId 추출 함수 - temp_ 및 enroll_ 접두사 모두 처리
  const extractEnrollIdFromResponse = (
    data: any,
    fallbackEnrollId: number
  ): number => {
    console.log("🔍 Extracting enrollId from response data:", data);
    console.log("🔄 Fallback enrollId:", fallbackEnrollId);

    try {
      // 1. moid에서 추출 시도 (temp_enrollId_timestamp 또는 enroll_enrollId_timestamp)
      if (data.moid || paymentData.moid) {
        const moid = data.moid || paymentData.moid;
        console.log("📋 Checking moid:", moid);

        const parts = moid.split("_");
        if (parts.length >= 2) {
          // temp_123_timestamp 또는 enroll_123_timestamp 형식
          if ((parts[0] === "temp" || parts[0] === "enroll") && parts[1]) {
            const extractedId = parseInt(parts[1]);
            if (!isNaN(extractedId)) {
              console.log(
                `✅ EnrollId extracted from moid (${parts[0]}_):`,
                extractedId
              );
              return extractedId;
            }
          }
        }
      }

      // 2. mbsReserved1에서 추출 시도 (temp_enrollId 또는 enroll_enrollId)
      if (data.mbsReserved1 || paymentData.mbsReserved1) {
        const mbsReserved1 = data.mbsReserved1 || paymentData.mbsReserved1;
        console.log("📋 Checking mbsReserved1:", mbsReserved1);

        const parts = mbsReserved1.split("_");
        if (parts.length >= 2) {
          // temp_123 또는 enroll_123 형식
          if ((parts[0] === "temp" || parts[0] === "enroll") && parts[1]) {
            const extractedId = parseInt(parts[1]);
            if (!isNaN(extractedId)) {
              console.log(
                `✅ EnrollId extracted from mbsReserved1 (${parts[0]}_):`,
                extractedId
              );
              return extractedId;
            }
          }
        }
      }

      // 3. ordNo에서 추출 시도 (추가 대안)
      if (data.ordNo) {
        console.log("📋 Checking ordNo:", data.ordNo);

        const parts = data.ordNo.split("_");
        if (parts.length >= 2) {
          if ((parts[0] === "temp" || parts[0] === "enroll") && parts[1]) {
            const extractedId = parseInt(parts[1]);
            if (!isNaN(extractedId)) {
              console.log(
                `✅ EnrollId extracted from ordNo (${parts[0]}_):`,
                extractedId
              );
              return extractedId;
            }
          }
        }
      }

      // 4. 직접 enrollId 필드에서 추출 시도
      if (data.enrollId && !isNaN(parseInt(data.enrollId))) {
        const extractedId = parseInt(data.enrollId);
        console.log(
          "✅ EnrollId extracted from direct enrollId field:",
          extractedId
        );
        return extractedId;
      }

      console.log(
        "⚠️ Could not extract enrollId from response, using fallback"
      );
      return fallbackEnrollId;
    } catch (error) {
      console.error("💥 Error extracting enrollId from response:", error);
      return fallbackEnrollId;
    }
  };

  // KISPG 결제창에서 오는 메시지 처리 (JSP의 returnData 함수와 동일한 역할)
  const handleKISPGMessage = (event: MessageEvent) => {
    console.log("🔔 KISPG Message received:", event);
    console.log("📄 Event data:", JSON.stringify(event.data, null, 2));
    console.log("🔍 Event origin:", event.origin);
    console.log("🏷️ Event type:", typeof event.data);

    // React DevTools나 기타 개발 도구 메시지 필터링
    if (
      !event.data ||
      typeof event.data !== "object" ||
      event.data.source === "react-devtools-bridge" ||
      event.data.source === "react-devtools-content-script" ||
      event.data.type === "webpackHotUpdate" ||
      event.data._source === "react-devtools-hook"
    ) {
      console.log("⏭️ Ignoring non-KISPG message:", {
        hasData: !!event.data,
        dataType: typeof event.data,
        source: event.data?.source,
        type: event.data?.type,
        _source: event.data?._source,
      });
      return;
    }

    // KISPG에서 오는 메시지는 특정 구조를 가져야 함
    // JSP 샘플에 따르면: { resultCode: '0000', data: {...} } 형태
    // 하지만 실제 KISPG는 다른 형태일 수 있음
    const { resultCode, resultCd, data } = event.data;
    const actualResultCode = resultCode || resultCd; // 두 가지 모두 체크

    console.log("🧩 Extracted fields:", {
      resultCode,
      resultCd,
      actualResultCode,
      data,
      allKeys: Object.keys(event.data),
    });

    // resultCode가 없으면 KISPG 메시지가 아님 - 하지만 다른 필드명일 수 있음
    if (actualResultCode === undefined || actualResultCode === null) {
      // KISPG 메시지인지 다른 방법으로 확인
      const hasKISPGFields =
        event.data.hasOwnProperty("tid") ||
        event.data.hasOwnProperty("amt") ||
        event.data.hasOwnProperty("payMethod") ||
        event.data.hasOwnProperty("moid");

      if (hasKISPGFields) {
        console.log(
          "🎯 Possible KISPG message without standard resultCode:",
          event.data
        );
        // 다른 결제 성공 지표가 있는지 확인
        if (event.data.type === "KISPG_PAYMENT_RESULT" && event.data.success) {
          console.log("🎉 Found KISPG success message with different format!");
          submitToResultPage(event.data);
          return;
        }
      }

      console.log(
        "❌ Not a KISPG payment message - missing resultCode/resultCd"
      );
      return;
    }

    console.log("✅ Valid KISPG message - Result Code:", actualResultCode);

    if (actualResultCode === "0000") {
      // 결제 성공 - JSP의 receive_result 함수와 동일한 로직
      console.log("🎉 Payment successful, submitting to result page");
      submitToResultPage(data || event.data);
    } else if (actualResultCode === "XXXX") {
      // 인증 실패
      console.log("🚫 Payment authentication failed:", actualResultCode);
      handlePaymentFailure(data || event.data, "인증에 실패했습니다.");
    } else {
      // 기타 실패
      console.log("💥 Payment failed with code:", actualResultCode);
      handlePaymentFailure(
        data || event.data,
        data?.resultMsg ||
          event.data?.resultMsg ||
          "결제 처리 중 오류가 발생했습니다."
      );
    }
  };

  // 결제 실패 처리 함수
  const handlePaymentFailure = (data: any, message: string) => {
    console.log("Handling payment failure:", { data, message });

    // 결제창 닫기
    setShowPaymentFrame(false);
    setIsPaymentInProgress(false);

    // 메시지 리스너 제거
    if (messageHandlerRef.current) {
      window.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
      console.log("Message listener removed after payment failure");
    }

    // 실패 토스터 표시
    toaster.create({
      title: "결제 실패",
      description: message,
      type: "error",
      duration: 5000,
    });

    // 실패 콜백 호출
    if (onPaymentComplete) {
      onPaymentComplete(false, { message, ...data });
    }
  };

  // JSP의 receive_result 함수와 동일한 로직 - 폼을 생성해서 결과 페이지로 POST
  const submitToResultPage = async (data: any) => {
    console.log("🚀 submitToResultPage called with data:", data);
    console.log("💳 Current paymentData:", paymentData);
    console.log("🆔 Current enrollId prop:", enrollId);

    // 결제창 먼저 닫기
    setShowPaymentFrame(false);
    setIsPaymentInProgress(false);

    // 메시지 리스너 제거
    if (messageHandlerRef.current) {
      window.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
      console.log("🧹 Message listener removed after payment success");
    }

    try {
      // 🎯 enrollId 결정: prop으로 받은 값 우선, 추출 함수로 폴백
      const effectiveEnrollId =
        enrollId || extractEnrollIdFromResponse(data, 0);
      console.log("🎯 Effective enrollId for API call:", effectiveEnrollId);

      if (!effectiveEnrollId || effectiveEnrollId <= 0) {
        throw new Error("유효한 enrollId를 확인할 수 없습니다.");
      }

      // 🎯 올바른 API 호출: approve-and-create-enrollment
      // KISPG 결제 승인 후 Payment 및 Enrollment 생성
      console.log("🔍 Calling CORRECT payment approval API...");

      const approvalRequestData = {
        tid: data.tid || data.TID, // KISPG에서 반환된 TID
        moid: paymentData.moid, // moid (temp_ 또는 enroll_ 형식)
        amt: data.amt || data.AMT || paymentData.amt, // 결제 금액
      };

      console.log("📮 API Request data:", approvalRequestData);

      const approvalResponse =
        await swimmingPaymentService.approvePaymentAndCreateEnrollment(
          approvalRequestData
        );

      console.log("📥 Payment approval response:", approvalResponse);

      if (
        approvalResponse &&
        approvalResponse.success &&
        approvalResponse.data
      ) {
        const { data: enrollmentData } = approvalResponse;

        // 승인 및 수강신청 생성 성공
        console.log("✅ Payment approval and enrollment creation successful!");

        // 성공 토스터 표시
        toaster.create({
          title: "결제 완료",
          description: "수영 강습 결제 및 신청이 완료되었습니다.",
          type: "success",
          duration: 4000,
        });

        // 성공 콜백 호출 (백엔드에서 받은 상세 정보 전달)
        if (onPaymentComplete) {
          console.log("📞 Calling onPaymentComplete with success=true");
          onPaymentComplete(true, {
            ...data,
            enrollmentData, // 백엔드에서 받은 수강신청 정보
            approved: true, // 승인 완료 플래그
            enrollId: effectiveEnrollId, // 사용된 enrollId도 전달
          });
        }
      } else {
        // 승인 실패
        console.log("❌ Payment approval failed - invalid response");
        throw new Error(
          (approvalResponse && approvalResponse.message) ||
            "결제 승인에 실패했습니다."
        );
      }
    } catch (approvalError: any) {
      console.error("💥 Payment approval failed:", approvalError);
      console.error("📊 Error details:", {
        message: approvalError.message,
        response: approvalError.response,
        status: approvalError.response?.status,
        data: approvalError.response?.data,
      });

      // 승인 실패 시 실패 처리
      handlePaymentFailure(
        data,
        approvalError.message ||
          "결제는 완료되었으나 시스템 처리 중 오류가 발생했습니다. 고객센터로 문의해주세요."
      );
      return; // 함수 종료
    }
  };

  const handleSubmitPayment = () => {
    if (isPaymentInProgress) {
      toaster.create({
        title: "알림",
        description: "이미 결제가 진행 중입니다.",
        type: "info",
      });
      return;
    }

    try {
      setIsPaymentInProgress(true);
      setShowPaymentFrame(true);

      // iframe이 로드된 후 폼 제출 및 메시지 리스너 등록
      setTimeout(() => {
        if (formRef.current && iframeRef.current) {
          console.log("Submitting payment form to iframe");

          // 메시지 리스너 등록 (폼 제출 직전에)
          messageHandlerRef.current = handleKISPGMessage;
          window.addEventListener("message", handleKISPGMessage, false);
          console.log("Message listener registered for KISPG payment");

          formRef.current.submit();
        }
      }, 500); // 좀 더 충분한 시간 확보
    } catch (error) {
      console.error("Error initiating KISPG payment:", error);
      toaster.create({
        title: "결제 오류",
        description: "결제 창을 열 수 없습니다. 다시 시도해주세요.",
        type: "error",
      });
      setIsPaymentInProgress(false);
      setShowPaymentFrame(false);
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener("message", messageHandlerRef.current);
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    triggerPayment: handleSubmitPayment,
  }));

  // 결제창 닫기
  const handleClosePayment = () => {
    setShowPaymentFrame(false);
    setIsPaymentInProgress(false);

    if (messageHandlerRef.current) {
      window.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
      console.log("Message listener removed when closing payment frame");
    }

    if (onPaymentClose) {
      onPaymentClose();
    }
  };

  return (
    <>
      {/* 결제 폼 - JSP의 payInit 폼과 동일 */}
      <form
        ref={formRef}
        method="POST"
        target="kispg_payment_frame"
        action={
          process.env.NEXT_PUBLIC_KISPG_URL ||
          "https://testapi.kispg.co.kr/v2/auth"
        }
        acceptCharset="UTF-8"
        style={{ display: "none" }}
      >
        <input type="hidden" name="payMethod" value="card" />
        <input type="hidden" name="trxCd" value="0" />
        <input type="hidden" name="mid" value={paymentData.mid} />
        <input type="hidden" name="goodsNm" value={paymentData.itemName} />
        <input type="hidden" name="ordNo" value={paymentData.moid} />
        <input type="hidden" name="goodsAmt" value={paymentData.amt} />
        <input type="hidden" name="ordNm" value={paymentData.buyerName} />
        <input
          type="hidden"
          name="ordTel"
          value={formatPhoneNumberForKISPG(paymentData.buyerTel)}
        />
        <input type="hidden" name="ordEmail" value={paymentData.buyerEmail} />
        <input
          type="hidden"
          name="returnUrl"
          value={`${window.location.origin}/payment/kispg-result`}
        />

        {/* 옵션 필드들 */}
        <input
          type="hidden"
          name="userIp"
          value={paymentData.userIp || "0:0:0:0:0:0:0:1"}
        />
        <input
          type="hidden"
          name="mbsUsrId"
          value={
            paymentData.mbsUsrId ||
            paymentData.buyerEmail?.split("@")[0] ||
            String(enrollId || "temp")
          }
        />
        <input type="hidden" name="ordGuardEmail" value="" />
        <input type="hidden" name="rcvrAddr" value="" />
        <input type="hidden" name="rcvrPost" value="" />
        <input
          type="hidden"
          name="mbsIp"
          value={paymentData.userIp || "127.0.0.1"}
        />
        <input
          type="hidden"
          name="mbsReserved"
          value={paymentData.mbsReserved1 || String(enrollId || "temp")}
        />
        <input type="hidden" name="rcvrMsg" value="" />
        <input
          type="hidden"
          name="goodsSplAmt"
          value={paymentData.goodsSplAmt || "0"}
        />
        <input
          type="hidden"
          name="goodsVat"
          value={paymentData.goodsVat || "0"}
        />
        <input type="hidden" name="goodsSvsAmt" value="0" />
        <input type="hidden" name="payReqType" value="1" />
        <input type="hidden" name="model" value="WEB" />
        <input type="hidden" name="charSet" value="UTF-8" />
        <input type="hidden" name="ediDate" value={paymentData.ediDate} />
        <input type="hidden" name="encData" value={paymentData.requestHash} />
      </form>

      {/* 결제창 iframe - JSP의 pay_frame과 동일 */}
      {showPaymentFrame && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.6)"
          zIndex="10000"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            width="90%"
            maxWidth="800px"
            height="90%"
            maxHeight="700px"
            bg="white"
            borderRadius="lg"
            overflow="hidden"
            position="relative"
          >
            {/* 닫기 버튼 */}
            <Box
              position="absolute"
              top="10px"
              right="10px"
              zIndex="10001"
              bg="white"
              borderRadius="full"
              p="2"
              cursor="pointer"
              boxShadow="md"
              onClick={handleClosePayment}
            >
              ✕
            </Box>

            {/* KISPG 결제 iframe */}
            <iframe
              ref={iframeRef}
              name="kispg_payment_frame"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              src=""
            />
          </Box>
        </Box>
      )}
    </>
  );
});

KISPGPaymentFrame.displayName = "KISPGPaymentFrame";

export default KISPGPaymentFrame;
