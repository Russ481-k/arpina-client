"use client";

import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { KISPGPaymentInitResponseDto } from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import { formatPhoneNumberForKISPG } from "@/lib/utils/phoneUtils";

interface KISPGPaymentPopupProps {
  paymentData: KISPGPaymentInitResponseDto;
  enrollId: number;
  onPaymentComplete?: (success: boolean, data?: any) => void;
  onPaymentClose?: () => void;
}

export interface KISPGPaymentPopupRef {
  triggerPayment: () => void;
}

const KISPGPaymentPopup = forwardRef<
  KISPGPaymentPopupRef,
  KISPGPaymentPopupProps
>(({ paymentData, enrollId, onPaymentComplete, onPaymentClose }, ref) => {
  const formRef = useRef<HTMLFormElement>(null);
  const popupRef = useRef<Window | null>(null);
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);

  const handleSubmitPayment = () => {
    if (isPaymentInProgress) {
      toaster.create({
        title: "알림",
        description: "이미 결제가 진행 중입니다.",
        type: "info",
      });
      return;
    }

    // 팝업 창 설정
    const popupWidth = 825;
    const popupHeight = 700;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    // 결제 결과를 받을 고유한 창 이름
    const popupName = `kispg_payment_${enrollId}_${Date.now()}`;

    // 팝업 차단 확인을 위한 테스트
    const popup = window.open(
      "",
      popupName,
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    if (!popup) {
      toaster.create({
        title: "팝업 차단됨",
        description:
          "팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.",
        type: "error",
      });
      return;
    }

    popupRef.current = popup;
    setIsPaymentInProgress(true);

    // KISPG 폼 제출
    if (formRef.current) {
      formRef.current.target = popupName;
      formRef.current.action =
        process.env.NEXT_PUBLIC_KISPG_URL ||
        "https://testapi.kispg.co.kr/v2/auth";
      formRef.current.submit();
    }

    // 팝업 상태 모니터링
    const checkPopupClosed = setInterval(() => {
      if (popupRef.current && popupRef.current.closed) {
        clearInterval(checkPopupClosed);
        setIsPaymentInProgress(false);
        if (onPaymentClose) {
          onPaymentClose();
        }
      }
    }, 500);
  };

  // 결제 결과 메시지 수신 처리
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 보안을 위한 origin 체크
      const allowedOrigins = [
        window.location.origin,
        process.env.NEXT_PUBLIC_API_URL,
      ].filter(Boolean);

      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      // 결제 결과 메시지 처리
      if (event.data.type === "KISPG_PAYMENT_RESULT") {
        const { success, enrollId: resultEnrollId, data } = event.data;

        // enrollId 확인
        if (resultEnrollId === enrollId) {
          // 팝업 닫기
          if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
          }

          setIsPaymentInProgress(false);

          // 결과 콜백 호출
          if (onPaymentComplete) {
            onPaymentComplete(success, data);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [enrollId, onPaymentComplete]);

  useImperativeHandle(ref, () => ({
    triggerPayment: handleSubmitPayment,
  }));

  // Build form fields
  const formFields = {
    payMethod: "card",
    trxCd: "0",
    mid: paymentData.mid,
    goodsNm: paymentData.itemName,
    ordNo: paymentData.moid,
    goodsAmt: paymentData.amt,
    ordNm: paymentData.buyerName,
    ordTel: formatPhoneNumberForKISPG(paymentData.buyerTel),
    ordEmail: paymentData.buyerEmail,
    returnUrl: paymentData.returnUrl,

    // 옵션 파라미터
    userIp: "0:0:0:0:0:0:0:1",
    mbsUsrId: paymentData.buyerEmail?.split("@")[0] || "user",
    ordGuardEmail: "",
    rcvrAddr: "서울특별시",
    rcvrPost: "00100",
    mbsIp: "127.0.0.1",
    mbsReserved: String(enrollId),
    rcvrMsg: "",
    goodsSplAmt: "0",
    goodsVat: "0",
    goodsSvsAmt: "0",
    payReqType: "1",
    model: "WEB",
    charSet: "UTF-8",
    ediDate: paymentData.ediDate,
    encData: paymentData.requestHash,
  };

  return (
    <form
      ref={formRef}
      method="post"
      style={{ display: "none" }}
      acceptCharset="UTF-8"
    >
      {Object.entries(formFields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={String(value)} />
      ))}
    </form>
  );
});

KISPGPaymentPopup.displayName = "KISPGPaymentPopup";

export default KISPGPaymentPopup;
