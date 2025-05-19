"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { niceApi, NicePublicUserDataDto } from "@/lib/api/niceApi";
import { Box, Spinner, Text } from "@chakra-ui/react";

// New NiceAuthMessage structures
export interface NiceAuthBaseMessage {
  source: "nice-auth-callback";
  verificationKey: string | null;
}

export interface NiceAuthDuplicateUserMessage extends NiceAuthBaseMessage {
  type: "DUPLICATE_DI";
  username?: string | null;
}

export interface NiceAuthSuccessMessage extends NiceAuthBaseMessage {
  type: "NICE_AUTH_SUCCESS";
  data: NicePublicUserDataDto;
}

export interface NiceAuthFailureMessage extends NiceAuthBaseMessage {
  type: "NICE_AUTH_FAIL";
  error: string;
  errorCode?: string | null; // from URL 'error' param
  errorDetail?: string | null; // from URL 'detail' param
}

export type NiceAuthTypedMessage =
  | NiceAuthDuplicateUserMessage
  | NiceAuthSuccessMessage
  | NiceAuthFailureMessage;

function NiceCallbackContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const key = searchParams.get("key");
  const joined = searchParams.get("joined"); // "true" or "false"
  const username = searchParams.get("username");
  const niceErrorCode = searchParams.get("nice_error_code"); // e.g., "DUPLICATE_DI"
  const backendError = searchParams.get("error"); // general backend error on status=fail
  const backendErrorDetail = searchParams.get("detail"); // general backend error detail on status=fail

  console.log("[NICE_CB] Initializing Callback. URL Params:", {
    status,
    key,
    joined,
    username,
    niceErrorCode,
    backendError,
    backendErrorDetail,
  });

  // Query to fetch NICE data if status is success and it's not a DUPLICATE_DI case
  const shouldFetchNiceData =
    status === "success" && niceErrorCode !== "DUPLICATE_DI" && !!key;

  const {
    data: authResult, // This will be NicePublicUserDataDto on success
    isSuccess: queryIsSuccess,
    isError: queryIsError,
    error: queryError, // This is of type Error | null
    isLoading: queryIsLoading,
  } = useQuery<
    NicePublicUserDataDto,
    Error,
    NicePublicUserDataDto,
    (string | null)[]
  >({
    // Specify DTO
    queryKey: ["niceAuthResult", key],
    queryFn: () => {
      console.log("[NICE_CB] useQuery - queryFn called with key:", key);
      if (!key) {
        // Should be caught by 'enabled' but as a safeguard
        return Promise.reject(
          new Error("NICE_CB_ERR: Missing key for auth result")
        );
      }
      return niceApi.getNiceAuthResult(key); // Expects NicePublicUserDataDto or throws
    },
    enabled: shouldFetchNiceData,
    retry: false,
  });

  useEffect(() => {
    let messageToSend: NiceAuthTypedMessage | null = null;
    let attemptedPost = false;

    console.log("[NICE_CB] useEffect triggered. States:", {
      status,
      key,
      niceErrorCode,
      username,
      shouldFetchNiceData,
      queryIsLoading,
      queryIsSuccess,
      queryIsError,
      authResultIsPresent: !!authResult,
    });

    if (status === "success") {
      if (niceErrorCode === "DUPLICATE_DI") {
        console.log("[NICE_CB] Handling DUPLICATE_DI case.");
        messageToSend = {
          source: "nice-auth-callback",
          type: "DUPLICATE_DI",
          verificationKey: key,
          username: username,
        };
      } else if (key) {
        // Proceed to fetch/use fetched data
        if (queryIsLoading) {
          console.log("[NICE_CB] status 'success', data fetch in progress...");
          return; // Wait for query
        }
        if (queryIsSuccess && authResult) {
          console.log(
            "[NICE_CB] status 'success', data fetched successfully:",
            authResult
          );
          messageToSend = {
            source: "nice-auth-callback",
            type: "NICE_AUTH_SUCCESS",
            verificationKey: key,
            data: authResult,
          };
        } else if (queryIsError) {
          console.error(
            "[NICE_CB] status 'success', but failed to fetch NICE data:",
            queryError
          );
          messageToSend = {
            source: "nice-auth-callback",
            type: "NICE_AUTH_FAIL",
            verificationKey: key,
            error:
              queryError?.message ||
              "Failed to retrieve verification details after success callback.",
          };
        } else if (!queryIsLoading) {
          // Query finished but no success/error (e.g. disabled and ran once)
          console.warn(
            "[NICE_CB] status 'success', query finished but no definitive result. Key might have been invalid or data fetch skipped."
          );
          messageToSend = {
            source: "nice-auth-callback",
            type: "NICE_AUTH_FAIL",
            verificationKey: key,
            error:
              "Could not retrieve verification details. The key may be invalid or already used.",
          };
        }
      } else {
        // status === "success" but no key
        console.error("[NICE_CB] status 'success' but key is missing!");
        messageToSend = {
          source: "nice-auth-callback",
          type: "NICE_AUTH_FAIL",
          verificationKey: null,
          error: "NICE_CB_ERR: Success callback is missing the required key.",
        };
      }
    } else if (status === "fail") {
      console.log(
        "[NICE_CB] Handling status 'fail'. Backend error:",
        backendError
      );
      messageToSend = {
        source: "nice-auth-callback",
        type: "NICE_AUTH_FAIL",
        verificationKey: key,
        error:
          backendErrorDetail || backendError || "NICE authentication failed.",
        errorCode: backendError,
        errorDetail: backendErrorDetail,
      };
    } else if (key) {
      // Invalid status, but key is present - potentially an issue
      console.error(
        "[NICE_CB] Invalid or missing status, but key was present:",
        status
      );
      messageToSend = {
        source: "nice-auth-callback",
        type: "NICE_AUTH_FAIL",
        verificationKey: key,
        error: `NICE_CB_ERR: Invalid or missing callback status ('${status}').`,
      };
    }

    if (messageToSend) {
      attemptedPost = true;
      if (window.opener && typeof window.opener.postMessage === "function") {
        try {
          console.log(
            "[NICE_CB] Attempting to postMessage to window.opener:",
            messageToSend
          );
          window.opener.postMessage(messageToSend, window.location.origin);
          console.log("[NICE_CB] postMessage successful.");
        } catch (e) {
          console.error("[NICE_CB] Failed to postMessage to opener:", e);
        }
      } else {
        console.warn(
          "[NICE_CB] window.opener not available or postMessage is not a function."
        );
      }

      // Close window if a message was determined and posted (or attempted)
      // except for truly unexpected scenarios where we might want the window to stay for debugging.
      // For now, close on any determined message.
      console.log("[NICE_CB] Attempting window.close().");
      window.close();
    } else if (!queryIsLoading && !shouldFetchNiceData && status) {
      // This case means status was 'success' but shouldFetchNiceData was false (e.g. DUPLICATE_DI already handled, or key missing)
      // OR status was 'fail' (already handled)
      // OR status was invalid. If it was an invalid status but we didn't form a message,
      // maybe we should close to prevent orphaned windows.
      // However, the original code had a specific "DO NOT CLOSE FOR INVALID STATUS" for debugging.
      // Let's stick to closing only if messageToSend was formed.
      // If no messageToSend and query isn't loading, it means logic path was exhausted or condition not met to send message.
      console.log(
        "[NICE_CB] No message to send and not loading. Window will not be closed by this effect path."
      );
    }
  }, [
    status,
    key,
    niceErrorCode,
    username,
    backendError,
    backendErrorDetail,
    queryIsLoading,
    queryIsSuccess,
    queryIsError,
    authResult,
    shouldFetchNiceData,
  ]);

  // UI Feedback Logic - simplified as window closes quickly
  let feedbackMessage = "본인인증 결과를 처리 중입니다. 이 창은 곧 닫힙니다...";
  if (queryIsLoading && shouldFetchNiceData) {
    feedbackMessage = "본인인증 결과를 확인 중입니다...";
    return (
      <Box textAlign="center" p={10}>
        <Spinner size="xl" />
        <Text mt={4}>{feedbackMessage}</Text>
      </Box>
    );
  }

  return (
    <Box textAlign="center" p={10}>
      <Text>{feedbackMessage}</Text>
      {niceErrorCode === "DUPLICATE_DI" && status === "success" && (
        <Text color="orange.500" mt={2}>
          이미 등록된 사용자 정보입니다. 로그인을 시도해주세요.
        </Text>
      )}
      {status === "fail" && (
        <Text color="red.500" mt={2}>
          본인인증에 실패했습니다. ({backendError || "오류 발생"})
        </Text>
      )}
    </Box>
  );
}

export default function NiceCallbackPage() {
  return (
    // Suspense is good for initial load of the page component itself
    <Suspense
      fallback={
        <Box textAlign="center" p={10}>
          <Spinner size="xl" />
          <Text mt={4}>페이지를 불러오는 중입니다...</Text>
        </Box>
      }
    >
      <NiceCallbackContent />
    </Suspense>
  );
}
