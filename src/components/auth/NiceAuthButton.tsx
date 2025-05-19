"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";
import { niceApi, NiceInitiateResponse } from "@/lib/api/niceApi";

const NiceAuthButton = () => {
  const initiateNiceMutation = useMutation<NiceInitiateResponse, Error>({
    mutationFn: niceApi.initiateVerification,
    onSuccess: (data) => {
      const { encodeData } = data;
      const popupName = "popupChk";
      const width = 500;
      const height = 550;
      const isSSR = typeof window === "undefined";
      let left = 0;
      let top = 0;

      if (!isSSR) {
        left = (window.screen.width - width) / 2;
        top = (window.screen.height - height) / 2;
        window.name = "Parent_window";
        window.open(
          "",
          popupName,
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
      }

      const form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute(
        "action",
        "https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb"
      );
      form.setAttribute("target", popupName);

      const hiddenFieldM = document.createElement("input");
      hiddenFieldM.setAttribute("type", "hidden");
      hiddenFieldM.setAttribute("name", "m");
      hiddenFieldM.setAttribute("value", "checkplusService");
      form.appendChild(hiddenFieldM);

      const hiddenFieldEncode = document.createElement("input");
      hiddenFieldEncode.setAttribute("type", "hidden");
      hiddenFieldEncode.setAttribute("name", "EncodeData");
      hiddenFieldEncode.setAttribute("value", encodeData);
      form.appendChild(hiddenFieldEncode);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    },
    onError: (error) => {
      console.error("NICE Auth Initiation Error (Button Component):", error);
      toaster.create({
        title: "본인인증 초기화 오류",
        description: error.message || "알 수 없는 에러가 발생했습니다.",
        type: "error",
      });
    },
  });

  const handleNiceAuthClick = () => {
    initiateNiceMutation.mutate();
  };

  return (
    <div>
      <button
        onClick={handleNiceAuthClick}
        disabled={initiateNiceMutation.isPending}
      >
        {initiateNiceMutation.isPending ? "처리 중..." : "NICE 본인인증"}
      </button>
      {initiateNiceMutation.isError && (
        <p style={{ color: "red" }}>
          에러: {initiateNiceMutation.error?.message}
        </p>
      )}
    </div>
  );
};

export default NiceAuthButton;
