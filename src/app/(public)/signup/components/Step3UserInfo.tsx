"use client";

import { useState, useEffect } from "react";
import {
  VStack,
  Text,
  Input,
  Button,
  HStack,
  Fieldset,
  Field,
  Stack,
} from "@chakra-ui/react";
import { StepHeader } from "./StepHeader";
import Script from "next/script";

declare global {
  interface Window {
    daum: any;
  }
}

interface Step3UserInfoProps {
  mainFlowSteps: number;
  currentProgressValue: number;
}

export const Step3UserInfo = ({
  mainFlowSteps,
  currentProgressValue,
}: Step3UserInfoProps) => {
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    setPostcode(data.zonecode);
    setAddress(fullAddress);
    const detailInput = document.getElementById("addressDetailInput");
    if (detailInput) {
      detailInput.focus();
    }
  };

  const handleSearchAddress = () => {
    if (!isScriptLoaded || !window.daum || !window.daum.Postcode) {
      alert("주소 검색 스크립트를 로드 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: handleComplete,
      width: "100%",
      height: "100%",
      maxSuggestItems: 5,
    }).open({});
  };

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
        onLoad={() => setIsScriptLoaded(true)}
        onError={(e) => {
          console.error("Daum Postcode script failed to load", e);
          alert(
            "주소 검색 서비스를 불러오는데 실패했습니다. 페이지를 새로고침하거나 다시 시도해주세요."
          );
        }}
      />
      <VStack gap={6} align="stretch" w="full">
        <StepHeader
          title="정보입력"
          currentStep={3}
          totalSteps={mainFlowSteps}
          currentProgressValue={currentProgressValue}
        />
        <Fieldset.Root w="full" maxW="lg" mx="auto">
          <Stack gap={5} as="form">
            <Field.Root id="name">
              <Field.Label fontWeight="semibold">이름</Field.Label>
              <Input placeholder="홍길동" name="name" />
            </Field.Root>

            <Field.Root id="username">
              <Field.Label fontWeight="semibold">아이디</Field.Label>
              <Input
                placeholder="사용하실 아이디를 입력해주세요."
                name="username"
              />
            </Field.Root>

            <Field.Root id="password">
              <Field.Label fontWeight="semibold">비밀번호</Field.Label>
              <Input
                type="password"
                placeholder="사용하실 비밀번호를 입력해주세요."
                name="password"
              />
            </Field.Root>

            <Field.Root id="passwordConfirm">
              <Field.Label fontWeight="semibold">비밀번호 확인</Field.Label>
              <Input
                type="password"
                placeholder="비밀번호를 한번 더 입력해주세요."
                name="passwordConfirm"
              />
            </Field.Root>

            <Field.Root id="phoneNumber">
              <Field.Label fontWeight="semibold">핸드폰 번호</Field.Label>
              <HStack gap={2}>
                <Input placeholder="010" maxLength={3} name="phone1" />
                <Text aria-hidden="true">-</Text>
                <Input placeholder="1234" maxLength={4} name="phone2" />
                <Text aria-hidden="true">-</Text>
                <Input placeholder="5678" maxLength={4} name="phone3" />
              </HStack>
            </Field.Root>

            <Field.Root id="postcodeField">
              <Field.Label fontWeight="semibold">우편번호</Field.Label>
              <HStack gap={2}>
                <Input
                  placeholder="우편번호"
                  name="postcode"
                  value={postcode}
                  readOnly
                  flex={1}
                />
                <Button
                  onClick={handleSearchAddress}
                  bg="#2E3192"
                  color="white"
                  _hover={{ bg: "#1A365D" }}
                  whiteSpace="nowrap"
                  type="button"
                >
                  주소 검색
                </Button>
              </HStack>
            </Field.Root>

            <Field.Root id="addressField">
              <Field.Label fontWeight="semibold">주소</Field.Label>
              <Input
                placeholder="주소검색 버튼을 클릭 후 주소를 입력해주세요."
                readOnly
                name="address_main"
                value={address}
              />
            </Field.Root>

            <Field.Root id="addressDetailField">
              <Field.Label fontWeight="semibold">상세주소</Field.Label>
              <Input
                id="addressDetailInput"
                placeholder="상세 주소를 입력해주세요."
                name="address_detail"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
              />
            </Field.Root>

            <Field.Root id="email">
              <Field.Label fontWeight="semibold">이메일</Field.Label>
              <Input
                type="email"
                placeholder="이메일을 입력해주세요."
                name="email"
              />
            </Field.Root>

            <Field.Root id="carNumber">
              <Field.Label fontWeight="semibold">차량번호</Field.Label>
              <Input
                placeholder="차량번호를 입력해주세요 (예: 12가 1234)"
                name="carNumber"
              />
            </Field.Root>
          </Stack>
        </Fieldset.Root>
      </VStack>
    </>
  );
};
