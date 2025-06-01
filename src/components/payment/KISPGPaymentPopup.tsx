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

interface KISPGPaymentPopupProps {
  paymentData: EnrollInitiationResponseDto;
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
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );

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
      const popupWidth = 825;
      const popupHeight = 700;
      const left = (window.screen.width - popupWidth) / 2;
      const top = (window.screen.height - popupHeight) / 2;

      const popupName = `kispg_payment_${enrollId}_${Date.now()}`;

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

      const form = document.createElement("form");
      form.method = "POST";
      form.action =
        process.env.NEXT_PUBLIC_KISPG_URL ||
        "https://testapi.kispg.co.kr/v2/auth";
      form.target = popupName;
      form.acceptCharset = "UTF-8";

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

        userIp: paymentData.userIp || "0:0:0:0:0:0:0:1",
        mbsUsrId:
          paymentData.mbsUsrId ||
          paymentData.buyerEmail?.split("@")[0] ||
          String(enrollId),
        ordGuardEmail: "",
        rcvrAddr: "",
        rcvrPost: "",
        mbsIp: paymentData.userIp || "127.0.0.1",
        mbsReserved: paymentData.mbsReserved1 || String(enrollId),
        rcvrMsg: "",
        goodsSplAmt: paymentData.goodsSplAmt || "0",
        goodsVat: paymentData.goodsVat || "0",
        goodsSvsAmt: "0",
        payReqType: "1",
        model: "WEB",
        charSet: "UTF-8",
        ediDate: paymentData.ediDate,
        encData: paymentData.requestHash,
      };

      console.log("KISPG Payment Form Data:", formFields);

      Object.entries(formFields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value || "");
        form.appendChild(input);
      });

      popup.document.body.appendChild(form);
      form.submit();

      const checkPopupClosed = setInterval(() => {
        if (popupRef.current && popupRef.current.closed) {
          clearInterval(checkPopupClosed);
          setIsPaymentInProgress(false);
          if (onPaymentClose) {
            onPaymentClose();
          }
          if (messageHandlerRef.current) {
            window.removeEventListener("message", messageHandlerRef.current);
            messageHandlerRef.current = null;
          }
        }
      }, 500);

      const handleMessage = (event: MessageEvent) => {
        const allowedOrigins = [
          window.location.origin,
          process.env.NEXT_PUBLIC_API_URL,
        ].filter(Boolean);

        if (!allowedOrigins.includes(event.origin)) {
          return;
        }

        if (event.data.type === "KISPG_PAYMENT_RESULT") {
          const { success, enrollId: resultEnrollId, data } = event.data;

          if (resultEnrollId === enrollId) {
            if (popupRef.current && !popupRef.current.closed) {
              popupRef.current.close();
            }

            setIsPaymentInProgress(false);
            clearInterval(checkPopupClosed);

            if (onPaymentComplete) {
              onPaymentComplete(success, data);
            }

            window.removeEventListener("message", handleMessage);
            messageHandlerRef.current = null;
          }
        }
      };

      messageHandlerRef.current = handleMessage;
      window.addEventListener("message", handleMessage);

      setTimeout(() => {
        if (form.parentNode) {
          form.parentNode.removeChild(form);
        }
      }, 100);
    } catch (error) {
      console.error("Error creating KISPG payment form:", error);
      toaster.create({
        title: "결제 오류",
        description: "결제 창을 열 수 없습니다. 다시 시도해주세요.",
        type: "error",
      });
      setIsPaymentInProgress(false);
    }
  };

  useEffect(() => {
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener("message", messageHandlerRef.current);
      }
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    triggerPayment: handleSubmitPayment,
  }));

  return null;
});

KISPGPaymentPopup.displayName = "KISPGPaymentPopup";

export default KISPGPaymentPopup;
